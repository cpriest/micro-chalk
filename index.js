'use strict';

function inspect(...x) {
	console.log(require('util')
		.inspect(x.length > 1 ? x : x[0]));
}

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
	 * Colorizes the input string based on the { } brackets
	 * @param {string} input
	 * @param {object?} prevTypes
	 * @returns {string}
	 */
	function colorize(input, prevTypes = mc.xl.xlate(mc.xl.resetCode).types) {
		let r      = /{(\S+)\s((?:[^{}]|(?:{[^{}]*})*)+)}/g, m;
		let output = input;

		// noinspection JSValidateTypes
		while((m = r.exec(input)) !== null) {
			let { types, open } = mc.xl.xlate(m[1]);

			let close = Object.keys(types)
				.filter(x => x in prevTypes)
				.reduce((close, x) => close + prevTypes[x], '');

			output = output.replace(m[0],
				colorize(open + m[2] + close,
					Object.assign({}, prevTypes, types),
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

	// logInfo(mc`This {red is {blue a test} run}: ${1 + 1}.  {white Yep, {green we {yellow like} ${'{blue template}'} literals}!}`);
	// logInfo(mc`{red This is an {green previous failure}: {}}`);

	return mc;
})();

