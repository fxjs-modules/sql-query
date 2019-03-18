import Where = require("./Where");
import { get_table_alias } from './Helpers'

export class RemoveQuery implements FxSqlQuery.ChainBuilder__Remove {
	private sql: FxSqlQuerySql.SqlQueryChainDescriptor = {
		where : [],
		order : []
	};

	constructor(private Dialect: FxSqlQueryDialect.Dialect, private opts: FxSqlQuery.ChainBuilderOptions) {}

	from (table: string) {
		this.sql.table = table;
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
		var query: FxSqlQuerySql.SqlQueryStr[] = [];

		// limit as: SELECT TOP n (MSSQL only)
		if (this.Dialect.limitAsTop && this.sql.hasOwnProperty("limit")) {
			query.push("DELETE TOP " + this.sql.limit + " FROM");
		} else {
			query.push("DELETE FROM");
		}
		query.push(this.Dialect.escapeId(this.sql.table));

		query = query.concat(Where.build(this.Dialect, this.sql.where as FxSqlQuerySubQuery.SubQueryBuildDescriptor[], this.opts));

		// order
		if (this.sql.order.length > 0) {
			// this.sql.order has been normalized
			const order = this.sql.order as FxSqlQuerySql.SqlOrderDescriptor[]
			const tmp: string[] = [];
			for (let i = 0; i < order.length; i++) {
				const col_desc = order[i].c;
				const zdir = order[i].d;

				if (Array.isArray(col_desc)) {
					tmp.push(this.Dialect.escapeId.apply(this.Dialect, col_desc) + " " + zdir);
				} else {
					tmp.push(this.Dialect.escapeId(col_desc) + " " + zdir);
				}
			}

			if (tmp.length > 0) {
				query.push("ORDER BY " + tmp.join(", "));
			}
		}

		// limit for all Dialects but MSSQL
		if (!this.Dialect.limitAsTop) {
			if (this.sql.hasOwnProperty("limit")) {
				if (this.sql.hasOwnProperty("offset")) {
					query.push("LIMIT " + this.sql.limit + " OFFSET " + this.sql.offset);
				} else {
					query.push("LIMIT " + this.sql.limit);
				}
			} else if (this.sql.hasOwnProperty("offset")) {
				query.push("OFFSET " + this.sql.offset);
			}
		}

		return query.join(" ");
	}
	offset (offset: number) {
		this.sql.offset = offset;
		return this;
	}
	limit (limit: number) {
		this.sql.limit = limit;
		return this;
	}
	order (column: string | string[], dir: FxSqlQuery.QueryOrderDirection) {
		this.sql.order.push({
			c : Array.isArray(column) ? [ get_table_alias(this.sql, column[0]), column[1] ] : column,
			d : (dir == "Z" ? "DESC" : "ASC")
		});
		return this;
	}
}
