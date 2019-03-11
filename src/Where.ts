/// <reference path="../@types/index.d.ts" />

import Helpers = require('./Helpers');
import ComparatorsHash = require('./Comparators');

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

	for (let i = 0; i < whereList.length; i++) {
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
const NOT_PREFIX_LEN = 'not_'.length;

function isKeyConjunctionNot (k: string) {
	return k.indexOf("_") >= 0
}

function buildOrGroup(
	Dialect: FxSqlQueryDialect.Dialect,
	where: FxSqlQuerySubQuery.SubQueryBuildDescriptor,
	opts: FxSqlQuery.ChainBuilderOptions
): FxSqlQuerySql.SqlFragmentStr[] | FxSqlQuerySql.SqlResultStr | false {
	opts = opts || {};

	if (where.e) {
	/* start of deal with case `whereExists` */
		const whereList = [];
		const link_table = where.e.tl;

		/**
		 * @example whereExists('table2', 'table1', [['fid1', 'fid2'], ['id1', 'id2']], { col1: 1, col2: 2 })
		 */
		if(Array.isArray(where.e.l[0]) && Array.isArray(where.e.l[1])) {
			const col_tuple_for_aligning_from = where.e.l[0];
			const col_tuple_for_aligning_to = where.e.l[1];
			for (let i = 0; i < col_tuple_for_aligning_from.length; i++) {
				whereList.push(Dialect.escapeId(col_tuple_for_aligning_from[i]) + " = " + Dialect.escapeId(link_table, col_tuple_for_aligning_to[i]));
			}
		} else {
			const [table_from, table_to] = where.e.l
			/**
			 * @example whereExists('table2', 'table1', ['fid', 'id'], { col1: 1, col2: 2 })
			 */
			whereList.push(Dialect.escapeId(table_from) + " = " + Dialect.escapeId(link_table, table_to));
		}

		return [
			"EXISTS (" +
			"SELECT * FROM " + Dialect.escapeId(where.e.t) + " " +
			"WHERE " + whereList.join(" AND ") + " " +
			"AND " + buildOrGroup(Dialect, { t: null, w: where.w }, opts) +
			")"
		];
	/* end of deal with case `whereExists` */
	}

	let query = [],
		op: FxSqlQueryComparator.QueryComparatorType,
		transformed_result_op: string = op;

	for (let k in where.w) {
		let where_conditem_value = where.w[k];
		if (where_conditem_value === null || where_conditem_value === undefined) {
			query.push(
				buildComparisonKey(Dialect, where.t, k) +
				" IS NULL"
			);
			continue;
		}
		// `not` is an alias for `not_and`
		if (isConjunctionWhereConditionInput(k, where_conditem_value)) {
			let q;
			const subquery = [];
			const prefix = (k == "not" || isKeyConjunctionNot(k) ? "NOT " : false);

			transformed_result_op = (k == "not" ? "and" : (isKeyConjunctionNot(k) ? k.substr(NOT_PREFIX_LEN) : k)).toUpperCase();

			for (let j = 0; j < where_conditem_value.length; j++) {
				const conj_c = where_conditem_value[j]
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
				query.push((prefix ? prefix : "") + "((" + subquery.join(") " + transformed_result_op + " (") + "))");
			}
			continue;
		}

		let non_conjunction_where_conditem_value: FxSqlQuerySubQuery.NonConjunctionInputValue
			= transformSqlComparatorLiteralObject(where_conditem_value, k, where.w) || where_conditem_value;

		if (isSqlComparatorPayload(non_conjunction_where_conditem_value)) {
			const query_comparator_obj = non_conjunction_where_conditem_value as FxSqlQuerySql.DetailedQueryWhereCondition

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
						case "eq"  : transformed_result_op = (normalized_cond.val === null ? "IS" : "="); break;
						case "ne"  : transformed_result_op = (normalized_cond.val === null ? "IS NOT" : "<>"); break;
						case "gt"  : transformed_result_op = ">";  break;
						case "gte" : transformed_result_op = ">="; break;
						case "lt"  : transformed_result_op = "<";  break;
						case "lte" : transformed_result_op = "<="; break;
						case "not_in" : transformed_result_op = "NOT IN"; break;
					}
					query.push(
						buildComparisonKey(Dialect, where.t, k) +
						" " + transformed_result_op + " " +
						Dialect.escapeVal(normalized_cond.val, opts.timezone)
					);
					break;
				// case "sql":
				// 	if (typeof normalized_cond.where == "object") {
				// 		var sql = normalized_cond.where.str.replace("?:column", buildComparisonKey(Dialect, where.t, k));

				// 		sql = sql.replace(/\?:(id|value)/g, function (m) {
				// 			if (normalized_cond.where.escapes.length === 0) {
				// 				return '';
				// 			}

				// 			if (m == "?:id") {
				// 				return Dialect.escapeId(normalized_cond.where.escapes.shift());
				// 			}
				// 			// ?:value
				// 			return Dialect.escapeVal(normalized_cond.where.escapes.shift(), opts.timezone);
				// 		});

				// 		query.push(sql);
				// 	}
				// 	break;
			}
			continue;
		}

		if (isUnderscoreSqlInput(k, non_conjunction_where_conditem_value)) {
			for (let i = 0; i < non_conjunction_where_conditem_value.length; i++) {
				query.push(normalizeSqlConditions(Dialect, non_conjunction_where_conditem_value[i]));
			}
		} else {
			/**
			 * array as 'IN'
			 */
			if (Array.isArray(non_conjunction_where_conditem_value)) {
				const arr_item_kv = non_conjunction_where_conditem_value as any
				if (arr_item_kv.length === 0) {
					// #274: IN with empty arrays should be a false sentence
					query.push("FALSE");
				} else {
					query.push(buildComparisonKey(Dialect, where.t, k) + " IN " + Dialect.escapeVal(arr_item_kv, opts.timezone));
				}
			} else {
				const normal_kv = non_conjunction_where_conditem_value as any
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

function isSqlComparatorPayload (non_special_kv: FxSqlQuerySubQuery.NonConjunctionInputValue) {
	if (typeof non_special_kv !== 'object') return false;
	if (! ('sql_comparator' in non_special_kv)) return false;

	return typeof non_special_kv.sql_comparator === "function"
}

function transformSqlComparatorLiteralObject (
	non_special_kv: FxSqlQuerySubQuery.NonConjunctionInputValue,
	payload_k: string,
	payload: FxSqlQuerySubQuery.SubQueryBuildDescriptor['w']
): false | FxSqlQueryComparator.QueryComparatorObject {
	if (typeof non_special_kv !== 'object') return false;

	const keys = Object.keys(non_special_kv) as [FxSqlQueryComparator.ComparatorNameType]
	if (keys.length !== 1) return false

	const [op] = keys;
	const literal_kv = non_special_kv as FxSqlQueryComparator.QueryComparatorLiteralObject;

	if (op in ComparatorsHash) {
		const fn = ComparatorsHash[op] as FxSqlQueryComparator.ComparatorHash[FxSqlQueryComparator.ComparatorNameType]
		const input = literal_kv[op];
		const args = Array.isArray(input) ? input : [input];
		const result = fn.apply(null, args);
		payload[payload_k] = result;
		return result;
	}

	return false;
}

function isConjunctionWhereConditionInput (
	k: string,
	where_conditem_value: FxSqlQuerySubQuery.SubQueryBuildDescriptor['w'][string]
): where_conditem_value is FxSqlQuerySubQuery.ConjunctionInputValue {
	return WHERE_CONJUNCTIONS.indexOf(k) >= 0;
}

function isUnderscoreSqlInput (
	k: string,
	where_conditem_value: FxSqlQuerySubQuery.SubQueryBuildDescriptor['w'][string]
): where_conditem_value is FxSqlQuerySubQuery.UnderscoreSqlInput {
	return k === '__sql';
}
