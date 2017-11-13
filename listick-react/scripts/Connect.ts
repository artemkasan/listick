import * as PropTypes from "prop-types";
import * as React from "react";
import "reflect-metadata";

import { Store } from "listick";
import { IConnectOptions } from "./ConnectOptions";
import { Type } from "./Type";

export interface ConnectComponentClass<P = {}>
{
	new (props: P, context: any, ...services: any[]): React.Component<P, {}>;
}

export interface ConnectClassDecorator<TProps>
{
	<T extends ConnectComponentClass<TProps>>(target: T): T;
}

export function connect<TProps, TState>(stateGet: (store: any) => TState): ConnectClassDecorator<TProps>
{

	let subscribedFunction: (sender: any, args: any)=> void;

	return <T extends ConnectComponentClass<TProps>>(target: T): T =>
	{
		let store: Store<any>;
		const inputArgs: any[] = Reflect.getMetadata("design:paramtypes", target);
		function constructorOverride(props: TProps, context: any, pThis: any)
		{
			const requestedServices: any[] = [];
			store = context.store as Store<any>;
			for (let i = 2; i < inputArgs.length; i++)
			{
				const service = store.getService(inputArgs[i]);
				if (service === undefined)
				{
					console.error(`Service ${inputArgs[i]} is not registered in store`);
				}

				requestedServices.push(service);
			}
			const targetArgs: any[] = [
				props,
				context,
				...requestedServices
			];
			target.apply(pThis, targetArgs);
			pThis.state = stateGet(store.getStoreState());
		}

		const connector = new Function(
			"constructorOverride",
			`return function ${target.name} (props, context) \
				{ \
					return constructorOverride(props, context, this); \
				}`)(constructorOverride);
		connector.prototype = Object.create(target.prototype);
		connector.prototype.componentDidMount = function()
		{
			subscribedFunction = (sender: any, args: any) =>
			{
				this.setState(stateGet(store.getStoreState()));
			};
			store.stateChanged.add(subscribedFunction)
		};
		connector.prototype.componentWillUnmount = function()
		{
			store.stateChanged.remove(subscribedFunction);
		};
		connector.contextTypes = {
			store: PropTypes.object.isRequired
		}

		return connector as T;
	}
}