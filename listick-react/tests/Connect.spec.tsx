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

		@connect<{}, ISimpleComponentState>((store: AppStore) => 
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
});