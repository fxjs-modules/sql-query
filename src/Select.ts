/// <reference path="../@types/index.d.ts" />

import util   = require("util");

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
			const from_descriptor = this.sql.from[this.sql.from.length - 1];

			if (!from_descriptor.select || !Array.isArray(from_descriptor.select)) {
				from_descriptor.select = [];
			}
			this.sql.from[this.sql.from.length - 1].select = from_descriptor.select.concat(
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

	as (_as: string) {
		var idx = this.sql.from.length - 1;

		if (Array.isArray(this.sql.from[idx].select)) {
			const from_select_arr = this.sql.from[idx].select as FxSqlQuerySql.SqlSelectFieldItemDescriptor[]

			var idx2 = from_select_arr.length - 1;

			if (typeof from_select_arr[idx2] == "string") {
				from_select_arr[idx2] = { column_name: from_select_arr[idx2] as any };
			}
			from_select_arr[from_select_arr.length - 1].as = _as || null;
		}

		return this;
	}

	fun (fun: string, column?: FxSqlQuerySql.SqlColumnType, _as?: string) {
		if (!Array.isArray(this.sql.from[this.sql.from.length - 1].select)) {
			this.sql.from[this.sql.from.length - 1].select = [];
		}
		const select = this.sql.from[this.sql.from.length - 1].select as FxSqlQuerySql.SqlSelectFieldItemDescriptor[]
		select.push({
			func_name: fun.toUpperCase(),
			column_name: (column && column != "*" ? column : null),
			as: (_as || null),
			func_stack: this.fun_stack
		});
		this.fun_stack = [];
		return this;
	}

	/**
	 *
	 * @param table from-table
	 * @param from_id from-table id(s), align with to_id
	 * @param to_table to table
	 * @param to_id to-table id(s), align with from_id
	 * @param from_opts join descriptor
	 */
	from (
		table: FxSqlQuerySql.SqlTableInputType,
		from_id?: FxSqlQueryHelpler.Arraiable<string>,
		to_table?: string,
		to_id?: FxSqlQueryHelpler.Arraiable<string>,
		from_opts?: FxSqlQuerySql.QueryFromDescriptorOpts
	): this {
		const [table_name, table_alias] = Helpers.parseTableInputStr(table)

		const from: FxSqlQuerySql.QueryFromDescriptor = {
			table: table_name,
			alias: table_alias || Helpers.defaultTableAliasNameRule( Helpers.autoIncreatementTableIndex(this.sql.from) )
		};

		if (this.sql.from.length === 0) {
			this.sql.from.push(from);
			return this;
		}

		let alias: string;

		const args = Array.prototype.slice.call(arguments);
		const last = args[args.length - 1];

		if (typeof last == 'object' && !Array.isArray(last)) {
			from_opts = args.pop()
			from.opts = from_opts;
		}

		if (args.length == 3) {
			alias = Helpers.pickAliasFromFromDescriptor(this.sql.from[this.sql.from.length - 1]);
			to_id = to_table;
		} else { // expect args.length === 4
			const [to_table_name, to_table_alias] = Helpers.parseTableInputStr(to_table)
			alias = to_table_alias || get_table_alias(this.sql, to_table_name);
		}

		from.joins = [];
		if (!from_id.length || !to_id.length)
			throw new Error('[SQL-QUERY] both from_id & to_id cannot be empty!');

		/**
		 * expect
		 * ```
		 * 	.from(
		 * 		'fromtable',
		 * 		['from_table_c1', 'from_table_c2', 'from_table_c3', ...],
		 * 		'totable',
		 * 		['to_table_c1', 'to_table_c2', 'to_table_c3', ...],
		 * 	)
		 * ```
		 */
		if (Array.isArray(from_id) && Array.isArray(to_id) && from_id.length == to_id.length) {
			for (let i = 0; i < from_id.length; i++) {
				from.joins.push([
					from_id[i],
					alias,
					to_id[i]
				]);
			}
		} else {
			/**
			 * expect
			 * ```
			 * 	.from('fromtable', from_table_c1', 'totable', 'to_table_c1')
			 * ```
			 */
			from.joins.push([
				from_id as string,
				alias,
				to_id as string
			]);
		}

		this.sql.from.push(from);
		return this;
	}

	where (
		...whereConditions: (
			FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres'] | FxSqlQuerySubQuery.WhereExistsTuple_Flatten[0]
		)[]
	): this {
		var whereItem: FxSqlQuerySubQuery.SubQueryBuildDescriptor = null;
		const pushNonEmptyWhereItem = () => {
			if (whereItem !== null) {
				this.sql.where.push(whereItem);
			}
		}

		for (let i = 0; i < whereConditions.length; i++) {
			if (whereConditions[i] === null) {
				continue;
			}
			if (typeof whereConditions[i] == "string") {
				/**
				 * deal with input like this:
				 * [
						"table1",
						{
							"col": 1
						},
						"table2",
						{
							"col": 2
						}
					]
				 */
				const table_or_alias = whereConditions[i] as FxSqlQuerySubQuery.WhereExistsTuple_Flatten[0]
				pushNonEmptyWhereItem()
				whereItem = {
					table: get_table_alias(this.sql, table_or_alias),
					wheres: whereConditions[i + 1] as FxSqlQuerySubQuery.WhereExistsTuple_Flatten[1]
				};
				i++;
			} else { // expect it's `FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres']`
				pushNonEmptyWhereItem()
				whereItem = {
					table: null,
					wheres: whereConditions[i] as FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres']
				};
			}
		}
		pushNonEmptyWhereItem()

		// make tmp variable null.
		whereItem = null;

		return this;
	}

	whereExists (table: string, table_link: string, link: FxSqlQuerySql.WhereExistsLinkTuple, cond: FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres']) {
		this.sql.where.push({
			table: (this.sql.from.length ? Helpers.pickAliasFromFromDescriptor(this.sql.from[this.sql.from.length - 1]) : null),
			wheres: cond,
			exists: { table: table, table_linked: get_table_alias(this.sql, table_link), link_info: link }
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

	order (column: FxSqlQuery.OrderNormalizedResult[0], dir?: FxSqlQuery.OrderNormalizedResult[1]) {
		// sql type tuple
		if (Array.isArray(dir)) {
			this.sql.order.push(
				Helpers.escapeQuery(
					this.Dialect,
					column as FxSqlQuery.OrderSqlStyleTuple[0],
					dir
				)
			);
		// normalized order array
		} else {
			this.sql.order.push({
				c : Array.isArray(column) ? [
					get_table_alias(this.sql, column[0]),
					column[1]
				] : column,
				d : (dir === "Z" ? "DESC" : "ASC")
			});
		}
		return this;
	}

	build () {
		let query: string[] = [],
			sqlfragment_collector: string[] = [],
			_from,
			ord;

		const having: string[] = [];

		const sql_from = this.sql.from;

		if (this.fun_stack.length) {
			this.fun(this.fun_stack.pop());
		}

		query.push("SELECT");

		// limit as: SELECT TOP n (MSSQL only)
		if (this.Dialect.limitAsTop && this.sql.hasOwnProperty("limit")) {
			query.push("TOP " + this.sql.limit);
		}

		const tableAliasMap = {} as {[k: string]: string};

		for (let i = 0; i < sql_from.length; i++) {
			sql_from[i].alias = Helpers.pickAliasFromFromDescriptor(sql_from[i]) || Helpers.defaultTableAliasNameRule(i + 1);
		}

		const single_query = sql_from.length === 1;
		for (let i = 0; i < sql_from.length; i++) {
			if (!sql_from[i].select) continue;

			tableAliasMap[`${sql_from[i].table}`] = sql_from[i].alias

			for (let j = 0; j < sql_from[i].select.length; j++) {
				const sql_select_item = sql_from[i].select[j]

				if (typeof sql_select_item == "string" ) {
					buildStringTypeSelectItem.apply(this, [
						sqlfragment_collector,
						sql_select_item,
						single_query,
						Helpers.pickAliasFromFromDescriptor(sql_from[i])
					])
					continue;
				} else if (typeof sql_select_item == "object") {
					const {should_continue} = buildObjectTypeSelectItem.apply(this, [
						sqlfragment_collector,
						sql_select_item,
						single_query,
						Helpers.pickAliasFromFromDescriptor(sql_from[i]),
						having
					]);

					if (should_continue)
						continue ;
				} else if (typeof sql_select_item == "function") {
					sqlfragment_collector.push(sql_select_item(this.Dialect));
					continue;
				}
			}
		}

		// MySQL specific!
		if (this.sql.found_rows) {
			query.push("SQL_CALC_FOUND_ROWS");
		}

		if (sqlfragment_collector.length) {
			query.push(sqlfragment_collector.join(", "));
		} else {
			query.push("*");
		}

		const sqlBuilder = this.Dialect.knex(tableAliasMap);

		if (sql_from.length > 0) {
			query.push("FROM");

			if (sql_from.length > 2) {
				query.push((new Array(sql_from.length - 1)).join("("));
			}

			const single_query = sql_from.length == 1 && !this.sql.where_exists;

			for (let i = 0; i < sql_from.length; i++) {
				_from = sql_from[i];

				if (i > 0) {
					if (_from.opts && _from.opts.joinType) {
						query.push(_from.opts.joinType.toUpperCase());
					}
					query.push("JOIN");
				}

				if (single_query) {
					query.push(this.Dialect.escapeId(_from.table));

					sqlBuilder.from(_from.table);
				} else {
					query.push(this.Dialect.escapeId(_from.table) + " " + this.Dialect.escapeId(Helpers.pickAliasFromFromDescriptor(_from)));

					sqlBuilder.from(_from.table);
					// sqlBuilder.from(`${_from.table} as ${Helpers.pickAliasFromFromDescriptor(_from)}`);
				}

				if (i > 0) {
					query.push("ON");

					buildJoinOn.apply(this, [query, _from]);

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
				sqlBuilder,
				this.Dialect,
				this.sql.where,
				this.opts
			)
		);

		if (this.sql.group_by !== null) {
			query.push("GROUP BY " + this.sql.group_by.map((column) => {
				if (column[0] == "-") {
					const cname = column.substr(1)
					this.sql.order.unshift({ c: cname, d: "DESC" });
					return this.Dialect.escapeId(cname);
				}
				return this.Dialect.escapeId(column);
			}).join(", "));
		}

		// order
		if (this.sql.order.length > 0) {
			sqlfragment_collector = [];
			for (let i = 0; i < this.sql.order.length; i++) {
				ord = this.sql.order[i];

				if (typeof ord == 'object') {
					if (Array.isArray(ord.c)) {
						sqlfragment_collector.push(this.Dialect.escapeId.apply(this.Dialect, ord.c) + " " + ord.d);

						for (let i = 0; i < ord.c.length; i++) {
							sqlBuilder.orderBy(ord.c[i], ord.d)
						}
					} else {
						sqlfragment_collector.push(this.Dialect.escapeId(ord.c) + " " + ord.d);

						sqlBuilder.orderBy(ord.c, ord.d)
					}
				} else if (typeof ord == 'string') {
					sqlfragment_collector.push(ord);

					sqlBuilder.orderBy(ord)
				}
			}

			if (sqlfragment_collector.length > 0) {
				query.push("ORDER BY " + sqlfragment_collector.join(", "));
			}
		}

		// limit for all Dialects but MSSQL
		if (!this.Dialect.limitAsTop) {
			if (this.sql.hasOwnProperty("limit")) {
				if (this.sql.hasOwnProperty("offset")) {
					query.push("LIMIT " + this.sql.limit + " OFFSET " + this.sql.offset);

					sqlBuilder.offset( Helpers.ensureNumber(this.sql.offset) )
				} else {
					query.push("LIMIT " + this.sql.limit);
				}

			} else if (this.sql.hasOwnProperty("offset")) {
				query.push("OFFSET " + this.sql.offset);

				sqlBuilder.offset( Helpers.ensureNumber(this.sql.offset) )
			}
		}

		return sqlBuilder.toQuery();
		// return query.join(" ");
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

function buildJoinOn (
	this: FxSqlQuery.ChainBuilder__Select,
	query: string[], _from: FxSqlQuerySql.QueryFromDescriptor
) {
	for (let ii = 0; ii < _from.joins.length; ii++) {
		if (ii > 0) {
			query.push("AND");
		}
		query.push(
			this.Dialect.escapeId(Helpers.pickAliasFromFromDescriptor(_from), _from.joins[ii][0]) +
			" = " +
			this.Dialect.escapeId(_from.joins[ii][1], _from.joins[ii][2])
		);
	}
}

function buildStringTypeSelectItem (
	this: FxSqlQuery.ChainBuilder__Select,
	sql_fragment_collector: string[],
	sql_select_item: string,
	single_query: boolean,
	alias: string
) {
	if (single_query) {
		sql_fragment_collector.push(this.Dialect.escapeId(sql_select_item));
	} else {
		sql_fragment_collector.push(this.Dialect.escapeId(alias, sql_select_item));
	}
}

function buildObjectTypeSelectItem (
	this: FxSqlQuery.ChainBuilder__Select,
	sql_fragment_collector: string[],
	sql_select_obj: FxSqlQuerySql.SqlSelectFieldItemDescriptor,
	single_query: boolean,
	alias: string,
	having: string[]
): {
	should_continue: boolean,
	return_value: string
} {
	const return_wrapper = {
		should_continue: false,
		return_value: ''
	};

	let str;

	if (!sql_select_obj.func_name && sql_select_obj.column_name) {
		if (single_query) {
			sql_fragment_collector.push(
				this.Dialect.escapeId(sql_select_obj.column_name as FxSqlQuerySql.SqlFragmentStr)
			);
		} else {
			sql_fragment_collector.push(
				this.Dialect.escapeId(
					alias,
					sql_select_obj.column_name as FxSqlQuerySql.SqlFragmentStr
				)
			);
		}
		const _as = Helpers.pickColumnAsFromSelectFieldsDescriptor(sql_select_obj)
		if (_as) {
			sql_fragment_collector[sql_fragment_collector.length - 1] += " AS " + this.Dialect.escapeId(_as as FxSqlQuerySql.NormalizedSimpleSqlColumnType);
		}
	}

	if (sql_select_obj.having) {
		having.push(this.Dialect.escapeId(sql_select_obj.having));
	}

	if (sql_select_obj.select) {
		sql_fragment_collector.push(this.Dialect.escapeId(sql_select_obj.select));

		return_wrapper.should_continue = true;
		return return_wrapper;
	}

	if (sql_select_obj.func_name) {
		str = sql_select_obj.func_name + "(";

		if (sql_select_obj.column_name && !Array.isArray(sql_select_obj.column_name)) {
			sql_select_obj.column_name = [ sql_select_obj.column_name as string ];
		}

		const column_descriptors = sql_select_obj.column_name
		if (Array.isArray(column_descriptors)) {
			str += column_descriptors.map((col_desc) => {
				if (!col_desc) {
					return this.Dialect.escapeVal(col_desc);
				}

				/* when col_desc is type:SqlColumnDescriptor */
				if (typeof col_desc === 'object' && typeof col_desc.type === "function") {
					switch (col_desc.type()) {
						case "text":
							return this.Dialect.escapeVal(col_desc.data, this.opts.timezone);
						default:
							return col_desc;
					}
				} else if (typeof col_desc !== "string") {
					return col_desc;
				}

				if (single_query) {
					return this.Dialect.escapeId(col_desc);
				} else {
					return this.Dialect.escapeId(alias, col_desc);
				}
			}).join(", ");
		} else {
			str += "*";
		}
		str += ")";
	} else if (sql_select_obj.sql) {
		str = '(' + sql_select_obj.sql + ')';
	} else {
		return_wrapper.should_continue = true;
		return return_wrapper;
	}

	const _as = Helpers.pickColumnAsFromSelectFieldsDescriptor(sql_select_obj);
	str += _as ? " AS " + this.Dialect.escapeId(_as) : "";

	if (sql_select_obj.func_stack && sql_select_obj.func_stack.length > 0) {
		str = sql_select_obj.func_stack.join("(") + "(" + str +
				Array(sql_select_obj.func_stack.length + 1).join(")");
	}

	sql_fragment_collector.push(str);

	return return_wrapper;
}
