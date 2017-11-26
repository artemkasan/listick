import * as React from "react";
import { renderToString } from 'react-dom/server';
import { StaticRouter } from "react-router";

import { buildStore } from "listick";
import { StoreContainer } from "listick-react";

import * as RoutesModule from "./routes";
import { AppStore } from "./appStore";

import { createServerRenderer, RenderResult } from 'aspnet-prerendering';

function decode(str: string ) {
	return str.replace(/&#(\d+);/g, function(match, dec)
	{
		return String.fromCharCode(dec);
	});
}
export default createServerRenderer(params =>
{
	return new Promise<RenderResult>((resolve, reject) => {

		let routes = RoutesModule.routes;
		const appStore = buildStore(AppStore, params.data);

		const basename = params.baseUrl.substring(0, params.baseUrl.length - 1); // Remove trailing slash

		const routerContext: any = {};
		const app = (
			<StoreContainer store={appStore}>
				<StaticRouter 
					basename={ basename } 
					context={ routerContext } 
					location={ params.location.path } 
					children={ routes } />
			</StoreContainer>);

		const renderedHtml = decode(renderToString(app));

		// If there's a redirection, just send this information back to the host application
		if (routerContext.url)
		{
			resolve({ redirectUrl: routerContext.url });
			return;
		}

		resolve({
			html: renderedHtml,
			globals: { initialState: appStore.getStoreState() }
		});
	});
});