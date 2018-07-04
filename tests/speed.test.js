'use strict';

// noinspection ConstantConditionalExpressionJS
require('../misc/globals.js')(true ? 'Ɛ' : '\x1B');

const baseOptions = {
	// No pre-defined aliases
	aliases: {},

	// No pre function
	pre: undefined,

	// For easier processing of output to expected, convert ESC to \e
	post: (output) => output.replace(/\x1B/g, ESC),

	// Stick with default
	resetCode: undefined,
};

let log = require('../');

beforeEach(() => {
	log.options(baseOptions);
});


describe('performance', () => {

	test('1000 iterations < 100ms - string 1', () => {
		const str1 = '{Magenta There are {Red many colors} {Blue available} for use, {Yellow 256 to be} exact.}',
			iterations = 1000;

		log.options({ pre: undefined, post: undefined });

		let start = Date.now(),
			_;

		for(var j=0;j<iterations;j++) {
			_ = log`${str1}`;
		}

		let duration = Date.now() - start;

		expect(duration)
			.toBeLessThan(100);
	});

});
