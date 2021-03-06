import "babel-polyfill";
import "isomorphic-fetch";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createBrowserHistory } from 'history';
import * as RoutesModule from "./routes";

import { buildStore } from "listick";
import { StoreContainer } from "listick-react";
import { subscribeDevTools } from "listick-devtools";

import { AppStore } from "./appStore";
import { Container } from "semantic-ui-react";

import './styles/main.scss';

let routes = RoutesModule.routes;
const appStore = buildStore(AppStore, (window as any).initialState);

const baseUrl: string = document.getElementsByTagName("base")[0].getAttribute("href")!;
const history = createBrowserHistory({ basename: baseUrl });

// subscribe redux-dev-tools to watch for Listick store.
subscribeDevTools(appStore);

ReactDOM.hydrate(
	<StoreContainer store={appStore}>
		<Router history={history} children={routes} />
	</StoreContainer>,
	document.getElementById("react-app")
);
