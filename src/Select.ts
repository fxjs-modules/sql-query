/// <reference path="../@types/index.d.ts" />

import { get_table_alias } from "./Helpers";
import Helpers = require('./Helpers');
import Where   = require("./Where");

export class SelectQuery implements FxSqlQuery.ChainBuilder__Select {
	private sql: FxSqlQuerySql.SqlQueryChainDescriptor = {
		from         : [],
		where        : [],
		order        : [],
		group_by     : null,
		found_rows   : false,
		where_exists : false
	}

	private _aggregation_functions: {[key: string]: Function} = {}
	private fun_stack: FxSqlQuery.SupportedAggregationFunction[] = []

	private get_aggregate_fun (fun: string) {
		if (this._aggregation_functions[fun])
			return this._aggregation_functions[fun]

		const func = this._aggregation_functions[fun] = (
			...columns: FxSqlQuery.ChainBuilder__SelectAggregationFunColumnArg
		) => {
			fun = fun.toUpperCase()
			if (columns.length === 0) {
				this.fun_stack.push(fun as FxSqlQuery.SupportedAggregationFunction);
				return this;
			}

			/**
			 * when columns is like this:
			 *
			 * ['MY_FUNC1', 'myfunc1']
			 */
			var alias = (columns.length > 1 && typeof columns[columns.length - 1] == "string" ? columns.pop() : null) as string;

			if (columns.length && Array.isArray(columns[0])) {
				const first = columns[0] as FxSqlQuery.ChainBuilder__SelectAggregationFunColumnArg
				columns = first.concat(
					columns.slice(1)
				);
			}

			return this.fun(
				fun,
				(columns.length && columns[0] ? columns : '*') as string,
				alias
			);
		};

		return func
	};

	constructor(private Dialect: FxSqlQueryDialect.Dialect, private opts: FxSqlQuery.QueryOptions) {
	}

	select (fields?: any) {
		if (fields) {
			if (!this.sql.from[this.sql.from.length - 1].select) {
				this.sql.from[this.sql.from.length - 1].select = [];
			}
			const select = this.sql.from[this.sql.from.length - 1].select as FxSqlQuerySql.SqlSelectFieldsDescriptor[]

			this.sql.from[this.sql.from.length - 1].select = select.concat(
				Array.isArray(fields)
					? fields
					: Array.prototype.slice.apply(arguments)
			);
		}
		return this;
	}

