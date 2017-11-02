# listick
Listick allows to do predictable state modifcation using TypeScript

### Influences
When I've started to use [Redux]('http://redux.js.org'>) in Typescript, in general Redux idea is great, but later I've find out that I have to do a lot of redundant work: declaration of actions with discriminated union, declaration of states and then join them together in one state and etc. Also Redux has remind me beginning of 2000 years. That old days all C++ developer used WinProc for processing messages. And later C# introduced events as replacement of message processing mechanism. Another idea is taken from [Angular](https://angular.io/) which uses great feature - decorators. Taken all these ideas into account I've started to create a Listick.

### How to run example
All you need is to execute two commands:
```sh
build.yarn.sh
node ./listick-example/app.js
```
Then you can open browser and enter url: http://localhost:3000

### How it works
Look at listick-example. This shows how to simply implement predicatable state using react.

#### Services
Services are any type of object that can be injected in another service or react component.
```ts
@inject export class CounterService
{
	constructor(private counterEvents: CounterEvents)
	{ }

	public Increment(): void
	{
		this.counterEvents.increment.fire(this, 1);
	}

	public Decrement(): void
	{
		this.counterEvents.decrement.fire(this, 1);
	}
}
```
This is a service that inject events container and fires increment and decrement events when appropriate method is called. In reality this can be more complex, and one service method can fire more than one event.
All services must be marked with <b>@inject</b> decorator

#### Events containers
Events container are classes that combain several events by one common idea

```ts
export class CounterEvents
{
	public increment: SimpleEvent<number> = new SimpleEvent<number>();

	public decrement: SimpleEvent<number> = new SimpleEvent<number>();
}
```
Here we see that events container contains two events, and each of them has argument number.

#### State modifiers
State modifier are classes that do state mutation.
```ts
export interface ICounterState
{
	counter: number;
}

@stateModifier<ICounterState>({
	eventContainers: [CounterEvents],
	initialState: { counter: 2 },
})
export class CounterStateModifier
{
	@subscribe(CounterEvents, (counterEvents:CounterEvents) => counterEvents.increment)
	public onIncrement(prevState: ICounterState, args: number): ICounterState
	{
		return {
			...prevState,
			counter: prevState.counter + args
		};
	}

	@subscribe(CounterEvents, (counterEvents: CounterEvents) => counterEvents.decrement)
	public onDecrement(prevState: ICounterState, args: number): ICounterState
	{
		return {
			...prevState,
			counter: prevState.counter - args
		}
	}
}
```
Each state modifier must be marked by <b>@stateModifier</b> decorator. And inside this decorator we have to define which events it is going to listen and initial state of state modifier.
Each method of state modifier that must listen to events and mutate state must be marked by <b>@subscribe</b> decorator. It defines which event must be listened. Method itself do simple mutation of state.

### Store
Store combines all these modules together.
```ts
@store({
	eventContainers: [CounterEvents],
	services: [CounterService]
})
export class AppStore
{
	@state({ stateModifier: CounterStateModifier })
	public counterState: ICounterState;
}
```

Here <b>@store</b> decorator describes which services and events are used inside this store.
Each state field must be marked with <b>state</b> decorator. This decorator binds state property with state modifier. And this field will be automatically modified by state modifier.

Then all you need is to call <b>buildStore</b> function and provide class prototype:
```ts
const appStore = buildStore(AppStore);
```

That is all for Listick itself. Now we can look at connection with [React](https://facebook.github.io/react/)

## Listick with React
This is separate module (listick-react) which connect Listick with React. 

### How to add Store to react
This is very simple, use <b>StoreContainer</b> component for it
```tsx
	<StoreContainer store={appStore}>
		<Counter text="John" />
	</StoreContainer>,
```
In store property define instance of Listick store.
Now we need to define <b>Counter</b>:
```tsx
interface ICounterProps
{
	text: string;
}

@connect<ICounterProps, ICounterState>((store: AppStore) => store.counterState)
export default class Counter extends React.Component<ICounterProps, ICounterState>
{
	constructor(props: ICounterProps, context: any,
		private counterService: CounterService)
	{
		super(props, context);
	}

	public render()
	{
		return <div>{this.props.text}<br/> Counter: {this.state.counter} <button onClick={() => this.onIncrement()} >Increment</button> <button onClick={() => this.onDecrement()} >Decrement</button></div>;
	}

	private onIncrement()
	{
		this.counterService.Increment();
	}

	private onDecrement()
	{
		this.counterService.Decrement();
	}
};
```
Here we use <b>@connect</b> decorator to bind state and services to React component. This component use Listick state as own. You do not need to modifiy the state manually, it will be done by Listick. All services can be injected in constructor and used inside React component as field.

You can try to run listick-example and check how it works.
