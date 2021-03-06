﻿import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { IStateModifier } from "../core/IStateModifier";
import { Event, EventCallback } from "../core/Event";
import { SubscribtionCallback, IGetEventCallbackInfo } from "../core/GetEventCallbackInfo";

export type GetEventCallback<TEvent, TArgs> = (eventsContainer: TEvent) => Event<TArgs>;

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
	subscriber: GetEventCallback<TEvent, TArgs>)
	: SubscribeDecorator<TArgs> {
	return <TState>(
		target: IStateModifier<TState>,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>>)
		: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>> =>
	{
		if (!(Reflect || Reflect.defineMetadata ))
		{
			throw new Error("reflect-metadata is required.");
		}

		if (descriptor.value !== undefined)
		{
			const getEventCallback : SubscribtionCallback<TEvent, TArgs> =
				(eventContainer) => {
					const result = subscriber(eventContainer);
					return (subsciption) => {
						result.add((sender, args) => subsciption(args));
					}
			}

			const getEventCallbackInfo: IGetEventCallbackInfo<TEvent, TArgs> = {
				eventContainer: eventContainer,
				getEventCallback: getEventCallback
			}

			Reflect.defineMetadata(MetadataKeys.eventResolver, getEventCallbackInfo, target, propertyKey);
		}

		const subscribedListeners: Array<string | symbol> = Reflect.getMetadata(MetadataKeys.subscribedListeners, target) || [];
		subscribedListeners.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.subscribedListeners, subscribedListeners, target);
		return descriptor;
	};
}