import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createBrowserHistory } from 'history';
import * as RoutesModule from "./routes";

import { buildStore } from "listick";
import { StoreContainer } from "listick-react";
import { subscribeDevTools } from "listick-devtools";

import { AppStore } from "./AppStore";

let routes = RoutesModule.routes;
const appStore = buildStore(AppStore);

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href")!;
const history = createBrowserHistory({ basename: baseUrl });

subscribeDevTools(appStore);

ReactDOM.render(
	<StoreContainer store={appStore}>
		<Router history={history} children={routes} />
	</StoreContainer>,
	document.getElementById("react-app")
);
