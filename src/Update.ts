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
	where (...whereConditions: FxSqlQuerySubQuery.SubQueryBuildDescriptor['w'][]) {
		for (var i = 0; i < whereConditions.length; i++) {
			this.sql.where.push({
				t: null,
				w: whereConditions[i]
			});
		}
		return this;
	}
	build () {
		var query = [];

		query.push("UPDATE");
		query.push(this.Dialect.escapeId(this.sql.table));

		query = query.concat(UpdateSet.build(this.Dialect, this.sql.set, this.opts));
		query = query.concat(Where.build(this.Dialect, this.sql.where, this.opts));

		return query.join(" ");
	}
}
