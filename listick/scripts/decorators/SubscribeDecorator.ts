import "reflect-metadata";

import { GetEventCallback } from "../core/GetEventCallbackInfo";
import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { IStateModifier } from "../core/IStateModifier";
import { SimpleEvent } from "../events/SimpleEvent";

export type StateModifierItem<TState, TArgs> = (prevState: TState, args: TArgs) => Partial<TState> | TState;
export type SubscribeDecorator<TArgs> = <TState>(
	target: IStateModifier<TState>,
	propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>>) 
		=> TypedPropertyDescriptor<StateModifierItem<TState, TArgs>> | void;

export function subscribe<TEvent, TArgs>(
	eventContainer: Type<TEvent>,
	getEventCallback: GetEventCallback<TEvent, TArgs>)
	: SubscribeDecorator<TArgs>
{
	return <TState>(target: IStateModifier<TState>, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>>)
		: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>> =>
	{
		if (!(Reflect || Reflect.defineMetadata ))
		{
			throw new Error("reflect-metadata is required.");
		}

		if (descriptor.value !== undefined)
		{
			Reflect.defineMetadata(MetadataKeys.eventResolver, { eventContainer, getEventCallback }, target, propertyKey);
		}

		const subscribedListeners: Array<string | symbol> = Reflect.getMetadata(MetadataKeys.subscribedListeners, target) || [];
		subscribedListeners.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.subscribedListeners, subscribedListeners, target);
		return descriptor;
	};
}
