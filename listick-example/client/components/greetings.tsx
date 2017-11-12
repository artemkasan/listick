import * as React from 'react';
import { IGreetingsState } from '../stateModifiers/greetingsStateModifier';
import { connect } from 'listick-react';
import { AppStore } from 'client/appStore';

export interface IGreetingsProps
{
    firstName: string
}

@connect<IGreetingsProps, IGreetingsState>((store: AppStore) => store.greetingState)
export default class Greetings extends React.Component<IGreetingsProps, IGreetingsState>
{
    constructor(props: IGreetingsProps, context?: any)
    {
        super(props, context);
    }

    public render()
    {
        return <div style={{ fontWeight: 700}} >Hallo {this.props.firstName} {this.state.lastName}</div>;
    }
}