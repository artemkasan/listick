import { subscribe, SimpleEvent } from "listick";
import { CounterEvents } from "../events/counterEvents";

export interface ICounterState
{
	counter: number;
}

export class CounterStateModifier
{
	initialState: ICounterState = { counter: 2 };

	@subscribe(CounterEvents, es => es.increment)
	public onIncrement(prevState: ICounterState, args: number): Partial<ICounterState>
	{
		return {
			...prevState,
			counter: prevState.counter + args
		};
	}

	@subscribe(CounterEvents, es => es.decrement)
	public onDecrement(prevState: ICounterState, args: number): Partial<ICounterState>
	{
		return {
			...prevState,
			counter: prevState.counter - args
		}
	}
}