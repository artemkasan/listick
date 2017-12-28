import { Type } from "../core/Type";
import { ServiceDescriptor } from "../core/ServiceDescriptor";

export interface EventContainerType<T> extends Function
{
	new (): T;
}

export type ServiceType = Type<any> | ServiceDescriptor;

export interface IStoreOptions
{
	eventContainers: EventContainerType<any>[];
	services?: ServiceType[];
}
