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


describe('misc', () => {

	describe('escaping with \\', () => {

		test('{ and } in main pattern', () => {
			expect(log`{Green \{Blue Test String\} }`)
				.toBe(`${FG}${Gre}{Blue Test String} ${FG}${Whi}`);
		});

		test('a few other characters', () => {
			expect(log`{Green \[ \o \t \T}`)
				.toBe(`${FG}${Gre}[ o t T${FG}${Whi}`);
		});

	});

});
