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
<<<<<<< HEAD
	gridState: WeatherGridState;
	error: string | null;
	content: Array<{ id: number, name: string, degree: number }>;
=======
    gridState: WeatherGridState;
    error: string | null;
    content: Array<{ id: number, name: string, degree: number }>;
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
}

export class WeatherStateModifier
{
	initialState: IWeatherState = { gridState: WeatherGridState.notInitialized, error: null, content: [] };

	@subscribe(WeatherEvents, es => es.startLoading)
	public onStartLoading(prevState: IWeatherState, args: boolean): Partial<IWeatherState>
	{
		return {
<<<<<<< HEAD
			gridState: WeatherGridState.loading,
			error: null,
			content: []
=======
            gridState: WeatherGridState.loading,
            error: null,
            content: []
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
		};
	}

	@subscribe(WeatherEvents, es => es.loadingFailed)
	public onLoadingFailed(prevState: IWeatherState, args: string): Partial<IWeatherState>
	{
		return {
<<<<<<< HEAD
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
=======
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
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
		};
	}
}