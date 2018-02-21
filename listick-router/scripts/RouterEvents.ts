import { Event } from "listick";
import * as H from "history";

export interface IChangeLocationArgs {
//	action: "go" | "goBack" | "goForward" | "push" | "replace";
	location: H.Location;
}

export class RouterEvents
{
	public changeLocation = new Event<IChangeLocationArgs>();
}