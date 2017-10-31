import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import { Type } from "../core/Type";
import { IStateOptions } from "./StateOptions";

export function state(options: IStateOptions): PropertyDecorator
{
	return <TObject extends FunctionConstructor, TProperty extends keyof TObject>(
		target: TObject,
		propertyKey: TProperty) =>
	{
		Reflect.defineMetadata(MetadataKeys.stateStateModifier, options.stateModifier, target, propertyKey);
		const states: string[] = Reflect.getMetadata(MetadataKeys.storeOwnStates, target) || [];

		states.push(propertyKey);
		Reflect.defineMetadata(MetadataKeys.storeOwnStates, states, target);
	};
}
