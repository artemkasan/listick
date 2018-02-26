# Listick Router
This package is a wrapper around history package with state. 

# How to use
All you need is call **subscribeHistory** after that you can access to **RouterService** from Store. Also you can access to **routerState** as new state of store.

# Example
```ts
    const history = createBrowserHistory({ basename: baseUrl });
		const appStore = buildStore(MyStore);
		const routerStore = subscribeHistory(appStore, history);
```

**routerStore** contains additional state with router information
You can inject **RouterService** from your services.
You can use routerState from React component.
