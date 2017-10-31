import { EventContainerType } from "../decorators/StoreOptions";
import { Type } from "./Type";

export class EventsProvider
{
	private eventContainerInstances: any[] = [];

	constructor(eventContainers: Array<EventContainerType<any>>)
	{
		for (const eventContainer of eventContainers)
		{
			switch (typeof eventContainer)
			{
				case "function":
					this.eventContainerInstances.push(new eventContainer());
					break;
				case "object":
					this.eventContainerInstances.push(eventContainer);
					break;
			}
		}
	}

	public getEventContainer<T>(type: Type<T>): T | undefined
	{
		const eventContainer = this.eventContainerInstances.find(x =>
		{
			if (x instanceof type)
			{
				return true;
			}
			return false;
		});

		return eventContainer;
	}
}