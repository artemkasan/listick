import { SimpleEvent } from "../events/SimpleEvent";
import { Type } from "./Type";

export type GetEventCallback<TEvent, TArgs> = (eventsContainer: TEvent) => SimpleEvent<TArgs>;

export interface IGetEventCallbackInfo<T, TArgs>
{
	eventContainer: Type<T>;
	getEventCallback: GetEventCallback<T, TArgs>;
}
