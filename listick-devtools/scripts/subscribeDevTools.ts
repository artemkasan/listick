import { Store, Dispatcher } from "listick";

export function subscribeDevTools<TState>(store: Store<TState>)
{
	const devToolsStateChangeReason = "__DEVTOOLS__";
	const windowIfDefined = typeof window === 'undefined' ? null : window as any;
	// If devTools is installed, connect to it
	const devToolsExtension = windowIfDefined && windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__;
	if(devToolsExtension === undefined)
	{
		return;
	}

	const devTools = devToolsExtension.connect();
	// store initial state to do reset when it requested by devtools.
	const initValue = store.getStoreState();
	
	const reset = async () =>
	{
		// first complete state change and then set new value to devtools.
		await Dispatcher.currentDispatcher.invoke(() => store.setStoreState(initValue, devToolsStateChangeReason));
		Dispatcher.currentDispatcher.invoke(() => devTools.init(store.getStoreState()));
	};

	const rollback = async (prevState: string) =>
	{
		await Dispatcher.currentDispatcher.invoke(() =>store.setStoreState(JSON.parse(prevState), devToolsStateChangeReason));
		devTools.init(store.getStoreState());
	}

	const importState = async (payload: any) =>
	{
		const { nextLiftedState } = payload;
		const { computedStates } = nextLiftedState;
		await Dispatcher.currentDispatcher.invoke(() =>
			store.setStoreState(computedStates[computedStates.length - 1].state, devToolsStateChangeReason));
		devTools.send(null, nextLiftedState);
	}

	devTools.init(initValue);

	devTools.subscribe((message : any) =>
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
						store.setStoreState(JSON.parse(message.state), devToolsStateChangeReason));
					return;
				case "TOGGLE_ACTION":
					// TODO: For now not clear how to invoke it. Implement it later
					return;
				case "IMPORT_STATE":
					importState(message.payload);
					return;
			}
		}
	});

	store.stateChanged.add((sender, args) =>
	{
		// save new state to dev tools if it was not invoked by devtools.
		if(args.name != devToolsStateChangeReason)
		{
			devToolsExtension.send(args.name, args.newState);
		}
	});
}
