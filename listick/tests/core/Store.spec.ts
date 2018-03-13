import "mocha";

import { inject, state, store, subscribe, buildStore, Event, extendStore, Dispatcher } from '../../scripts';
import { assert, expect } from "chai";

describe("Instantiating store", () => {
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
	class MyStore {
		@state(CounterStateModifier)
		public counter: ICounterState = { count: 2 };
	};

	it("simple initialization", () => {
		const store = buildStore(MyStore);
	});

	it("store modification", (done) => {
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

	it("state as simple type", async () => {
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
			public count: number = 0;
		}

		const simpleStore = buildStore(SimpleStore);
		assert.equal(0, simpleStore.getStoreState().count, "initial value for store was not applied");
		const counterService = simpleStore.getService(CounterService);
		await counterService.increment();
		assert.equal(1, simpleStore.getStoreState().count, "store state was not updated");
	});

	it("one of state items changed", async () => {
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
			public simple: IComplexState = { count: 0, name: "John" };
		}

		const simpleStore = buildStore(SimpleStore);
		assert.equal(0, simpleStore.getStoreState().simple.count, "initial value for store was not applied");

		const counterService = simpleStore.getService(CounterService);
		await counterService.increment();
		assert.equal(1, simpleStore.getStoreState().simple.count, "store state was not updated");
		assert.equal("John", simpleStore.getStoreState().simple.name, "parameter name has changed, but must be old");
	});

	it("empty store", () => {
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

	it("initial state", async () => {
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
			public state1: number = 5;

			public state2: { id: number, data: string } = { id: 5, data: "yyy"}
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

	it("extendStore", async () => {
		class OriginalEvents {
			public origEvent = new Event<{ a: number }>();
		}

		@inject class OriginalService {
			constructor(private originalEvents: OriginalEvents ) { }

			public fireEvent(): Promise<void> {
				return this.originalEvents.origEvent.fire(this, {a: 5 })
			}
		}

		interface IOriginalState { a: number }

		class OriginalStateModifier {
			initialState: IOriginalState = { a: 2 };

			@subscribe(OriginalEvents, ec => ec.origEvent)
			public onOriginal(prevState:IOriginalState, args: { a: number})
				: Partial<IOriginalState> {
				return {
					a: prevState.a + args.a
				};
			}
		}

		@store({
			eventContainers: [OriginalEvents],
			services: [OriginalService]
		})
		class OriginalStore {
			@state(OriginalStateModifier)
			public originalState = { a: 2 };
		};
	
		class ExtendedEvents {
			public exEvent = new Event<{ b: number }>();
		}

		@inject class ExtendedService {
			constructor(private extendedEvents: ExtendedEvents ) { }

			public fireEvent(): Promise<void> {
				return this.extendedEvents.exEvent.fire(this, {b: 5 })
			}
		}

		interface IExtendedState { b: number }

		class ExtendedStateModifier {
			initialState: IExtendedState = { b: 2 };
			
			@subscribe(ExtendedEvents,ec => ec.exEvent)
			public onIncrement(prevState:IExtendedState, args: { b: number})
				: Partial<IExtendedState> {
				return {
					b: prevState.b + args.b
				};
			}
		}

		@store({
			eventContainers: [ExtendedEvents],
			services: [ExtendedService]
		})
		class ExtendStore {
			@state(ExtendedStateModifier)
			public extendedState: IExtendedState = { b: 3 };
		};

		const originalStore = buildStore(OriginalStore)
		const joinedStore = extendStore(originalStore, ExtendStore);

		const storeState = joinedStore.getStoreState();
		assert.equal(2, storeState.originalState.a);
		assert.equal(3, storeState.extendedState.b);
		const originalService = joinedStore.getService(OriginalService);
		await originalService.fireEvent();
		const originalModifiedState = joinedStore.getStoreState();
		assert.equal(7, originalModifiedState.originalState.a);
		assert.equal(3, originalModifiedState.extendedState.b);
		const extendedService = joinedStore.getService(ExtendedService);
		await extendedService.fireEvent();
		const extendedModifierState = joinedStore.getStoreState();
		assert.equal(7, extendedModifierState.originalState.a);
		assert.equal(8, extendedModifierState.extendedState.b);
	});

	it("extendStore services intersection", async () => {
		@inject class CommonService {
			public getValue(): number {
				return 5;
			}
		}

		class OriginalEvents {
			public origEvent = new Event<{ a: number }>();
		}

		@inject class OriginalService {
			constructor(private originalEvents: OriginalEvents,
				private commonService: CommonService ) { }

			public fireEvent(): Promise<void> {
				const val = this.commonService.getValue();
				return this.originalEvents.origEvent.fire(this, {a: val });
			}
		}

		interface IOriginalState { a: number }

		class OriginalStateModifier {
			initialState: IOriginalState = { a: 2 };

			@subscribe(OriginalEvents,ec => ec.origEvent)
			public onOriginal(prevState:IOriginalState, args: { a: number})
				: Partial<IOriginalState> {
				return {
					a: prevState.a + args.a
				};
			}
		}

		@store({
			eventContainers: [OriginalEvents],
			services: [CommonService, OriginalService]
		})
		class OriginalStore {
			@state(OriginalStateModifier)
			public originalState = { a: 2 };
		};
	
		class ExtendedEvents {
			public exEvent = new Event<{ b: number }>();
		}

		@inject class ExtendedService {
			constructor(private extendedEvents: ExtendedEvents,
				private commonService: CommonService ) { }

			public fireEvent(): Promise<void> {
				const val = this.commonService.getValue();
				return this.extendedEvents.exEvent.fire(this, {b: val })
			}
		}

		interface IExtendedState { b: number }

		class ExtendedStateModifier {
			initialState: IExtendedState = { b: 2 };
			
			@subscribe(ExtendedEvents,ec => ec.exEvent)
			public onIncrement(prevState:IExtendedState, args: { b: number})
				: Partial<IExtendedState> {
				return {
					b: prevState.b + args.b
				};
			}
		}

		@store({
			eventContainers: [ExtendedEvents],
			services: [CommonService, ExtendedService]
		})
		class ExtendStore {
			@state(ExtendedStateModifier)
			public extendedState: IExtendedState = { b: 3 };
		};

		const originalStore = buildStore(OriginalStore)
		const joinedStore = extendStore(originalStore, ExtendStore);

		const storeState = joinedStore.getStoreState();
		assert.equal(2, storeState.originalState.a);
		assert.equal(3, storeState.extendedState.b);
		const originalService = joinedStore.getService(OriginalService);
		await originalService.fireEvent();
		const originalModifiedState = joinedStore.getStoreState();
		assert.equal(7, originalModifiedState.originalState.a);
		assert.equal(3, originalModifiedState.extendedState.b);
		const extendedService = joinedStore.getService(ExtendedService);
		await extendedService.fireEvent();
		const extendedModifierState = joinedStore.getStoreState();
		assert.equal(7, extendedModifierState.originalState.a);
		assert.equal(8, extendedModifierState.extendedState.b);
	});

	it("extendStore common event", async () => {
		class CommonEvents {
			public commonEvent = new Event<{ a: number }>();
		}

		@inject class OriginalService {
			constructor(private commonEvents: CommonEvents ) { }

			public fireEvent(): Promise<void> {
				return this.commonEvents.commonEvent.fire(this, {a: 5 })
			}
		}

		interface IOriginalState { a: number }

		class OriginalStateModifier {
			initialState: IOriginalState = { a: 2 };

			@subscribe(CommonEvents,ec => ec.commonEvent)
			public onOriginal(prevState:IOriginalState, args: { a: number})
				: Partial<IOriginalState> {
				return {
					a: prevState.a + args.a
				};
			}
		}

		@store({
			eventContainers: [CommonEvents],
			services: [OriginalService]
		})
		class OriginalStore {
			@state(OriginalStateModifier)
			public originalState = { a: 2 };
		};
	
		@inject class ExtendedService {
			constructor(private commonEvents: CommonEvents ) { }

			public fireEvent(): Promise<void> {
				return this.commonEvents.commonEvent.fire(this, {a: 5 })
			}
		}

		interface IExtendedState { b: number }

		class ExtendedStateModifier {
			initialState: IExtendedState = { b: 2 };
			
			@subscribe(CommonEvents,ec => ec.commonEvent)
			public onIncrement(prevState:IExtendedState, args: { a: number})
				: Partial<IExtendedState> {
				return {
					b: prevState.b + args.a
				};
			}
		}

		@store({
			eventContainers: [CommonEvents],
			services: [ExtendedService]
		})
		class ExtendStore {
			@state(ExtendedStateModifier)
			public extendedState: IExtendedState = { b: 3 };
		};

		const originalStore = buildStore(OriginalStore)
		const joinedStore = extendStore(originalStore, ExtendStore);

		const storeState = joinedStore.getStoreState();
		assert.equal(2, storeState.originalState.a);
		assert.equal(3, storeState.extendedState.b);
		const originalService = joinedStore.getService(OriginalService);
		await originalService.fireEvent();
		const originalModifiedState = joinedStore.getStoreState();
		assert.equal(7, originalModifiedState.originalState.a);
		assert.equal(8, originalModifiedState.extendedState.b);
		const extendedService = joinedStore.getService(ExtendedService);
		await extendedService.fireEvent();
		const extendedModifierState = joinedStore.getStoreState();
		assert.equal(12, extendedModifierState.originalState.a);
		assert.equal(13, extendedModifierState.extendedState.b);
	});

	it("extendStore state intersection", async () => {
		class OriginalEvents {
			public origEvent = new Event<{ a: number }>();
		}

		@inject class OriginalService {
			constructor(private originalEvents: OriginalEvents ) { }

			public fireEvent(): Promise<void> {
				return this.originalEvents.origEvent.fire(this, {a: 5 })
			}
		}

		interface IOriginalState { a: number }

		class OriginalStateModifier {
			initialState: IOriginalState = { a: 2 };

			@subscribe(OriginalEvents,ec => ec.origEvent)
			public onOriginal(prevState:IOriginalState, args: { a: number}): Partial<IOriginalState>
			{
				return {
					a: prevState.a + args.a
				};
			}
		}

		@store({
			eventContainers: [OriginalEvents],
			services: [OriginalService]
		})
		class OriginalStore {
			@state(OriginalStateModifier)
			public originalState: IOriginalState = { a: 2 };
		};
	
		class ExtendedEvents {
			public exEvent = new Event<{ b: number }>();
		}

		@inject class ExtendedService {
			constructor(private extendedEvents: ExtendedEvents ) { }

			public fireEvent(): Promise<void> {
				return this.extendedEvents.exEvent.fire(this, {b: 5 })
			}
		}

		interface IExtendedState { b: number }

		class ExtendedStateModifier {
			initialState: IExtendedState = { b: 2 };
			
			@subscribe(ExtendedEvents,ec => ec.exEvent)
			public onIncrement(prevState:IExtendedState, args: { b: number})
				: Partial<IExtendedState> {
				return {
					b: prevState.b + args.b
				};
			}
		}

		@store({
			eventContainers: [ExtendedEvents],
			services: [ExtendedService]
		})
		class ExtendStore {
			@state(ExtendedStateModifier)
			public extendedState: IExtendedState = { b: 3 };

			@state(ExtendedStateModifier)
			public originalState: IExtendedState = { b: 2 };
		};

		const originalStore = buildStore(OriginalStore)
		const joinedStore = extendStore(originalStore, ExtendStore);

		const storeState = joinedStore.getStoreState();
		assert.isUndefined(storeState.originalState.a)
		assert.equal(2, storeState.originalState.b);
		assert.equal(3, storeState.extendedState.b);
		const originalService = joinedStore.getService(OriginalService);
		await originalService.fireEvent();
		const originalModifiedState = joinedStore.getStoreState();
		assert.isNaN(originalModifiedState.originalState.a);
		assert.equal(2, originalModifiedState.originalState.b);
		assert.equal(3, originalModifiedState.extendedState.b);
		const extendedService = joinedStore.getService(ExtendedService);
		await extendedService.fireEvent();
		const extendedModifierState = joinedStore.getStoreState();
		assert.isNaN(originalModifiedState.originalState.a);
		assert.equal(7, extendedModifierState.originalState.b);
		assert.equal(8, extendedModifierState.extendedState.b);
	});

	it("call member of state modifier", async () => {
		class SimpleEvents {
			public amountChanged = new Event<number>();
		}

		interface IStateModifierState {
			amount: number;
		}

		class StateModifier {
			initialState: IStateModifierState = { amount: 0 }

			@subscribe(SimpleEvents, se => se.amountChanged)
			public onAmountChanged(prevState: IStateModifierState, args: number)
			 : Partial<IStateModifierState> {
				return {
					amount: this.getNewAmount(prevState.amount, args)
				};
			}

			private getNewAmount(prevAmount: number, increment: number) : number {
				return prevAmount + increment;
			}
		}

		@store({
			eventContainers: [SimpleEvents],
			services: []
		})
		class SimpleStore {
			@state(StateModifier)
			public stateModifierState: IStateModifierState = { amount: 0};
		}

		const simpleStore = buildStore(SimpleStore);
		const simpleEvents = simpleStore.getEvent(SimpleEvents);
		await simpleEvents.amountChanged.fire(simpleEvents, 5);
		const newAmount = simpleStore.getStoreState().stateModifierState.amount;
		assert.equal(5, newAmount);
	});

	it("state update not invked if state modifier returend nothing", async () => {
		class SimpleEvents {
			public amountChanged = new Event<number>();
		}

		interface IStateModifierState {
			amount: number;
		}

		class StateModifier {
			initialState: IStateModifierState = { amount: 0 }

			@subscribe(SimpleEvents, se => se.amountChanged)
			public onAmountChanged(prevState: IStateModifierState, args: number)
			 : Partial<IStateModifierState> {
				return {
				};
			}
		}

		@store({
			eventContainers: [SimpleEvents],
			services: []
		})
		class SimpleStore {
			@state(StateModifier)
			public stateModifierState: IStateModifierState = { amount: 0};
		}

		let stateChangedInvoked = false;

		const simpleStore = buildStore(SimpleStore);
		simpleStore.stateChanged.add(() => {
			stateChangedInvoked = true;
		});
		const simpleEvents = simpleStore.getEvent(SimpleEvents);
		await simpleEvents.amountChanged.fire(simpleEvents, 5);
		const newAmount = simpleStore.getStoreState().stateModifierState.amount;
		assert.equal(0, newAmount);
		// Simply put our message in the queue last and wait for execution.
		// Then we make sure if state changed was invoked or not.
		await Dispatcher.currentDispatcher.invoke(() => {
		});
		assert.isFalse(stateChangedInvoked, "state change unexpectly was called");
	});
});