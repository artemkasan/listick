import {inject} from "listick";
import * as H from "history";

import { RouterEvents } from "./RouterEvents";

@inject export class RouterService
{
	constructor(
		private history: H.History,
		private routerEvents:RouterEvents) {
		this.history.listen((location, action)=>{
			routerEvents.changeLocation.fire(this, {
				location: location
			})
		});
		this.routerEvents.changeLocation.fire(
			this,
			{ location: this.history.location });
	}
	
	public push(location: H.LocationDescriptorObject) : void;
	public push(path: string, state?: any): void;
	public push(x: any, state?: any): void {
		if(this.isLocation(x)) {
			this.history.push(x);
		} else {
			this.history.push(x, state);
		}
	}

	public replace(location: H.LocationDescriptorObject) : void;
	public replace(path: string, state?: any): void
	public replace(x: any, state?: any):void {
		if(this.isLocation(x)) {
			this.replace(x);
		} else {
			this.replace(x, state);
		}
	}

	public go(n: number): void {
		this.history.go(n);
	}

	public goBack(): void {
		this.history.goBack();
	}
	
	public goForward(): void {
		this.history.goForward();
	}

	public block(prompt?: boolean | string | H.TransitionPromptHook): void {
		this.history.block(prompt);
	}

	private isLocation(x: any): x is H.LocationDescriptorObject {
		return (<H.LocationDescriptorObject>x).pathname !== undefined;
	}
}