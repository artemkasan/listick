import * as MetadataKeys from "./MetadataKeys";
import { EventContainerType, ServiceType } from "../decorators/StoreOptions";
import { Type } from "./Type";

export class ServiceProvider
{
	private serviceInstances: any[] = [];

	constructor(
		private eventContainers: any[],
		private services?: Array<ServiceType<any>>)
	{
	}

	public getService<T>(type: Type<T>): T | undefined
	{
		const requestedService = this.serviceInstances.find(x => x instanceof type) as T;
		if (requestedService !== undefined)
		{
			return requestedService;
		}

		const injected = Reflect.getMetadata(MetadataKeys.inject, type);
		if (injected !== "true")
		{
			console.log(`You must define @inject for service ${type}`);
			return undefined;
		}

		const inputArgs: Type<any>[] = Reflect.getMetadata("design:paramtypes", type)
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

		const serviceInstance = new type(...serviceArgs);
		this.serviceInstances.push(serviceInstance);

		return serviceInstance;
	}

	private resolveService<T>(type: Type<T>): T | undefined
	{
		if (this.services === undefined)
		{
			return undefined;
		}
	}
}
