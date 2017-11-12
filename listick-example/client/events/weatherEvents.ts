import { SimpleEvent } from "listick";

export interface IWeatherData
{
	content: Array<{ id: number, name: string; degree: number;}>
}

export class WeatherEvents
{
	public startLoading: SimpleEvent<boolean> = new SimpleEvent<boolean>();
	
	public loadingFailed: SimpleEvent<string> = new SimpleEvent<string>();

	public updateWeather: SimpleEvent<IWeatherData> = new SimpleEvent<IWeatherData>();
}