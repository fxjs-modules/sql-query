const test = require('test')
test.setup()

var common = require('../common')
var assert = require('assert')

describe('offset', () => {
  it('offset - mysql', () => {
	const queryOptions = { dialect: 'mysql' }

    assert.equal(
      common.Select(queryOptions).from('table1').offset(3).build(),
      'select * from `table1` limit 18446744073709551615 offset 3'
    )

    assert.equal(
      common.Select(queryOptions).from('table1').offset('123456789').build(),
      'select * from `table1` limit 18446744073709551615 offset 123456789'
    )
  });

  it('offset - sqlite', () => {
	const queryOptions = { dialect: 'sqlite' }

    assert.equal(
      common.Select(queryOptions).from('table1').offset(3).build(),
      'select * from `table1` limit -1 offset 3'
    )

    assert.equal(
      common.Select(queryOptions).from('table1').offset('123456789').build(),
      'select * from `table1` limit -1 offset 123456789'
    )
  });
})

if (require.main === module) {
  test.run(console.DEBUG)
}
