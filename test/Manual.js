'use strict';

console.log(process.env.TERM);

let log = require('../')
	.options({
		aliases: {
			'RED':  'Red',
			'pink': 207,
			'^':    'black.Yellow',
			'^^':   'White.Red',
		}, pre:  (input) => {
			console.log(input);
			return input;
		}, post: (output) => {
			console.log(output);
			console.log('');
			return output;
		},
		resetCode: 'cyan',
	});


log`Simple Test Without Markup`;

log`Test {green with simple green} markup.`;

log`This {RED is a test run}: {pink Yep, {^ we {^^ like} template} literals}!  They are awesome!`;
