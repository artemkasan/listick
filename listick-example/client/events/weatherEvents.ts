import { SimpleEvent } from "listick";

export interface IWeatherData
{
<<<<<<< HEAD
	content: Array<{ id: number, name: string; degree: number;}>
=======
    content: Array<{ id: number, name: string; degree: number;}>
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
}

export class WeatherEvents
{
<<<<<<< HEAD
	public startLoading: SimpleEvent<boolean> = new SimpleEvent<boolean>();
	
	public loadingFailed: SimpleEvent<string> = new SimpleEvent<string>();

	public updateWeather: SimpleEvent<IWeatherData> = new SimpleEvent<IWeatherData>();
=======
    public startLoading: SimpleEvent<boolean> = new SimpleEvent<boolean>();
    
    public loadingFailed: SimpleEvent<string> = new SimpleEvent<string>();

    public updateWeather: SimpleEvent<IWeatherData> = new SimpleEvent<IWeatherData>();
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
}