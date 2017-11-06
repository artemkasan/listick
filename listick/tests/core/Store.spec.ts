import "mocha";

import { inject, state, store, stateModifier, subscribe, buildStore, SimpleEvent } from '../../scripts';
import { assert } from "chai";

describe("Instantiating store", () =>
{
	class CounterEvents
	{
		public increment: SimpleEvent<number> = new SimpleEvent<number>();
		public decrement: SimpleEvent<number> = new SimpleEvent<number>();
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

	@stateModifier<ICounterState>({ count: 2 })
	class CounterStateModifier
	{
		@subscribe(CounterEvents, (eventsContainer) => eventsContainer.increment)
		public onIncrement(prevState:ICounterState, args: number): ICounterState
		{
			return {
				...prevState,
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
			assert.equal(3, store.getStore().counter.count, "store state was not updated");
			done();
		});
		assert.equal(2, store.getStore().counter.count, "initial value for store was not applied");
		const counterService = store.getService(CounterService);
		counterService.increment();
	});
});