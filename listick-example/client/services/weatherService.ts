import { WeatherEvents } from "../events/weatherEvents";
import { inject } from "listick";

interface IWeatherModel
{
    id: number;
    name: string;
    degree: number;
}

@inject export class WeatherService
{
	constructor(private weatherEvents: WeatherEvents)
	{ }

	public async updateWeather(): Promise<void>
	{
        try
        {
            this.weatherEvents.startLoading.fire(this, true);
            
            const response = await fetch('/api/weather');
            const result = await response.json() as Array<IWeatherModel>;
            this.weatherEvents.updateWeather.fire(this, { content: result });
        }
        catch(exc)
        {
            this.weatherEvents.loadingFailed.fire(this, exc);
        }
	}
}