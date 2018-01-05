# Services mechanism
There exists three types of services: **Instance**, **Singleton** and **Transient**.

# How to register service

```ts
  @store({
    eventContainers: [CounterEvents],
    services: [CounterService]
  })
  class SimpleStore {
    @state(SimpleStateModifier)
    public count: number;
  }
```
here **services** contains all services registered for store. In this case we register CounterService simply provide the type.

#Instance
User instantiates service manually and set its instance. After that instance behave as singleton.

```ts
  const simpleService = new SimpleService();
  const serviceProvider = new ServiceProvider(
    [],
    [ServiceDescriptor.instance(SimpleService, simpleService)]);

  const simpleServiceInstance = serviceProvider.getService(SimpleService);
```
Here as service provided service type and service instance. Then when we request for service we get the same instance as we regiestered - **simpleService** and **simpleServiceInstance** are the same instance.

# Singleton
Singleton service will be instantiated one time and then returned the same instance. There are different ways how to register singleton service

## Singleton as type
You can simply provide type to services array and it will be automatically resolved by **listick*. 
If you need to use fooService inside barService you can simply write so:
```ts
  @inject class FooService {
    public fooData: number = 5
  }

  @inject class BarService {
    constructor(private fooService: FooService) {
  }
    
  doBarAction() : number {
    return this.fooService.fooData;
  }
    
  @store({
    eventContainers: [CounterEvents],
    services: [FooService, BarService]
		})
  class SimpleStore {
    @state(SimpleStateModifier)
    public count: number;
  }
```
Infrastructure will automatically resolve dependences. You can put items in **services** in any order. Registering services by type is short form of
```ts
  @store({
    eventContainers: [CounterEvents],
    services: [ServiceDescriptor.singleton(FooService), ServiceDescriptor.singleton(BarService)]
  })
```

## Register singleton with ServiceDescriptor
If you need to instantiate singleton in custom way use this method

```ts
  ServiceDescriptor.singleton(BarService, sp => new BarService(sp.getService(FooService)));
```
where second argument accepts function that instantiate service which has argument as service provider.

#Transient
This service instance will be created on each request to **getService** of the service provider.

```ts
  const serviceProvider = new ServiceProvider(
    [],
    [ServiceDescriptor.transient(SimpleService)]);

  const simpleServiceInstance1 = serviceProvider.getService(SimpleService);
  const simpleServiceInstance2 = serviceProvider.getService(SimpleService);
```

Here simpleServiceInstance1 is not equal to simpleServiceInstance2.

As Singleton service you can instantiate transient service with custom function

```ts
  ServiceDescriptor.transient(BarService, sp => new BarService(sp.getService(FooService)));
``

# Example
Here we will try to combine usage of singleton and transient services types together
```ts
  @inject class FooService {
    public fooData: number = 5;
  }
  
  @inject class BarService {
    constructor(private fooService: FooService) { }
    
    public barAction(): number {
      return this.fooService.fooData + 5;
    }
    
    public incrementFoo(): void {
      this.fooService.fooData++;
    }
  }
  
  @inject class CombinedService {
    constructor(
      private fooService: FooService,
      private barService: BarService
    )
    
    public complexAction(): number {
      this.barService.incrementFoo();
      return this.fooService.fooData + this.barService.barAction();
    }
  }
  
  @store({
    eventContainers: [CounterEvents],
    services: [
      ServiceDescriptor.transient(FooService),
      ServiceDescriptor.singleton(BarService, sp => new BarService(sp.getService(FooService))),
      CombinedService]
		})
  class SimpleStore {
    @state(SimpleStateModifier)
    public count: number;
  }
  
```
First request to CombinedService.complexAction() will return 16 then 17 and etc.
