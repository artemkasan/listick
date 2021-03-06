import "mocha";

import { inject, state, store, buildStore, Event, extendStore } from '../../scripts';
import { subscribe as rxSubscribe } from '../../scripts/RxSubscription';
import { assert, expect } from "chai";
import { Observable } from 'rxjs/Observable';
import { ArrayObservable } from 'rxjs/observable/ArrayObservable';
import { Observer } from "rxjs/Observer";

describe("StateModifier using RxJs", () =>
{
	it("simple initialization", async () => {
		interface IMyState {
			count: number;
		}

		var promise = new Promise<number>((resolve, reject) => {
			setTimeout(() => resolve(5), 500);
		});

		class MyEvents {
			public myObserverChanged = ArrayObservable.create([1,2]);
		}

		class MyStateModifier {
			initialState: IMyState = { count: 5 }

			@rxSubscribe(MyEvents, me => me.myObserverChanged)
			public onMyObserverChanged(prevState: IMyState, args: number): Partial<IMyState> {
				return {
					count: prevState.count + args
				};
			}
		};

		@store({
			eventContainers: [MyEvents]
		})
		class simpleStore {
			@state(MyStateModifier)
			public myState: IMyState = { count: 5 }
		}

		const myStore = buildStore(simpleStore);

		assert.equal(8, myStore.getStoreState().myState.count);
	});

	it("delay call next", async () => {
		interface IMyState {
			count: number;
		}

		let globalObserver: Observer<number> | null = null;

		class MyEvents {
			public myObserverChanged = new Observable<number>(observer => {
				globalObserver = observer;
			});
		}

		class MyStateModifier {
			initialState: IMyState = { count: 5 }

			@rxSubscribe(MyEvents, me => me.myObserverChanged)
			public onMyObserverChanged(prevState: IMyState, args: number): Partial<IMyState> {
				return {
					count: prevState.count + args
				};
			}
		};

		@store({
			eventContainers: [MyEvents]
		})
		class simpleStore {
			@state(MyStateModifier)
			public myState: IMyState = { count: 5 }
		}

		const myStore = buildStore(simpleStore);

		assert.equal(5, myStore.getStoreState().myState.count);

		globalObserver!.next(2);

		await new Promise((resolve, reject) => {
			setTimeout(() => resolve(), 500);
		});

		assert.equal(7, myStore.getStoreState().myState.count);
	});

	it("call member of state modifier", async () => {
		interface IMyState {
			count: number;
		}

		let globalObserver: Observer<number> | null = null;

		class MyEvents {
			public myObserverChanged = new Observable<number>(observer => {
				globalObserver = observer;
			});
		}

		class MyStateModifier {
			initialState: IMyState = { count: 5 }

			@rxSubscribe(MyEvents, me => me.myObserverChanged)
			public onMyObserverChanged(prevState: IMyState, args: number): Partial<IMyState> {
				return {
					count: this.incrementCount(prevState.count, args)
				};
			}

			private incrementCount(prevCount: number, inc: number): number {
				return prevCount + inc;
			}
		};

		@store({
			eventContainers: [MyEvents]
		})
		class simpleStore {
			@state(MyStateModifier)
			public myState: IMyState = { count: 5 }
		}

		const myStore = buildStore(simpleStore);

		assert.equal(5, myStore.getStoreState().myState.count);

		globalObserver!.next(2);

		await new Promise((resolve, reject) => {
			setTimeout(() => resolve(), 500);
		});

		assert.equal(7, myStore.getStoreState().myState.count);
	});
});