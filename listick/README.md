# listick

Listick allows to do predictable state modification using TypeScript

## Services

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

## Events containers

Events container are classes that combine several events by one common idea

```ts
export class CounterEvents
{
    public increment = new Event<number>();

    public decrement = new Event<number>();
}
```

Here we see that events container contains two events, and each of them has argument number.

## State modifiers

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

## Store

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
