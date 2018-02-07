import "mocha";
import { assert, expect } from "chai";

import { inject, ServiceProvider, ServiceDescriptor } from "../../scripts";

describe("Service provider", () =>
{
	@inject class SimpleService
	{
		constructor() {}

		public simpleValue: number = 1;
	}

	class FooEvent { }

	@inject class BarService
	{
		constructor(
			public fooEvent: FooEvent,
			public simpleService: SimpleService
		)
		{ }
	}

	it("empty service provider", () =>
	{
		const serviceProvider = new ServiceProvider([], []);
		const simpleService = serviceProvider.getService(SimpleService);
		assert.isNull(simpleService);
	});

	it("singleton service instantiate twice", () =>
	{
		const serviceProvider = new ServiceProvider(
			[],
			[ServiceDescriptor.singleton(SimpleService)]);
		const simpleService1 = serviceProvider.getService(SimpleService);
		if(isNotNull(simpleService1))
		{
			simpleService1.simpleValue = 5;
			const simpleService2 = serviceProvider.getService(SimpleService);
			if(isNotNull(simpleService2))
			{
				assert.strictEqual(simpleService1, simpleService2);
				assert.equal(simpleService2.simpleValue, 5);
			}
		}
	});

	it("singleton service with dependent service", () =>
	{
		const serviceProvider = new ServiceProvider(
			[FooEvent],
			[ServiceDescriptor.singleton(SimpleService),
			ServiceDescriptor.singleton(BarService)]);
		const barService = serviceProvider.getService(BarService);
		if(isNotNull(barService))
		{
			assert.isNotNull(barService.fooEvent);
			if(isNotNull(barService.simpleService))
			{
				barService.simpleService.simpleValue = 5;
				const simpleService = serviceProvider.getService(SimpleService);
				if(isNotNull(simpleService))
				{
					assert.equal(simpleService.simpleValue, 5);
				}
			}
		}
	});

	it("default singleton with dependent service", () =>
	{
		const serviceProvider = new ServiceProvider(
			[FooEvent],
			[SimpleService, BarService]);
		const barService = serviceProvider.getService(BarService);
		if(isNotNull(barService))
		{
			assert.isNotNull(barService.fooEvent);
			if(isNotNull(barService.simpleService))
			{
				barService.simpleService.simpleValue = 5;
				const simpleService = serviceProvider.getService(SimpleService);
				if(isNotNull(simpleService))
				{
					assert.equal(simpleService.simpleValue, 5);
				}
			}
		}
	});

	it("singleton service with custom initialization", () =>
	{
		const serviceProvider = new ServiceProvider(
			[],
			[ServiceDescriptor.singleton(SimpleService, serviceProvider =>
				{
					const simpleService = new SimpleService();
					simpleService.simpleValue = 5;
					return simpleService;
				})]);

		const simpleService = serviceProvider.getService(SimpleService);
		if(isNotNull(simpleService))
		{
			assert.equal(simpleService.simpleValue, 5);
		}
	});

	it("instance service", () =>
	{
		const simpleService = new SimpleService();
		simpleService.simpleValue = 6;
		const serviceProvider = new ServiceProvider(
			[FooEvent],
			[ServiceDescriptor.instance(SimpleService, simpleService)]);

		const simpleServiceInstance = serviceProvider.getService(SimpleService);

		if(isNotNull(simpleServiceInstance))
		{
			assert.equal(simpleServiceInstance.simpleValue, 6);
		}
	});

	it("transient service instantiate twice", () =>
	{
		const serviceProvider = new ServiceProvider(
			[],
			[ServiceDescriptor.transient(SimpleService)]);
		const simpleService1 = serviceProvider.getService(SimpleService);
		if(isNotNull(simpleService1))
		{
			simpleService1.simpleValue = 5;
			const simpleService2 = serviceProvider.getService(SimpleService);
			if(isNotNull(simpleService2))
			{
				assert.notEqual(simpleService1, simpleService2);
				assert.equal(simpleService2.simpleValue, 1);
			}
		}
	});

	it("transient service with dependent service", () =>
	{
		const serviceProvider = new ServiceProvider(
			[FooEvent],
			[ServiceDescriptor.transient(SimpleService),
			ServiceDescriptor.transient(BarService)]);
		const barService = serviceProvider.getService(BarService);
		if(isNotNull(barService))
		{
			assert.isNotNull(barService.fooEvent);
			if(isNotNull(barService.simpleService))
			{
				barService.simpleService.simpleValue = 5;
				const simpleService = serviceProvider.getService(SimpleService);
				if(isNotNull(simpleService))
				{
					assert.equal(simpleService.simpleValue, 1);
				}
			}
		}
	});

	it("transient service with custom initialization", () =>
	{
		const serviceProvider = new ServiceProvider(
			[],
			[ServiceDescriptor.transient(SimpleService, serviceProvider =>
				{
					const simpleService = new SimpleService();
					simpleService.simpleValue = 5;
					return simpleService;
				})]);

		const simpleService = serviceProvider.getService(SimpleService);
		if(isNotNull(simpleService))
		{
			assert.equal(simpleService.simpleValue, 5);
		}
	});
});

function isNotNull<T>(value: T | null ): value is T
{
	assert.isNotNull(value);
	return true;
}