'use strict';

// noinspection ConstantConditionalExpressionJS
const ESC = true ? 'Ɛ' : '\x1B';

const CSI = `${ESC}[`;
const FG  = `${CSI}38;5;`;
const BG  = `${CSI}48;5;`;

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

const FG_RSET   = `${FG}15m`;
const BG_RSET   = `${BG}0m`;
const FULL_RSET = `${FG_RSET}${BG_RSET}`;

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

let log = require('../')
	.options(baseOptions);

beforeEach(() => {
	log.options(baseOptions);
});

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

	beforeEach(() => {
		log.options(baseOptions);
	});

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
	});

	test('post is called with output', () => {
		let post_output = '';
		log.options({
			post: (output) => {
				output = output.replace(/\x1B/g, ESC);
				return post_output = output;
			}
		});

		log`{red red string}`;
		expect(post_output)
			.toBe(`${FG}${red}red string${FG_RSET}`);
	});

	test('reset code works as intended - fg', () => {
		log.options({
			resetCode: 'magenta'
		});
		expect(log`before {red red string} after`)
			.toBe(`before ${FG}${red}red string${FG}${mag} after`);
	});

	test('reset code works as intended - bg', () => {
		log.options({
			resetCode: '.magenta'
		});

		expect(log`before {red red string} after`)
			.toBe(`before ${FG}${red}red string${FG}${Whi} after`);

		expect(log`before {.red red string} after`)
			.toBe(`before ${BG}${red}red string${BG}${mag} after`);
	});

	test('reset code works as intended - fg/bg', () => {
		log.options({
			resetCode: 'magenta.green'
		});

		expect(log`before {red.white red string} after`)
			.toBe(`before ${FG}${red}${BG}${whi}red string${FG}${mag}${BG}${gre} after`);
	});

	test('alias of base', () => {
		log.options({
			aliases: {
				'RED':  'Red',
			}
		});
		expect(log`{RED red string}`)
			.toBe(`${FG}${Red}red string${FG_RSET}`);
	});

	test('alias of ANSI-256 code', () => {
		log.options({
			aliases: {
				'pink': '207',
			}
		});
		expect(log`{pink pink string}`)
			.toBe(`${FG}207mpink string${FG_RSET}`);
	});

	test('alias of semi qualified code (fg)', () => {
		log.options({
			aliases: {
				'^': 'Red.',
			}
		});
		expect(log`{^ Red string}`)
			.toBe(`${FG}${Red}Red string${FG_RSET}`);
	});

	test('alias of semi qualified code (bg)', () => {
		log.options({
			aliases: {
				'##': '.Red',
			}
		});
		expect(log`{## red background}`)
			.toBe(`${BG}${Red}red background${BG_RSET}`);
	});

	test('alias of fully qualified code', () => {
		log.options({
			aliases: {
				'^': 'black.Yellow',
				'^^': 'White.red',
			}
		});
		expect(log`{^ WARNING: {^^ PROBLEM!!}}`)
			.toBe(`${FG}${bla}${BG}${Yel}WARNING: ${FG}${Whi}${BG}${red}PROBLEM!!${FG}${bla}${BG}${Yel}${FULL_RSET}`);
	});

	test('alias of alias of base', () => {
		log.options({
			aliases: {
				'^': 'Red',
				'#': '^',
			}
		});
		expect(log`{# Red fg}`)
			.toBe(`${FG}${Red}Red fg${FG_RSET}`);
	});

	test('alias of alias of ANSI-256 Code', () => {
		log.options({
			aliases: {
				'^': '207',
				'#': '^',
			}
		});
		expect(log`{# pink fg}`)
			.toBe(`${FG}207mpink fg${FG_RSET}`);
	});
});

describe('chalk test strings', () => {

	test('fg test', () => {
		expect(log`{redBright redBright}`)
			.toBe(`${FG}${Red}redBright${FG_RSET}`);
	});

	test('bg test', () => {
		expect(log`{bgBlueBright bgBlueBright}`)
			.toBe(`${BG}${Blu}bgBlueBright${BG_RSET}`);
	});

	test('fg/bg test', () => {
		expect(log`{whiteBright.bgBlueBright whiteBright.bgBlueBright}`)
			.toBe(`${FG}${Whi}${BG}${Blu}whiteBright.bgBlueBright${FULL_RSET}`);
	});


});
