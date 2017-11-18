import { Event } from "listick";

/**
 * Counter specific events.
 */
export class CounterEvents
{
	public increment = new Event<number>();

	public decrement = new Event<number>();
}