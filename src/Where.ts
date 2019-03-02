/// <reference path="../@types/index.d.ts" />

import Helpers = require('./Helpers');

export function build (
	Dialect: FxSqlQueryDialect.Dialect,
	whereList: FxSqlQuerySubQuery.SubQueryBuildDescriptor[],
	opts: FxSqlQuery.ChainBuilderOptions
): string | string[] {
	if (whereList.length === 0) {
		return [];
	}

	var query = [],
		subquery;

	for (var i = 0; i < whereList.length; i++) {
		subquery = buildOrGroup(Dialect, whereList[i], opts);

		if (subquery !== false) {
			query.push(subquery);
		}
	}

	if (query.length === 0) {
		return [];
	} else if (query.length == 1) {
		return "WHERE " + query[0];
	}

	return "WHERE (" + query.join(") AND (") + ")";
};

const WHERE_CONJUNCTIONS = [ "or", "and", "not_or", "not_and", "not" ];

function isKeyConjunctionNot (k: string) {
	return k.indexOf("_") >= 0
}

function buildOrGroup(
	Dialect: FxSqlQueryDialect.Dialect,
	where: FxSqlQuerySubQuery.SubQueryBuildDescriptor,
	opts: FxSqlQuery.ChainBuilderOptions
): FxSqlQuerySql.SqlFragmentStr[] | FxSqlQuerySql.SqlResultStr | false {
	opts = opts || {};

	// where-Exists query
	if (where.e) {
		var whereList = [];
		/**
		 * @example whereExists('table2', 'table1', [['fid1', 'fid2'], ['id1', 'id2']], { col1: 1, col2: 2 })
		 */
		if(Array.isArray(where.e.l[0]) && Array.isArray(where.e.l[1])) {
			for (let i = 0; i < where.e.l[0].length; i++) {
				whereList.push(Dialect.escapeId(where.e.l[0][i]) + " = " + Dialect.escapeId(where.e.tl, where.e.l[1][i]));
			}
		} else {
			/**
			 * @example whereExists('table2', 'table1', ['fid', 'id'], { col1: 1, col2: 2 })
			 */
			whereList.push(Dialect.escapeId(where.e.l[0]) + " = " + Dialect.escapeId(where.e.tl, where.e.l[1]));
		}

		return [
			"EXISTS (" +
			"SELECT * FROM " + Dialect.escapeId(where.e.t) + " " +
			"WHERE " + whereList.join(" AND ") + " " +
			"AND " + buildOrGroup(Dialect, { t: null, w: where.w }, opts) +
			")"
		];
	}

	var query = [],
		op: FxSqlQueryComparator.QueryComparatorType;

	for (var k in where.w) {
		if (where.w[k] === null || where.w[k] === undefined) {
			query.push(
				buildComparisonKey(Dialect, where.t, k) +
				" IS NULL"
			);
			continue;
		}
		// `not` is an alias for `not_and`
		if (WHERE_CONJUNCTIONS.indexOf(k) >= 0) {
			var q, subquery = [];
			var prefix = (k == "not" || isKeyConjunctionNot(k) ? "NOT " : false);

			op = (k == "not" ? "and" : (isKeyConjunctionNot(k) ? k.substr(4) : k)).toUpperCase();

			const conj_cond_item = where.w[k] as FxSqlQueryComparator.SubQueryInput[]
			for (var j = 0; j < conj_cond_item.length; j++) {
				const conj_c = conj_cond_item[j]
				q = buildOrGroup(
					Dialect,
					{ t: where.t, w: conj_c },
					opts
				);
				if (q !== false) {
					subquery.push(q);
				}
			}

			if (subquery.length > 0) {
				query.push((prefix ? prefix : "") + "((" + subquery.join(") " + op + " (") + "))");
			}
			continue;
		}

		const non_special_kv = where.w[k] as FxSqlQuerySubQuery.NonConjunctionInputValue

		if (
			/* non_special_kv could be string, it's international */
			typeof (non_special_kv as FxSqlQuerySql.DetailedQueryWhereCondition).sql_comparator == "function"
		) {
			const query_comparator_obj = non_special_kv as FxSqlQuerySql.DetailedQueryWhereCondition

			op = query_comparator_obj.sql_comparator();
			const normalized_cond = query_comparator_obj as FxSqlQuerySql.DetailedQueryWhereCondition

			switch (op) {
				case "between":
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" BETWEEN " +
						Dialect.escapeVal(normalized_cond.from, opts.timezone) +
						" AND " +
						Dialect.escapeVal(normalized_cond.to, opts.timezone)
					);
					break;
				case "not_between":
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" NOT BETWEEN " +
						Dialect.escapeVal(normalized_cond.from, opts.timezone) +
						" AND " +
						Dialect.escapeVal(normalized_cond.to, opts.timezone)
					);
					break;
				case "like":
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" LIKE " +
						Dialect.escapeVal(normalized_cond.expr, opts.timezone)
					);
					break;
				case "not_like":
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" NOT LIKE " +
						Dialect.escapeVal(normalized_cond.expr, opts.timezone)
					);
					break;
				case "eq":
				case "ne":
				case "gt":
				case "gte":
				case "lt":
				case "lte":
				case "not_in":
					switch (op) {
						case "eq"  : op = (normalized_cond.val === null ? "IS" : "="); break;
						case "ne"  : op = (normalized_cond.val === null ? "IS NOT" : "<>"); break;
						case "gt"  : op = ">";  break;
						case "gte" : op = ">="; break;
						case "lt"  : op = "<";  break;
						case "lte" : op = "<="; break;
						case "not_in" : op = "NOT IN"; break;
					}
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" " + op + " " +
						Dialect.escapeVal(normalized_cond.val, opts.timezone)
					);
					break;
				case "sql":
					if (typeof normalized_cond.where == "object") {
						var sql = normalized_cond.where.str.replace("?:column", buildComparisonKey(Dialect, where.t, k));

						sql = sql.replace(/\?:(id|value)/g, function (m) {
							if (normalized_cond.where.escapes.length === 0) {
								return '';
							}

							if (m == "?:id") {
								return Dialect.escapeId(normalized_cond.where.escapes.shift());
							}
							// ?:value
							return Dialect.escapeVal(normalized_cond.where.escapes.shift(), opts.timezone);
						});

						query.push(sql);
					}
					break;
			}
			continue;
		}

		if (k == '__sql') {
			const puresql_kv = where.w[k] as FxSqlQuerySubQuery.UnderscoreSqlInput
			for (var a = 0; a < puresql_kv.length; a++) {
				query.push(normalizeSqlConditions(Dialect, puresql_kv[a]));
			}
		} else {
			if (Array.isArray(where.w[k])) {
				const arr_item_kv = where.w[k] as any
				if (arr_item_kv.length === 0) {
					// #274: IN with empty arrays should be a false sentence
					query.push("FALSE");
				} else {
					query.push(buildComparisonKey(Dialect, where.t, k) + " IN " + Dialect.escapeVal(arr_item_kv, opts.timezone));
				}
			} else {
				const normal_kv = where.w[k] as any
				query.push(buildComparisonKey(Dialect, where.t, k) + " = " + Dialect.escapeVal(normal_kv, opts.timezone));
			}
		}
	}

	if (query.length === 0) {
		return false;
	}

	return query.join(" AND ");
}

function buildComparisonKey(Dialect: FxSqlQueryDialect.Dialect, table: string, column: string) {
	return (table ? Dialect.escapeId(table, column) : Dialect.escapeId(column));
}

function normalizeSqlConditions(Dialect: FxSqlQueryDialect.Dialect, queryArray: FxSqlQuerySql.SqlAssignmentTuple) {
	if (queryArray.length == 1) {
		return queryArray[0];
	}
	return Helpers.escapeQuery(Dialect, queryArray[0], queryArray[1]);
}
