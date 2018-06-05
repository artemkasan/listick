import { store, state, ServiceDescriptor } from "listick";

import { CounterEvents } from "./events/counterEvents";
import { CounterService } from "./services/counterService";
import { CounterStateModifier, ICounterState } from "./stateModifiers/counterStateModifier";

@store({
	eventContainers: [CounterEvents],
	services: [ServiceDescriptor.singleton(CounterService)]
})
export class AppStore
{
	@state(CounterStateModifier)
	public counterState: ICounterState = {
		counter: 2
	};
}