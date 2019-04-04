/// <reference path="../@types/index.d.ts" />

import UpdateSet   	= require("./Set");
import Where 		= require("./Where");

export class UpdateQuery implements FxSqlQuery.ChainBuilder__Update {
	private sql: FxSqlQuerySql.SqlQueryChainDescriptor = {
		where : []
	};

	constructor(private Dialect: FxSqlQueryDialect.Dialect, private opts: FxSqlQuery.QueryOptions) {}

	into(table: string) {
		this.sql.table = table;
		return this;
	}
	set (values: FxSqlQuerySql.DataToSet) {
		this.sql.set = values;
		return this;
	}
	where (...whereConditions: FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres'][]) {
		for (let i = 0; i < whereConditions.length; i++) {
			this.sql.where.push({
				table: null,
				wheres: whereConditions[i]
			});
		}
		return this;
	}
	build () {
		const sqlBuilder = this.Dialect.knex(this.sql.table)

		var query = [];

		query.push("UPDATE");
		query.push(this.Dialect.escapeId(this.sql.table));

		query = query.concat(
			UpdateSet.build(sqlBuilder, this.Dialect, this.sql.set, this.opts)
		);
		query = query.concat(
			Where.build(sqlBuilder, this.Dialect, this.sql.where, this.opts)
		);

		return sqlBuilder.toQuery();
		// return query.join(" ");
	}
}
