import * as PropTypes from "prop-types";
import * as React from "react";
import "reflect-metadata";

import { Store } from "listick";

/**
 * Describes react component class where additionally services
 * are defined as input arguments.
 */
export interface ConnectComponentClass<P = {},S = {}>
{
	new (props: P, context: any, ...services: any[]): React.Component<P, S>;
}

export interface ConnectClassDecorator<TProps, TState>
{
	<T extends ConnectComponentClass<TProps, TState>>(target: T): T;
}

/**
 * Connect React component with Listick Store. 
 * @param stateGet Callback that extract required state from store.
 */
export function connect<TProps, TState, TStore>(stateGet: (store: TStore) => TState): ConnectClassDecorator<TProps, TState>
{
	let subscribedFunction: (sender: any, args: any)=> void;

	if(typeof Proxy === "undefined") {
		// in IE 11 proxy is not supported, do fallback
		return <T extends ConnectComponentClass<TProps, TState>>(target: T): T => {
			// Here we override real rect component with new one.
			// For this new constructor is defined and prototype copied to new object.
			let store: Store<any>;
			const inputArgs: any[] = Reflect.getMetadata("design:paramtypes", target);
			function constructorOverride(props: TProps, context: any, pThis: any) {
				// Collect all services requested by constructor.
				const requestedServices: any[] = [];
				store = context.store as Store<any>;
				// if there is no constructor in component input args will be undefined.
				if(inputArgs !== undefined) {
					for (let i = 2; i < inputArgs.length; i++) {
						const service = store.getService(inputArgs[i]);
						if (service === undefined) {
							console.error(`Service ${inputArgs[i]} is not registered in store`);
						}
	
						requestedServices.push(service);
					}
				}
	
				const targetArgs: any[] = [
					props,
					context,
					...requestedServices
				];
				target.apply(pThis, targetArgs);
				pThis.state = stateGet(store.getStoreState());
			}
	
			// Have to use this hack to make new class name the same as original.
			// For now there is no other way.
			const connector = new Function(
				"constructorOverride",
				`return function ${target.name} (props, context) \
					{ \
						return constructorOverride(props, context, this); \
					}`)(constructorOverride);
			connector.prototype = Object.create(target.prototype);

			const componentDidMountBase: () => void = connector.prototype.componentDidMount;
			const componentWillUnmountBase: () => void = connector.prototype.componentWillUnmount;
			const setStateBase: (state: any, context?: any) => void = connector.prototype.setState;

			// We need to listen to state change only when component is mounted.
			connector.prototype.componentDidMount = function() {
				if(store != null) {
					subscribedFunction = (sender: any, args: any) => {
						const newState = stateGet(store.getStoreState());
						setStateBase.apply(this, [newState]);
					};
					store.stateChanged.add(subscribedFunction)
				}

				if(componentDidMountBase != null) {
					componentDidMountBase.apply(this, arguments);
				}
			};
		
			connector.prototype.componentWillUnmount = function() {
				if(store != null) {
					store.stateChanged.remove(subscribedFunction);
				}
		
				if(componentWillUnmountBase != null) {
					componentWillUnmountBase.apply(this, arguments);
				}
			};
		
			connector.prototype.setState = function() {
				if(store != null) {
					console.warn("Attempt to change state from React component, \
but this component is connected to listick state. \
State change ignored.");
				} else if(setStateBase != null) {
					setStateBase.apply(this, arguments);
				}
			}

			connector.contextTypes = {
				store: PropTypes.object.isRequired
			}
			connector.displayName = target.name;


			return connector as T;
		}
	}
	else {
		return <T extends ConnectComponentClass<TProps, TState>>(target: T): T =>
		{
			// Here we override real rect component with new one.
			const inputArgs: any[] = Reflect.getMetadata("design:paramtypes", target);
			const handler = {
				construct (targetConstructor: T, args: any[]) {
					const requestedServices: any[] = [];
					const props = args[0];
					const context = args[1];
					const store = context.store as Store<any>;
					if(store === undefined) {
						return new targetConstructor(props, context, ...requestedServices);
					}
					// if there is no constructor in component input args will be undefined.
					if(inputArgs !== undefined)
					{
						for (let i = 2; i < inputArgs.length; i++)
						{
							const service = store.getService(inputArgs[i]);
							if (service === undefined)
							{
								console.error(`Service ${inputArgs[i]} is not registered in store`);
							}
		
							requestedServices.push(service);
						}
					}

					var newInstance = new targetConstructor(props, context, ...requestedServices);

					function componentDidMount (target: React.Component<TProps, TState>) {
						if(store != null) {
							return (...args: any[]) =>
							{
								const pStore = store;
								subscribedFunction = (sender: any, args: any) => {
									const newState = stateGet(pStore.getStoreState());
									Reflect.get(target, "setState").apply(target, [newState]);
								};
								store.stateChanged.add(subscribedFunction)
							}
						}
			
						return Reflect.get(target, "componentDidMount");
					};
			
					function componentWillUnmount (target: React.Component<TProps, TState>) {
						if(store != null) {
							return (...args: any[]) => {
								store.stateChanged.remove(subscribedFunction);
							}
						}
			
						return Reflect.get(target, "componentWillUnmount");
					};
			
					function setState (target: React.Component<TProps, TState>) {
						if(store != null) {
							return () => {
							console.warn("Attempt to change state from React component, \
	but this component is connected to listick state. \
	State change ignored.");
							}
						}

						return Reflect.get(target, "setState");
					}

					return new Proxy(newInstance, {
						get(targetGet: React.Component<TProps, TState>, key: string): any {
							switch (key) {
								case "componentDidMount":
									return componentDidMount(targetGet);
								case "componentWillUnmount":
									return componentWillUnmount(targetGet);
								case "setState":
									return setState(targetGet);
								case "state":
									return stateGet(store.getStoreState());
								default:
									return Reflect.get(targetGet, key);
							}
						}
					});
				},
				get(targetGet: object, key: string): any {
					switch(key) {
						case "contextTypes":
							return {
								store: PropTypes.object.isRequired
							}
						default:
							return Reflect.get(targetGet, key);
					}
				}
			}

			var result = new Proxy(target, handler);
			return result;
		}
	}
}