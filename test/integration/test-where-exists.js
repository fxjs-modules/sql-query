const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

describe('where-exists', () => {
  it('where-exists', () => {
    assert.equal(
      common.Select().from('table1').whereExists('table2', 'table1', ['fid', 'id'], { col1: 1, col2: 2 }).build(),
      'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `fid` = `t1`.`id` AND `col1` = 1 AND `col2` = 2)'
    )

    assert.equal(
      common.Select().from('table1').whereExists('table2', 'table1', [['fid1', 'fid2'], ['id1', 'id2']], { col1: 1, col2: 2 }).build(),
      'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `fid1` = `t1`.`id1` AND `fid2` = `t1`.`id2` AND `col1` = 1 AND `col2` = 2)'
    )

    assert.equal(
      common.Select().from('table1').whereExists(
		  	'table2', 'table1',
		  	[
			  ['fid1', 'fid2'],
			  ['id1', 'id2']
			],
			{
				col1: common.Query.ne(1),
				col2: common.Query.gte(2)
			}
		).build(),
      'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `fid1` = `t1`.`id1` AND `fid2` = `t1`.`id2` AND `col1` <> 1 AND `col2` >= 2)'
    )
  })
})

if (require.main === module) {
  test.run(console.DEBUG)
  process.exit()
}
