import "babel-polyfill";
import "isomorphic-fetch";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createBrowserHistory } from 'history';
import * as RoutesModule from "./routes";

import { buildStore } from "listick";
import { StoreContainer } from "listick-react";
import { AppStore } from "./AppStore";
import { Container } from "semantic-ui-react";

let routes = RoutesModule.routes;
const appStore = buildStore(AppStore);

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href")!;
const history = createBrowserHistory({ basename: baseUrl });

ReactDOM.render(
	<StoreContainer store={appStore}>
		<Router history={history} children={routes} />
	</StoreContainer>,
	document.getElementById("react-app")
);
