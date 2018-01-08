# Listick Development tools
This package allows to manage **listick** state with Redux DeveTools.

## How to run it
First you need to add Redux DeveTools as extension for Chrome or Firefox, see [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension) for details.

Then you need to add this line into your application after the initialization of **appStore**

```ts
subscribeDevTools(appStore);
```
Now when you start your application Redux DevTools become activated and you can manage the state.
