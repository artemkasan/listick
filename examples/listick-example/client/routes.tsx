import * as React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from './components/home';
import Counter from './components/counter';
import Layout from "./components/layout";
import Weather from "./components/weather";


export const routes = <Layout>
	<Switch>
		<Redirect exact from="/" to="/home" />
		<Route path="/home" component={ Home } />
		<Route path="/counter" component = { Counter } />
		<Route path="/weather" component = { Weather } />
	</Switch>
</Layout>;
