import { extendStore, Store, Dispatcher, ServiceDescriptor } from "listick";
import * as H from "history";
import { RouterService } from "./RouterService";
import { RouterState } from "./RouterState";
import { RouterEvents } from "./RouterEvents";

export function subscribeHistory<TState>(
	store: Store<TState>,
	history: H.History) : Store<TState & RouterState>
{
	const result = extendStore(store, RouterState);
	const routerEvents = result.getEvent(RouterEvents);
	if(routerEvents == null) {
		throw new Error("Failed to extend store with routing. RouterEvents was not registered.");
	}
	const routerService = new RouterService(history, routerEvents);
	result.registerService(ServiceDescriptor.instance(RouterService, routerService));
	return result;
}