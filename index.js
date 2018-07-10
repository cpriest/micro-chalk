'use strict';

// require('./src/debug.js');

function replacer(pairs, str) {
	for(let [k, v] of Object.entries(pairs))
		str = str.replace(k, v);
	return str;
}

let mask   = replacer.bind(undefined, {
		'\\{': '\x01\x01',
		'\\}': '\x01\x02',
	}),
	unmask = replacer.bind(undefined, {
		'\x01\x01': '\\{',
		'\x01\x02': '\\}',
	});

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

		// Mask /\\[{}]/ with something else
		let output = colorize(
			mask(input),
		);

		// Unmask entries and unescape any remaining escaped characters
		output = unmask(output)
			.replace(/\\(.)/g, '$1');

		if(mc.post && typeof mc.post == 'function')
			output = mc.post(output);

		return output;
	};

	/**
	 * Colorizes the input string based on the { } brackets
	 * @param {string} input
	 * @param {object?} prevTypes
	 * @returns {string}
	 */
	function colorize(input, prevTypes = mc.xl.xlate(mc.xl.resetCode).types) {
		let r      = /{(\S+)\s((?:[\\].|[^{}]|(?:{[^{}]*})*)+)}/g,
			output = input,
			m;

		// noinspection JSValidateTypes
		while((m = r.exec(input)) !== null) {
			let { types, open } = mc.xl.xlate(m[1]);

			let close = Object.keys(types)
				.filter(x => x in prevTypes)
				.reduce((close, x) => close + prevTypes[x], '');

			output = output.replace(m[0],					// Replace match
				colorize(open + m[2] + close,				// with re-processed string
					Object.assign({}, prevTypes, types),	// Passing in our previous types overlayed with our current types
				),
			);
		}

		return output;
	}

	/**
	 * Sets options for the logger
	 *
	 * @param {MicroChalk.Options} opts
	 */
	function options(opts = {}) {
		this.xl.options(opts);
		mc.pre  = 'pre' in opts ? opts.pre : mc.pre;
		mc.post = 'post' in opts ? opts.post : mc.post;
		return mc;
	}

	mc.options = options;
	mc.xl      = require('./src/Ansi');

	return mc;
})();

