
type DispatcherAction = () => void;

export class Dispatcher
{
	private invokeSubject: DispatcherAction[] = [];
	private static _currentDispatcher: Dispatcher = new Dispatcher();

	private constructor()
	{
	}

	public static get currentDispatcher(): Dispatcher
	{
		return this._currentDispatcher;
	}

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

	private startProcessingActions()
	{
		setTimeout(() => this.processAction(), 1);
	}

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
