import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Table, Message, Segment, Dimmer, Loader, Button } from 'semantic-ui-react';
import { connect } from 'listick-react';
import { AppStore } from '../appStore';
import { WeatherService } from '../services/weatherService';
import { IWeatherState, WeatherGridState } from '../stateModifiers/weatherStateModifier';

@connect<RouteComponentProps<any>, IWeatherState, AppStore>((store: AppStore) => store.weatherState)
export default class Weather extends React.Component<RouteComponentProps<any>, IWeatherState> {

	/**
	 * Creates new instance of counter component. Here we have to set service with ? sign
	 * because React typings specify constructor with two arguments and router uses it
	 * we have to set counterService as optional and later set ! mark when we call it.
	 * @param props React props
	 * @param context React context
	 * @param weatherService Service that is injected by connect decorator.
	 */
	constructor(props:RouteComponentProps<any>, context?: any,
		private weatherService?: WeatherService)
	{
		super(props, context);
	}

	public onReload()
	{
		this.weatherService!.updateWeather();
	}

	public componentWillMount()
	{
		if(this.state.gridState === WeatherGridState.notInitialized)
		{
			this.weatherService!.updateWeather();
		}
	}

	public render()
	{
		let content:JSX.Element;
		if(this.state.error !== null)
		{
			content = <div>
				<Message error header="An error has ocurred while fetching data" list={[this.state.error]} />
				<Button onClick={() => this.onReload()} >Update</Button>
			</div>
		}
		else if(this.state.gridState == WeatherGridState.notInitialized ||
			this.state.gridState == WeatherGridState.loading && this.state.content === null)
		{
			content = <Segment className="loading-segment">
				<style> {`
					.loading-segment {
					min-height: 10em;
				}
				`}</style>
				<Dimmer active>
					<Loader>Loading</Loader>
				</Dimmer>
			</Segment>
	  
		}
		else
		{
			content = <div>
				<Dimmer.Dimmable as={Table} dimmed={this.state.gridState === WeatherGridState.loading}>
					<Dimmer active={this.state.gridState === WeatherGridState.loading}>
						<Loader>Loading...</Loader>
					</Dimmer>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>City</Table.HeaderCell>
								<Table.HeaderCell>Degree</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{this.state.content!.map(x => 
								<Table.Row key={x.id} >
									<Table.Cell>{x.name}</Table.Cell>
									<Table.Cell>{x.degree}</Table.Cell>
								</Table.Row>)}
						</Table.Body>
				</Dimmer.Dimmable>
				<Button
					onClick={() => this.onReload()}
					disabled={this.state.gridState == WeatherGridState.loading} >
					Update
				</Button>
			</div>;
		}

		return <div>
				<h1>Weather forecast</h1>
				{ content}
				</div>
	}
}