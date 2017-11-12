import * as React from 'react';
import { IGreetingsState } from '../stateModifiers/greetingsStateModifier';
import { connect } from 'listick-react';
import { AppStore } from 'client/appStore';

export interface IGreetingsProps
{
<<<<<<< HEAD
	firstName: string
=======
    firstName: string
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
}

@connect<IGreetingsProps, IGreetingsState>((store: AppStore) => store.greetingState)
export default class Greetings extends React.Component<IGreetingsProps, IGreetingsState>
{
<<<<<<< HEAD
	constructor(props: IGreetingsProps, context?: any)
	{
		super(props, context);
	}

	public render()
	{
		return <div style={{ fontWeight: 700}} >Hallo {this.props.firstName} {this.state.lastName}</div>;
	}
=======
    constructor(props: IGreetingsProps, context?: any)
    {
        super(props, context);
    }

    public render()
    {
        return <div style={{ fontWeight: 700}} >Hallo {this.props.firstName} {this.state.lastName}</div>;
    }
>>>>>>> a276043329595351a1a98b96d0572a8713ca891e
}