'use strict';

function inspect(...x) {
	console.log(require('util').inspect(x.length > 1 ? x : x[0]));
}

const ESC = '\x1B' || 'Ɛ';

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
	 * Parses the input string for ANSI codes, keeping track of 'last fg/bg' color and
	 *    restoring those colors when an (invalid) \e[38;5m or \e[48;5m shows up
	 * @param {string} input
	 * @return {string}
	 */
	function unroll(input) {
		let r     = new RegExp(`${ESC}\\[((?:38|48);[25]);?(\\d*)m`, 'g'),
			stack = {}, m;

		let open = mc.xl.xlate(mc.xl.resetCode).open;
		// inspect(open);
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

				let reset = mc.xl.resetCode;
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
			let { open, close } = mc.xl.xlate(m[1]);
			output              = output.replace(m[0], open + m[2] + close);
			// inspect(m, output);
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
		this.xl.options(opts);
		mc.pre     = 'pre' in opts ? opts.pre : mc.pre;
		mc.post    = 'post' in opts ? opts.post : mc.post;
		return mc;
	}

	mc.options   = options;
	mc.xl = require('./src/Ansi');

	// logInfo(mc`This {red is {blue a test} run}: ${1 + 1}.  {white Yep, {green we {yellow like} ${'{blue template}'} literals}!}`);
	// logInfo(mc`{red This is an {green previous failure}: {}}`);

	return mc;
})();

