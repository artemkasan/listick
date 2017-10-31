import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { IStateModifierOptions } from "./StateModifierOptions";

export function stateModifier<TState>(options: IStateModifierOptions<TState>): ClassDecorator
{
	return <T>(target: T): T =>
	{
		Reflect.defineMetadata(MetadataKeys.stateModifierOptions, options, target);
		return target;
	};
}