	calculateFoundRows () {
		this.sql.found_rows = true;

		return this;
	}
	as (alias: string) {
		var idx = this.sql.from.length - 1;

		if (Array.isArray(this.sql.from[idx].select)) {
			const from_select_arr = this.sql.from[idx].select as FxSqlQuerySql.SqlSelectFieldsDescriptor[]

			var idx2 = from_select_arr.length - 1;

			if (typeof from_select_arr[idx2] == "string") {
				from_select_arr[idx2] = { c: from_select_arr[idx2] as any };
			}
			from_select_arr[from_select_arr.length - 1].a = alias || null;
		}

		return this;
	}
	fun (fun: string, column?: FxSqlQuerySql.SqlColumnType, alias?: string) {
		if (!Array.isArray(this.sql.from[this.sql.from.length - 1].select)) {
			this.sql.from[this.sql.from.length - 1].select = [];
		}
		const select = this.sql.from[this.sql.from.length - 1].select as FxSqlQuerySql.SqlSelectFieldsDescriptor[]
		select.push({
			f: fun.toUpperCase(),
			c: (column && column != "*" ? column : null),
			a: (alias || null),
			s: this.fun_stack
		});
		this.fun_stack = [];
		return this;
	}
	from (
		table: string,
		from_id: FxSqlQueryHelpler.Arraiable<string>,
		to_table: string,
		to_id: FxSqlQueryHelpler.Arraiable<string>,
		fromOpts?: FxSqlQuerySql.QueryFromDescriptorOpts
	): this {
		var from: FxSqlQuerySql.QueryFromDescriptor = {
			t: table,							// table
			a: "t" + (this.sql.from.length + 1)		// alias
		};

		if (this.sql.from.length === 0) {
			this.sql.from.push(from);
			return this;
		}

		var alias: string,
			from_id: FxSqlQueryHelpler.Arraiable<string> = from_id,
			to_id: FxSqlQueryHelpler.Arraiable<string>;

		var args = Array.prototype.slice.call(arguments);
		var last = args[args.length - 1];

		if (typeof last == 'object' && !Array.isArray(last)) {
			fromOpts = args.pop()
			from.opts = fromOpts;
		}

		if (args.length == 3) {
			alias = this.sql.from[this.sql.from.length - 1].a;
			to_id = to_table;
		} else {
			alias = get_table_alias(this.sql, to_table);
			to_id = to_id;
		}

		from.j = [];
		if (from_id.length && to_id.length) {
			if (Array.isArray(from_id) && Array.isArray(to_id) && from_id.length == to_id.length) {
				for (let i = 0; i < from_id.length; i++) {
					from.j.push([from_id[i], alias, to_id[i]]);
				}
			} else {
				from.j.push([from_id, alias, to_id]);
			}
		} else {
				throw new Error();
		}

		this.sql.from.push(from);
		return this;
	}
	where (...whereConditions: FxSqlQuerySql.QueryWhereConditionInputArg[]): this {
		var whereItem: FxSqlQuerySql.SqlQueryDescriptorWhereItem = null;

		for (var i = 0; i < whereConditions.length; i++) {
			if (whereConditions[i] === null) {
				continue;
			}
			if (typeof whereConditions[i] == "string") {
				const cond_str = whereConditions[i] as string
				if (whereItem !== null) {
					this.sql.where.push(whereItem);
				}
				whereItem = {
					t: get_table_alias(this.sql, cond_str),
					w: whereConditions[i + 1] as FxSqlQuerySql.QueryWhereConditionHash
				};
				i++;
			} else {
				if (whereItem !== null) {
					this.sql.where.push(whereItem);
				}
				whereItem = {
					t: null,
					w: whereConditions[i] as FxSqlQuerySql.QueryWhereConditionHash
				};
			}
		}
		if (whereItem !== null) {
			this.sql.where.push(whereItem);
		}
		return this;
	}
	whereExists (table: string, table_link: string, link: string, cond: FxSqlQuerySql.QueryWhereConditionHash) {
		this.sql.where.push({
			t: (this.sql.from.length ? this.sql.from[this.sql.from.length - 1].a : null),
			w: cond,
			e: { t: table, tl: get_table_alias(this.sql, table_link), l: link }
		});
		this.sql.where_exists = true;
		return this;
	}
	groupBy (...args: FxSqlQuerySql.SqlGroupByType[]) {
		this.sql.group_by = args;
		return this;
	}
	offset (offset: number) {
		this.sql.offset = offset;
		return this;
	}
	limit (limit: number) {
		this.sql.limit = limit;
		return this;
	}
	order (column: FxSqlQuerySql.SqlFragmentStr, dir: string | FxSqlQuerySql.SqlAssignmentValues) {
		if (Array.isArray(dir)) {
			this.sql.order.push(
				Helpers.escapeQuery(this.Dialect, column, dir as any)
			);
		} else {
			this.sql.order.push({
				c : Array.isArray(column) ? [ get_table_alias(this.sql, column[0]), column[1] ] : column,
				d : (dir == "Z" ? "DESC" : "ASC")
			});
		}
		return this;
	}
	build () {
		var query = [], tmp = [], from, j, ord, str;
		var having = [];

		if (this.fun_stack.length) {
			this.fun(this.fun_stack.pop());
		}

		query.push("SELECT");

		// limit as: SELECT TOP n (MSSQL only)
		if (this.Dialect.limitAsTop && this.sql.hasOwnProperty("limit")) {
			query.push("TOP " + this.sql.limit);
		}
		
		for (let i = 0; i < this.sql.from.length; i++) {
			this.sql.from[i].a = "t" + (i + 1);
		}

		const sql_from = this.sql.from
		for (let i = 0; i < sql_from.length; i++) {
			if (!sql_from[i].select) continue;

			const sql_select = sql_from[i].select as FxSqlQuerySql.SqlSelectFieldsDescriptor[] | string

			for (let j = 0; j < sql_from[i].select.length; j++) {
				if (typeof sql_select[j] == "string" ) {
					const sql_select_string = sql_select[j] as string
					
					if (sql_from.length == 1) {
						tmp.push(this.Dialect.escapeId(sql_select_string));
					} else {
						tmp.push(this.Dialect.escapeId(sql_from[i].a, sql_select_string));
					}
					continue;
				}

				const sql_select_obj = sql_select[j] as FxSqlQuerySql.SqlSelectFieldsDescriptor
				if (typeof sql_select[j] == "object") {
					if (!sql_select_obj.f && sql_select_obj.c) {
						if (sql_from.length == 1) {
							tmp.push(
								this.Dialect.escapeId(sql_select_obj.c as FxSqlQuerySql.SqlFragmentStr)
							);
						} else {
							tmp.push(
								this.Dialect.escapeId(sql_from[i].a, sql_select_obj.c as FxSqlQuerySql.SqlFragmentStr)
							);
						}
						if (sql_select_obj.a) {
							tmp[tmp.length - 1] += " AS " + this.Dialect.escapeId(sql_select_obj.a);
						}
					}
					if (sql_select_obj.having) {
						having.push(this.Dialect.escapeId(sql_select_obj.having));
					}
					if (sql_select_obj.select) {
						tmp.push(this.Dialect.escapeId(sql_select_obj.select));
						continue;
					}
				}

				if (typeof sql_select[j] == "function") {
					const sql_select_func = sql_from[i].select[j] as FxSqlQuerySql.SqlSelectFieldsGenerator

					tmp.push(sql_select_func(this.Dialect));
					continue;
				}

				str = sql_select_obj.f + "(";

				if (sql_select_obj.f) {
					str = sql_select_obj.f + "(";

					if (sql_select_obj.c && !Array.isArray(sql_select_obj.c)) {
						sql_select_obj.c = [ sql_select_obj.c as string ];
					}

					if (Array.isArray(sql_select_obj.c)) {
						const column_descriptors = sql_select_obj.c as FxSqlQuerySql.SqlColumnDescriptor[]
						str += column_descriptors.map((el: FxSqlQuerySql.SqlColumnDescriptor) => {
							if (!el) {
								return this.Dialect.escapeVal(el as null);
							}
							if (typeof el.type == "function") {
								switch (el.type()) {
									case "text":
										return this.Dialect.escapeVal(el.data, this.opts.timezone);
									default:
										return el;
								}
							}
							if (typeof el != "string") {
								return el;
							}
							if (sql_from.length == 1) {
								return this.Dialect.escapeId(el);
							} else {
								return this.Dialect.escapeId(sql_from[i].a, el);
							}
						}).join(", ");
					} else {
						str += "*";
					}
					str += ")";
				} else if (sql_select_obj.sql) {
					str = '(' + sql_select_obj.sql + ')';
				} else {
					continue;
				}

				str += (sql_select_obj.a ? " AS " + this.Dialect.escapeId(sql_select_obj.a) : "");

				if (sql_select_obj.s && sql_select_obj.s.length > 0) {
					str = sql_select_obj.s.join("(") + "(" + str +
						((new Array(sql_select_obj.s.length + 1)).join(")"));
				}

				tmp.push(str);
			}
		}

		// MySQL specific!
		if (this.sql.found_rows) {
			query.push("SQL_CALC_FOUND_ROWS");
		}

		if (tmp.length) {
			query.push(tmp.join(", "));
		} else {
			query.push("*");
		}

		if (sql_from.length > 0) {
			query.push("FROM");

			if (sql_from.length > 2) {
				query.push((new Array(sql_from.length - 1)).join("("));
			}

			for (let i = 0; i < sql_from.length; i++) {
				from = sql_from[i];

				if (i > 0) {
					if (from.opts && from.opts.joinType) {
						query.push(from.opts.joinType.toUpperCase());
					}
					query.push("JOIN");
				}
				if (sql_from.length == 1 && !this.sql.where_exists) {
					query.push(this.Dialect.escapeId(from.t));
				} else {
					query.push(this.Dialect.escapeId(from.t) + " " + this.Dialect.escapeId(from.a));
				}
				if (i > 0) {
					query.push("ON");

					for (let ii = 0; ii < from.j.length; ii++) {
						if (ii > 0) {
							query.push("AND");
						}
						query.push(
							this.Dialect.escapeId(from.a, from.j[ii][0]) +
							" = " +
							this.Dialect.escapeId(from.j[ii][1], from.j[ii][2])
						);
					}

					if (i < sql_from.length - 1) {
						query.push(")");
					}
				}
			}
		}

		if (having.length > 0) {
			for (let i = 0; i < having.length; i++) {
				query.push( (i === 0 ? "HAVING" : "AND") + having[i]);
			}
		}

		query = query.concat(
			Where.build(
				this.Dialect,
				// at this time, this.sql.where has been normalized, it must be `FxSqlQuerySql.SqlWhereDescriptor[]`
				this.sql.where as FxSqlQuerySql.SqlWhereDescriptor[],
				this.opts
			)
		);
 
		if (this.sql.group_by !== null) {
			query.push("GROUP BY " + this.sql.group_by.map((column) => {
				if (column[0] == "-") {
					this.sql.order.unshift({ c: column.substr(1), d: "DESC" });
					return this.Dialect.escapeId(column.substr(1));
				}
				return this.Dialect.escapeId(column);
			}).join(", "));
		}

		// order
		if (this.sql.order.length > 0) {
			tmp = [];
			for (let i = 0; i < this.sql.order.length; i++) {
				ord = this.sql.order[i];

				if (typeof ord == 'object') {
					if (Array.isArray(ord.c)) {
						tmp.push(this.Dialect.escapeId.apply(this.Dialect, ord.c) + " " + ord.d);
					} else {
						tmp.push(this.Dialect.escapeId(ord.c) + " " + ord.d);
					}
				} else if (typeof ord == 'string') {
					tmp.push(ord);
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

	abs (...args: any[]) { return this.get_aggregate_fun('ABS')(...args) }
	ceil (...args: any[]) { return this.get_aggregate_fun('CEIL')(...args) }
	floor (...args: any[]) { return this.get_aggregate_fun('FLOOR')(...args) }
	round (...args: any[]) { return this.get_aggregate_fun('ROUND')(...args) }
	avg (...args: any[]) { return this.get_aggregate_fun('AVG')(...args) }
	min (...args: any[]) { return this.get_aggregate_fun('MIN')(...args) }
	max (...args: any[]) { return this.get_aggregate_fun('MAX')(...args) }
	log (...args: any[]) { return this.get_aggregate_fun('LOG')(...args) }
	log2 (...args: any[]) { return this.get_aggregate_fun('LOG2')(...args) }
	log10 (...args: any[]) { return this.get_aggregate_fun('LOG10')(...args) }
	exp (...args: any[]) { return this.get_aggregate_fun('EXP')(...args) }
	power (...args: any[]) { return this.get_aggregate_fun('POWER')(...args) }
	acos (...args: any[]) { return this.get_aggregate_fun('ACOS')(...args) }
	asin (...args: any[]) { return this.get_aggregate_fun('ASIN')(...args) }
	atan (...args: any[]) { return this.get_aggregate_fun('ATAN')(...args) }
	cos (...args: any[]) { return this.get_aggregate_fun('COS')(...args) }
	sin (...args: any[]) { return this.get_aggregate_fun('SIN')(...args) }
	tan (...args: any[]) { return this.get_aggregate_fun('TAN')(...args) }
	conv (...args: any[]) { return this.get_aggregate_fun('CONV')(...args) }
	random (...args: any[]) { return this.get_aggregate_fun('RANDOM')(...args) }
	rand (...args: any[]) { return this.get_aggregate_fun('RAND')(...args) }
	radians (...args: any[]) { return this.get_aggregate_fun('RADIANS')(...args) }
	degrees (...args: any[]) { return this.get_aggregate_fun('DEGREES')(...args) }
	sum (...args: any[]) { return this.get_aggregate_fun('SUM')(...args) }
	count (...args: any[]) { return this.get_aggregate_fun('COUNT')(...args) }
	distinct (...args: any[]) { return this.get_aggregate_fun('DISTINCT')(...args) }
}
