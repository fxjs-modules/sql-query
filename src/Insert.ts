/// <reference path="../@types/index.d.ts" />

export class InsertQuery implements FxSqlQuery.ChainBuilder__Insert {
	private sql: FxSqlQuerySql.SqlQueryChainDescriptor = {};

	constructor(private Dialect: FxSqlQueryDialect.Dialect, private opts: FxSqlQuery.ChainBuilderOptions) {}

	into (table: string) {
		this.sql.table = table;
		return this;
	}
	set (values: FxSqlQuerySql.ValuesToSet) {
		this.sql.set = values;
		return this;
	}
	build () {
		var query = [], cols = [], vals = [];

		query.push("INSERT INTO");
		query.push(this.Dialect.escapeId(this.sql.table));

		if (this.sql.hasOwnProperty("set")) {
			for (var k in this.sql.set) {
				cols.push(this.Dialect.escapeId(k));
				vals.push(this.Dialect.escapeVal(this.sql.set[k], this.opts.timezone));
			}
			if (cols.length == 0) {
				query.push(this.Dialect.defaultValuesStmt);
			} else {
				query.push("(" + cols.join(", ") + ")");
				query.push("VALUES (" + vals.join(", ") + ")");
			}
		}

		return query.join(" ");
	}
}
