import { subscribe } from "listick";
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
	content: Array<{ id: number, name: string, degree: number }> | null;
}

/**
 * This is complex state modifier which shows how to use Listick
 * with server communication.
 */
export class WeatherStateModifier
{
	initialState: IWeatherState = { gridState: WeatherGridState.notInitialized, error: null, content: null };

	/**
	 * Called when server start to load weather data from server.
	 * @param prevState Weather previous state.
	 * @param args Start loading arguments.
	 */
	@subscribe(WeatherEvents, es => es.startLoading)
	public onStartLoading(prevState: IWeatherState, args: boolean): Partial<IWeatherState>
	{
		return {
			gridState: WeatherGridState.loading,
			error: null
		};
	}

	/** Called when weather loading has failed. You can test it by fail
	 * request to weather content.
	 * 
	 * @param prevState Weather previous state.
	 * @param args Fail arguments.
	 */
	@subscribe(WeatherEvents, es => es.loadingFailed)
	public onLoadingFailed(prevState: IWeatherState, args: string): Partial<IWeatherState>
	{
		return {
			gridState: WeatherGridState.loaded,
			error: args,
			content: []
		};
	}

	/**
	 * Called when response from server is get.
	 * @param prevState Weather previous state.
	 * @param args Weather data.
	 */
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