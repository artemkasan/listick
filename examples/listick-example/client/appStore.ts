import { store, state } from "listick";

import { CounterEvents } from "./events/counterEvents";
import { CounterService } from "./services/counterService";
import { CounterStateModifier, ICounterState } from "./stateModifiers/counterStateModifier";
import { IGreetingsState, GreetingsStateModifier } from "./stateModifiers/greetingsStateModifier";
import { IWeatherState, WeatherStateModifier, WeatherGridState } from "./stateModifiers/weatherStateModifier";
import { WeatherEvents } from "./events/weatherEvents";
import { WeatherService } from "./services/weatherService";

/**
 * Here we define application store with three states.
 */
@store({
	eventContainers: [CounterEvents, WeatherEvents],
	services: [CounterService, WeatherService]
})
export class AppStore
{
	@state(CounterStateModifier)
	public counterState: ICounterState= {
		counter: 2
	};

	@state(GreetingsStateModifier)
	public greetingState: IGreetingsState = {
		lastName: "Smith"
	};

	@state(WeatherStateModifier)
	public weatherState: IWeatherState = {
		gridState: WeatherGridState.notInitialized,
		error: null,
		content: null
	};
}
