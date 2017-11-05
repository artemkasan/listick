import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";

export function state(stateModifier: Type<any>): PropertyDecorator
{
	return (
		target: Object,
		 propertyKey: string | symbol): void =>
	{
		Reflect.defineMetadata(MetadataKeys.stateStateModifier, stateModifier, target, propertyKey);
		const states: Array<string | symbol> = Reflect.getMetadata(MetadataKeys.storeOwnStates, target) || [];

		states.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.storeOwnStates, states, target);
	};
}
