import { store, state } from "listick";

import { CounterEvents } from "./events/counterEvents";
import { CounterService } from "./services/counterService";
import { CounterStateModifier, ICounterState } from "./stateModifiers/counterStateModifier";
import { IGreetingsState, GreetingsStateModifier } from "./stateModifiers/greetingsStateModifier";
import { IWeatherState, WeatherStateModifier } from "./stateModifiers/weatherStateModifier";
import { WeatherEvents } from "./events/weatherEvents";
import { WeatherService } from "./services/weatherService";

@store({
	eventContainers: [CounterEvents, WeatherEvents],
	services: [CounterService, WeatherService]
})
export class AppStore
{
	@state(CounterStateModifier)
	public counterState: ICounterState;

	@state(GreetingsStateModifier)
	public greetingState: IGreetingsState;

	@state(WeatherStateModifier)
	public weatherState: IWeatherState;
}
