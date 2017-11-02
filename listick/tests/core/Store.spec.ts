import "mocha";

import { inject, state, store, stateModifier, buildStore, SimpleEvent } from '../../scripts';

describe("Instantiating store", () =>
{
	class CounterEventContainer
	{
		public increment: SimpleEvent<number> = new SimpleEvent<number>();
		public decrement: SimpleEvent<number> = new SimpleEvent<number>();
	}

	@inject class CounterService
	{
		constructor(
			private counterEvents: CounterEventContainer) {}

		public increment()
		{
			this.counterEvents.increment.fire(this, 1);
		}

		public decrement()
		{
			this.counterEvents.decrement.fire(this, 1);
		}
	}

	@stateModifier<{ count: number}>({
		 eventContainers: [CounterEventContainer],
		 initialState: { count: 0 }
		 })
	class CounterStateModifier
	{

	}

	@store({
		eventContainers: [CounterEventContainer],
		services: [CounterService]
	})
	class MyStore
	{
		@state({ stateModifier: CounterStateModifier})
		public counter: { 
			count: number
		}
	};

	it("test1", () =>
	{
		const store = buildStore(MyStore);
	});
});