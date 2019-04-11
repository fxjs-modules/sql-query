const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

describe('order', () => {
  it('order', () => {
    assert.equal(
      common.Select().from('table1').order('col').build(),
    //   'SELECT * FROM `table1` ORDER BY `col` ASC'
	'select * from `table1` order by `col` ASC'
    )

    assert.equal(
      common.Select().from('table1').order('col', 'A').build(),
    //   'SELECT * FROM `table1` ORDER BY `col` ASC'
	'select * from `table1` order by `col` ASC'
    )

    assert.equal(
      common.Select().from('table1').order('col', 'Z').build(),
    //   'SELECT * FROM `table1` ORDER BY `col` DESC'
	'select * from `table1` order by `col` DESC'
    )

    assert.equal(
      common.Select().from('table1').order('col').order('col2', 'Z').build(),
    //   'SELECT * FROM `table1` ORDER BY `col` ASC, `col2` DESC'
	'select * from `table1` order by `col` ASC, `col2` DESC'
    )

    assert.equal(
      common.Select().from('table1').order('col', []).build(),
    //   'SELECT * FROM `table1` ORDER BY col'
	'select * from `table1` order by col'
    )

    assert.equal(
      common.Select().from('table1').order('?? DESC', ['col']).build(),
    //   'SELECT * FROM `table1` ORDER BY `col` DESC'
	'select * from `table1` order by `col` DESC'
    )

    assert.equal(
      common.Select().from('table1').order('ST_Distance(??, ST_GeomFromText(?,4326))', ['geopoint', 'POINT(-68.3394 27.5578)']).build(),
      "select * from `table1` order by ST_Distance(`geopoint`, ST_GeomFromText('POINT(-68.3394 27.5578)',4326))"
    )
  })

  it('order with table', () => {
    assert.equal(
      common.Select().from('table1').order(['table2', 'col']).build(),
	'select * from `table1` order by `table2`.`col` ASC'
    )

    assert.equal(
      common.Select().from('table1').order(['table2', '-col']).build(),
	'select * from `table1` order by `table2`.`col` DESC'
    )

    assert.equal(
      common.Select().from('table1').order(['table2', '-col'], 'A').build(),
	'select * from `table1` order by `table2`.`col` ASC'
    )

    assert.equal(
      common.Select().from('table1').order(['table2', 'col'], 'Z').build(),
	'select * from `table1` order by `table2`.`col` DESC'
    )
  })
})

if (require.main === module) {
  test.run(console.DEBUG)
}
