import { CounterEvents } from "../events/counterEvents";
import { inject } from "listick";

/**
 * Simple service with two methods which fire two events
 * increment and decrement.
 */
@inject export class CounterService
{
	constructor(private counterEvents: CounterEvents)
	{ }

	public Increment(): void
	{
		this.counterEvents.increment.fire(this, 1);
	}

	public Decrement(): void
	{
		this.counterEvents.decrement.fire(this, 1);
	}
}