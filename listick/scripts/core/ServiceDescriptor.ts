import { Type } from './Type';
import { ServiceProvider } from './ServiceProvider';

export class ServiceDescriptor
{
	constructor(
		public type: Type<any>,
		public lifetime: "singleton" | "transient",
		public initFunction?: (serviceProvider: ServiceProvider) => any,
		public implementationInstance?: any)
	{
	}

	/**
	 * Get service descriptor for instance.
	 * @param type object type.
	 * @param objectInstance object instance.
	 */
	static instance<T>(type: Type<T>, objectInstance: T) : ServiceDescriptor
	{
		return new ServiceDescriptor(type, "singleton", undefined, objectInstance);
	}

	/**
	 * Get service descriptor for singleton.
	 * @param type Singleton type.
	 * @param initFunction opional initialize function for singleton object.
	 * 	if not set tries to instantiate it automatically.
	 */
	static singleton<T>(type: Type<T>, initFunction?:(serviceProvider: ServiceProvider) => T): ServiceDescriptor
	{
		if(initFunction !== undefined)
		{
			return new ServiceDescriptor(type, "singleton", initFunction);
		}

		return new ServiceDescriptor(type, "singleton");
	}

	/**
	 * Get service descriptor for transient.
	 * @param type Transient type.
	 * @param initFunction opional initialize function for transient object.
	 * 	if not set tries to instantiate it automatically.
	 */
	static transient<T>(type: Type<T>, initFunction?:(serviceProvider: ServiceProvider) => T): ServiceDescriptor
	{
		if(initFunction !== undefined)
		{
			return new ServiceDescriptor(type, "transient", initFunction);
		}
		
		return new ServiceDescriptor(type, "transient");
	}
};
