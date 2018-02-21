import * as MetadataKeys from "./MetadataKeys";
import { EventContainerType, ServiceType } from "../decorators/StoreOptions";
import { Type } from "./Type";
import { ServiceDescriptor } from './ServiceDescriptor';

interface IEventDescriptor<T> {
	type: Type<T>;
	instance: T
}
/**
 * This class controls access to services.
 */
export class ServiceProvider {
	private _services: ServiceDescriptor[] = [];
	private _events:IEventDescriptor<any>[] = [];

	private _parentServiceProvider: ServiceProvider | null = null;

	constructor(
		parentServiceProvider: ServiceProvider,
		events?: Type<any>[],
		services?: Array<ServiceType>);
	constructor(
		events: Type<any>[],
		services?: Array<ServiceType>);
	constructor(
		parentServiceProvider: any,
		events: any,
		services?: any) {

		if(parentServiceProvider instanceof ServiceProvider) {
			this._parentServiceProvider = events;
		} else {
			services = events;
			events = parentServiceProvider;
		}

		if(events !== undefined) {
			for(const eventType of events) {
				this.registerEvent(eventType);
			}
		}
		
		if(services !== undefined) {
			for (const service of services) {
				let serviceDescriptor = service as ServiceDescriptor;
				if(!this.isServiceType(service)) {
					serviceDescriptor = new ServiceDescriptor(service, "singleton");
				}
				this._services.push(serviceDescriptor);
			}
		}
	}

	/**
	 * Gets an event by it's type or null if it was not registered before.
	 * @param eventType event type to get.
	 */
	public getEvent<T>(eventType: Type<T>): T | null {
		for(const eventDescriptor of this._events) {
			if(eventDescriptor.type === eventType) {
				return eventDescriptor.instance;
			}
		}

		if(this._parentServiceProvider !== null) {
			return this._parentServiceProvider.getEvent(eventType);
		}

		return null;
	}

	/**
	 * Searches for a service or undefined if it was not found.
	 * @param type Required service type.
	 */
	public getService<T>(type: Type<T>): T | null {
		if(this._services.length === 0) {
			return null;
		}

		for (const serviceInfo of this._services) {
			if(serviceInfo.type == type) {
				return this.getOrInitService(serviceInfo);
			}
		}

		if(this._parentServiceProvider !== null) {
			return this._parentServiceProvider.getService(type);
		}

		return null;
	}

	/**
	 * 
	 * @param event event type to register.
	 */
	public registerEvent<T>(eventType: Type<T>): T {
		const event = new eventType();
		this._events.push({ type: eventType, instance: event });
		return event;
	}

	/**
	 * Registers new service in service provider.
	 * @param serviceType service type to register.
	 */
	public registerService<T>(serviceType: Type<T> | ServiceDescriptor): T | null {
		let serviceDescriptor = serviceType as ServiceDescriptor;
		if(!this.isServiceType(serviceType)) {
			serviceDescriptor = new ServiceDescriptor(serviceType, "singleton");
		}

		const existsServiceDescriptor = this._services.find(x => x.type === serviceDescriptor.type);
		if(existsServiceDescriptor === undefined) {
			this._services.push(serviceDescriptor);
		}
		return this.getOrInitService(serviceDescriptor);
	}

	private getOrInitService<T>(serviceDescriptor: ServiceDescriptor): T | null {
		for (const serviceInfo of this._services) {
			if(serviceInfo.type == serviceDescriptor.type) {
				if(serviceInfo.lifetime === 'singleton') {
					if(serviceInfo.implementationInstance !== undefined) {
						return serviceInfo.implementationInstance;
					}
				}
			}
		}

		if(serviceDescriptor.initFunction !== undefined) {
			const objectInstance = serviceDescriptor.initFunction(this) as T;
			if(serviceDescriptor.lifetime == "singleton") {
				serviceDescriptor.implementationInstance = objectInstance;
			}
			return objectInstance;
		}

		const injected = Reflect.getMetadata(MetadataKeys.inject, serviceDescriptor.type);
		if (injected !== "true") {
			console.log(`You must define @inject for service ${serviceDescriptor.type}`);
			return null;
		}

		const inputArgs: Type<any>[] = Reflect.getMetadata("design:paramtypes", serviceDescriptor.type)
		const serviceArgs: any[] = [];
		if(inputArgs !== undefined) {
			for (const inputArg of inputArgs) {
				const requestedEventContainer = this.getEvent(inputArg);
				if (requestedEventContainer !== null) {
					serviceArgs.push(requestedEventContainer);
				} else {
					const serviceArg = this.getService(inputArg);
					if (serviceArg == null) {
						console.log(`You must define @inject for service ${inputArg}`);
					}
					serviceArgs.push(serviceArg);
				}
			}
		}

		const serviceInstance = new serviceDescriptor.type(...serviceArgs);
		if(serviceDescriptor.lifetime == "singleton") {
			serviceDescriptor.implementationInstance = serviceInstance;
		}
		return serviceInstance;
	}

	private isServiceType<T>( value: ServiceType): value is ServiceDescriptor {
		if((value as any).lifetime !== undefined) {
			return true;
		}

		return false;
	}
}
