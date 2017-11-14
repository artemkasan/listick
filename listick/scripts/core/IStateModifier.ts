/**
 * Base interface for all state modifiers.
 */
export interface IStateModifier<TState>
{
	/**
	 * Initial state.
	 */
	initialState: TState;
}