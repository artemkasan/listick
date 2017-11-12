import { subscribe, SimpleEvent } from "listick";
import { WeatherEvents, IWeatherData } from "../events/weatherEvents";

export enum WeatherGridState
{
	notInitialized,
	loading,
	loaded
}
export interface IWeatherState
{
	gridState: WeatherGridState;
	error: string | null;
	content: Array<{ id: number, name: string, degree: number }>;
}

export class WeatherStateModifier
{
	initialState: IWeatherState = { gridState: WeatherGridState.notInitialized, error: null, content: [] };

	@subscribe(WeatherEvents, es => es.startLoading)
	public onStartLoading(prevState: IWeatherState, args: boolean): Partial<IWeatherState>
	{
		return {
			gridState: WeatherGridState.loading,
			error: null,
			content: []
		};
	}

	@subscribe(WeatherEvents, es => es.loadingFailed)
	public onLoadingFailed(prevState: IWeatherState, args: string): Partial<IWeatherState>
	{
		return {
			gridState: WeatherGridState.loaded,
			error: args
		};
	}

	@subscribe(WeatherEvents, es => es.updateWeather)
	public onWeatherUpdated(prevState: IWeatherState, args: IWeatherData): Partial<IWeatherState>
	{
		return {
			gridState: WeatherGridState.loaded,
			error: null,
			content: args.content
		};
	}
}