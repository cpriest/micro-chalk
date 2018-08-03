let log = require('../'), str;
require('../misc/debug.js');

const ESC = '\x1B';
const CSI = `${ESC}[`;

const FULL_RESET = `${ESC}c`;

function br(title) {
	let left = '-'.repeat(Math.floor((64 - title.length) / 2)),
		right = '-'.repeat(Math.ceil((64 - title.length) / 2));
	console.log(`---
	
${left} ${title} ${right}

---`);
}

console.log(FULL_RESET);

br('Header');

let lines = [
	[3, '', 'Black:Black.White', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White'],
	[3, '', 'black:black.White', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'],
	[],
	[0, ' ', ' .Black ', ' .Red ', ' .Green :black.Green', ' .Yellow :black.Yellow', ' .Blue ', ' .Magenta :black.Magenta', ' .Cyan :black.Cyan', ' .White :black.White'],
	[0, ' ', ' .black ', ' .red ', ' .green :.green', 	  ' .yellow :.yellow', 	    ' .blue ', ' .magenta :.magenta', 	   ' .cyan :.cyan', 	 ' .white :black.white'],
	[],
	[1, ' ', ' bold  ', 'strike  ', 'underline', '  dim :Black', ' italic ', 'blink', 'inverse', ' hide'],
	[1, ' ', '\\*bold\\*:bold', '\\~strike\\~:strike', '\\_underline\\_:underline'],
];

let out;

out = lines.map((cur) => {
		let [indent, ...line] = cur.map((cur, index) => {
			if(index === 0)
				return cur;
			let [text, desc] = cur.split(':');
			desc = (desc || text).replace(/\s+/g, '');

			if(text.trim() == '')
				return text;

			return `{${desc} ${text}}`;
		});

		return line.join(' '.repeat(indent));
	}).join('\n');

// console.log(out + '\n');
str = log`${out}`;

// console.log(str.replace(/\x1B/g, 'Ɛ'));
console.log(str);

// process.exit();

/******************************************************************************/
br('Quick Sample');

str = log`
{red There are *eight base colors* which come in _two shades_.}
{Green Green is bright, while {green green is dimmer than} {Green Green}}
`;

console.log(str.replace(/^/gm, '  '));


/******************************************************************************/
br('Formatting Sample');

str = log`
{black.White black text on White background.}
        {black.white black text on white background.}
{Black.White Black text on White background.}
        {Black.white Black text on white background.}

    {Yellow Note use of white vs White, all base colors work this way.}
        {White Title case is bright} and {white lowercase is dim.} 
            red -> Red, blue -> Blue, etc.
        
        chalk          micro-chalk
          {red red}            {red red}
          {redBright redBright}      {Red Red}
    	 
          {green green}          {green green}
          {greenBright greenBright}    {Green Green}
          
          {bgBlue bgBlue}         {.blue .blue}
          {bgBlueBright bgBlueBright}   {.Blue .Blue}

          {bgRed bgRed}          {.red .red}
          {bgRedBright bgRedBright}    {.Red .Red}


{.Red Sample of White on Red.}
        {.red Sample of White on red.}
{.Blue Sample of White on Blue.}
        {.blue Sample of White on blue.}
`;

console.log(str.replace(/^/gm, '  '));


/******************************************************************************/
br('Post Sample');

log = require('../')
	.options({
		pre:  (input) => {
			// Do something with pre-processed input, perhaps translation, loading strings, whatnot.
			return input;
		},
		post: (output) => {
			// Do something with the output, such as sending it to console.log()
			console.log(output.replace(/^/gm, '  '));
			return output;
		}
	});

log`
{White You can use the {red post hook} to cause the 
result to go *straight to the console.*}
`;


/******************************************************************************/
br('Nesting Styles Sample');

log = require('../')
	.options({ post: (output) => { console.log(output.replace(/^/gm, '  ')); return output; } });

log`
{Magenta Most terminals {red support {green the basic} 16 colors},  
{cyan many terminals} {Yellow support 256 colors} {Blue and 24-bit color.}}
`;


/******************************************************************************/
br('NestedTemplateLiterals Sample');

log = require('../')
	.options({ post: (output) => { console.log(output.replace(/^/gm, '  ')); return output; } });

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
br('Rainbow Sample');

log = require('../')
	.options({
		aliases: {
			'Red2':   196,
			'orange': 214,
			'pink':   207,
			'Blue2':  27,
			'purple': 105,
		},
		post: (output) => { console.log(output.replace(/^/gm, '  ')); return output; }
	});

/**
 * Generates an infinite iterator on {through}
 *
 * @param {Iterable} through
 *
 * @return {IterableIterator<*>}
 */
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
log`
${rainbow("It's a cornucopia of skittles, taste the rainbow!")}
`;
// log`${rainbow('MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM')}`;


/******************************************************************************/
br('Aliasing Sample');

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
		post: (output) => { console.log(output.replace(/^/gm, '  ')); return output; }
	});

log`
{^ WARNING:{=  There is a {yellow minor problem} that needs your attention}}

{^^ ERROR:{=  There is a {^^  major problem } that needs your attention!}}

{#                                                    }
{#   White on blue used to be a common color scheme.  }  
{#                                                    }

{pink Some people prefer pink}, {RED to red}, {BLU others like blue}.

{grey39 The world {black.White is full} of color, {grey49 why use just grey?}}
`;

br('Additional Features');

log = require('../')
	.options({
		patternAliases: Object.assign({}, log.patternAliases, {
			'(\\[[^\\]]+\\])' : 'White.blue'
		}),
		post: (output) => { console.log(output.replace(/^/gm, '  ')); return output; }
	});

log`
- {#FFF.#0000FF Use CSS Hex Codes Directly}

- {129.251  Directly use ANSI 256 color codes}

- {Red *Convenient* _pattern aliasing_ lets you do [nearly anything].}
`;
