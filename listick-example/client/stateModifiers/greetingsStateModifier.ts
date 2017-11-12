export interface IGreetingsState
{
    lastName: string
}

export class GreetingsStateModifier
{
    initialState: IGreetingsState = { lastName: "Smith" }
}