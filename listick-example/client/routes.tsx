import * as React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from './components/home';


export const routes = <div>
	<Switch>
		<Redirect exact from="/" to="/home" />
		<Route path="/home" component={ Home } />
	</Switch>
</div>;
