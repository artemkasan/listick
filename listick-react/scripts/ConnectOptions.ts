import { Type } from "./Type";

export interface IConnectOptions
{
	services?: Array<Type<any>>;
	states?: Array<Type<any>>;
}
