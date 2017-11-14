import { SimpleEvent } from "listick";

/**
 * Counter specific events.
 */
export class CounterEvents
{
	public increment: SimpleEvent<number> = new SimpleEvent<number>();

	public decrement: SimpleEvent<number> = new SimpleEvent<number>();
}