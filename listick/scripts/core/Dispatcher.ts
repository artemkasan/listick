
type DispatcherAction = () => void;

/**
 * Dispatcher which forces to do all actions one by one.
 */
export class Dispatcher
{
	private invokeSubject: DispatcherAction[] = [];
	private static _currentDispatcher: Dispatcher = new Dispatcher();

	/**
	 * Gets current dispatcher.
	 */
	public static get currentDispatcher(): Dispatcher
	{
		return this._currentDispatcher;
	}

	/**
	 * Invokes some code in queue of dispatcher.
	 * @param callback that must be invoked.
	 * @returns Promise that will be finished when callback successfully executed.
	 */
	public invoke<TArgs, TResult>(callback: () => void): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			this.invokeSubject.push(() =>
			{
				try
				{
					callback();
					resolve();
				}
				catch
				{
					reject();
				}
			});
		
			this.startProcessingActions();
		});
	}

	/**
	 * Starts new queue of actions processing.
	 */
	private startProcessingActions()
	{
		setTimeout(() => this.processAction(), 1);
	}

	/**
	 * Process one action from queue.
	 */
	private processAction()
	{
		try
		{
			const value = this.invokeSubject.splice(0, 1);
			if(value.length > 0)
			{
				value[0]();
			}
		}
		catch (e)
		{
			console.dir(e);
		}
		if(this.invokeSubject.length > 0)
		{
			this.startProcessingActions();
		}
	}
}
