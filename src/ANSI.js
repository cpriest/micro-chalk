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

const symbols = {
	'~': 0,		// Strikethrough??
	'*': 1,		// Bold
	'X': 3,		// Italic
	'_': 4,		// Underlined
	'&': 5,		// Blinking,
	'!': 7,		// Inverse
};

const defaultResetCode = 'White.black';

class ANSI {
	constructor() {
		this.longForms = longForms;
		this.aliases   = {};
		this.resetCode = defaultResetCode;
	}

	/**
	 * Returns the opening/closing ansi codes for the given ${input} elements
	 *
	 * @param {string} input    The descriptive replacements
	 *
	 * @return {object} Opening/Closing Ansi Codes
	 */
	xlate(input) {
		while(this.aliases[input])
			input = String(this.aliases[input]);

		if(chalkAliases[input])
			input = chalkAliases[input];

		let [fg, bg]         = input.split('.');
		let [fgCode, bgCode] = [this.resolve(fg), this.resolve(bg)];

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
	 * Resolves ${desc} into an {Alias} or {AnsiCode}
	 * @param {MicroChalk.Alias} desc
	 *
	 * @returns {MicroChalk.AnsiCode|MicroChalk.Alias}
	 */
	resolve(desc) {
		if(desc == undefined)
			return desc;

		while(this.aliases[desc])
			desc = this.aliases[desc];

		while(chalkAliases[desc]) {
			desc = chalkAliases[desc];
			if(desc[0] == '.')
				desc = desc.substr(1);
		}

		if(!isNaN(parseInt(desc)))
			return parseInt(desc);

		return this.longForms[desc];
	}

	/**
	 * Sets options for the logger
	 *
	 * @param {MicroChalk.Options} opts
	 */
	options(opts = {}) {
		this.aliases = opts.aliases || this.aliases || {};

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
			this.resetCode = opts.resetCode || this.resetCode;
		} else {
			this.resetCode = defaultResetCode;
		}
	}
}

module.exports = new ANSI();
