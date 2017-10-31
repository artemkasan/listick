import { Type } from "../core/Type";

export type ServiceProvider<T> = {
	type: "singleton" | "transient",
	function: () => T,
	objectType?: T,
};

export interface EventContainerType<T> extends Function
{
	new (): T;
}

export type ServiceType<T> = Type<T> | ServiceProvider<T>;

export interface IStoreOptions
{
	eventContainers: EventContainerType<any>[];
	services?: ServiceType<any>[];
}
