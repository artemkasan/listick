import * as MetadataKeys from "./MetadataKeys";
import { EventContainerType, ServiceType } from "../decorators/StoreOptions";
import { Type } from "./Type";
import { ServiceDescriptor } from './ServiceDescriptor';

/**
 * This class controls access to services.
 */
export class ServiceProvider
{
	private _services: ServiceDescriptor[] = [];

	constructor(
		private eventContainers: any[],
		services: Array<ServiceType> | undefined)
	{
		if(services !== undefined)
		{
			for (const service of services)
			{
				let serviceDescriptor = service as ServiceDescriptor;
				if(!this.isServiceType(service))
				{
					serviceDescriptor = new ServiceDescriptor(service, "singleton");
				}
				this._services.push(serviceDescriptor);
			}
		}
	}

	/**
	 * Searches for a service or undefined if it was not found.
	 * @param type Required service type.
	 */
	public getService<T>(type: Type<T>): T | null
	{
		if(this._services.length === 0)
		{
			return null;
		}

		for (const serviceInfo of this._services)
		{
			if(serviceInfo.type == type)
			{
				if(serviceInfo.lifetime === 'singleton')
				{
					if(serviceInfo.implementationInstance !== undefined)
					{
						return serviceInfo.implementationInstance;
					}
				}

				return this.getOrInitService(serviceInfo);
			}
		}

		return null;
	}

	private getOrInitService<T>(serviceDescriptor: ServiceDescriptor): T | null
	{
		if(serviceDescriptor.initFunction !== undefined)
		{
			const objectInstance = serviceDescriptor.initFunction(this) as T;
			if(serviceDescriptor.lifetime == "singleton")
			{
				serviceDescriptor.implementationInstance = objectInstance;
			}
			return objectInstance;
		}

		const injected = Reflect.getMetadata(MetadataKeys.inject, serviceDescriptor.type);
		if (injected !== "true")
		{
			console.log(`You must define @inject for service ${serviceDescriptor.type}`);
			return null;
		}

		const inputArgs: Type<any>[] = Reflect.getMetadata("design:paramtypes", serviceDescriptor.type)
		const serviceArgs: any[] = [];
		for (const inputArg of inputArgs)
		{
			const requestedEventContainer = this.eventContainers.find(x => x instanceof inputArg);
			if (requestedEventContainer !== undefined)
			{
				serviceArgs.push(requestedEventContainer);
			}
			else
			{
				const serviceArg = this.getService(inputArg);
				if (serviceArg === undefined)
				{
					console.log(`You must define @inject for service ${inputArg}`);
				}
				serviceArgs.push(serviceArg);
			}
		}

		const serviceInstance = new serviceDescriptor.type(...serviceArgs);
		if(serviceDescriptor.lifetime == "singleton")
		{
			serviceDescriptor.implementationInstance = serviceInstance;
		}
		return serviceInstance;
	}

	private isServiceType<T>( value: ServiceType): value is ServiceDescriptor
	{
		if((value as any).lifetime !== undefined)
		{
			return true;
		}

		return false;
	}
}
