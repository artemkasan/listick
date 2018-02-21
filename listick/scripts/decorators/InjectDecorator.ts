import * as MetadataKeys from "../core/MetadataKeys";

/**
 * Marks object that it can be injectable as service.
 * @param target Object that must be injectable.
 */
export function inject<T>(target: T): T
{
	Reflect.defineMetadata(MetadataKeys.inject, "true", target);
	// this must be assigned to add reflect-metadata to injectable object.
	return target;
}