import "reflect-metadata";

import { GetEventCallback } from "../core/GetEventCallbackInfo";
import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { SimpleEvent } from "../events/SimpleEvent";

export function subscribe<TEvent, TArgs>(
	eventContainer: Type<TEvent>,
	getEventCallback: GetEventCallback<TEvent, TArgs>)
	: MethodDecorator
{
	return <T>(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>)
		: TypedPropertyDescriptor<T> =>
	{
		if (!(Reflect || Reflect.defineMetadata ))
		{
			throw new Error("reflect-metadata is required.");
		}

		if (descriptor.value !== undefined)
		{
			Reflect.defineMetadata(MetadataKeys.eventResolver, { eventContainer, getEventCallback }, target, propertyKey);
		}

		const subscribedListeners: string[] = Reflect.getMetadata(MetadataKeys.subscribedListeners, target) || [];
		subscribedListeners.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.subscribedListeners, subscribedListeners, target);
		return descriptor;
	};
}
