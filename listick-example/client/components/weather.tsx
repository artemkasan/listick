import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Table, Message, Segment, Dimmer, Loader, Image, Label, Button } from 'semantic-ui-react';
import { connect } from 'listick-react';
import { AppStore } from '../appStore';
import { WeatherService } from '../services/weatherService';
import { IWeatherState, WeatherGridState } from '../stateModifiers/weatherStateModifier';

@connect<RouteComponentProps<any>, IWeatherState>((store: AppStore) => store.weatherState)
export default class Weather extends React.Component<RouteComponentProps<any>, IWeatherState> {

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
		if(this.state.error !== null)
		{
			return <div>
				<Message error header="An error has ocurred while fetching data" list={[this.state.error]} />
				<Button onClick={() => this.onReload()} >Update</Button>
			</div>
		}

		if(this.state.gridState == WeatherGridState.loading)
		{
			return <Segment className="loading-segment">
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

		return <div>
			<h1>Weather forecast</h1>
			<Table celled>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>City</Table.HeaderCell>
						<Table.HeaderCell>Degree</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{this.state.content.map(x => 
						<Table.Row key={x.id} >
							<Table.Cell>{x.name}</Table.Cell>
							<Table.Cell>{x.degree}</Table.Cell>
						</Table.Row>)}
				</Table.Body>
			</Table>
			<Button onClick={() => this.onReload()} >Update</Button>
		</div>;
	}
}