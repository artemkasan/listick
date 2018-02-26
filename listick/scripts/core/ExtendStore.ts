import * as MetadataKeys from "./MetadataKeys";

import { Store, IStateModifierLink, StoreState } from "./Store";
import { Type } from "./Type";
import { IStoreOptions } from "../decorators/StoreOptions";
import { IStateModifier } from "./IStateModifier";


export function extendStore<T, U>(
	originalStore: Store<T>,
	stateType: Type<U>)
	: Store<T & U> {
		const newState: any = new stateType();
		const originalState: any = originalStore.getStoreState();
		const state:T&U = <T&U>{
			...originalState,
			...newState
		};

		for(const origStateProp in originalState) {
			for(const newStateProp in newState) {
				if(origStateProp == newStateProp) {
					console.warn(`State property ${newStateProp} intersection detected. \
Future work of this state is unpredictable.`);
				}
			}
		}

		originalStore.setStoreState(state);

		const storeOptions: IStoreOptions = Reflect.getMetadata(
			MetadataKeys.storeOptions,
			stateType);
		if (storeOptions !== undefined) {
			for(const event of storeOptions.eventContainers) {
				originalStore.registerEvent(event);
			}

			if(storeOptions.services !== undefined) {
				for(const service of storeOptions.services) {
					originalStore.registerService(service);
				}
			}
		}

		const stateModifiersLinks: IStateModifierLink<T>[] = [];
		const ownStates: Array<StoreState<T>> = Reflect.getMetadata(
				MetadataKeys.storeOwnStates,
				stateType.prototype);
		if(ownStates === undefined) {
			console.warn(
				`Store ${stateType.name} doesn't contain any state that can be modified`);
		} else {
			for (const storeProperty of ownStates) {
				const stateModifierType: Type<IStateModifier<any>> =
						Reflect.getMetadata(
							MetadataKeys.stateStateModifier,
							stateType.prototype,
							storeProperty);
				stateModifiersLinks.push({
					propertName: storeProperty,
					stateModifier: stateModifierType
				});
			}
		}

		for(const stateModifiersLink of stateModifiersLinks) {
			originalStore.addStateModifier(
				stateModifiersLink.stateModifier,
				stateModifiersLink.propertName);
		}

		const result: Store<T&U> = originalStore as any as Store<T&U>;
		return result;
}