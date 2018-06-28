let log = require('../');

const ESC = '\x1B';
const CSI = `${ESC}[`;

const FULL_RESET = `${ESC}c`;

function br() {
	console.log('\n\n---------------------------------------------------\n\n');
}

console.log(FULL_RESET);

console.log(log`{red The color red is nice.}`);
console.log(log`{green green is nice too!}`);
console.log(log`{Red Is this a better red?}`);
console.log(log`{Green Is this a better green?}`);

br();

log = require('../')
	.options({
		pre:  (input) => {
			// Do something with pre-processed input, perhaps translation, loading strings, whatnot.
			return input;
		},
		post: (output) => {
			// Do something with the output, such as sending it to console.log()
			console.log(output);
			return output;
		}
	});

log`{Magenta There are many colors available}`;

br();

log = require('../')
	.options({
		post: (output) => {
			console.log(output);
			return output;
		}
	});

log`{Magenta There are {Red many colors} {Blue available} for use, {Yellow 256 to be} exact.}`;

br();

log = require('../')
	.options({
		aliases: {
			// Regular alias to colors 207, 239, 249
			pink:   207,
			grey39: 239,
			grey49: 249,

			// Alias of other aliases
			RED: 'Red',
			BLU: 'Blue',

			// Full Alias
			'^':  'black.Yellow',     // Black on Yellow
			'^^': 'White.Red',        // White on Red
			'#':  'White.blue',       // White on blue
			'=':  'White.black',      // White on black
		},
		post:    (output) => {
			console.log(output);
			return output;
		}
	});

log`
{^ WARNING:{=  There is a {yellow minor problem} that needs your attention}}

{^^ ERROR:{=  There is a {^^  major problem } that needs your attention!}}

{#
                                                   
  White on blue used to be a common color scheme.  
                                                   
}
`;
