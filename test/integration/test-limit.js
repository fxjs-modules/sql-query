const test = require('test')
test.setup()

var common     = require('../common');
var assert     = require('assert');

describe('limit', () => {
  it('limit - mysql', () => {
	const queryOptions = { dialect: 'mysql' }

	assert.equal(
		common.Select(queryOptions).from('table1').limit(123).build(),
		"select * from `table1` limit 123"
	);

	assert.equal(
		common.Select(queryOptions).from('table1').limit('123456789').build(),
		"select * from `table1` limit 123456789"
	);
  });

  it('limit - sqlite', () => {
	const queryOptions = { dialect: 'sqlite' }

	assert.equal(
		common.Select(queryOptions).from('table1').limit(123).build(),
		"select * from `table1` limit 123"
	);

	assert.equal(
		common.Select(queryOptions).from('table1').limit('123456789').build(),
		"select * from `table1` limit 123456789"
	);
  });
})

if (require.main === module) {
    test.run(console.DEBUG)
}
