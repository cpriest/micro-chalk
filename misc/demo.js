let log = require('../'), str;

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
br('Quick Sample');

str = log`
{red The color red is nice.}
{green green is nice too!}

{Red Is this a better red?}
{Green Is this a better green?}
`;

console.log(str);


/******************************************************************************/
br('Formatting Sample');

str = log`
{black.White black text on White background.}
        {black.white black text on white background.}
{Black.White Black text on White background.}
        {Black.white Black text on white background.}

    {Yellow Note the case difference of white vs White, all colors are this way.}
        {white Lowercase is dim} and {White Title case is bright.}
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


{White.Red Sample of White on Red.}
        {White.red Sample of White on red.}
{White.Blue Sample of White on Blue.}
        {White.blue Sample of White on blue.}
`;

console.log(str);


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
			console.log(output);
			return output;
		}
	});

log`{Magenta There are many colors available}`;


/******************************************************************************/
br('Nesting Styles Sample');

log = require('../')
	.options({ post: (output) => {console.log(output);return output;} });

log`{Magenta There are {Red many colors} {Blue available} for use, {Yellow 256 to be} exact.}`;


/******************************************************************************/
br('NestedTemplateLiterals Sample');

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
