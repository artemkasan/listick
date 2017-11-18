import "mocha";

import { inject, state, store, subscribe, buildStore, Event } from '../../scripts';
import { assert } from "chai";

describe("Instantiating store", () =>
{
	class CounterEvents
	{
		public increment = new Event<number>();
		public decrement = new Event<number>();
	}

	@inject class CounterService
	{
		constructor(
			private counterEvents: CounterEvents) {}

		public increment() : Promise<void>
		{
			return this.counterEvents.increment.fire(this, 1);
		}
	}

	interface ICounterState
	{
		count: number;
	}

	class CounterStateModifier
	{
		initialState: ICounterState = {count: 2 };

		@subscribe(CounterEvents,ec => ec.increment)
		public onIncrement(prevState:ICounterState, args: number): Partial<ICounterState>
		{
			return {
				count: prevState.count + args
			};
		}
	}

	@store({
		eventContainers: [CounterEvents],
		services: [CounterService]
	})
	class MyStore
	{
		@state(CounterStateModifier)
		public counter: ICounterState;
	};

	it("simple initialization", () =>
	{
		const store = buildStore(MyStore);
	});

	it("store modification", (done) =>
	{
		const store = buildStore(MyStore);
		store.stateChanged.add(() =>
		{
			assert.equal(3, store.getStoreState().counter.count, "store state was not updated");
			done();
		});
		assert.equal(2, store.getStoreState().counter.count, "initial value for store was not applied");
		const counterService = store.getService(CounterService);
		counterService.increment();
	});

	it("state as simple type", (done) =>
	{
		class SimpleStateModifier
		{
			initialState: number = 0;

			@subscribe(CounterEvents, se => se.increment)
			onIncrement(prevState: number, args: number): number
			{
				return prevState + args;
			}
		}
	
		@store({
			eventContainers: [CounterEvents],
			services: [CounterService]
		})
		class SimpleStore {
			@state(SimpleStateModifier)
			public count: number;
		}

		const simpleStore = buildStore(SimpleStore);
		simpleStore.stateChanged.add(() =>
		{
			assert.equal(1, simpleStore.getStoreState().count, "store state was not updated");
			done();
		});
		assert.equal(0, simpleStore.getStoreState().count, "initial value for store was not applied");
		const counterService = simpleStore.getService(CounterService);
		counterService.increment();
	});

	it("one of state items changed", (done) =>
	{
		interface IComplexState
		{
			count: number;
			name: string;
		}
	
		class SimpleStateModifier
		{
			initialState:IComplexState = { count: 0, name: "John" }

			@subscribe(CounterEvents, se => se.increment)
			onIncrement(prevState: IComplexState, args: number): Partial<IComplexState>
			{
				return {
					count: prevState.count + args
				};
			}
		}
	
		@store({
			eventContainers: [CounterEvents],
			services: [CounterService]
		})
		class SimpleStore {
			@state(SimpleStateModifier)
			public simple: IComplexState;
		}

		const simpleStore = buildStore(SimpleStore);
		simpleStore.stateChanged.add(() =>
		{
			assert.equal(1, simpleStore.getStoreState().simple.count, "store state was not updated");
			assert.equal("John", simpleStore.getStoreState().simple.name, "parameter name has changed, but must be old");
			done();
		});
		assert.equal(0, simpleStore.getStoreState().simple.count, "initial value for store was not applied");
		const counterService = simpleStore.getService(CounterService);
		counterService.increment();
	});
});