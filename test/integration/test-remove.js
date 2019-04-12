const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

function shared(queryOptions) {
    assert.equal(
      common.Remove(queryOptions).from('table1').build(),
      'delete from `table1`'
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').where({ col: 1 }).build(),
      "delete from `table1` where `col` = 1"
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').where({ col1: 1 }, { col2: 2 }).build(),
      "delete from `table1` where `col1` = 1 and `col2` = 2"
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').where({ or: [{ col: 1 }, { col: 2 }] }).build(),
      //   'delete from `table1` where ((`col` = 1) OR (`col` = 2))'
	  "delete from `table1` where ((`col` = 1) or (`col` = 2))"
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').limit(10).build(),
      'delete from `table1` LIMIT 10'
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').limit(10).offset(3).build(),
      'delete from `table1` LIMIT 10 OFFSET 3'
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').order('col').limit(5).build(),
      'delete from `table1` ORDER BY `col` ASC LIMIT 5'
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').order('col1', 'A').order('col2', 'Z').limit(5).build(),
      'delete from `table1` ORDER BY `col1` ASC, `col2` DESC LIMIT 5'
    )
}

describe('remove', () => {
  it('remove - mysql', () => {
	const queryOptions = { dialect: 'mysql' };
	shared(queryOptions)
  });

  it('remove - sqlite', () => {
	const queryOptions = { dialect: 'sqlite' };
	shared(queryOptions)
  });

  xit('remove - mssql', () => {
	const queryOptions = { dialect: 'mssql' };

    assert.equal(
      common.Remove(queryOptions).from('table1').build(),
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').where({ col: 1 }).build(),
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').where({ col1: 1 }, { col2: 2 }).build(),
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').where({ or: [{ col: 1 }, { col: 2 }] }).build(),
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').limit(10).build(),
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').limit(10).offset(3).build(),
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').order('col').limit(5).build(),
    )

    assert.equal(
      common.Remove(queryOptions).from('table1').order('col1', 'A').order('col2', 'Z').limit(5).build(),
    )
  });
})

if (require.main === module) {
  test.run(console.DEBUG)
}
