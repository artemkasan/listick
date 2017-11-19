export interface IGreetingsState
{
	lastName: string
}

/**
 * Here as example we have state modifier without modifier
 * In console log you can see that Listick warn about it.
 */
export class GreetingsStateModifier
{
	initialState: IGreetingsState = { lastName: "Smith" }
}