const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

describe('select', () => {
  it('select', () => {
    assert.equal(
      common.Select().from('table1').build(),
      'SELECT * FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select('id', 'name').build(),
      'SELECT `id`, `name` FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select('id', 'name').as('label').build(),
      'SELECT `id`, `name` AS `label` FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select('id', 'name').select('title').as('label').build(),
      'SELECT `id`, `name`, `title` AS `label` FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select('id', 'name').as('label').select('title').build(),
      'SELECT `id`, `name` AS `label`, `title` FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select([ 'id', 'name' ]).build(),
      'SELECT `id`, `name` FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select().build(),
      'SELECT * FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select(
        ['abc', 'def', { a: 'ghi', sql: 'SOMEFUNC(ghi)' }]
      ).build(),
      'SELECT `abc`, `def`, (SOMEFUNC(ghi)) AS `ghi` FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select(
        ['abc', 'def', { as: 'ghi', sql: 'SOMEFUNC(ghi)' }]
      ).build(),
      'SELECT `abc`, `def`, (SOMEFUNC(ghi)) AS `ghi` FROM `table1`'
    )

    assert.equal(
      common.Select().calculateFoundRows().from('table1').build(),
      'SELECT SQL_CALC_FOUND_ROWS * FROM `table1`'
    )

    assert.equal(
      common.Select().calculateFoundRows().from('table1').select('id').build(),
      'SELECT SQL_CALC_FOUND_ROWS `id` FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1').select('id1', 'name')
        .from('table2', 'id2', 'id1').select('id2').build(),
      'SELECT `t1`.`id1`, `t1`.`name`, `t2`.`id2` FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1').select('id1')
        .from('table2', 'id2', 'id1', { joinType: 'left inner' }).select('id2').build(),
      'SELECT `t1`.`id1`, `t2`.`id2` FROM `table1` `t1` LEFT INNER JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1').select('id1', 'name')
        .from('table2', 'id2', 'table1', 'id1').select('id2').build(),
      'SELECT `t1`.`id1`, `t1`.`name`, `t2`.`id2` FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id2', 'table1', 'id1').count().build(),
      'SELECT COUNT(*) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id2', 'table1', 'id1').count(null, 'c').build(),
      'SELECT COUNT(*) AS `c` FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id2', 'table1', 'id1').count('id').build(),
      'SELECT COUNT(`t2`.`id`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1').count('id')
        .from('table2', 'id2', 'table1', 'id1').count('id').build(),
      'SELECT COUNT(`t1`.`id`), COUNT(`t2`.`id`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id2', 'table1', 'id1').count('id').count('col').build(),
      'SELECT COUNT(`t2`.`id`), COUNT(`t2`.`col`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1')
        .from('table2', 'id2', 'table1', 'id1').fun('AVG', 'col').build(),
      'SELECT AVG(`t2`.`col`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2` = `t1`.`id1`'
    )

    assert.equal(
      common.Select().from('table1')
        .from('table2', ['id2a', 'id2b'], 'table1', ['id1a', 'id1b']).count('id').build(),
      'SELECT COUNT(`t2`.`id`) FROM `table1` `t1` JOIN `table2` `t2` ON `t2`.`id2a` = `t1`.`id1a` AND `t2`.`id2b` = `t1`.`id1b`'
    )
  })

  it('alias: valid but useless', () => {
    assert.equal(
      common.Select().from('table1 as t1')
        .build(),
      'SELECT * FROM `table1`'
    )

    assert.equal(
      common.Select().from('table1 t1')
        .build(),
      'SELECT * FROM `table1`'
    )
  })

  it('alias: two tables', () => {
    assert.equal(
      common.Select()
        .from('table1 as custom_t1').select('id1', 'name')
        .from('table2 as custom_t2', 'id2', 'id1').select('id2')
        .build(),
      'SELECT `custom_t1`.`id1`, `custom_t1`.`name`, `custom_t2`.`id2` FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )

    assert.equal(
      common.Select()
        .from('table1 as custom_t1').select('id1', 'name')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').select('id2')
        .build(),
      'SELECT `custom_t1`.`id1`, `custom_t1`.`name`, `custom_t2`.`id2` FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )
  })

  it('alias: two tables - Custom Join Type', () => {
    assert.equal(
      common.Select()
        .from('table1 as custom_t1').select('id1')
        .from('table2 as custom_t2', 'id2', 'id1', { joinType: 'left inner' }).select('id2')
        .build(),
      'SELECT `custom_t1`.`id1`, `custom_t2`.`id2` FROM `table1` `custom_t1` LEFT INNER JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )
  })

  it('alias: two tables - count', () => {
    assert.equal(
      common.Select()
        .from('table1 as custom_t1')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').count()
        .build(),
      'SELECT COUNT(*) FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )

    assert.equal(
      common.Select()
        .from('table1 as custom_t1')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').count(null, 'c')
        .build(),
      'SELECT COUNT(*) AS `c` FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )

    assert.equal(
      common.Select()
        .from('table1 as custom_t1')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').count('id')
        .build(),
      'SELECT COUNT(`custom_t2`.`id`) FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )

    assert.equal(
      common.Select()
        .from('table1 as custom_t1').count('id')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').count('id')
        .build(),
      'SELECT COUNT(`custom_t1`.`id`), COUNT(`custom_t2`.`id`) FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )

    assert.equal(
      common.Select()
        .from('table1 as custom_t1')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').count('id').count('col')
        .build(),
      'SELECT COUNT(`custom_t2`.`id`), COUNT(`custom_t2`.`col`) FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )

    assert.equal(
      common.Select()
        .from('table1 as custom_t1')
        .from('table2 as custom_t2', ['id2a', 'id2b'], 'table1', ['id1a', 'id1b']).count('id')
        .build(),
      'SELECT COUNT(`custom_t2`.`id`) FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2a` = `custom_t1`.`id1a` AND `custom_t2`.`id2b` = `custom_t1`.`id1b`'
    )
  })

  it('alias: two tables - Aggregation Function', () => {
    assert.equal(
      common.Select()
        .from('table1 as custom_t1').fun('AVG', 'col')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1')
        .build(),
      'SELECT AVG(`custom_t1`.`col`) FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )

    assert.equal(
      common.Select()
        .from('table1 as custom_t1')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').fun('AVG', 'col')
        .build(),
      'SELECT AVG(`custom_t2`.`col`) FROM `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1`'
    )
  })

  it('alias: more than two tables', () => {
    assert.equal(
      common.Select()
        .from('table1 as custom_t1').select('id1', 'id2', 'name')
        .from('table2 as custom_t2', 'id2', 'table1', 'id1').select('id2')
        .from('table2 as custom_t3', 'id3', 'custom_t1', 'id2').select('id3')
        .build(),
      'SELECT `custom_t1`.`id1`, `custom_t1`.`id2`, `custom_t1`.`name`, `custom_t2`.`id2`, `custom_t3`.`id3` FROM ( `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2` = `custom_t1`.`id1` ) JOIN `table2` `custom_t3` ON `custom_t3`.`id3` = `custom_t1`.`id2`'
    )
  })

  it('alias: more than two tables - count', () => {
    assert.equal(
      common.Select()
        .from('table1 as custom_t1').select('id1', 'id2', 'name')
        .from('table2 as custom_t2', ['id2a', 'id2b'], 'table1', ['id1a', 'id1b'])
        .from('table2 as custom_t3', 'id3', 'custom_t1', 'id2').select('id3')
        .build(),
      'SELECT `custom_t1`.`id1`, `custom_t1`.`id2`, `custom_t1`.`name`, `custom_t3`.`id3` FROM ( `table1` `custom_t1` JOIN `table2` `custom_t2` ON `custom_t2`.`id2a` = `custom_t1`.`id1a` AND `custom_t2`.`id2b` = `custom_t1`.`id1b` ) JOIN `table2` `custom_t3` ON `custom_t3`.`id3` = `custom_t1`.`id2`'
    )

    assert.equal(
      common.Select()
        .from('stage s').select('id').as('stage_id').select('name', 'description')
        .from('task t', 'of_stage_id', 'stage', 'id').count('id', 'count_task')
        .from('project p', 'id', 's', 'project_id').select('id').as('project_id').select('name', 'description')
        .groupBy('stage_id')
        .build(),
      'SELECT `s`.`id` AS `stage_id`, `s`.`name`, `s`.`description`, COUNT(`t`.`id`) AS `count_task`, `p`.`id` AS `project_id`, `p`.`name`, `p`.`description` FROM ( `stage` `s` JOIN `task` `t` ON `t`.`of_stage_id` = `s`.`id` ) JOIN `project` `p` ON `p`.`id` = `s`.`project_id` GROUP BY `stage_id`'
    )
  })

  it('from: error assertion', () => {
    assert.throws(() => {
      common.Select()
        .from('table1 as custom_t1').select('id1', 'id2', 'name')
        .from('table2 as custom_t2', [], 'table1', [])
        .build()
    })
  })
})

if (require.main === module) {
  test.run(console.DEBUG)
}
