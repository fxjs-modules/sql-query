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

  	it('literal where conditions: eq/ne; gt/gte; lt/lte', () => {
		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col: 1,
					or: [{
						col: {
							eq: 2
						}
					}, {
						col: {
							ne: '3'
						}
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((`col` = 2) OR (`col` <> '3'))) AND (`col` = 4))"
		);

		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col: 1,
					or: [{
						col: {
							gte: 2
						}
					}, {
						col: {
							lt: 3
						}
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((`col` >= 2) OR (`col` < 3))) AND (`col` = 4))"
		);
  	});

  	it('literal where conditions: in/not_in', () => {
		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col: 1,
					or: [{
						col: {
							in: [2, 7]
						}
					}, {
						col: {
							not_in: [3, 8]
						}
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((`col` IN (2, 7)) OR (`col` NOT IN (3, 8)))) AND (`col` = 4))"
		);

		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col: 1,
					or: [{
						col2: {
							in: []
						}
					}, {
						col2: {
							not_in: [3, 8]
						}
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((FALSE) OR (`col2` NOT IN (3, 8)))) AND (`col` = 4))"
		);

		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col: 1,
					or: [{
						col2: {
							in: [2, 7]
						}
					}, {
						col2: {
							not_in: []
						}
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((`col2` IN (2, 7)) OR (FALSE))) AND (`col` = 4))"
		);
  	});

  	it('literal where conditions: between/not_between', () => {
		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col1: {
						ne: 'abc'
					},
					or: [{
						col2: {
							ne: 2
						}
					}, {
						col2: {
							between: [1, 9]
						}
					}]
				}, {
					col3: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col1` <> 'abc' AND ((`col2` <> 2) OR (`col2` BETWEEN 1 AND 9))) AND (`col3` = 4))"
		);

		assert.equal(
			common.Select().from('table1').where({
				not_and: [{
					col: 1,
					or: [{
						col: {
							not_between: [3, 4]
						}
					}, {
						col: {
							between: [1, 9]
						}
					}]
				}, {
					col: 4
				}]
			}).build(),
			"SELECT * FROM `table1` WHERE NOT ((`col` = 1 AND ((`col` NOT BETWEEN 3 AND 4) OR (`col` BETWEEN 1 AND 9))) AND (`col` = 4))"
		);
  	});
})

if (require.main === module) {
    test.run(console.DEBUG)
}
