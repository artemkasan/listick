import { subscribe, stateModifier, SimpleEvent } from "listick";
import { CounterEvents } from "../events/counterEvents";

export interface ICounterState
{
	counter: number;
}

@stateModifier<ICounterState>({ counter: 2 })
export class CounterStateModifier
{
	@subscribe(CounterEvents, es => es.increment)
	public onIncrement(prevState: ICounterState, args: number): ICounterState
	{
		return {
			...prevState,
			counter: prevState.counter + args
		};
	}

	@subscribe(CounterEvents, es => es.decrement)
	public onDecrement(prevState: ICounterState, args: number): ICounterState
	{
		return {
			...prevState,
			counter: prevState.counter - args
		}
	}
}