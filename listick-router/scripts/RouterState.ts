import { store, state, ServiceDescriptor } from "listick";
import { RouterEvents } from "./RouterEvents";
import { RouterService } from "./RouterService";
import { RouterStateModifier, IRouterState } from "./RouterStateModifier";

@store({
	eventContainers: [RouterEvents]
})
export class RouterState {
	@state(RouterStateModifier)
	public routerState: IRouterState = { location: {
		pathname: "",
		search: "",
		state: null,
		hash: ""
		}};
};
