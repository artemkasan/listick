/**
 * This interface describes any object prototype.
 */
export interface Type<T> extends Function
{
	new (...args: any[]): T;
}