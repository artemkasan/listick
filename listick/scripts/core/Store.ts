import { IStateModifierOptions } from "../decorators/StateModifierOptions";
import { EventContainerType, IStoreOptions } from "../decorators/StoreOptions";
import { SimpleEvent } from "../events/SimpleEvent";
import { IGetEventCallbackInfo } from "./GetEventCallbackInfo";
import * as MetadataKeys from "./MetadataKeys";
import { ServiceProvider } from "./ServiceProvider";
import { Type } from "./Type";

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

	private initializeStateModifier(storeInstance: T, storeType: Type<T>, storeProperty: keyof T): void
	{
		const stateModifierType: Type<any> = Reflect.getMetadata(
			MetadataKeys.stateStateModifier,
			storeType.prototype,
			storeProperty);
		const stateModifierOptions: IStateModifierOptions<T[keyof T]> = Reflect.getMetadata(
			MetadataKeys.stateModifierOptions,
			stateModifierType);

		if (stateModifierOptions.initialState !== undefined)
		{
			storeInstance[storeProperty] = stateModifierOptions.initialState;
		}

		const stateModifier = new stateModifierType();
		const subscribedListeners: string[] = Reflect.getMetadata(
			MetadataKeys.subscribedListeners,
			stateModifierType.prototype) as string[];

		for (const stateModifierPropertyName of subscribedListeners)
		{
			const eventResolver = Reflect.getMetadata(
					MetadataKeys.eventResolver,
					stateModifierType.prototype,
					stateModifierPropertyName) as IGetEventCallbackInfo<any, any>;

			const eventContainerInstance = this.getEventContainerInstance(eventResolver.eventContainer);
			const eventHandler = eventResolver.getEventCallback(eventContainerInstance);
			const stateModifierItem = stateModifier[stateModifierPropertyName] as (prevState: any, args: any) => any;
			eventHandler.add((sender, args) =>
			{
				storeInstance[storeProperty] = stateModifierItem(storeInstance[storeProperty], args);
				this.onStateChanged();
			});
		}
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
