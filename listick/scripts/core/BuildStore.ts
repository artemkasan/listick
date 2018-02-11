import * as MetadataKeys from "./MetadataKeys";

import { Store, StoreState, IStateModifierLink } from "./Store";
import { Type } from "./Type";
import { IStoreOptions } from "../decorators/StoreOptions";
import { ServiceProvider } from "./ServiceProvider";
import { IStateModifier } from "..";

/**
 * Builds new store that is the root object for listick.
 * @param storeType Prototype of store.
 * @param initialState Initial state of store.
 */
export function buildStore<T>(storeType: Type<T>, initialState?: T): Store<T>
{
	const newStore = initialState || new storeType();

	const storeOptions: IStoreOptions = Reflect.getMetadata(
		MetadataKeys.storeOptions,
		storeType);
	if (storeOptions === undefined) {
		throw new Error("You need to apply @store decorator for yor store");
	}

	const serviceProvider = new ServiceProvider(
		storeOptions.eventContainers,
		storeOptions.services);

	const stateModifiersLinks: IStateModifierLink<T>[] = [];
	const ownStates: Array<StoreState<T>> = Reflect.getMetadata(
			MetadataKeys.storeOwnStates,
			storeType.prototype);
	if(ownStates === undefined) {
		console.warn(
			`Store ${storeType.name} doesn't contain any state that can be modified`);
	} else {
		for (const storeProperty of ownStates) {
			const stateModifierType: Type<IStateModifier<any>> =
					Reflect.getMetadata(
						MetadataKeys.stateStateModifier,
						storeType.prototype,
						storeProperty);
			stateModifiersLinks.push({
				propertName: storeProperty,
				stateModifier: stateModifierType
			});
		}
	}

	const storeContainer: Store<T> = new Store(
		newStore,
		stateModifiersLinks,
		serviceProvider);

	return storeContainer;
}
