import "mocha";

import { Event } from '../../scripts';
import { assert, expect } from "chai";

describe("Event subscribtion and fire", () => {
	it("simple subscribtion and fire", async () => {
		const myEvent = new Event<number>();
		let eventCalled = false;
		myEvent.add((sender, args) => {
			eventCalled = true;
		});

		await myEvent.fire({}, 5);

		assert.isTrue(eventCalled, "event was not called.");
	});

	it("more than one subscribers", async () => {
		const myEvent = new Event<number>();
		let firstEventCalled = false;
		let secondEventCalled = false;
		myEvent.add((sender, args) => {
			firstEventCalled = true;
		});
		myEvent.add((sender, args) => {
			secondEventCalled = true;
		});

		await myEvent.fire({}, 5);

		assert.isTrue(firstEventCalled, "first event was not called.");
		assert.isTrue(secondEventCalled, "second event was not called.");
	});

	it("three subscribers second fail", async () => {
		const myEvent = new Event<number>();
		const errorText = "Fail";
		let firstEventCalled = false;
		let thirdEventCalled = false;
		myEvent.add((sender, args) => {
			firstEventCalled = true;
		});
		myEvent.add((sender, args) => {
			throw errorText;
		});
		myEvent.add((sender, args) => {
			thirdEventCalled = true;
		});
		try {
			await myEvent.fire({}, 5);
		} catch(e) {
			const errors = e as Array<string>;
			assert.equal(errors.length, 1);
			assert.equal(errors[0], errorText);
		}

		assert.isTrue(firstEventCalled, "first event was not called.");
		assert.isTrue(thirdEventCalled, "second event was not called.");
	});
});
