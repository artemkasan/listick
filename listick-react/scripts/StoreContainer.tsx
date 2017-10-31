import * as PropTypes from "prop-types";
import * as React from "react";

import { Store } from "listick";

export interface IStoreContainerProps
{
	store: Store<any>;
}

export interface IStoreContainerState
{
	store: Store<any>;
}

export default class StoreContainer extends React.Component<IStoreContainerProps, IStoreContainerState>
{
	public static childContextTypes = {
		store: PropTypes.object.isRequired,
	};

	constructor(props: IStoreContainerProps, context?: any)
	{
		super(props, context);
		this.state = {
			store: props.store,
		};

		this.state.store.stateChanged.add((sender, args) => this.onStateChanged(sender, args));
	}

	public getChildContext()
	{
		return {
			store: this.props.store,
		};
	}

	public render()
	{
		return React.Children.only(this.props.children);
	}

	private onStateChanged(sender: any, args: any)
	{
		this.setState({
			store: this.state.store,
		});
	}
}
