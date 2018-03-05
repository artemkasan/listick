import { EventContainerType, IStoreOptions } from "../decorators/StoreOptions";
import { Event } from "../core/Event";
import { IGetEventCallbackInfo } from "./GetEventCallbackInfo";
import * as MetadataKeys from "./MetadataKeys";
import { ServiceProvider } from "./ServiceProvider";
import { Type } from "./Type";
import { IStateModifier } from "./IStateModifier";
import { ServiceDescriptor } from "./ServiceDescriptor";

export type StoreState<T> = keyof T;

export interface IStateModifierLink<T>{
	propertyName: StoreState<T>;
	stateModifier: Type<IStateModifier<T[StoreState<T>]>>;
}

/**
 * Store holds and manage state in listick.
 */
export class Store<T>
{
	/**
	 * This event is fired when state of current store has changed.
	 */
	public stateChanged = new Event<{ name: string, newState:T}>();

	constructor(
		private storeInstance: T,
		stateModifiersLinks: IStateModifierLink<T>[],
		private serviceProvider: ServiceProvider) {

		for(const stateModifiersLink of stateModifiersLinks) {
			this.addStateModifier(
				stateModifiersLink.stateModifier,
				stateModifiersLink.propertyName);
			}
	}

	/**
	 * Gets current store.
	 */
	public getStoreState(): T {
		return this.storeInstance;
	}

	/**
	 * Sets current store state.
	 * @param value New store state.
	 */
	public setStoreState(value: T, reason?: string) {
		this.storeInstance = value;
		this.onStateChanged(reason || "setStore");
	}

	/**
	 * Gets registered service or throw an exception if it is not found.
	 * @param serviceType Prototype of service to search.
	 */
	public getService<TService>(serviceType: Type<TService>): TService {
		const service = this.serviceProvider.getService(serviceType);
		if (service === null) {
			console.error(`Service ${serviceType} is undefined.`);
			throw new Error(`Service ${serviceType} is undefined.`);
		}
		return service;
	}

	/**
	 * Registers new service in current store.
	 * @param serviceType service type to register.
	 */
	public registerService<TService>(serviceType: Type<TService> | ServiceDescriptor): TService | null {
		return this.serviceProvider.registerService(serviceType);
	}

	/**
	 * Gets registered event or throw an exception if it is not found.
	 * @param eventType Prototype of event to search.
	 */
	public getEvent<TEvent>(eventType: Type<TEvent>): TEvent {
		const requestedEvent = this.serviceProvider.getEvent(eventType);
		if(requestedEvent !== null) {
			return requestedEvent;
		}

		console.error(`Event ${eventType} is undefined.`);
		throw new Error(`Event ${eventType} is undefined.`);
	}

	/**
	 * Registers new event type in this store.
	 * @param eventType new event type that must be registered in current store.
	 */
	public registerEvent<TEvent>(eventType: Type<TEvent>): TEvent {
		return this.serviceProvider.registerEvent(eventType);
	}

	/**
	 * Subscribes state modifier to events related to this state.
	 * @param storeInstance instance of contained store.
	 * @param stateModifierType Prototype of state modifier.
	 * @param storeProperty one of the properties of contained store.
	 */
	public addStateModifier<K extends keyof T, TStateModifier extends IStateModifier<T[K]>>(
		stateModifierType: Type<TStateModifier>,
		storeProperty: K): void {

		type StateModifierProperty = keyof TStateModifier;
		const stateModifier = new stateModifierType();
		if (this.storeInstance[storeProperty] === undefined &&
			stateModifier.initialState !== undefined) {
			this.storeInstance[storeProperty] = stateModifier.initialState;
		}

		const subscribedListeners = Reflect.getMetadata(
			MetadataKeys.subscribedListeners,
			stateModifierType.prototype) as StateModifierProperty[];

		if(subscribedListeners === undefined) {
			console.warn(`No subscriptions are defined for ${stateModifierType.name}`)
		} else {
			for (const stateModifierPropertyName of subscribedListeners) {
				const eventResolver = Reflect.getMetadata(
						MetadataKeys.eventResolver,
						stateModifierType.prototype,
						stateModifierPropertyName) as IGetEventCallbackInfo<any, any>;

				const eventContainerInstance = this.getEvent(eventResolver.eventContainer);
				const eventHandler = eventResolver.getEventCallback(eventContainerInstance);
				const stateModifierItem = 
					stateModifier[stateModifierPropertyName] as any as (prevState: T[K], args: any) => Partial<T[K]>;
				eventHandler(
					this.subscribe(storeProperty, stateModifierItem, stateModifierPropertyName));
			}
		}
	}

	/**
	 * Initializes subscription to state modification.
	 * @param storeProperty one of store properties.
	 * @param stateModifierItem state modifier method that must be subscribed.
	 * @param stateModifierPropertyName state modifier method name, used for 
	 * in reason why state has changed.
	 * @returns callback that must be fired for state modification
	 */
	public subscribe<K extends keyof T, TArgs>(
		storeProperty:K,
		stateModifierItem: (prevState:T[K], args: TArgs) => Partial<T[K]>,
		stateModifierPropertyName: string): (args: TArgs) => void {
		return (args: TArgs) => {
			const prevState = this.storeInstance[storeProperty] as any;
			const newState = stateModifierItem(prevState, args) as any
			if(newState === undefined) {
				throw new Error(`function ${stateModifierPropertyName} returns undefined state which is not acceptable`);
			}

			let newStorePropertyValue: any;
			if(this.isObject(prevState)) {
				newStorePropertyValue = {
					...prevState,
					...newState
				};
			} else {
				newStorePropertyValue = newState;
			}

			const newStoreState = this.storeInstance as any;
			this.storeInstance = {
				...newStoreState,
			};

			this.storeInstance[storeProperty] = newStorePropertyValue;
			this.onStateChanged(stateModifierPropertyName);
		};
	}

	/**
	 * Checks if provided value is object.
	 * @param value Value to check.
	 */
	private isObject(value: any): value is {} {
		return typeof value === "object";
	}

	/**
	 * Notifies by stateChanged event that state has changed.
	 * @param reason Reason why state has changed.
	 */
	private onStateChanged(reason: string): void {
		this.stateChanged.fire(this, { name: reason, newState: this.storeInstance });
	}
}
