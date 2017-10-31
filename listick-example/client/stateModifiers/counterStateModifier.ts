import { subscribe, stateModifier, SimpleEvent } from "listick";
import { CounterEvents } from "../events/counterEvents";

export interface ICounterState
{
	counter: number;
}

@stateModifier<ICounterState>({
	eventContainers: [CounterEvents],
	initialState: { counter: 2 },
})
export class CounterStateModifier
{
	@subscribe(CounterEvents, (counterEvents:CounterEvents) => counterEvents.increment)
	public onIncrement(prevState: ICounterState, args: number): ICounterState
	{
		return {
			...prevState,
			counter: prevState.counter + args
		};
	}

	@subscribe(CounterEvents, (counterEvents: CounterEvents) => counterEvents.decrement)
	public onDecrement(prevState: ICounterState, args: number): ICounterState
	{
		return {
			...prevState,
			counter: prevState.counter - args
		}
	}
}