import { Type } from '../core/Type';

export interface IStateModifierOptions<TState>
{
	eventContainers: Array<Type<any>>;
	initialState: TState;
}
