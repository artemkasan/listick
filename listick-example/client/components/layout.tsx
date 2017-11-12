import * as React from 'react';
import Navigation from './navigation';
import { Sidebar, Menu, Segment, Container } from 'semantic-ui-react';

export default class Layout extends React.Component<{}, {}>
{
	public render()
	{
		return <div className="main-layout">
			<style>{`
				body > div,
				body > div > div,
				body > div > div > div.main-layout {
					height: 100%;
				}
			`}</style>
			<Sidebar.Pushable>
				<Navigation />
				<Sidebar.Pusher>
					<Container>
					<Segment basic>
						{this.props.children}
					</Segment>
					</Container>
				</Sidebar.Pusher>
			</Sidebar.Pushable>
		</div>;
	}
}