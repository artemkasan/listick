import { SimpleEvent } from "listick";

export class CounterEvents
{
	public increment: SimpleEvent<number> = new SimpleEvent<number>();

	public decrement: SimpleEvent<number> = new SimpleEvent<number>();
}