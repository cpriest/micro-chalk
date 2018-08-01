'use strict';

let _;	// General Purpose Variable
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

const ESC   = '\x1B' || 'Ɛ',
	  CSI   = `${ESC}[`,
	  FGC   = `38;5`,
	  FGC24 = `38;2`,
	  FG    = `${CSI}${FGC};`,
	  FG24  = `${CSI}${FGC24};`,
	  BGC   = `48;5`,
	  BGC24 = `48;2`,
	  BG    = `${CSI}${BGC};`,
	  BG24  = `${CSI}${BGC24};`;

const SgrAttributeCodes = {
	'bold':          [1, 22],	// Bold
	'bright':        [1, 22],	// Bold

	'dim':           [2, 22],	// Dim

	'italic':        [3, 23],	// Italic
	'italicized':    [3, 23],	// Italic

	'under':         [4, 24],	// Underlined
	'underline':     [4, 24],	// Underlined
	'underlined':    [4, 24],	// Underlined

	'blink':         [5, 25],	// Blinking
	'blinking':      [5, 25],	// Blinking

	'inverse':       [7, 27],	// Inverse

	'hidden':        [8, 28],	// Hidden
	'hide':          [8, 28],	// Hidden

	'strike':        [9, 29],	// Strikethrough
	'strikethrough': [9, 29],	// Strikethrough
	'strikeout':     [9, 29],	// Strikethrough
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
	'FG': FG,
	'BG': BG,
};

const Ansi24CSI = {
	'FG': FG24,
	'BG': BG24,
};

const defaultResetCode = 'White.black';

/**
 * Converts a given css color hex code to its ISO-8613-6 24 bit code
 *
 * @param {string} css
 *
 * @return {string}
 */
function cssColorToAnsi24(css) {
	if(css.length === 3)
		css = css[0] + css[0] + css[1] + css[1] + css[2] + css[2];

	return parseInt(css.substr(0, 2), 16) + ';' + parseInt(css.substr(2, 2), 16) + ';' + parseInt(css.substr(4, 2), 16);
}


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
	 * Returns the opening/closing ansi codes for the given ${desc} elements
	 *
	 * @param {string} desc      The descriptive replacements
	 * @param {object} prevTypes  The previous enclosing types from the parent context
	 *
	 * @return {object} Opening/Closing Ansi Codes
	 */
	xlate(desc, prevTypes) {
		while(this.aliases[desc])
			desc = String(this.aliases[desc]);

		if(chalkAliases[desc])
			desc = chalkAliases[desc];

		function nextColor(result) {
			return ['FG', 'BG', '_'].find(
				x => !(x in result.types),
			);
		}

		let colorOpen  = '',
			colorClose = '';

		let result = desc
			.split('.')
			.reduce((result, desc) => {
					let { SgrType, code } = this.resolve(desc);

					if(SgrType === 'color') {
						let next = nextColor(result);

						if(next === '_')
							throw `Extraneous color (${desc}) specified in ${desc}, only two colors may be declared per markup block.`;

						result.types[next] = code !== undefined
											 ? AnsiCSI[next] + code + 'm'
											 : code;

						return result;
					} else if(SgrType === 'color24b') {
						let next = nextColor(result);

						if(next === '_')
							throw `Extraneous color (${desc}) specified in ${desc}, only two colors may be declared per markup block.`;

						result.types[next] = code !== undefined
											 ? Ansi24CSI[next] + code + 'm'
											 : code;

						return result;
					} else if(SgrType === 'attr') {
						result.open += CSI + code[0] + 'm';
						result.close += CSI + code[1] + 'm';

						// For bold/dim, we also want to set the FG color upon close
						if(code[1] == 22)
							colorClose = prevTypes.FG;

						return result;
					}
					throw `Unknown type (${SgrType}) in ANSI::xlate()`;
				}, { types: {}, open: '', close: '' },
			);

		for(let [type, code] of Object.entries(result.types)) {
			if(code === undefined) {
				delete result.types[type];
				continue;
			}
			colorOpen += result.types[type];
		}

		result.open  = colorOpen + result.open;
		result.close = result.close + colorClose;

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

		if((_ = desc.match(/^#([a-f\d]{6}|[a-f\d]{3})$/i)) !== null)
			return { SgrType: 'color24b', code: cssColorToAnsi24(_[1]) };

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
