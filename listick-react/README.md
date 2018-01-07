# Listick React
This package allows to join listick with react

## How to add Store to react

This is very simple, use **StoreContainer** component for it

```tsx
    <StoreContainer store={appStore}>
        <Counter text="John" />
    </StoreContainer>,
```

In *store* property define instance of Listick store.
As an example we will connect listick with react component **Counter**:

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
