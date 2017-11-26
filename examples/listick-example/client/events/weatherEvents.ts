import { Event } from "listick";

export interface IWeatherData
{
	content: Array<{ id: number, name: string; degree: number;}>
}

/**
 * Weather specific events.
 */
export class WeatherEvents
{
	public startLoading = new Event<boolean>();
	
	public loadingFailed = new Event<string>();

	public updateWeather = new Event<IWeatherData>();
}