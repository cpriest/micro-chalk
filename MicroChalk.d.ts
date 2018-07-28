// Type definitions for cpriest/MicroChalk
// Project: cpriest/MicroChalk
// Definitions by: Clint Priest <https://github.com/cpriest>

declare namespace MicroChalk {
	type AnsiCode = number;
	type Alias = string | AnsiCode;

	type Aliases = {
		[key: string]: Alias;
	}

	type Options = {
		/**
		 * Provide Aliases to existing AnsiCodes or new AnsiCodes
		 *    @example: {
		 * 		'R' : 'red', 	// Would make 'R' equivalent to 'red' (which = AnsiCode 1)
		 * 		'pink': 207 ,	// Would make 'pink' equivalent to AnsiCode 207
		 * 	}
		 **/
		aliases?: Aliases;

		/**
		 * Provide RegEx Patterns to map to Aliases or existing AnsiCodes or new AnsiCodes
		 *    @example: {
		 *    	// Use the * character to match between and replace with {bold Match}
		 *		'\\*([^\\*]*?)\\*': 'bold',		// Bold
		 * 	  }
		 **/
		patternAliases?: Aliases;

		/**
		 * Declare a function to pre-process any input string before color processing
		 */
		pre?: (input: string) => string;

		/**
		 * Declare a function to post-process any output string before returning to caller
		 *    This is useful for sending any results directly to a logging function
		 */
		post?: (output: string) => string;

		/**
		 * An alternate resetCode, defaults to \e[m which
		 */
		resetCode?: Alias;
	}
}
