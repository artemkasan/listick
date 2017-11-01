import * as React from "react";
import { connect } from "listick-react";
import { AppStore } from "../appStore";
import { ICounterState } from "../stateModifiers/counterStateModifier";
import { CounterService } from "../services/counterService";

interface ICounterProps
{
	text: string;
}

@connect<ICounterProps, ICounterState>((store: AppStore) => store.counterState)
export default class Counter extends React.Component<ICounterProps, ICounterState>
{
	constructor(props: ICounterProps, context: any,
		private counterService: CounterService)
	{
		super(props, context);
	}

	public render()
	{
		return <div>{this.props.text} Counter: {this.state.counter} <button onClick={() => this.onIncrement()} >Increment</button> <button onClick={() => this.onDecrement()} >Decrement</button></div>;
	}

	private onIncrement()
	{
		this.counterService.Increment();
	}

	private onDecrement()
	{
		this.counterService.Decrement();
	}
};