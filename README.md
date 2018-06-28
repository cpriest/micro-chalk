# micro-chalk
MicroChalk is a small library for coloring marked up text with ansi codes.  It takes a form similar to that of chalk. It's aim was to be smaller, more flexible and no dependencies, but slightly more opinionated.

Most existing `chalk template tag` strings should work out of the box, please report if you find a discrepancy.

---
### Quick Example

```
const log = require('micro-chalk');

console.log(log`{red The color red is nice.}`);
console.log(log`{green green is nice too!}`);
console.log(log`{Red Is this a better red?}`);
console.log(log`{Green Is this a better green?}`);
```


## Features
There are several convenient features worth mentioning.

#### pre/post options

```
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

#### Unrolling
Unrolling lets you encapsulate sections within one another, when an inner section completes, the fg/bg color states are restored to the containing block.
```
const log = require('micro-chalk')
    .options( { post: (output) => { console.log(output); return output; } } );

log`{Magenta There are {Red many colors} {Blue available} for use, {Yellow 256 to be} exact.}`;
```

#### Aliasing
Aliasing lets you define aliases for common usage scenarios or define names for those 256 colors at your fingertips.
```
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
`;
```


### Notes
  * micro-chalk assumes your output is ansi 256 color compliant
