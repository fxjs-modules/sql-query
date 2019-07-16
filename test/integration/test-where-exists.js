const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

describe('where-exists', () => {
  it('simple', () => {
    assert.equal(
      common.Select().from('table1').whereExists('table2', 'table1', ['fid', 'id'], { col1: 1, col2: 2 }).build(),
    // 'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `fid` = `t1`.`id` AND `col1` = 1 AND `col2` = 2)'
	'select * from `table1` as `t1` where exists (select * from `table2` where `fid` = `t1`.`id` and `col1` = 1 and `col2` = 2)'
    )

    assert.equal(
      common.Select().from('table1').whereExists('table2', 'table1', [['fid1', 'fid2'], ['id1', 'id2']], { col1: 1, col2: 2 }).build(),
    // 'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `fid1` = `t1`.`id1` AND `fid2` = `t1`.`id2` AND `col1` = 1 AND `col2` = 2)'
	'select * from `table1` as `t1` where exists (select * from `table2` where `fid1` = `t1`.`id1` and `fid2` = `t1`.`id2` and `col1` = 1 and `col2` = 2)'
    )

    assert.equal(
      common.Select().from('table1').whereExists('table2', 'table1', [[], []], { col1: 1, col2: 2 }).build(),
    // 'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `col1` = 1 AND `col2` = 2)'
	'select * from `table1` as `t1` where exists (select * from `table2` where `col1` = 1 and `col2` = 2)'
    )
  });

  it('complex', () => {
    assert.equal(
      common.Select().from('table1').whereExists(
        'table2', 'table1',
        [
          ['fid1', 'fid2'],
          ['id1', 'id2']
        ],
        {
          col1: common.Query.comparators.ne(1),
          col2: common.Query.comparators.gte(2)
        }
      ).build(),
    // 'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `fid1` = `t1`.`id1` AND `fid2` = `t1`.`id2` AND `col1` <> 1 AND `col2` >= 2)'
	'select * from `table1` as `t1` where exists (select * from `table2` where `fid1` = `t1`.`id1` and `fid2` = `t1`.`id2` and `col1` <> 1 and `col2` >= 2)'
    )

    assert.equal(
      common.Select().from('table1').whereExists(
        'table2', 'table1',
        [
          ['fid1', 'fid2', 'fid3'],
          ['id1', 'id2', 'id3']
        ],
        {
          col1: common.Query.comparators.ne(1),
          col2: common.Query.comparators.gte(2)
        }
      ).build(),
    // 'SELECT * FROM `table1` `t1` WHERE EXISTS (SELECT * FROM `table2` WHERE `fid1` = `t1`.`id1` AND `fid2` = `t1`.`id2` AND `fid3` = `t1`.`id3` AND `col1` <> 1 AND `col2` >= 2)'
	'select * from `table1` as `t1` where exists (select * from `table2` where `fid1` = `t1`.`id1` and `fid2` = `t1`.`id2` and `fid3` = `t1`.`id3` and `col1` <> 1 and `col2` >= 2)'
    )
  });
})

if (require.main === module) {
  test.run(console.DEBUG)
}
