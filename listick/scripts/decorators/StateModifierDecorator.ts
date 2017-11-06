import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";

export function stateModifier<TState>(initialState: TState): ClassDecorator
{
	return <T>(target: T): T =>
	{
		Reflect.defineMetadata(MetadataKeys.initialState, initialState, target);
		return target;
	};
}
