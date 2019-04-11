const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

describe('where', () => {
  it('where', () => {
    assert.equal(
      common.Select().from('table1').where().build(),
    // 'SELECT * FROM `table1`'
	'select * from `table1`'
    )

    assert.equal(
      common.Select().from('table1').where(null).build(),
    // 'SELECT * FROM `table1`'
	'select * from `table1`'
    )

    assert.equal(
      common.Select().from('table1').where({ col: 1 }).build(),
    // 'SELECT * FROM `table1` WHERE `col` = 1'
	'select * from `table1` where `col` = 1'
    )

    assert.equal(
      common.Select().from('table1').where({ col: 0 }).build(),
    // 'SELECT * FROM `table1` WHERE `col` = 0'
	'select * from `table1` where `col` = 0'
    )

    assert.equal(
      common.Select().from('table1').where({ col: null }).build(),
    // 'SELECT * FROM `table1` WHERE `col` IS NULL'
	'select * from `table1` where `col` is null'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.eq(null) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` IS NULL'
	'select * from `table1` where `col` is null'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.ne(null) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` IS NOT NULL'
	'select * from `table1` where `col` is not null'
    )

    assert.equal(
      common.Select().from('table1').where({ col: undefined }).build(),
    // 'SELECT * FROM `table1` WHERE `col` IS NULL'
	'select * from `table1` where `col` is null'
    )

    assert.equal(
      common.Select().from('table1').where({ col: false }).build(),
    // 'SELECT * FROM `table1` WHERE `col` = false'
	'select * from `table1` where `col` = false'
    )

    assert.equal(
      common.Select().from('table1').where({ col: '' }).build(),
    // "SELECT * FROM `table1` WHERE `col` = ''"
	"select * from `table1` where `col` = ''"
    )

    assert.equal(
      common.Select().from('table1').where({ col: true }).build(),
    // 'SELECT * FROM `table1` WHERE `col` = true'
	'select * from `table1` where `col` = true'
    )

    assert.equal(
      common.Select().from('table1').where({ col: 'a' }).build(),
    // "SELECT * FROM `table1` WHERE `col` = 'a'"
	"select * from `table1` where `col` = 'a'"
    )

    assert.equal(
      common.Select().from('table1').where({ col: "a'" }).build(),
    // "SELECT * FROM `table1` WHERE `col` = 'a\\''"
	"select * from `table1` where `col` = 'a\\''"
    )

    assert.equal(
      common.Select().from('table1').where({ col: [ 1, 2, 3 ] }).build(),
    // 'SELECT * FROM `table1` WHERE `col` IN (1, 2, 3)'
	'select * from `table1` where `col` in (1, 2, 3)'
    )

    assert.equal(
      common.Select().from('table1').where({ col: [] }).build(),
    // 'SELECT * FROM `table1` WHERE FALSE'
	'select * from `table1` where 1 = 0'
    )

    assert.equal(
      common.Select().from('table1').where({ col1: 1, col2: 2 }).build(),
    // 'SELECT * FROM `table1` WHERE `col1` = 1 AND `col2` = 2'
	'select * from `table1` where `col1` = 1 and `col2` = 2'
    )

    assert.equal(
      common.Select().from('table1').where({ col1: 1 }, { col2: 2 }).build(),
    // 'SELECT * FROM `table1` WHERE (`col1` = 1) AND (`col2` = 2)'
	'select * from `table1` where `col1` = 1 and `col2` = 2'
    )

    assert.equal(
      common.Select().from('table1').where({ col: 1 }).where({ col: 2 }).build(),
    // 'SELECT * FROM `table1` WHERE (`col` = 1) AND (`col` = 2)'
	'select * from `table1` where `col` = 1 and `col` = 2'
    )

    assert.equal(
      common.Select().from('table1').where({ col1: 1, col2: 2 }).where({ col3: 3 }).build(),
    // 'SELECT * FROM `table1` WHERE (`col1` = 1 AND `col2` = 2) AND (`col3` = 3)'
	'select * from `table1` where `col1` = 1 and `col2` = 2 and `col3` = 3'
    )

	// .where(tablename, conditions, tablename, conditions)
    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id', 'id')
        .where('table1', { col: 1 }, 'table2', { col: 2 }).build(),
    // 'SELECT * FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id` = `t1`.`id` WHERE (`t1`.`col` = 1) AND (`t2`.`col` = 2)'
	'select * from `table1` as `t1` inner join `table2` as `t2` on `t2`.`id` = `t1`.`id` where `col` = 1 and `col` = 2'
    )

	// .where(tablename, conditions, aliasname, conditions)
    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id', 'id')
        .where('table1', { col: 1 }, 't2', { col: 2 }).build(),
      'select * from `table1` as `t1` inner join `table2` as `t2` on `t2`.`id` = `t1`.`id` where `col` = 1 and `col` = 2'
    )

    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id', 'id')
        .where('table1', { col: 1 }, { col: 2 }).build(),
    // 'SELECT * FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id` = `t1`.`id` WHERE (`t1`.`col` = 1) AND (`col` = 2)'
	'select * from `table1` as `t1` inner join `table2` as `t2` on `t2`.`id` = `t1`.`id` where `col` = 1 and `col` = 2'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.gt(1) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` > 1'
	'select * from `table1` where `col` > 1'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.gte(1) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` >= 1'
	'select * from `table1` where `col` >= 1'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.lt(1) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` < 1'
	'select * from `table1` where `col` < 1'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.lte(1) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` <= 1'
	'select * from `table1` where `col` <= 1'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.eq(1) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` = 1'
	'select * from `table1` where `col` = 1'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.ne(1) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` <> 1'
	'select * from `table1` where `col` <> 1'
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.between('a', 'b') }).build(),
    // "SELECT * FROM `table1` WHERE `col` BETWEEN 'a' AND 'b'"
	"select * from `table1` where `col` between 'a' and 'b'"
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.not_between('a', 'b') }).build(),
    // "SELECT * FROM `table1` WHERE `col` NOT BETWEEN 'a' AND 'b'"
	"select * from `table1` where `col` not between 'a' and 'b'"
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.like('abc') }).build(),
    // "SELECT * FROM `table1` WHERE `col` LIKE 'abc'"
	"select * from `table1` where `col` like 'abc'"
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.not_like('abc') }).build(),
    // "SELECT * FROM `table1` WHERE `col` NOT LIKE 'abc'"
	"select * from `table1` where `col` not like 'abc'"
    )

    assert.equal(
      common.Select().from('table1').where({ col: common.Query.not_in([ 1, 2, 3 ]) }).build(),
    // 'SELECT * FROM `table1` WHERE `col` NOT IN (1, 2, 3)'
	'select * from `table1` where `col` not in (1, 2, 3)'
    )

    assert.equal(
      common.Select().from('table1').where({ __sql: [["LOWER(`stuff`) LIKE 'peaches'"]] }).build(),
    // "SELECT * FROM `table1` WHERE LOWER(`stuff`) LIKE 'peaches'"
	"select * from `table1` where LOWER(`stuff`) LIKE 'peaches'"
    )

    assert.equal(
      common.Select().from('table1').where({ __sql: [['LOWER(`stuff`) LIKE ?', ['peaches']]] }).build(),
    // "SELECT * FROM `table1` WHERE LOWER(`stuff`) LIKE 'peaches'"
	"select * from `table1` where LOWER(`stuff`) LIKE 'peaches'"
    )

    assert.equal(
      common.Select().from('table1').where({ __sql: [['LOWER(`stuff`) LIKE ? AND `number` > ?', ['peaches', 12]]] }).build(),
    // "SELECT * FROM `table1` WHERE LOWER(`stuff`) LIKE 'peaches' AND `number` > 12"
	"select * from `table1` where LOWER(`stuff`) LIKE 'peaches' AND `number` > 12"
    )

    assert.equal(
      common.Select().from('table1').where({ __sql: [['LOWER(`stuff`) LIKE ? AND `number` == ?', ['peaches']]] }).build(),
    // "SELECT * FROM `table1` WHERE LOWER(`stuff`) LIKE 'peaches' AND `number` == NULL"
	"select * from `table1` where LOWER(`stuff`) LIKE 'peaches' AND `number` == NULL"
    )
  })
})

if (require.main === module) {
  test.run(console.DEBUG)
}
