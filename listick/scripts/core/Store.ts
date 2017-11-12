import { EventContainerType, IStoreOptions } from "../decorators/StoreOptions";
import { SimpleEvent } from "../events/SimpleEvent";
import { IGetEventCallbackInfo } from "./GetEventCallbackInfo";
import * as MetadataKeys from "./MetadataKeys";
import { ServiceProvider } from "./ServiceProvider";
import { Type } from "./Type";
import { IStateModifier } from "./IStateModifier";

type StoreState<T> = keyof T;

export class Store<T>
{
	public stateChanged: SimpleEvent<{ name: string, newState:T}> = new SimpleEvent<{ name: string, newState:T}>();

	private serviceInjector: ServiceProvider;
	private eventContainers: any[] = [];

	constructor(
		private storeInstance: T,
		storeType: Type<T>)
	{
		const storeOptions: IStoreOptions = Reflect.getMetadata(MetadataKeys.storeOptions, storeType);
		if (storeOptions === undefined)
		{
			throw new Error("You need to apply @store decorator for yor store");
		}

		for (const eventContainerType of storeOptions.eventContainers)
		{
			this.eventContainers.push(new eventContainerType());
		}

		this.serviceInjector = new ServiceProvider(this.eventContainers, storeOptions.services);

		const ownStates: Array<StoreState<T>> = Reflect.getMetadata(MetadataKeys.storeOwnStates, storeType.prototype);
		for (const storeProperty of ownStates)
		{
			const stateModifierType: Type<IStateModifier<any>> = Reflect.getMetadata(
				MetadataKeys.stateStateModifier,
				storeType.prototype,
				storeProperty);
	
			this.initializeStateModifier(storeInstance, stateModifierType, storeProperty);
		}
	}

	public getStore(): T
	{
		return this.storeInstance;
	}

	public setStore(value: T)
	{
		this.storeInstance = value;
		this.onStateChanged("setStore");
	}

	public getService<TService>(serviceType: Type<TService>): TService
	{
		const service = this.serviceInjector.getService(serviceType);
		if (service === undefined)
		{
			console.error(`Service ${serviceType} is undefined.`);
			throw new Error(`Service ${serviceType} is undefined.`);
		}
		return service;
	}

	public getEvent<TEvent>(eventType: Type<TEvent>): TEvent
	{
		const requestedEvent = this.eventContainers.find(x => x instanceof eventType) as TEvent;
		if(requestedEvent === undefined)
		{
			console.error(`Event ${eventType} is undefined.`);
			throw new Error(`Service ${eventType} is undefined.`);
		}

		return requestedEvent;
	}

	public subscribe<K extends keyof T, TArgs>(
		storeProperty:K,
		eventHandler: SimpleEvent<TArgs>,
		stateModifierItem: (prevState:T[K], args: TArgs) => T[K],
		stateModifierPropertyName: string)
	{
		eventHandler.add((sender, args) =>
		{
			const prevState = this.storeInstance[storeProperty] as any;
			const newState = stateModifierItem(prevState, args) as any
			if(newState === undefined)
			{
				throw new Error(`function ${stateModifierPropertyName} returns undefined state which is not acceptable`);
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

				const eventContainerInstance = this.getEventContainerInstance(eventResolver.eventContainer);
				const eventHandler = eventResolver.getEventCallback(eventContainerInstance);
				const stateModifierItem = (stateModifier as any)[stateModifierPropertyName] as (prevState: any, args: any) => any;
				this.subscribe(storeProperty, eventHandler, stateModifierItem, stateModifierPropertyName);
			}
		}
	}

	private isObject(value: any): value is {}
	{
		return typeof value === "object";
	}

	private onStateChanged(eventName: string): void
	{
		this.stateChanged.fire(this, { name: eventName, newState: this.storeInstance });
	}

	private getEventContainerInstance<TType>(eventContainerType: EventContainerType<TType>): TType
	{
		for (const eventContainer of this.eventContainers)
		{
			if (eventContainer instanceof eventContainerType)
			{
				return eventContainer;
			}
		}

		throw new Error(`Unable to allocate event container with type ${eventContainerType}`);
	}
}
