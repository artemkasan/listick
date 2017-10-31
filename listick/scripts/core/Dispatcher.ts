import { Subject as RxSubject } from "rxjs";

type DispatcherAction = () => void;

export default class Dispatcher
{
	private invokeSubject: RxSubject<DispatcherAction>;
	private static _currentDispatcher: Dispatcher = new Dispatcher();

	private constructor()
	{
		this.invokeSubject = new RxSubject<DispatcherAction>();
		this.invokeSubject.subscribe(this.processAction);
	}

	public static get currentDispatcher(): Dispatcher
	{
		return this._currentDispatcher;
	}

	public invoke<TArgs, TResult>(callback: () => void): Promise<void>
	{
		return new Promise<void>((resolve) =>
		{
			this.invokeSubject.next(callback);
			resolve(undefined);
		});
	}

	private processAction(value: DispatcherAction)
	{
		try
		{
			value();
		}
		catch (e)
		{
			console.dir(e);
		}
	}
}
