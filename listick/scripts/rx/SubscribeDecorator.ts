import "reflect-metadata";
import { Observable } from 'rxjs/Observable';

import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { IStateModifier } from "../core/IStateModifier";
import { SubscribtionCallback, IGetEventCallbackInfo } from "../core/GetEventCallbackInfo";

export type GetObservableCallback<TEvent, TArgs> = (eventsContainer: TEvent) => Observable<TArgs>

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
	subscriber: GetObservableCallback<TEvent, TArgs>
): SubscribeDecorator<TArgs> {
	return <TState>(
		target: IStateModifier<TState>,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>>)
		: TypedPropertyDescriptor<StateModifierItem<TState, TArgs>> => {
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
						result.subscribe(subsciption);
					}
			}

			const getEventCallbackInfo: IGetEventCallbackInfo<TEvent, TArgs> = {
				eventContainer: eventContainer,
				getEventCallback: getEventCallback
			};

			Reflect.defineMetadata(MetadataKeys.eventResolver, getEventCallbackInfo, target, propertyKey);
		}

		const subscribedListeners: Array<string | symbol> = Reflect.getMetadata(MetadataKeys.subscribedListeners, target) || [];
		subscribedListeners.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.subscribedListeners, subscribedListeners, target);
		return descriptor;
	};
}

export function subscribeFailure<TEvent, TFailArgs>(
	eventContainer: Type<TEvent>,
	subscriber: GetObservableCallback<TEvent, TFailArgs>
): SubscribeDecorator<TFailArgs> {
	return <TState>(
		target: IStateModifier<TState>,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<StateModifierItem<TState, TFailArgs>>)
		: TypedPropertyDescriptor<StateModifierItem<TState, TFailArgs>> => {
		if (!(Reflect || Reflect.defineMetadata ))
		{
			throw new Error("reflect-metadata is required.");
		}

		if (descriptor.value !== undefined)
		{
			const getEventCallback : SubscribtionCallback<TEvent, any> =
				(eventContainer) => {
					const result = subscriber(eventContainer);
					return (subsciption) => {
						result.subscribe(undefined, subsciption);
					}
			}

			const getEventCallbackInfo: IGetEventCallbackInfo<TEvent, TFailArgs> = {
				eventContainer: eventContainer,
				getEventCallback: getEventCallback
			};

			Reflect.defineMetadata(MetadataKeys.eventResolver, getEventCallbackInfo, target, propertyKey);
		}

		const subscribedListeners: Array<string | symbol> = Reflect.getMetadata(MetadataKeys.subscribedListeners, target) || [];
		subscribedListeners.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.subscribedListeners, subscribedListeners, target);
		return descriptor;
	};
}
