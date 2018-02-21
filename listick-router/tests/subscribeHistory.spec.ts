import "mocha";
import { assert, expect } from "chai";
import * as H from "history";

import {inject, store, state, subscribe, Event, buildStore} from 'listick';

import {subscribeHistory} from '../scripts/subscribeHistory';

describe("subscribeHistory tests", () =>
{
	it("subscribtion to routing", async () => {
		class CounterEvents {
			public increment = new Event<number>();
			public decrement = new Event<number>();
		}
	
		@inject class CounterService {
			constructor(
				private counterEvents: CounterEvents) {}
	
			public increment() : Promise<void> {
				return this.counterEvents.increment.fire(this, 1);
			}
		}
	
		interface ICounterState {
			count: number;
		}
	
		class CounterStateModifier {
			initialState: ICounterState = {count: 2 };
	
			@subscribe(CounterEvents,ec => ec.increment)
			public onIncrement(prevState:ICounterState, args: number): Partial<ICounterState> {
				return {
					count: prevState.count + args
				};
			}
		}
	
		@store({
			eventContainers: [CounterEvents],
			services: [CounterService]
		})
		class MyStore {
			@state(CounterStateModifier)
			public counter: ICounterState = { count: 2 };
		};
		
		const history = H.createMemoryHistory({
			initialEntries: [ '/' ],  // The initial URLs in the history stack
			initialIndex: 0,          // The starting index in the history stack
			keyLength: 6,             // The length of location.key
			// A function to use to confirm navigation with the user. Required
			// if you return string prompts from transition hooks (see below)
			getUserConfirmation: (message, callback) => {

			}
		});
		
		const appStore = buildStore(MyStore);
		const routerStore = subscribeHistory(appStore, history);
		let location = routerStore.getStoreState().routerState.location;
		assert.equal("", location.pathname);
		history.push("home");
		// Wait while message from history through dispatcher will update state.
		await new Promise<void>((resolve) => {
			setTimeout(() =>{
				resolve();
			}, 500);
		});

		location = routerStore.getStoreState().routerState.location;
		assert.equal("/home", location.pathname);

	});
});