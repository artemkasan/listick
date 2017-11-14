import "reflect-metadata";

import * as MetadataKeys from "../core/MetadataKeys";
import { IStoreOptions } from "./StoreOptions";

/**
 * Marks object as store.
 * @param options Store options.
 */
export function store<TState>(options: IStoreOptions): ClassDecorator
{
	return <T>(target: T): T =>
	{
		Reflect.defineMetadata(MetadataKeys.storeOptions, options, target);
		return target;
	};
}
