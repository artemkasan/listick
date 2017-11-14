import { Dispatcher} from "../core/Dispatcher";

export type EventCallback<TArgs> = (sender: any, args: TArgs) => void;

/**
 * Represents object that can notify multiple targets.
 */
export class SimpleEvent<TArgs>
{
	private handlers: Array<EventCallback<TArgs>> = [];

	/**
	 * Adds to the list of listeners new callback.
	 * @param callback Called when event is fired.
	 */
	public add(callback: EventCallback<TArgs>): void
	{
		if (this.handlers.some((x) => x === callback))
		{
			return;
		}

		this.handlers.push(callback);
	}

	/**
	 * Removes callback for the list of listeners.
	 * @param callback callback that must be unsubscribed.
	 */
	public remove(callback: EventCallback<TArgs>): void
	{
		const callbackIndex = this.handlers.indexOf(callback);
		if (callbackIndex !== -1)
		{
			this.handlers.splice(callbackIndex);
		}
	}

	/**
	 * Notifies listeners about changes.
	 * @param sender event initiator.
	 * @param args event arguments to send.
	 */
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
