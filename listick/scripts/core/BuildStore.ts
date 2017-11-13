import { Store } from "./Store";
import { Type } from "./Type";

/**
 * Builds new store that is the root object for listick.
 * @param storeType Prototype of store.
 * @param initialState Initial state of store.
 */
export function buildStore<T>(storeType: Type<T>, initialState?: T): Store<T>
{
	const newStore = new storeType();
	const storeContainer: Store<T> = new Store(newStore, storeType);
	return storeContainer;
}
