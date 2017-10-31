import { CounterEvents } from "../events/counterEvents";
import { inject } from "listick";

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