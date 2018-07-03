'use strict';

// noinspection ConstantConditionalExpressionJS
let x = require('./globals.js')(false ? 'Ɛ' : '\x1B');
let log = require('../');

console.log(`${FG}${Red}Bold Red Underlined Non-Bold Non-Underlined${CSI}0m after 0m`);
console.log(`${FG}${Red}${CSI}1mBold Red ${CSI}4mUnderlined ${CSI}22mNon-Bold${CSI}24m Non-Underlined${CSI}0m after 0m`);
