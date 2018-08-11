/**
 * This is just a hacky/convenient way of getting a few debug utilities into the global scope
 *    while not having to define them in every file, nor reference them through an object
 *        Do not do this in production, bad juju.
 */

import * as util from 'util';

global.inspect = function inspect(...x) {
	console.log(util.inspect(x.length > 1 ? x : x[0]) + '\r\n');
};
global.dl = console.log;


// global.dl = global.inspect = function() {};
