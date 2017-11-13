import { Store, Dispatcher } from "listick";

export function subscribeDevTools<TState>(store: Store<TState>)
{
	const windowIfDefined = typeof window === 'undefined' ? null : window as any;
	// If devTools is installed, connect to it
	const devToolsExtension = windowIfDefined && windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__;
	if(devToolsExtension === undefined)
	{
		return;
	}

	const devTools = devToolsExtension.connect();
	const initValue = store.getStoreState();
	
	const reset = async () =>
	{
		await Dispatcher.currentDispatcher.invoke(() => store.setStoreState(initValue));
		Dispatcher.currentDispatcher.invoke(() => devTools.init(store.getStoreState()));
	};

	const rollback = async (prevState: string) =>
	{
		await Dispatcher.currentDispatcher.invoke(() =>store.setStoreState(JSON.parse(prevState)));
		devTools.init(store.getStoreState());
	}

	const importState = async(payload: any) =>
	{
		const { nextLiftedState } = payload;
		const { computedStates } = nextLiftedState;
		await Dispatcher.currentDispatcher.invoke(() =>
			store.setStoreState(computedStates[computedStates.length - 1].state));
		devTools.send(null, nextLiftedState);
	}

	devTools.init(initValue);

	const unsubscribe = devTools.subscribe((message : any) =>
	{
		if(message.type === "DISPATCH")
		{
			switch(message.payload.type)
			{
				case "RESET":
					reset();
					return;
				case "COMMIT":
					devTools.init(store.getStoreState());
					return;
				case "ROLLBACK":
					rollback(message.state);
					return;
				case "JUMP_TO_STATE":
				case "JUMP_TO_ACTION":
					Dispatcher.currentDispatcher.invoke(() =>
						store.setStoreState(JSON.parse(message.state)));
					return;
				case "TOGGLE_ACTION":
					return;
				case "IMPORT_STATE":
					importState(message.payload);
					return;
			}
		}
	});

	store.stateChanged.add((sender, args) =>
	{
		devToolsExtension.send(args.name, args.newState);
	});
}
