'use strict';

import {ANSI}  from '../src/ANSI.js';
import {setup} from '../misc/globals.js';
import * as fs from "fs";
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

describe('ANSI', () => {

	describe('basic', () => {

		test('fg test', () => {
			expect(log`{red red string}`)
				.toBe(`${FG}${red}red string${FG_RSET}`);
		});

		test('bg test', () => {
			expect(log`{.red red string}`)
				.toBe(`${BG}${red}red string${BG_RSET}`);

		});

		test('fg/bg test', () => {
			expect(log`{White.Blue Blue on White Background}`)
				.toBe(`${FG}${Whi}${BG}${Blu}Blue on White Background${FULL_RSET}`);

		});

		test('fg/bg test (cssColors)', () => {
			expect(log`{#00F.#FFF Blue on White Background}`)
				.toBe(`${FG24}0;0;255m${BG24}255;255;255mBlue on White Background${FULL_RSET}`);

		});
	});

	describe('Nesting', () => {

		test('Nested fg coloring', () => {
			expect(log`{Blue Blue Text {White White Text} Blue Text}`)
				.toBe(`${FG}${Blu}Blue Text ${FG}${Whi}White Text${FG}${Blu} Blue Text${FG_RSET}`);
		});

		test('Nested bg coloring', () => {
			expect(log`{.yellow yellow bg {.green green bg} yellow bg}`)
				.toBe(`${BG}${yel}yellow bg ${BG}${gre}green bg${BG}${yel} yellow bg${BG_RSET}`);
		});

		test('Nested fg/bg coloring', () => {
			expect(log`{Blue Blue Text {.White White Background} Blue Text}`)
				.toBe(`${FG}${Blu}Blue Text ${BG}${Whi}White Background${BG_RSET} Blue Text${FG_RSET}`);
		});
	});

	describe('options', () => {

		describe('pre/post', () => {

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

		});

		describe('reset code', () => {

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

		});

		describe('aliasing', () => {

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
	});

	describe('pattern aliasing', () => {

		test('Builtin Bold, Strikeout and Underline Markup', () => {
			expect(log`This is *bold* and ~strikethough~ and _underline_`)
				.toBe(`This is ${CSI}1mbold${CSI}21m and ${CSI}9mstrikethough${CSI}29m and ${CSI}4munderline${CSI}24m`);
		});

		test('Custom Pattern Alias []', () => {
			let pa = log.patternAliases;

			log.options({
				patternAliases: Object.assign({}, pa, { '(\\[[^\\]]+?\\])' : 'Green'})
			});

			expect(log`{Red command [-jxhd] arg}`)
				.toBe(`${FG}${Red}command ${FG}${Gre}[-jxhd]${FG}${Red} arg${FG_RSET}`);

			log.options({
				patternAliases: pa,
			});
		});

		test('Bold / Dim properly resets the color', () => {
			expect(log`{Red Red *Bold* Red}`)
				.toBe(`${FG}${Red}Red ${CSI}1mBold${CSI}21m Red${FG_RSET}`);
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

	describe('bugfixes', () => {

		// Tests that * requires a \s before and after the *
		test('embedded *s work properly when at boundary', () => {
			expect(log`{Red Some *math examples* are 4 * 4 = 16 and 2 * 3 = 6}`)
				.toBe(`${FG}${Red}Some ${CSI}1mmath examples${CSI}21m are 4 * 4 = 16 and 2 * 3 = 6${FG_RSET}`);
		});

		// Tests that _ requires a \s before and after the *
		test('embedded _s work properly when at boundary', () => {
			expect(log`{Red The _variables_ are innodb_buffer_pool and innodb_buffer_pool_instances}`)
				.toBe(`${FG}${Red}The ${CSI}4mvariables${CSI}24m are innodb_buffer_pool and innodb_buffer_pool_instances${FG_RSET}`);
		});

		// Tests that embedded JSON {'s don't break the parser
		describe('embedded JSON in output works properly (unknown tags are ignored)', () => {

			test('manual input/output', () => {
				expect(log`{Red The JSON string is { "input": "sample text" }}`)
					.toBe(`${FG}${Red}The JSON string is { "input": "sample text" }${FG_RSET}`);
			});

			test('JSON.stringify() of package.json', () => {
				let json = fs.readFileSync('./package.json', 'utf8');
				expect(log`${json}`)
					.toBe(json);
			});
		});
	});
});
