import Dispatcher from "../core/dispatcher";

export type EventCallback<TArgs> = (sender: any, args: TArgs) => void;

export class SimpleEvent<TArgs>
{
	private handlers: Array<EventCallback<TArgs>> = [];

	public add(callback: EventCallback<TArgs>): void
	{
		if (this.handlers.some((x) => x === callback))
		{
			return;
		}

		this.handlers.push(callback);
	}

	public remove(callback: EventCallback<TArgs>): void
	{
		const callbackIndex = this.handlers.indexOf(callback);
		if (callbackIndex !== -1)
		{
			this.handlers.splice(callbackIndex);
		}
	}

	public async fire(sender: any, args: TArgs): Promise<void>
	{
		for (const callback of this.handlers)
		{
			try
			{
				await Dispatcher.currentDispatcher.invoke(() => callback(sender, args));
			}
			catch (e)
			{
				console.dir(e);
			}
		}
	}
}
