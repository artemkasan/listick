import * as H from "history";

import { subscribe } from "listick";
import { RouterEvents, IChangeLocationArgs } from "./RouterEvents";

export interface IRouterState {
	location: H.Location;
}

export class RouterStateModifier {
	initialState: IRouterState = { location: {
		pathname: "",
		search: "",
		state: null,
		hash: ""
		}};

	@subscribe(RouterEvents, re => re.changeLocation)
	public onChangeLocation(prevState:IRouterState, args: IChangeLocationArgs)
		: Partial<IRouterState> {
		return {
			location: args.location
		};
	}

}