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
	public stateChanged: SimpleEvent<T> = new SimpleEvent<T>();

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
			this.initializeStateModifier(storeInstance, storeType, storeProperty);
		}
	}

	public getStore(): T
	{
		return this.storeInstance;
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

	private initializeStateModifier<K extends keyof T>(storeInstance: T, storeType: Type<T>, storeProperty: K): void
	{
		const stateModifierType: Type<IStateModifier<T[K]>> = Reflect.getMetadata(
			MetadataKeys.stateStateModifier,
			storeType.prototype,
			storeProperty);
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
				const stateModifierProperty = (stateModifier as any)[stateModifierPropertyName];
				const stateModifierItem = (stateModifier as any)[stateModifierPropertyName] as (prevState: any, args: any) => any;
				eventHandler.add((sender, args) =>
				{
					const prevState = storeInstance[storeProperty] as any;
					const newState = stateModifierItem(prevState, args)
					if(this.isObject(prevState))
					{
						storeInstance[storeProperty] = 
						{
							...prevState,
							...newState
						};
					}
					else
					{
						storeInstance[storeProperty] = newState;
					}
					this.onStateChanged();
				});
			}
		}
	}

	private isObject(value: any): value is {}
	{
		return typeof value === "object";
	}

	private onStateChanged(): void
	{
		this.stateChanged.fire(this, this.storeInstance);
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
