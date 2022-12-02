import * as PropTypes from "prop-types";
import * as React from "react";
import "reflect-metadata";

import { Store } from "listick";

/**
 * Describes react component class where additionally services
 * are defined as input arguments.
 */
export interface ConnectComponentClass<P = {}>
{
	new (props: P, context: any, ...services: any[]): React.Component<P, {}>;
}

export interface ConnectClassDecorator<TProps>
{
	<T extends ConnectComponentClass<TProps>>(target: T): T;
}

/**
 * Connect React component with Listick Store. 
 * @param stateGet Callback that extract required state from store.
 */
export function connect<TProps, TState>(stateGet: (store: any) => TState): ConnectClassDecorator<TProps>
{

	let subscribedFunction: (sender: any, args: any)=> void;

	return <T extends ConnectComponentClass<TProps>>(target: T): T =>
	{
		// Here we override real rect component with new one.
		// For this new constructor is defined and prototype copied to new object.
		let store: Store<any>;
		const inputArgs: any[] = Reflect.getMetadata("design:paramtypes", target);
		function constructorOverride(props: TProps, context: any, pThis: any)
		{
			// Collect all services requested by constructor.
			const requestedServices: any[] = [];
			store = context.store as Store<any>;
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

			const targetArgs: [props: TProps, context: any, ...services: any[]] = [
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

		// We need to listen to state change only when component is mounted.
		connector.prototype.componentDidMount = function() {
			if(store != null) {
				subscribedFunction = (sender: any, args: any) => {
					const newState = stateGet(store.getStoreState());
					this.updater.enqueueReplaceState(this, newState);
				};
				store.stateChanged.add(subscribedFunction)
			}

			if(componentDidMountBase != null) {
				componentDidMountBase.apply(this, arguments as any);
			}
		};

		connector.prototype.componentWillUnmount = function() {
			if(store != null) {
				store.stateChanged.remove(subscribedFunction);
			}

			if(componentWillUnmountBase != null) {
				componentWillUnmountBase.apply(this, arguments as any);
			}
		};

		connector.prototype.setState = function() {
			throw new Error("State of this React component is managed by listick.");
		}

		connector.contextTypes = {
			store: PropTypes.object.isRequired
		}

		return connector as T;
	}
}
