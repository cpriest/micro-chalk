/**
 * This is just a hacky/convenient way of getting our ansi codes into the global scope
 *    while not having to define them in every file, nor reference them through an object
 *        Do not do this in production, bad juju.
 *
 * @param {string} ESC        Escape is passed in as we may want it to be \x1B or 'Ɛ' in the case of tests
 */
module.exports = (ESC) => {
	const CSI       = `${ESC}[`;
	const FG        = `${CSI}38;5;`;
	const BG        = `${CSI}48;5;`;
	const FG_RSET   = `${FG}15m`;
	const BG_RSET   = `${BG}0m`;
	const FULL_RSET = `${FG_RSET}${BG_RSET}`;

	let Constants = new Map(Object.entries({
		ESC:       ESC,
		CSI:       CSI,
		FG:        FG,
		BG:        BG,
		bla:       '0m',
		red:       '1m',
		gre:       '2m',
		yel:       '3m',
		blu:       '4m',
		mag:       '5m',
		cya:       '6m',
		whi:       '7m',
		Bla:       '8m',
		Red:       '9m',
		Gre:       '10m',
		Yel:       '11m',
		Blu:       '12m',
		Mag:       '13m',
		Cya:       '14m',
		Whi:       '15m',
		FG_RSET:   FG_RSET,
		BG_RSET:   BG_RSET,
		FULL_RSET: FULL_RSET,
	}));
	for(let [key, value] of Constants) {
		Object.defineProperty(global, key, {
			value: value, writable: false, configurable: false, enumerable: true
		});
	}
};

