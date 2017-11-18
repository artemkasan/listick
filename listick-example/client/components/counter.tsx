import * as React from "react";
import { RouteComponentProps } from "react-router";
import { connect } from "listick-react";

import { AppStore } from "../appStore";
import { ICounterState } from "../stateModifiers/counterStateModifier";
import { CounterService } from "../services/counterService";
import { Button, Progress } from "semantic-ui-react";

@connect<RouteComponentProps<any>, ICounterState>((store: AppStore) => store.counterState)
export default class Counter extends React.Component<RouteComponentProps<any>, ICounterState>
{
	/**
	 * Creates new instance of counter component. Here we have to set service with ? sign
	 * because React typings specify constructor with two arguments and router uses it
	 * we have to set counterService as optional and later set ! mark when we call it.
	 * @param props React props
	 * @param context React context
	 * @param counterService Service that is injected by connect decorator.
	 */
	constructor(props: RouteComponentProps<any>, context?: any,
		private counterService?: CounterService)
	{
		super(props, context);
	}

	public render()
	{
		return <div>
			<h1>Current progress</h1>
			<Progress percent={this.state.counter} indicating />
			<Button onClick={() => this.onIncrement()} >Increment</Button>
			<Button onClick={() => this.onDecrement()} >Decrement</Button>
		</div>;
	}

	private onIncrement()
	{
		this.counterService!.Increment();
	}

	private onDecrement()
	{
		this.counterService!.Decrement();
	}
};