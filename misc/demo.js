let log = require('../');

const ESC = '\x1B';
const CSI = `${ESC}[`;

const FULL_RESET = `${ESC}c`;

function br(title) {
	let left = '-'.repeat((60 - title.length)/2),
		right = '-'.repeat((60 - title.length) / 2);
	console.log(`---
	
${left} ${title} ${right}

---`);
}

console.log(FULL_RESET);

/******************************************************************************/
br('Sample 1');

let str = log`
{red The color red is nice.}
{green green is nice too!}

{Red Is this a better red?}
{Green Is this a better green?}
`;

console.log(str);


/******************************************************************************/
br('Sample 2');

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


/******************************************************************************/
br('Sample 3');

log = require('../')
	.options({ post: (output) => {console.log(output);return output;} });

log`{Magenta There are {Red many colors} {Blue available} for use, {Yellow 256 to be} exact.}`;


/******************************************************************************/
br('Sample 4');

log = require('../')
	.options({ post: (output) => {console.log(output);return output;} });

function check(value) {
	if(value >= .98)
		return `{Green ${value * 100}%}`;
	if(value >= .70)
		return `{black.Yellow ${value * 100}%}`;
	return `{White.Red ${value * 100}%}`;
}

log`
   Battery: ${check(.99)}
  CPU Load: ${check(.78)}   ${'{Yellow Warning}'}
Disk Space: ${check(.31)}   ${'{Red Danger {White.Red  Very Low } Disk Space}'}
`;


/******************************************************************************/
br('Sample ?');

log = require('../')
	.options({
		aliases: {
			'Red2':   196,
			'orange': 214,
			'pink':   207,
			'Blue2':  27,
			'purple': 105,
		},
		post: (output) => {
			console.log(output);
			return output;
		}
	});

function* rotate(through) {
	while(true)
		yield* through;
}
let it = rotate(['Red2','orange','Yellow','green','Blue2','purple','pink']);

function rainbow(input) {
	let r = '';
	for(let i=0; i<input.length; i++) {
		if(true || input[i].match(/[A-Za-z]/))
			r += `{${it.next().value} ${input[i]}}`;
		else
			r += input[i];
	}
	return r;
}

// log`${rainbow('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM')}`;
log`${rainbow("It's a cornucopia of skittles, taste the rainbow!")}`;
// log`${rainbow('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM')}`;


/******************************************************************************/
br('Sample 5');

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

{pink Some people prefer pink}, {RED to red}, {BLU others like blue}.

{grey39 The world {black.White is full} of color, {grey49 why use just grey?}}
`;
