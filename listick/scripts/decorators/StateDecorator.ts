import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { IStateOptions } from "./StateOptions";

export function state(options: IStateOptions): PropertyDecorator
{
	return (
		target: Object,
		 propertyKey: string | symbol): void =>
	{
		Reflect.defineMetadata(MetadataKeys.stateStateModifier, options.stateModifier, target, propertyKey);
		const states: Array<string | symbol> = Reflect.getMetadata(MetadataKeys.storeOwnStates, target) || [];

		states.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.storeOwnStates, states, target);
	};
}
