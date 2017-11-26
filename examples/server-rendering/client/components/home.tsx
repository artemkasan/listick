import * as React from "react";
import { RouteComponentProps } from "react-router-dom";

/**
 * Simple component that uses Greeting component.
 */
export default class Home extends React.Component<RouteComponentProps<any>, {}>
{
	public render()
	{
		return <div><h1>Greeting by Listick</h1>
		</div>;
	}
};
