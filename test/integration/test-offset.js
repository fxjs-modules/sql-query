const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

describe('offset', () => {
  it('offset', () => {
    assert.equal(
      common.Select().from('table1').offset(3).build(),
      'SELECT * FROM `table1` OFFSET 3'
    )

    assert.equal(
      common.Select().from('table1').offset('123456789').build(),
      'SELECT * FROM `table1` OFFSET 123456789'
    )
  })
})

if (require.main === module) {
  test.run(console.DEBUG)
}
