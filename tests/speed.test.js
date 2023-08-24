'use strict';

import {ANSI}  from '../src/ANSI.js';
import {setup} from '../misc/globals';
setup('Ɛ');

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

const log = new ANSI();

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
