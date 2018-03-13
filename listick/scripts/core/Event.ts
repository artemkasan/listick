import { Dispatcher} from "../core/Dispatcher";

export type EventCallback<TArgs> = (sender: any, args: TArgs) => void;

/**
 * Represents object that can notify multiple targets.
 */
export class Event<TArgs> {
	private handlers: Array<EventCallback<TArgs>> = [];

	/**
	 * Adds to the list of listeners new callback.
	 * @param callback Called when event is fired.
	 */
	public add(callback: EventCallback<TArgs>): void {
		if (this.handlers.some((x) => x === callback)) {
			return;
		}

		this.handlers.push(callback);
	}

	/**
	 * Removes callback for the list of listeners.
	 * @param callback callback that must be unsubscribed.
	 */
	public remove(callback: EventCallback<TArgs>): void {
		const callbackIndex = this.handlers.indexOf(callback);
		if (callbackIndex !== -1) {
			this.handlers.splice(callbackIndex);
		}
	}

	/**
	 * Notifies listeners.
	 * @param sender event initiator.
	 * @param args event arguments to send.
	 * @returns Promise that will be finished when all targets process event.
	 */
	public async fire(sender: any, args: TArgs): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			let finishedPromises = 0;
			const expectedPromises = this.handlers.length;
			if(expectedPromises == 0) {
				resolve();
			}
			
			const errors: Array<any> = [];
			const promiseFinished = () => {
				finishedPromises++;
				if(finishedPromises == expectedPromises) {
					if(errors.length == 0) {
						resolve();
						return;
					}
					reject(errors);
				}
			}
			for (const callback of this.handlers) {
				Dispatcher.currentDispatcher.invoke(
					() => callback(sender, args))
				.then(promiseFinished)
				.catch(e => {
					errors.push(e);
					promiseFinished();
				});
			}

		});
	}
}
