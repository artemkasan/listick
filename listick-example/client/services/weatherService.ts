import { WeatherEvents } from "../events/weatherEvents";
import { inject } from "listick";

interface IWeatherModel
{
<<<<<<< HEAD
	id: number;
	name: string;
	degree: number;
=======
    id: number;
    name: string;
    degree: number;
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
}

@inject export class WeatherService
{
	constructor(private weatherEvents: WeatherEvents)
	{ }

	public async updateWeather(): Promise<void>
	{
<<<<<<< HEAD
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
=======
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
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
	}
}