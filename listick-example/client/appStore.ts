import { store, state } from "listick";

import { CounterEvents } from "./events/counterEvents";
import { CounterService } from "./services/counterService";
import { CounterStateModifier, ICounterState } from "./stateModifiers/counterStateModifier";

@store({
	eventContainers: [CounterEvents],
	services: [CounterService]
})
export class AppStore
{
	@state({ stateModifier: CounterStateModifier })
	public counterState: ICounterState;
}
