import "mocha";

import { inject, state, store, subscribe, buildStore, Event } from '../../scripts';
import { assert, expect } from "chai";

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

	it("state as simple type", async () =>
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
		assert.equal(0, simpleStore.getStoreState().count, "initial value for store was not applied");
		const counterService = simpleStore.getService(CounterService);
		await counterService.increment();
		assert.equal(1, simpleStore.getStoreState().count, "store state was not updated");
	});

	it("one of state items changed", async () =>
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
		assert.equal(0, simpleStore.getStoreState().simple.count, "initial value for store was not applied");

		const counterService = simpleStore.getService(CounterService);
		await counterService.increment();
		assert.equal(1, simpleStore.getStoreState().simple.count, "store state was not updated");
		assert.equal("John", simpleStore.getStoreState().simple.name, "parameter name has changed, but must be old");
	});

	it("empty store", () =>
	{
		@store({
			eventContainers: [],
		})
		class EmptyStore
		{
		}

		const emptyStore = buildStore(EmptyStore);
		const content = emptyStore.getStoreState();
		assert.deepEqual(content, {});
	});

	it("initial state", async () =>
	{
		class SimpleStateModifier
		{
			initialState = 5;

			@subscribe(CounterEvents, se => se.increment)
			onIncrement(prevState: number, args: number): Partial<number>
			{
				return prevState + args;
			}
		}

		@store({
			eventContainers: [CounterEvents],
		})
		class SimpleStore
		{
			@state(SimpleStateModifier)
			public state1: number

			public state2: { id: number, data: string }
		}

		const initialState = { state1: 3, state2: { id: 5, data: "yyy"} };

		const simpleStore = buildStore(SimpleStore, initialState);
		let content = simpleStore.getStoreState();
		assert.deepEqual(content, initialState);

		const counterEvents = simpleStore.getEvent(CounterEvents);
		await counterEvents.increment.fire(counterEvents, 5);

		content = simpleStore.getStoreState();
		
		expect(content).to.deep.equal({ state1: 8, state2: { id: 5, data: "yyy"} });
	});
});