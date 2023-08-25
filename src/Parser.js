'use strict';

/**
 * This masks all backslash escaped characters by making them \zXX where XX is the ascii hex code for the escaped character.
 *
 * @param {string} input
 *
 * @return {string}
 */
function mask(input) {
	return input.replace(/\\(.)/g, (s) => {
		return '\\z' + s.charCodeAt(1)
			.toString(16);
	});
}

/**
 * This is the complement of mask() and converts \zXX sequences to their ascii character and removes the backslash
 *
 * @param {string} input
 *
 * @return {string}
 */
function unmask(input) {
	return input.replace(/\\z(..)/g, (s, ...match) => {
		return String.fromCharCode(parseInt(match[0], 16));
	});
}

export class Parser {
	constructor() {
		this.resetCode = '';
	}

	/**
	 * Returns a proxy object that will call the TagParser function when the template literal is evaluated
	 * @returns {function(*, ...[*]): *}
	 */
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

	/**
	 * The template literal tag function that will be called when the template literal is evaluated
	 *
	 * @param {string|string[]} strings
	 * @param {string|string[]} keys
	 *
	 * @returns {string}
	 */
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

		// Markup the input string after masking any escaped characters
		let output = this.markup(
			// Mask /\\[{}]/ with something else
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
	 * @param {string} input   Input string from the template literal tag function
	 *
	 * @returns {string}       Resulting translation of the marked up input
	 */
	markup(input) {
		let [output, entries] = this.extract(input);

		return this.expand(output, entries, this.xlate(this.resetCode, []).types);
	}

	/**
	 * Recursive expansion of extracted string entries until no further extracted strings remain
	 *
	 * @param {string} input		The modified input from extract() and as recursed by expand
	 * @param {object[]} entries	The indexed string entries found by the extract() function
	 * @param {object} prevTypes	The previous enclosing types from the parent context
	 *
	 * @return {string}
	 */
	expand(input, entries, prevTypes) {
		let r      = /\x1A(\d+)/g,
			output = input,
			m;

		// noinspection JSValidateTypes
		while((m = r.exec(input)) !== null) {
			let entry                  = entries[parseInt(m[1])];
			let { types, open, close } = this.xlate(entry[0], prevTypes);

			close += Object.keys(types)
				.filter(x => x in prevTypes)
				.reduce((close, x) => close + prevTypes[x], '');

			output = output.replace(m[0],							// Replace match
				this.expand(open + entry[1] + close,				// with re-processed string
					entries, Object.assign({}, prevTypes, types),	// Passing in our previous types overlayed with our current types
				),
			);
		}
		return output;
	};


	/**
	 * Extracts the smallest { } pair and stores it as an entry in an array, replacing the match with the entry index.
	 *    This process repeats until there are no further bracket pairs
	 *
	 * @param {string} input
	 * @return {[string, array]}
	 */
	extract(input) {
		let r       = /{(\S*\s*)([^{}]+)}/g,
			entries = [],
			m;

		// noinspection JSValidateTypes
		while((m = r.exec(input)) !== null) {
			r.lastIndex = 0;
			entries.push(m.slice(1, 3));
			input = input.replace(m[0], String.fromCharCode(26) + (entries.length - 1));
		}

		return [input, entries];
	}

	/**
	 * Returns the opening/closing ansi codes for the given ${input} elements
	 *
	 * @param {string} input      The descriptive replacements
	 * @param {object} prevTypes  The previous enclosing types from the parent context
	 *
	 * @return {object} Opening/Closing Ansi Codes
	 */
	xlate(input, prevTypes) {
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
