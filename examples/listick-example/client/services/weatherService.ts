import { WeatherEvents } from "../events/weatherEvents";
import { inject } from "listick";

interface IWeatherModel
{
	id: number;
	name: string;
	degree: number;
}

/**
 * This service do request to server for weather data.
 */
@inject export class WeatherService
{
	constructor(private weatherEvents: WeatherEvents)
	{ }

	public async updateWeather(): Promise<void>
	{
		try
		{
			// notify that we start to load weather content.
			this.weatherEvents.startLoading.fire(this, true);
			
			// do request for weather to server
			const response = await fetch('/api/weather');
			const result = await response.json() as Array<IWeatherModel>;
			// notify that new weather data got.
			this.weatherEvents.updateWeather.fire(this, { content: result });
		}
		catch(exc)
		{
			// notify that weather loading has failed.
			this.weatherEvents.loadingFailed.fire(this, exc);
		}
	}
}