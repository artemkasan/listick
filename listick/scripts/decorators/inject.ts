import * as MetadataKeys from "../core/MetadataKeys";

export function inject<T>(target: T): T
{
	Reflect.defineMetadata(MetadataKeys.inject, "true", target);
	// this must be assigned to add reflect-metadata to injectable object.
	return target;
}