# micro-chalk
MicroChalk is a small library for coloring text with ansi codes in a form similar to chalk.

#### Project Aims

* To be smaller
* More flexible
* With no dependencies
* Slightly more opinionated.

Most existing ``` chalk `template tag` ``` strings should work out of the box, please report if you find a discrepancy.

---
### Quick Example

<img align="right" src="res/img/QuickSample.png">

```js
const log = require('micro-chalk');

let str = log`
{red The color red is nice.}
{green green is nice too!}

{Red Is this a better red?}
{Green Is this a better green?}
`;

console.log(str);
```


### Features
  * Simple Foreground/Background/Formatting
  * Allows Nested Styles
  * Allows Nested [Template Literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals)
  * Aliases / Nested Aliases
  * pre/post Hooks

### Examples

#### pre/post options

<img align="right" src="res/img/PostSample.png">

```js
const log = require('micro-chalk')
    .options( {
        pre: (input) => {
            // Do something with pre-processed input, perhaps translation, loading strings, whatnot.
            return input;
        },
        post: (output) => {
            // Do something with the output, such as sending it to console.log()
            console.log(output);
            return output;
        }
    } );

log`{Magenta There are many colors available}`;
```

#### Nested Styles
Nesting styles lets you encapsulate styles within one another; when an inner section closes, the fg/bg color states are restored to the containing block.

<img align="right" src="res/img/NestingStyles.png">

```js
const log = require('micro-chalk')
    .options( { post: (output) => { console.log(output); return output; } } );

log`{Magenta There are {Red many colors} {Blue available} for use, {Yellow 256 to be} exact.}`;
```

#### Nested Template Literals

<img align="right" src="res/img/NestedTemplateLiterals.png">

```js
const log = require('micro-chalk')
    .options( { post: (output) => { console.log(output); return output; } } );

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
```

#### Aliasing
Aliasing lets you define aliases for common usage scenarios or define names for those 256 colors at your fingertips.

<img align="right" src="res/img/AliasingSample.png">

```js
const log = require('micro-chalk')
    .options( {
        aliases: {
            // Regular alias to colors 207, 239, 249
            pink:    207,
            grey39:  239,
            grey49:  249,

            // Alias of other aliases
            RED:    'Red',
            BLU:    'Blue',

            // Full Alias
            '^':    'black.Yellow',     // Black on Yellow
            '^^':   'White.Red',        // White on Red
            '#':    'White.blue',       // White on blue
            '=':    'White.black',      // White on black
        },
        post: (output) => { console.log(output); return output; }
    } );

log`
{^ WARNING:{=  There is a {yellow minor problem} that needs your attention.}}

{^^ ERROR:{=  There is a {^^  major problem } that needs your attention!}}

{#

  White on blue used to be a common color scheme.

}

{pink Some people prefer pink}, {RED to red}, {BLU others like blue}.

{grey39 The world {black.White is full} of color, {grey49 why use just grey?}}
`;
```


### Notes
  * micro-chalk assumes your output is ansi 256 color compliant
