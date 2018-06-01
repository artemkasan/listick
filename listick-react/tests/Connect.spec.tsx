import { buildStore, store } from "listick";
import * as React from "react";
import * as ReactServer from 'react-dom/server';
import "mocha";
import {use, assert, expect } from "chai";
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { connect } from '../scripts/Connect';
import StoreContainer from '../scripts/StoreContainer';

Enzyme.configure({ adapter: new Adapter() });

use(require("chai-string"));

describe("connect tests", () => {
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

	it("connect component without StoreContainer", () =>{
		@store({
			eventContainers: []
		})
		class AppStore {
			public simpleState = { count: 5 }
		}

		interface ISimpleComponentState {
			count: number
		}

		@connect<{}, ISimpleComponentState>((store: AppStore) => store.simpleState)
		class SimpleComponent extends React.Component<{}, ISimpleComponentState> {
			constructor(props:{}, context?: any) {
				super(props, context);
				this.state = { count: 5};
			}

			public updateState() {
				this.setState({ count: 1});
			}

			render() {
				return <div>
					<div>{"Simple state " + this.state.count}</div>
					<a className="clickable" onClick={() => this.updateState() }>
						Action
					</a>
				</div>;
			}
		}

		const appStore = buildStore(AppStore);

		const shallowComponent = Enzyme.shallow(
				<SimpleComponent />);
		shallowComponent
			.find('.clickable')
			.simulate('click');
	});

	it("try to update control state", async () => {
		@store({
			eventContainers: []
		})
		class AppStore {
			public simpleState = { count: 5 }
		}

		interface ISimpleComponentState {
			count: number
		}

		@connect<{}, ISimpleComponentState>((store: AppStore) => store.simpleState)
		class SimpleComponent extends React.Component<{}, ISimpleComponentState> {
			constructor(props:{}, context?: any) {
				super(props, context);
			}

			public updateState() {
				this.setState({ count: 1});
			}

			render() {
				return <div>
					<div>{"Simple state " + this.state.count}</div>
					<a className="clickable" onClick={() => this.updateState() }>
						Action
					</a>
				</div>;
			}
		}

		const appStore = buildStore(AppStore);

		const shallowComponent = Enzyme.shallow(
				<SimpleComponent />,
			{context: { store: appStore}});
		shallowComponent
			.find('.clickable')
			.simulate('click');
		
		assert.equal(shallowComponent.state().count, 5);
	});
});