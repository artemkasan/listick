import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import Counter from "./Counter";

export default class Home extends React.Component<RouteComponentProps<any>, {}>
{
	public render()
	{
		return <div>Hello world <Counter text="John"></Counter></div>;
	}
};
