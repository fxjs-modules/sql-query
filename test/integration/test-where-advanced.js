const test = require('test')
test.setup()

var common     = require('../common');
var assert     = require('assert');

describe('where-advanced', () => {
  it('where-advanced', () => {
		assert.equal(
			common.Select().from('table1').where({ or: [ { col: 1 }, { col: 2 } ] }).build(),
			"SELECT * FROM `table1` WHERE ((`col` = 1) OR (`col` = 2))"
		);

		assert.equal(
			common.Select().from('table1').where({ col: 1, or: [ { col: 2 }, { col: 3 } ] }).build(),
			"SELECT * FROM `table1` WHERE `col` = 1 AND ((`col` = 2) OR (`col` = 3))"
		);

		assert.equal(
			common.Select().from('table1').where({ col: 1, not_or: [ { col: 2 }, { col: 3 } ] }).build(),
			"SELECT * FROM `table1` WHERE `col` = 1 AND NOT ((`col` = 2) OR (`col` = 3))"
		);

		assert.equal(
			common.Select().from('table1').where({ not: [ { col: 2 }, { col: 3 } ] }).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 2) AND (`col` = 3))"
		);

		assert.equal(
			common.Select().from('table1').where({ not: [ { col: common.Query.gt(2) }, { col: 3 } ] }).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` > 2) AND (`col` = 3))"
		);

		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col: 1,
					or: [{
						col: 2
					}, {
						col: 3
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((`col` = 2) OR (`col` = 3))) AND (`col` = 4))"
		);

		assert.equal(
			common.Select().from('table1').where({
				// not is alias of `not_and`
				not: [{
					col: 1,
					or: [{
						col: common.Query.gte(2)
					}, {
						col: common.Query.lt(3)
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((`col` >= 2) OR (`col` < 3))) AND (`col` = 4))"
		);
  })
})

if (require.main === module) {
    test.run(console.DEBUG)
}
