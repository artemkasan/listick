import { Event } from "../core/Event";
import { Type } from "./Type";
import { Subscriber } from "rxjs/Subscriber";

export type SubscribtionCallback<TEvent, TArgs> =
	(eventsContainer: TEvent) => (actionCallback: (args: TArgs) => void) => void;

export interface IGetEventCallbackInfo<TEvent, TArgs>
{
	eventContainer: Type<TEvent>;
	getEventCallback: SubscribtionCallback<TEvent, TArgs>;
}
