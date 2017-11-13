import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import {IStateModifier} from '../core/IStateModifier';
import {Type} from "../core/Type";

/**
 * Marks store property that it is state that can be changed.
 * @param stateModifier State modifier prototype.
 */
export function state<T extends IStateModifier<any>>(stateModifier: Type<T>): PropertyDecorator
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
