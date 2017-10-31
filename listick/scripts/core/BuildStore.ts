import { Store } from "./Store";
import { Type } from "./Type";

export function buildStore<T>(storeType: Type<T>, initialState?: T): Store<T>
{
	const newStore = new storeType();
	const storeContainer: Store<T> = new Store(newStore, storeType);
	return storeContainer;
}
