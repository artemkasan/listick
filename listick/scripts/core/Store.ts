﻿import { EventContainerType, IStoreOptions } from "../decorators/StoreOptions";
import { Event } from "../core/Event";
import { IGetEventCallbackInfo } from "./GetEventCallbackInfo";
import * as MetadataKeys from "./MetadataKeys";
import { ServiceProvider } from "./ServiceProvider";
import { Type } from "./Type";
import { IStateModifier } from "./IStateModifier";

type StoreState<T> = keyof T;

/**
 * Store holds and manage state in listick.
 */
export class Store<T>
{
	/**
	 * This event is fired when state of current store has changed.
	 */
	public stateChanged = new Event<{ name: string, newState:T}>();

	private eventContainers: any[] = [];
	private serviceProvider: ServiceProvider;

	constructor(
		private storeInstance: T,
		storeType: Type<T>,
		serviceProvider?: ServiceProvider)
	{
		const storeOptions: IStoreOptions = Reflect.getMetadata(
			MetadataKeys.storeOptions,
			storeType);
		if (storeOptions === undefined)
		{
			throw new Error("You need to apply @store decorator for yor store");
		}

		this.initializeEvents(storeOptions.eventContainers);

		if(serviceProvider !== undefined)
		{
			this.serviceProvider = serviceProvider;
		}
		else
		{
			this.serviceProvider = new ServiceProvider(
				this.eventContainers,
				storeOptions.services);
		}

		this.initializeOwnState(storeInstance, storeType);
	}

	/**
	 * Gets current store.
	 */
	public getStoreState(): T
	{
		return this.storeInstance;
	}

	/**
	 * Sets current store state.
	 * @param value New store state.
	 */
	public setStoreState(value: T, reason?: string)
	{
		this.storeInstance = value;
		this.onStateChanged(reason || "setStore");
	}

	/**
	 * Gets registered service or throw an exception if it is not found.
	 * @param serviceType Prototype of service to search.
	 */
	public getService<TService>(serviceType: Type<TService>): TService
	{
		const service = this.serviceProvider.getService(serviceType);
		if (service === null)
		{
			console.error(`Service ${serviceType} is undefined.`);
			throw new Error(`Service ${serviceType} is undefined.`);
		}
		return service;
	}

	/**
	 * Gets registered event or throw an exception if it is not found.
	 * @param eventType Prototype of event to search.
	 */
	public getEvent<TEvent>(eventType: Type<TEvent>): TEvent
	{
		const requestedEvent = this.eventContainers.find(x => x instanceof eventType) as TEvent;
		if(requestedEvent === undefined)
		{
			console.error(`Event ${eventType} is undefined.`);
			throw new Error(`Event ${eventType} is undefined.`);
		}

		return requestedEvent;
	}

	/**
	 * Binds event handler with a method of state modifier for modifications.
	 * @param storeProperty one of store properties.
	 * @param eventHandler event handler that must be subscribed.
	 * @param stateModifierItem state modifier method that must be subscribed.
	 * @param stateModifierPropertyName state modifier method name, used for 
	 * in reason why state has changed.
	 */
	private subscribe<K extends keyof T, TArgs>(
		storeProperty:K,
		eventHandler: Event<TArgs>,
		stateModifierItem: (prevState:T[K], args: TArgs) => T[K],
		stateModifierPropertyName: string)
	{
		eventHandler.add((sender, args) =>
		{
			const prevState = this.storeInstance[storeProperty] as any;
			const newState = stateModifierItem(prevState, args) as any
			if(newState === undefined)
			{
				throw new Error(`Function ${stateModifierPropertyName} returns undefined state which is not acceptable`);
			}

			let newStorePropertyValue: any;
			if(this.isObject(prevState))
			{
				newStorePropertyValue = 
				{
					...prevState,
					...newState
				};
			}
			else
			{
				newStorePropertyValue = newState;
			}

			const newStoreState = this.storeInstance as any;
			this.storeInstance = {
				...newStoreState,
			};

			this.storeInstance[storeProperty] = newStorePropertyValue;
			this.onStateChanged(stateModifierPropertyName);
		});
	}

	/**
	 * Processes provided events.
	 */
	private initializeEvents(eventContainers: EventContainerType<any>[]): void
	{
		for (const eventContainerType of eventContainers)
		{
			this.eventContainers.push(new eventContainerType());
		}
	}

	/**
	 * 
	 * @param storeInstance instance of contained store.
	 * @param storeType type of contained store.
	 */
	private initializeOwnState(storeInstance: T, storeType: Type<T>): void
	{
		const ownStates: Array<StoreState<T>> = Reflect.getMetadata(
			MetadataKeys.storeOwnStates,
			storeType.prototype);
		if(ownStates === undefined)
		{
			console.warn(
				`Store ${storeType.name} doesn't contain any state that can be modified`);
		}
		else
		{
			for (const storeProperty of ownStates)
			{
				const stateModifierType: Type<IStateModifier<any>> = Reflect.getMetadata(
					MetadataKeys.stateStateModifier,
					storeType.prototype,
					storeProperty);
		
				this.initializeStateModifier(
					storeInstance,
					stateModifierType,
					storeProperty);
			}
		}
	}

	/**
	 * Initializes and subscribes state modifier to events.
	 * @param storeInstance instance of contained store.
	 * @param stateModifierType Prototype of state modifier.
	 * @param storeProperty one of the properties of contained store.
	 */
	private initializeStateModifier<K extends keyof T>(
		storeInstance: T,
		stateModifierType: Type<IStateModifier<any>>,
		storeProperty: K): void
	{
		const stateModifier = new stateModifierType();
		if (storeInstance[storeProperty] === undefined)
		{
			storeInstance[storeProperty] = stateModifier.initialState;
		}

		const subscribedListeners: string[] = Reflect.getMetadata(
			MetadataKeys.subscribedListeners,
			stateModifierType.prototype) as string[];

		if(subscribedListeners === undefined)
		{
			console.warn(`No subscriptions are defined for ${stateModifierType.name}`)
		}
		else
		{
			for (const stateModifierPropertyName of subscribedListeners)
			{
				const eventResolver = Reflect.getMetadata(
						MetadataKeys.eventResolver,
						stateModifierType.prototype,
						stateModifierPropertyName) as IGetEventCallbackInfo<any, any>;

				const eventContainerInstance = this.getEvent(eventResolver.eventContainer);
				const eventHandler = eventResolver.getEventCallback(eventContainerInstance);
				const stateModifierItem = (stateModifier as any)[stateModifierPropertyName] as (prevState: any, args: any) => any;
				this.subscribe(storeProperty, eventHandler, stateModifierItem, stateModifierPropertyName);
			}
		}
	}

	/**
	 * Checks if provided value is object.
	 * @param value Value to check.
	 */
	private isObject(value: any): value is {}
	{
		return typeof value === "object";
	}

	/**
	 * Notifies by stateChanged event that state has changed.
	 * @param reason Reason why state has changed.
	 */
	private onStateChanged(reason: string): void
	{
		this.stateChanged.fire(this, { name: reason, newState: this.storeInstance });
	}
}
