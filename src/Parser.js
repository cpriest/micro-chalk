'use strict';

function replacer(pairs, str) {
	for(let [k, v] of Object.entries(pairs))
		str = str.replace(k, v);
	return str;
}

/**
 * At present, any \\{ or \\} must be masked with some other code and later unmasked
 * to work properly with our current regular expression pattern/method
 */
/** @type {function} */
let mask   = replacer.bind(undefined, {
	'\\{': '\x01\x01',
	'\\}': '\x01\x02',
});
/** @type {function} */
let unmask = replacer.bind(undefined, {
	'\x01\x01': '\\{',
	'\x01\x02': '\\}',
});

class Parser {
	constructor() {
		this.resetCode = '';
	}

	proxy() {
		// noinspection JSCheckFunctionSignatures
		return new Proxy(this.TagParser, {
			apply:                    (target, _this, args) => this.TagParser.apply(this, args),
			construct:                (target, args) => { throw 'construct() trap called'; },
			get:                      (target, key) => this[key],
			set:                      (target, key, value) => this[key] = value || true,
			deleteProperty:           (target, key) => delete this[key],
			enumerate:                (target, key) => Object.entries(this),
			ownKeys:                  (target, key) => Object.entries(this),
			has:                      (target, key) => key in this,
			defineProperty:           (target, key, desc) => Object.defineProperty(this, key, desc),
			getOwnPropertyDescriptor: (target, key) => Object.getOwnPropertyDescriptor(this, key),
		});
	}

	TagParser(strings, ...keys) {
		const args  = [].slice.call(arguments, 1);
		const parts = [strings.raw[0]];

		for(let i = 1; i < strings.length; i++) {
			parts.push(String(args[i - 1]));
			parts.push(String(strings.raw[i]));
		}

		let input = parts.join('');

		if(this.pre && typeof this.pre == 'function')
			input = this.pre(input);

		// Mask /\\[{}]/ with something else
		let output = this.markup(
			mask(input),
		);

		// Unmask entries and unescape any remaining escaped characters
		output = unmask(output)
			.replace(/\\(.)/g, '$1');

		if(this.post && typeof this.post == 'function')
			output = this.post(output);

		return output;
	}

	/**
	 * Break apart the input string based on the { } brackets and pass the bracket
	 * description to xlate for open/close information, recurse as needed.
	 *
	 * @param {string} input
	 * @param {object?} prevTypes
	 * @returns {string}
	 */
	markup(input, prevTypes = this.xlate(this.resetCode).types) {
		let r      = /{(\S+)\s((?:[\\].|[^{}]|(?:{[^{}]*})*)+)}/g,
			output = input,
			m;

		// noinspection JSValidateTypes
		while((m = r.exec(input)) !== null) {
			let { types, open } = this.xlate(m[1]);

			let close = Object.keys(types)
				.filter(x => x in prevTypes)
				.reduce((close, x) => close + prevTypes[x], '');

			output = output.replace(m[0],					// Replace match
				this.markup(open + m[2] + close,			// with re-processed string
					Object.assign({}, prevTypes, types),	// Passing in our previous types overlayed with our current types
				),
			);
		}

		return output;
	}

	/**
	 * Returns the opening/closing ansi codes for the given ${input} elements
	 *
	 * @param {string} input    The descriptive replacements
	 *
	 * @return {object} Opening/Closing Ansi Codes
	 */
	xlate(input) {
		throw 'xlate() must be implemented by sub-class';
	}

	/**
	 * Sets options for the logger
	 *
	 * @param {MicroChalk.Options} opts
	 */
	options(opts = {}) {
		this.pre  = 'pre' in opts ? opts.pre : this.pre;
		this.post = 'post' in opts ? opts.post : this.post;

		return this;
	}
}

module.exports = Parser;
