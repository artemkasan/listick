import * as React from 'react';
import { Menu, Icon, Sidebar } from 'semantic-ui-react';
import { NavLink, Link } from 'react-router-dom';

export default class Navigation extends React.Component<{}, {}>
{
	public render()
	{
		return <Sidebar as={Menu} animation='push' width='thin' visible={true} icon='labeled' vertical inverted >
			<Menu.Item name='home'>
				<NavLink exact to={ '/' } >
					<Icon name='home' />
					Home
				</NavLink>
			</Menu.Item>
			<Menu.Item name='counter'>
				<NavLink exact to={ '/counter' } >
					<Icon name='refresh' />
					Counter
				</NavLink>
			</Menu.Item>
		</Sidebar>;
	}
}