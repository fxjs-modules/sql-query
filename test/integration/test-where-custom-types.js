const test = require('test')
test.setup()

var common     = require('../common');
var assert     = require('assert');

var Point = function () {
	var point = "POINT(" + Array.prototype.slice.apply(arguments).join(" ") + ")";

	return function () {
		return point;
	};
};

var Year = function (col) {
	return function (dialect) {
		return "YEAR(" + dialect.escapeId(col) + ")";
	};
};

describe('where-custom-types', () => {
  it('where-custom-types', () => {
	assert.equal(
		common.Select().from('table1').where({ col: Point(1, 2) }).build(),
		// "SELECT * FROM `table1` WHERE `col` = POINT(1 2)"
		"select * from `table1` where `col` = 'POINT(1 2)'"
	);

	assert.equal(
		common.Select().from('table1').select(Year('dt')).build(),
		// "SELECT YEAR(`dt`) FROM `table1`"
		"select YEAR(`dt`) from `table1`"
	);
  })
})

if (require.main === module) {
    test.run(console.DEBUG)
}
