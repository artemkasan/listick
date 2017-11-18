import { Event } from "../core/Event";
import { Type } from "./Type";

export type GetEventCallback<TEvent, TArgs> = (eventsContainer: TEvent) => Event<TArgs>;

export interface IGetEventCallbackInfo<T, TArgs>
{
	eventContainer: Type<T>;
	getEventCallback: GetEventCallback<T, TArgs>;
}
