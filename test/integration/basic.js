const test = require('test')
test.setup()

var Query     	= require('../../');
var assert     	= require('assert');

describe('basic', () => {
	assert.isFunction(Query.Text)

	describe('exported modules', () => {
		describe('comparators', () => {
			;[
				'between',
				'not_between',
				'like',
				'not_like',
				'eq',
				'ne',
				'gt',
				'gte',
				'lt',
				'lte',
				'in',
				'not_in',
			].forEach((comparator) => {
				it(`Query.comparator.${comparator} exists`, () => {
					assert.isFunction(Query.comparators[comparator])
				})
			});
		});

		;[
			'mysql',
			'mssql',
			'sqlite'
		].forEach((dialect) => {
			describe(`Dialects - ${dialect}`, () => {
				it(`Dialects.${dialect} exists`, () => {
					assert.isObject(Query.Dialects[dialect])
				});

				;[
					'type',
					'DataTypes',
					'escape',
					'escapeId',
					'escapeVal',
				].forEach((method) => {
					it(`Dialects.${dialect} has '${method}'`, () => {
						assert.exist(Query.Dialects[dialect][method])
					});
				})
			});
		});
	})
})

if (require.main === module) {
    test.run(console.DEBUG)
}
