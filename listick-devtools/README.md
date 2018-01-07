# Listick Development tools
This package allows to combine listick with react development tool.

## How to run it
First you need to add react developer tool as extension of Chrome, see [React development tool](https://github.com/facebook/react-devtools/blob/master/README.md) for details.

Then you need to add this line into your application after the initialization of **appStore**

```ts
subscribeDevTools(appStore);
```
Now when you start your application rect development tool.
