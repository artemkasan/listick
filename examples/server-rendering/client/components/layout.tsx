import * as React from 'react';
import Navigation from './navigation';
import { Segment, Container } from 'semantic-ui-react';

export default class Layout extends React.Component<{}, {}>
{
	public render()
	{
		return <div className="main-layout">
			<Navigation />
			<div className="main">
				<Container>
					<Segment basic>
						{this.props.children}
					</Segment>
				</Container>
			</div>
		</div>;
	}
}