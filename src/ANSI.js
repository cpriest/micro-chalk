'use strict';

let Parser = require('./Parser');

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

const SgrAttributeCodes = {
	'bold':      [1, 22],	// Bold
	'dim':       [2, 22],	// Dim
	'italic':    [3, 23],	// Italic
	'underline': [4, 24],	// Underlined
	'blink':     [5, 25],	// Blinking
	'inverse':   [7, 27],	// Inverse
	'hidden':    [8, 28],	// Hidden
	'strike':    [9, 29],	// Strikethrough
};

// The entire match is replaced with {value Match0}
const patternAliases = {
	'\\*([^\\*]*?)\\*': 'bold',			// Bold
//	'\\:([^\\:]*?)\\:': 'dim',			// Dim
//	'\\#([^\\#]*?)\\#': 'italic',		// Italic
	'\\_([^\\_]*?)\\_': 'underline',	// Underlined
//	'\\&([^\\&]*?)\\&': 'blink',		// Blinking
//	'\\!([^\\!]*?)\\!': 'inverse',		// Inverse
//	'\\=([^\\=]*?)\\=': 'hidden',		// Hidden
	'\\~([^\\~]*?)\\~': 'strike',		// Strikethrough
};

const AnsiCSI = {
	'FG': CSI + FGC + ';',
	'BG': CSI + BGC + ';',
};

const defaultResetCode = 'White.black';

class ANSI extends Parser {
	constructor() {
		super();

		this.longForms      = longForms;
		this.aliases        = {};
		this.resetCode      = defaultResetCode;
		this.patternAliases = patternAliases;
		this.attrCodes      = SgrAttributeCodes;

		return this.proxy();
	}

	/**
	 * Handle non-base Parser markup, such as *bold*, then pass on to parent
	 *
	 * @param {string} input   Input string from the template literal tag function
	 *
	 * @returns {string}       Resulting translation of the marked up input
	 */
	markup(input) {
		let pattern = Object
			.keys(this.patternAliases)
			.join('|');


		let output  = input,
			entries = Object.entries(this.patternAliases),
			max     = entries.length + 1;

		let r = new RegExp(pattern, 'g'),
			m;

		// noinspection JSValidateTypes
		while((m = r.exec(output)) !== null) {
			for(let j = 1; j <= max; j++) {
				if(m[j] !== undefined) {
					// j - 1 is the index of the matching patternAlias, [1] is the value to the pattern key
					let desc = Object.entries(this.patternAliases)[j - 1][1];

					output = output.replace(m[0], `{${desc} ${m[j]}}`);

					r.lastIndex -= m[0].length; // Backtrack to beginning of our match
					r.lastIndex += desc.length + 3;	// Move forward the description length + 3 for {, space and first character of match
					break;	// for loop
				}
			}
		}

		return super.markup(output);
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

		function nextColor(result) {
			return ['FG', 'BG', '_'].find(
				x => !(x in result.types),
			);
		}

		let result = input
			.split('.')
			.reduce((result, desc) => {
					let { SgrType, code } = this.resolve(desc);

					if(SgrType === 'color') {
						let next = nextColor(result);

						if(next === '_')
							throw `Extraneous color (${desc}) specified in ${input}, only two colors may be declared per tag pair.`;

						result.types[next] = code;

						return result;
					} else if(SgrType === 'attr') {
						result.open += CSI + code[0] + 'm';
						result.close += CSI + code[1] + 'm';
						return result;
					}
					throw `Unknown type (${SgrType}) in ANSI::xlate()`;
				}, { types: {}, open: '', close: '' },
			);

		let colorOpen = '';
		for(let [type, code] of Object.entries(result.types)) {
			if(code === undefined) {
				delete result.types[type];
				continue;
			}
			result.types[type] = AnsiCSI[type] + code + 'm';
			colorOpen += result.types[type];
		}

		result.open = colorOpen + result.open;

		return result;
	}

	/**
	 * Resolves ${desc} into an {Alias} or {AnsiCode}
	 *
	 * @param {MicroChalk.Alias} desc
	 *
	 * @returns {object}
	 */
	resolve(desc) {
		if(desc == undefined)
			return { SgrType: 'color', code: undefined };

		while(this.aliases[desc])
			desc = this.aliases[desc];

		while(chalkAliases[desc]) {
			desc = chalkAliases[desc];
			if(desc[0] == '.')
				desc = desc.substr(1);
		}

		if(!isNaN(parseInt(desc)))
			return { SgrType: 'color', code: parseInt(desc) };

		if(this.attrCodes[desc])
			return { SgrType: 'attr', code: this.attrCodes[desc] };

		return { SgrType: 'color', code: this.longForms[desc] };
	}

	/**
	 * Sets options for the logger
	 *
	 * @param {MicroChalk.Options} opts
	 */
	options(opts = {}) {
		this.aliases        = opts.aliases || this.aliases || {};
		this.patternAliases = opts.patternAliases || this.patternAliases || {};

		if(opts.resetCode) {
			switch(opts.resetCode.indexOf('.')) {
				case -1:
					opts.resetCode += '.black';
					break;
				case 0:
					opts.resetCode = 'White' + opts.resetCode;
					break;
			}
			this.resetCode = opts.resetCode || this.resetCode;
		} else {
			this.resetCode = defaultResetCode;
		}
		return super.options(opts);
	}
}

module.exports = new ANSI();
