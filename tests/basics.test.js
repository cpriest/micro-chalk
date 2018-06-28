'use strict';

const baseOptions = {
	// No pre-defined aliases
	aliases: {},

	// No pre function
	pre: undefined,

	// For easier processing of output to expected, convert ESC to \e
	post: (output) => output.replace(/\x1B/g, 'Ɛ'),

	// Stick with default
	resetCode: undefined,
};

let log = require('../')
	.options(baseOptions);

const CSI = 'Ɛ[';
const FG = `${CSI}38;5;`;
const BG = `${CSI}48;5;`;

const bla = '0m';
const red = '1m';
const gre = '2m';
const yel = '3m';
const blu = '4m';
const mag = '5m';
const cya = '6m';
const whi = '7m';
const Bla = '8m';
const Red = '9m';
const Gre = '10m';
const Yel = '11m';
const Blu = '12m';
const Mag = '13m';
const Cya = '14m';
const Whi = '15m';

const FG_RSET = `${FG}15m`;
const BG_RSET = `${BG}0m`;
const FULL_RSET = `${FG_RSET}${BG_RSET}`;


describe('basic tests', () => {

	test('basic fg test', () => {
		expect(log`{red red string}`)
			.toBe(`${FG}${red}red string${FG_RSET}`);
	});

	test('basic bg test', () => {
		expect(log`{.red red string}`)
			.toBe(`${BG}${red}red string${BG_RSET}`);

	});

	test('basic fg/bg test', () => {
		expect(log`{White.Blue Blue on White Background}`)
			.toBe(`${FG}${Whi}${BG}${Blu}Blue on White Background${FULL_RSET}`);

	});

	test('Nested fg coloring w/ Unrolling', () => {
		expect(log`{Blue Blue Text {White White Text} Blue Text}`)
			.toBe(`${FG}${Blu}Blue Text ${FG}${Whi}White Text${FG}${Blu} Blue Text${FG_RSET}`);
	});

	test('Nested bg coloring w/ Unrolling', () => {
		expect(log`{.yellow yellow bg {.green green bg} yellow bg}`)
			.toBe(`${BG}${yel}yellow bg ${BG}${gre}green bg${BG}${yel} yellow bg${BG_RSET}`);
	});

	test('Nested fg/bg coloring w/ Unrolling', () => {
		expect(log`{Blue Blue Text {.White White Background} Blue Text}`)
			.toBe(`${FG}${Blu}Blue Text ${BG}${Whi}White Background${BG_RSET} Blue Text${FG_RSET}`);
	});
});

describe('option tests', () => {

	test('pre is called with input', () => {
		let pre_input = '';
		log.options({
			pre: (input) => {
				return pre_input = input;
			}
		});

		log`{red red string}`;

		expect(pre_input)
			.toBe('{red red string}');

		log.options(baseOptions);
	});

	test('post is called with output', () => {
		let post_output = '';
		log.options({
			post: (output) => {
				output = output.replace(/\x1B/g, 'Ɛ');
				return post_output = output;
			}
		});

		log`{red red string}`;
		expect(post_output)
			.toBe(`${FG}${red}red string${FG_RSET}`);

		log.options(baseOptions);
	});

	test('reset code works as intended - fg', () => {
		log.options({
			resetCode: 'magenta'
		});
		expect(log`before {red red string} after`)
			.toBe(`before ${FG}${red}red string${FG}${mag} after`);

		log.options(baseOptions);
	});

	test('reset code works as intended - bg', () => {
		log.options({
			resetCode: '.magenta'
		});

		expect(log`before {red red string} after`)
			.toBe(`before ${FG}${red}red string${FG}${Whi} after`);

		expect(log`before {.red red string} after`)
			.toBe(`before ${BG}${red}red string${BG}${mag} after`);

		log.options(baseOptions);
	});

	test('reset code works as intended - fg/bg', () => {
		log.options({
			resetCode: 'magenta.green'
		});

		expect(log`before {red.white red string} after`)
			.toBe(`before ${FG}${red}${BG}${whi}red string${FG}${mag}${BG}${gre} after`);

		log.options(baseOptions);
	});


});
