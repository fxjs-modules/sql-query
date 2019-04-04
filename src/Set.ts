import Knex = require('knex')

export function build (
	knexQueryBuilder: Knex.QueryBuilder,
	Dialect: FxSqlQueryDialect.Dialect,
	set: FxSqlQuerySql.DataToSet,
	opts: FxSqlQuery.ChainBuilderOptions
): string | string[] {
	opts = opts || {};

	if (!set || set.length === 0) {
		return [];
	}

	var query = [];
	const safeSet: typeof set = {};

	for (let k in set) {
		safeSet[k] = Dialect.escapeVal(set[k], opts.timezone)

		query.push(
			Dialect.escapeId(k) +
			" = " +
			Dialect.escapeVal(set[k], opts.timezone)
		);
	}

	knexQueryBuilder.update(safeSet);

	return "SET " + query.join(", ");
};
