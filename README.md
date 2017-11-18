# listick

Listick allows to do predictable state modification using TypeScript

## Influences

When I've started to use [Redux]('http://redux.js.org'>) in Typescript, in general Redux idea is great, but later I've find out that I have to do a lot of redundant work: declaration of actions with discriminated union, declaration of states and then join them together in one state and etc. Also Redux has remind me beginning of 2000 years. That old days all C++ developer used WinProc for processing messages. And later C# introduced events as replacement of message processing mechanism. Another idea is taken from [Angular](https://angular.io/) which uses great feature - decorators. Taken all these ideas into account I've started to create a Listick.

## How to run example

All you need is to execute these commands:

```ps
build.yarn.ps1
cd listick-example
yarn start
```

## How it works

Look at listick-example. This shows how to simply implement predictable state using react.

### Services

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
All services must be marked with **@inject** decorator

### Events containers

Events container are classes that combine several events by one common idea

```ts
export class CounterEvents
{
    public increment = new Event<number>();

    public decrement = new Event<number>();
}
```

Here we see that events container contains two events, and each of them has argument number.

### State modifiers

State modifier are classes that do state mutation.

```ts
export interface ICounterState
{
    counter: number;
}

export class CounterStateModifier implements IStateModifier<ICounterState>
{
    initialState: ICounterState = { counter: 2 }

    @subscribe(CounterEvents, ce => ce.increment)
    public onIncrement(prevState: ICounterState, args: number): Partial<ICounterState>
    {
        return {
            counter: prevState.counter + args
        };
    }

    @subscribe(CounterEvents, ce => ce.decrement)
    public onDecrement(prevState: ICounterState, args: number): Partial<ICounterState>
    {
        return {
            counter: prevState.counter - args
        }
    }
}
```

Inside state modifier we have to define initial state for state modifier. Implementation of ```IStateModifier<TState>``` is optional because of duck typing.
Each method of state modifier that must listen for events and mutate state must be marked by **@subscribe** decorator. It defines which event must be listened. Method itself returns mutated part of state. If state is simple type, this simple type can be returned.

### Store

Store combines all these modules together.

```ts
@store({
    eventContainers: [CounterEvents],
    services: [CounterService]
})
export class AppStore
{
    @state(CounterStateModifier)
    public counterState: ICounterState;
}
```

Here **@store** decorator describes which services and events are used inside this store.
Each state field must be marked with **state** decorator. This decorator binds state property with state modifier. And this field will be automatically modified by state modifier.

Then all you need is to call **buildStore** function and provide class prototype:

```ts
const appStore = buildStore(AppStore);
```

That is all for Listick itself. Now we can look at connection with [React](https://facebook.github.io/react/)

## Listick with React

This is separate module (listick-react) which connect Listick with React.

### How to add Store to react

This is very simple, use **StoreContainer** component for it

```tsx
    <StoreContainer store={appStore}>
        <Counter text="John" />
    </StoreContainer>,
```

In store property define instance of Listick store.
Now we need to define **Counter**:

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
        return <div>{this.props.text}<br/>
            Counter: {this.state.counter} 
            <button onClick={() => this.onIncrement()} >Increment</button>
            <button onClick={() => this.onDecrement()} >Decrement</button></div>;
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

Here we use **@connect** decorator to bind state and services to React component. This component use Listick state as own. You do not need to modify the state manually, it will be done by Listick. All services can be injected in constructor and used inside React component as field.

## Using of Redux Development Tools
You can use redux development tools with listick. All you need to include **listick-devtools** into the project. and add link to dev tool for specified store.
```ts
subscribeDevTools(appStore);
```

You can try to run listick-example and check how it works.
