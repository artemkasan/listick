import "reflect-metadata";

import { GetEventCallback } from "../core/GetEventCallbackInfo";
import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { IStateModifier } from "../core/IStateModifier";
import { Event } from "../core/Event";

export type StateModifierItem<TState, TArgs> = (prevState: TState, args: TArgs) => Partial<TState> | TState;
export type SubscribeDecorator<TArgs> = <TState>(
	target: IStateModifier<TState>,
	propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>>) 
		=> TypedPropertyDescriptor<StateModifierItem<TState, TArgs>> | void;

/**
 * Marks state modifier method that it can listen to event container event.
 * @param eventContainer Event container to listen.
 * @param getEventCallback Callback that returns Simple event that can be listened.
 */
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
