'use strict';

const longForms = {
	'black':   0, 'Black': 8,
	'red':     1, 'Red': 9,
	'green':   2, 'Green': 10,
	'yellow':  3, 'Yellow': 11,
	'blue':    4, 'Blue': 12,
	'magenta': 5, 'Magenta': 13,
	'cyan':    6, 'Cyan': 14,
	'white':   7, 'White': 15,
};

/**
 *
 * @type Object<String,String>
 */
const chalkAliases = {
	// chalk aliases
	gray:          'Black',
	redBright:     'Red',
	greenBright:   'Green',
	yellowBright:  'Yellow',
	blueBright:    'Blue',
	magentaBright: 'Magenta',
	cyanBright:    'Cyan',
	whiteBright:   'White',
	bgBlack:       '.black', bgBlackBright: '.Black',
	bgRed:         '.red', bgRedBright: '.Red',
	bgGreen:       '.green', bgGreenBright: '.Green',
	bgYellow:      '.yellow', bgYellowBright: '.Yellow',
	bgBlue:        '.blue', bgBlueBright: '.Blue',
	bgMagenta:     '.magenta', bgMagentaBright: '.Magenta',
	bgCyan:        '.cyan', bgCyanBright: '.Cyan',
	bgWhite:       '.white', bgWhiteBright: '.White',
};

const ESC = '\x1B' || 'Ɛ';
const CSI = `${ESC}[`;
const FGC = `38;5`;
const FG  = `${CSI}${FGC};`;
const BGC = `48;5`;
const BG  = `${CSI}${BGC};`;

const defaultResetCode = 'White.black';

module.exports = (() => {
	let mc = function MicroChalk(strings, ...keys) {
		const args  = [].slice.call(arguments, 1);
		const parts = [strings.raw[0]];

		for(let i = 1; i < strings.length; i++) {
			parts.push(String(args[i - 1]));
			parts.push(String(strings.raw[i]));
		}

		let input = parts.join('');

		if(mc.pre && typeof mc.pre == 'function')
			input = mc.pre(input);

		let output = colorize(input);

		if(mc.post && typeof mc.post == 'function')
			output = mc.post(output);

		return output;
	};

	/**
	 * Resolves ${desc} into an {Alias} or {AnsiCode}
	 * @param {MicroChalk.Alias} desc
	 *
	 * @returns {MicroChalk.AnsiCode|MicroChalk.Alias}
	 */
	function resolve(desc) {
		if(desc == undefined)
			return desc;

		while(mc.aliases[desc])
			desc = mc.aliases[desc];

		while(chalkAliases[desc]) {
			desc = chalkAliases[desc];
			if(desc[0] == '.')
				desc = desc.substr(1);
		}

		if(!isNaN(parseInt(desc)))
			return parseInt(desc);

		return mc.longForms[desc];
	}

	/**
	 * Returns the opening/closing ansi codes for the given ${input} elements
	 * @param {string} input    The descriptive replacements
	 * @return {object} Opening/Closing Ansi Codes
	 */
	function convert(input) {
		// let mon = input == '^' || input == '^^';

		while(mc.aliases[input])
			input = String(mc.aliases[input]);

		if(chalkAliases[input])
			input = chalkAliases[input];

		let [fg, bg]         = input.split('.');
		let [fgCode, bgCode] = [resolve(fg), resolve(bg)];

		// if(mon)
		// 	inspect([input, fg, bg, fgCode, bgCode]);

		let open = [], close = [];

		if(fgCode != undefined) {
			open.push(`${FG}${fgCode}m`);
			close.push(`${FG}m`);				// Note, this is an invalid sequence which is post-processed by unroll()
		}

		if(bgCode != undefined) {
			open.push(`${BG}${bgCode}m`);
			close.push(`${BG}m`);				// Note, this is an invalid sequence which is post-processed by unroll()
		}

		return {
			open:   open.join(''),
			opens:  open,
			close:  close.join(''),
			closes: close,
		};
	}

	/**
	 * Parses the input string for ANSI codes, keeping track of 'last fg/bg' color and
	 *    restoring those colors when an (invalid) \e[38;5m or \e[48;5m shows up
	 * @param {string} input
	 * @return {string}
	 */
	function unroll(input) {
		let r     = new RegExp(`${ESC}\\[((?:38|48);[25]);?(\\d*)m`, 'g'),
			stack = {}, m;

		let open = convert(mc.resetCode).open;
		input    = open + input;

		// noinspection JSValidateTypes
		while((m = r.exec(input)) !== null) {
			let [type, color] = m.slice(1);
			if(!stack[type])
				stack[type] = [];

			if(color) {
				stack[type].push(color);
			} else {
				stack[type].pop();

				let reset = mc.resetCode;
				if(stack[type].length)
					reset = `\x1B[${type};${stack[type].slice(-1)}m`;

				input = input.slice(0, m.index) + reset + input.slice(m.index + m[0].length);
			}
		}
		return input.slice(open.length);
	}

	/**
	 * Colorizes the input string based on the { } brackets
	 * @param {string} input
	 * @returns {string}
	 */
	function colorize(input) {
		// logInfo('-->\n\t' + input + '\n');
		// let r      = /{(\S+)\s+([^{}]+?)}/g, m;
		let r      = /{(\S+)\s((?:[^{}]|(?:{[^{}]*})*)+)}/g, m;
		let output = input;

		// noinspection JSValidateTypes
		while((m = r.exec(input)) !== null) {
			// inspect(m);
			let { open, close } = convert(m[1]);
			output              = output.replace(m[0], open + m[2] + close);
		}
		if(input != output)
			return colorize(output);
		return unroll(output);
	}

	/**
	 * Sets options for the logger
	 *
	 * @param {MicroChalk.Options} opts
	 */
	function options(opts = {}) {
		mc.aliases = opts.aliases || mc.aliases || {};
		mc.pre     = 'pre' in opts ? opts.pre : mc.pre;
		mc.post    = 'post' in opts ? opts.post : mc.post;

		if(opts.resetCode) {
			// inspect(opts.resetCode);
			switch(opts.resetCode.indexOf('.')) {
				case -1:
					opts.resetCode += '.black';
					break;
				case 0:
					opts.resetCode = 'White' + opts.resetCode;
					break;
			}
			// inspect(opts.resetCode);
			// inspect(convert(opts.resetCode));
			mc.resetCode = opts.resetCode || mc.resetCode;
		} else {
			mc.resetCode = defaultResetCode;
		}
		return mc;
	}

	mc.options   = options;
	mc.longForms = longForms;
	mc.aliases   = {};

	mc.resetCode = defaultResetCode;

	// logInfo(mc`This {red is {blue a test} run}: ${1 + 1}.  {white Yep, {green we {yellow like} ${'{blue template}'} literals}!}`);
	// logInfo(mc`{red This is an {green previous failure}: {}}`);

	return mc;
})();

