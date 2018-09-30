import { buildStore, store } from "listick";
import * as React from "react";
import * as ReactServer from 'react-dom/server';
import "mocha";
import {use, assert, expect } from "chai";

import { connect } from '../scripts/Connect';
import StoreContainer from '../scripts/StoreContainer';

use(require("chai-string"));

describe("connect tests", () =>
{
	it("connect to store", async () => {
		@store({
			eventContainers: []
		})
		class AppStore {
			public simpleState = { count: 5 }
			public additionalState = { number: 2 }
			public excludedState = { content: "hello world" }
		}

		interface ISimpleComponentState {
			simpleState: { count: number }
			additionalState: { number: number }
		}

		@connect<{}, ISimpleComponentState, AppStore>((store: AppStore) => 
			{
				return {
					simpleState: store.simpleState,
					additionalState: store.additionalState
			}})
		class SimpleComponent extends React.Component<{}, ISimpleComponentState> {
			constructor(props:{}, context?: any) {
				super(props, context);
			}
			render() {
				return <div>
					<div>{"Simple state " + this.state.simpleState.count}</div>
					<div>{"Additional state " + this.state.additionalState.number}</div>
				</div>;
			}
		}

		const appStore = buildStore(AppStore);

		const component = 
			<StoreContainer store={appStore}>
				<SimpleComponent/>
			</StoreContainer>;

		const beforeChange = ReactServer.renderToString(component);

		expect(beforeChange).to.containIgnoreCase("Simple state 5");
		expect(beforeChange).to.containIgnoreCase("Additional state 2");

		appStore.setStoreState({
			simpleState: { count: 3 },
			additionalState: { number: 5 },
			excludedState: { content: "Bye" }
		})

		const afterChange = ReactServer.renderToString(component);

		expect(afterChange).to.containIgnoreCase("Simple state 3");
		expect(afterChange).to.containIgnoreCase("Additional state 5");
	});

	it("update store part, another shoud not refresh", async () => {
		interface ISimpleState {
			count: number;
		}
		interface IAdditionalState {
			number: number;
		}

		@store({
			eventContainers: []
		})
		class AppStore {
			public simpleState = { count: 5 }
			public additionalState = { number: 2 }
			public excludedState = { content: "hello world" }
		}



		@connect<{}, ISimpleState, AppStore>((store: AppStore) => 
			{
				return store.simpleState
			})
		class SimpleComponent extends React.Component<{}, ISimpleState> {
			constructor(props:{}, context?: any) {
				super(props, context);
			}
			render() {
				return <div>
					<div>{"Simple state " + this.state.count}</div>
				</div>;
			}
		}

		@connect<{}, IAdditionalState, AppStore>((store: AppStore) => 
		{
			return store.additionalState
		})
		class AdditionalComponent extends React.Component<{}, IAdditionalState> {
			constructor(props:{}, context?: any) {
				super(props, context);
			}
			render() {
				return <div>
					<div>{"Additional state " + this.state.number}</div>
				</div>;
			}
		}

		const appStore = buildStore(AppStore);

		let simpleComponentRenderCount = 0;
		let additionalComponentRenderCount = 0;

		const component = 
			<StoreContainer store={appStore}>
				<div>
					<SimpleComponent />
					<AdditionalComponent />
				</div>
			</StoreContainer>;

		const beforeChange = ReactServer.renderToString(component);

		expect(beforeChange).to.containIgnoreCase("Simple state 5");
		expect(beforeChange).to.containIgnoreCase("Additional state 2");

		const prevState = appStore.getStoreState();
		appStore.setStoreState({
			...prevState,
			simpleState: { count: 3 }
		});

		const afterChange = ReactServer.renderToString(component);

		expect(afterChange).to.containIgnoreCase("Simple state 3");
		expect(afterChange).to.containIgnoreCase("Additional state 2");
	});
});