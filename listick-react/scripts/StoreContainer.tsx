import * as PropTypes from "prop-types";
import * as React from "react";

import { Store } from "listick";

export interface IStoreContainerProps
{
	store: Store<any>;
}

/**
 * Root object which allows to connect child react components to the Listik store.
 */
export default class StoreContainer extends React.Component<IStoreContainerProps, {}>
{
	/**
	 * Set Listick store as context of React child components.
	 */
	public static childContextTypes = {
		store: PropTypes.object.isRequired,
	};

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
}
