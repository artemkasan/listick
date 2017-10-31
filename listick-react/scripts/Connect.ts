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
	return <T extends ConnectComponentClass<TProps>>(target: T): T =>
	{
		const inputArgs: any[] = Reflect.getMetadata("design:paramtypes", target);
		const f = class
		{
			constructor(props: TProps, context: any, ...args: any[])
			{
				const requestedServices: any[] = [];
				const store = context.store as Store<any>;
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
				const obj = target.apply(this, targetArgs);
				obj.state = stateGet(store.getStore());
				store.stateChanged.add((sender, args) =>
				{
					obj.setState(stateGet(store.getStore()));
				})
				return obj;
			}

			static contextTypes = {
				store: PropTypes.object.isRequired
			};
		}

		f.prototype = target.prototype;

		return (f as any) as T;
	}
}