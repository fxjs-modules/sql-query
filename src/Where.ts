/// <reference path="../@types/index.d.ts" />

import Knex = require('knex')
import Helpers = require('./Helpers');
import ComparatorsHash = require('./Comparators');

export function build (
	knexQueryBuilder: Knex.QueryBuilder,
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
		subquery = buildOrGroup(knexQueryBuilder, Dialect, whereList[i], opts);

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

type SelectedWhereOperator =
	'where'
	| 'andWhere'
	| 'orWhere'
	| 'whereNot'
	| 'andWhereNot'
	| 'orWhereNot'
	| 'whereRaw'
	| 'orWhereRaw'
	| 'andWhereRaw'
	| 'whereWrapped'
	| 'havingWrapped'
	| 'whereExists'
	| 'orWhereExists'
	| 'whereNotExists'
	| 'orWhereNotExists'
	| 'whereIn'
	| 'orWhereIn'
	| 'whereNotIn'
	| 'orWhereNotIn'
	| 'whereNull'
	| 'orWhereNull'
	| 'whereNotNull'
	| 'orWhereNotNull'
	| 'whereBetween'
	| 'orWhereBetween'
	| 'andWhereBetween'
	| 'whereNotBetween'
	| 'orWhereNotBetween'
	| 'andWhereNotBetween'

function buildOrGroup(
	knexQueryBuilder: Knex.QueryBuilder,
	Dialect: FxSqlQueryDialect.Dialect,
	where: FxSqlQuerySubQuery.SubQueryBuildDescriptor,
	opts: FxSqlQuery.ChainBuilderOptions,
	innerConjuncWord?: FxSqlQueryComparator.QueryConjunctionWord
): FxSqlQuerySql.SqlFragmentStr[] | FxSqlQuerySql.SqlResultStr | false {
	opts = opts || {};

	if (where.exists) {
		return buildExistsSqlFragments(knexQueryBuilder, Dialect, where, opts)
	}

	let query: string[] = [],
		op: FxSqlQueryComparator.QueryComparatorType,
		transformed_result_op: string = op;

	console.log(
		'where.wheres', where.wheres, '\n',
		'innerConjuncWord', innerConjuncWord, '\n',
	);

	const isInnerNotAnd = innerConjuncWord === 'not' || innerConjuncWord === 'not_and';
	const isInnerNotOr = innerConjuncWord === 'not_or';
	const isInnerOr = innerConjuncWord === 'or';
	const isInnerNot = innerConjuncWord === 'not';

	for (let k in where.wheres) {
		let where_conditem_value = where.wheres[k];
		if (where_conditem_value === null || where_conditem_value === undefined) {
			query.push(
				buildComparisonKey(Dialect, where.table, k) +
				" IS NULL"
			);

			// ? in subquery
			knexQueryBuilder.whereNull(k);
			continue;
		}
		// `not` is an alias for `not_and`
		if (isConjunctionWhereConditionInput(k, where_conditem_value)) {
			let q;
			const subquery = [];
			const conjunctionWord = (k.toLocaleLowerCase() as FxSqlQueryComparator.QueryConjunctionWord);
			const prefix = (k == "not" || isKeyConjunctionNot(k) ? "NOT " : false);

			/**
			 * @values FxSqlQueryComparator.QueryConjunctionWord
			 */
			transformed_result_op = (k == "not" ? "and" : (isKeyConjunctionNot(k) ? k.substr(NOT_PREFIX_LEN) : k)).toUpperCase();

			const queryInput = where_conditem_value as FxSqlQueryComparator.SubQueryInput[]

			console.log('conjunctionWord', conjunctionWord);

			// const subBuilder = function (self: Knex.QueryBuilder) {
			// 	for (let j = 0; j < queryInput.length; j++) {
			// 		const conj_c = queryInput[j]

			// 		q = buildOrGroup(
			// 			self,
			// 			Dialect,
			// 			{ table: where.table, wheres: conj_c },
			// 			opts,
			// 			conjunctionWord
			// 		);
			// 		if (q !== false) {
			// 			subquery.push(q);
			// 		}
			// 	}
			// }

			// switch (conjunctionWord) {
			// 	case 'not_and':
			// 		knexQueryBuilder.andWhereNot(function () { subBuilder(this) })
			// 		break
			// 	case 'not_or':
			// 		knexQueryBuilder.orWhereNot(function () { subBuilder(this) })
			// 		break
			// 	case 'and':
			// 		knexQueryBuilder.andWhere(function () { subBuilder(this) })
			// 		break
			// 	case 'or':
			// 		knexQueryBuilder.orWhere(function () { subBuilder(this) })
			// 		break
			// 	case 'not':
			// 		knexQueryBuilder.whereNot(function () { subBuilder(this) })
			// 		break
			// }

			for (let j = 0; j < where_conditem_value.length; j++) {
				const conj_c = where_conditem_value[j]

				q = buildOrGroup(
					knexQueryBuilder,
					Dialect,
					{ table: where.table, wheres: conj_c },
					opts,
					conjunctionWord
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

		let non_conj_where_conditem_value: FxSqlQuerySubQuery.NonConjunctionInputValue
			= transformSqlComparatorLiteralObject(where_conditem_value, k, where.wheres) || where_conditem_value;

		console.log(
			'non_conj_where_conditem_value',
			isSqlComparatorPayload(non_conj_where_conditem_value),
			non_conj_where_conditem_value
		);

		const selectWhereOperatorByCtx = function (
			suffix?: 'null' | 'between' | 'notBetween'
		): SelectedWhereOperator
		 {
			let whereOperator = 'where'
			switch (innerConjuncWord) {
				case 'not_and':
					whereOperator = 'andWhereNot'
					break
				case 'not':
					whereOperator = 'whereNot'
					break
				case 'and':
					whereOperator = 'where'
					break
				case 'or':
					whereOperator = 'orWhere'
					break
				case 'not_or':
					whereOperator = 'orWhereNot'
					break
				default:
					break
			}

			if (suffix)
				whereOperator = `${whereOperator}${Helpers.ucfirst(suffix)}`

			return whereOperator as SelectedWhereOperator
		}

		if (isSqlComparatorPayload(non_conj_where_conditem_value)) {
			op = non_conj_where_conditem_value.sql_comparator();

			switch (op) {
				case "between":
					query.push(
						buildComparisonKey(Dialect, where.table, k) +
						" BETWEEN " +
						Dialect.escapeVal(non_conj_where_conditem_value.from, opts.timezone) +
						" AND " +
						Dialect.escapeVal(non_conj_where_conditem_value.to, opts.timezone)
					);

					// #knexQueryBuilder
					// knexQueryBuilder.whereBetween(k, [non_conj_where_conditem_value.from, non_conj_where_conditem_value.to])
					knexQueryBuilder[selectWhereOperatorByCtx('between')].call(knexQueryBuilder, k, [non_conj_where_conditem_value.from, non_conj_where_conditem_value.to])
					break;
				case "not_between":
					query.push(
						buildComparisonKey(Dialect, where.table, k) +
						" NOT BETWEEN " +
						Dialect.escapeVal(non_conj_where_conditem_value.from, opts.timezone) +
						" AND " +
						Dialect.escapeVal(non_conj_where_conditem_value.to, opts.timezone)
					);

					// #knexQueryBuilder
					// knexQueryBuilder.whereNotBetween(k, [non_conj_where_conditem_value.from, non_conj_where_conditem_value.to])
					knexQueryBuilder[selectWhereOperatorByCtx('notBetween')].call(knexQueryBuilder, k, [non_conj_where_conditem_value.from, non_conj_where_conditem_value.to])
					break;
				case "like":
					query.push(
						buildComparisonKey(Dialect, where.table, k) +
						" LIKE " +
						Dialect.escapeVal(non_conj_where_conditem_value.expr, opts.timezone)
					);

					// #knexQueryBuilder
					// knexQueryBuilder.where(k, 'like', Dialect.escapeVal(non_conj_where_conditem_value.expr, opts.timezone))
					knexQueryBuilder[selectWhereOperatorByCtx()].call(knexQueryBuilder, k, 'like', Dialect.escapeVal(non_conj_where_conditem_value.expr, opts.timezone))
					break;
				case "not_like":
					query.push(
						buildComparisonKey(Dialect, where.table, k) +
						" NOT LIKE " +
						Dialect.escapeVal(non_conj_where_conditem_value.expr, opts.timezone)
					);

					// #knexQueryBuilder
					// knexQueryBuilder.where(k, 'not like', Dialect.escapeVal(non_conj_where_conditem_value.expr, opts.timezone))
					knexQueryBuilder[selectWhereOperatorByCtx()].call(knexQueryBuilder, k, 'like', Dialect.escapeVal(non_conj_where_conditem_value.expr, opts.timezone))
					break;
				case "eq":
				case "ne":
				case "gt":
				case "gte":
				case "lt":
				case "lte":
				case "in":
				case "not_in":
					switch (op) {
						case "eq"  : transformed_result_op = (non_conj_where_conditem_value.val === null ? "IS" : "="); break;
						case "ne"  : transformed_result_op = (non_conj_where_conditem_value.val === null ? "IS NOT" : "<>"); break;
						case "gt"  : transformed_result_op = ">";  break;
						case "gte" : transformed_result_op = ">="; break;
						case "lt"  : transformed_result_op = "<";  break;
						case "lte" : transformed_result_op = "<="; break;
						case "in"  : transformed_result_op = "IN"; break;
						case "not_in" : transformed_result_op = "NOT IN"; break;
					}

					if (!isInStyleOperator(op, non_conj_where_conditem_value)) {
						query.push(
							buildComparisonKey(Dialect, where.table, k) +
							" " + transformed_result_op + " " +
							Dialect.escapeVal(non_conj_where_conditem_value.val, opts.timezone)
						);

						// #knexQueryBuilder
						// knexQueryBuilder.where(k, transformed_result_op, Dialect.escapeVal(non_conj_where_conditem_value.val, opts.timezone))
						knexQueryBuilder[selectWhereOperatorByCtx()].call(knexQueryBuilder, k, transformed_result_op, Dialect.escapeVal(non_conj_where_conditem_value.val, opts.timezone))
					} else {
						const op = transformed_result_op as FxSqlQueryComparator.NormalizedInOperator
						processInStyleWhereConditionInput(non_conj_where_conditem_value.val, query, Dialect, where, k, opts, op);

						// #knexQueryBuilder
						// knexQueryBuilder.where(k, transformed_result_op, Dialect.escapeVal(non_conj_where_conditem_value.val, opts.timezone))
						knexQueryBuilder[selectWhereOperatorByCtx()].call(knexQueryBuilder, k, transformed_result_op, Dialect.escapeVal(non_conj_where_conditem_value.val, opts.timezone))
					}

					break;
			}
			continue;
		}

		if (isUnderscoreSqlInput(k, non_conj_where_conditem_value)) {
			for (let i = 0; i < non_conj_where_conditem_value.length; i++) {
				query.push(normalizeSqlConditions(Dialect, non_conj_where_conditem_value[i]));
			}
		} else {
			/**
			 * array as 'IN'
			 */
			if (Array.isArray(non_conj_where_conditem_value)) {
				processInStyleWhereConditionInput(
					non_conj_where_conditem_value,
					query,
					Dialect,
					where,
					k,
					opts,
					'IN'
				);

				// #knexQueryBuilder
				// knexQueryBuilder.where(k, transformed_result_op, Dialect.escapeVal(non_conj_where_conditem_value, opts.timezone))
				knexQueryBuilder[selectWhereOperatorByCtx()].call(knexQueryBuilder, k, transformed_result_op, Dialect.escapeVal(non_conj_where_conditem_value, opts.timezone))
			} else { // finally, simplest where-equal
				const normal_kv = non_conj_where_conditem_value as any
				query.push(buildComparisonKey(Dialect, where.table, k) + " = " + Dialect.escapeVal(normal_kv, opts.timezone));

				// #knexQueryBuilder
				// knexQueryBuilder.where(k, Dialect.escapeVal(normal_kv, opts.timezone))
				knexQueryBuilder[selectWhereOperatorByCtx()].call(knexQueryBuilder, k, Dialect.escapeVal(normal_kv, opts.timezone))
			}
		}
	}

	if (query.length === 0) {
		return false;
	}

	return query.join(" AND ");
}

function buildExistsSqlFragments (
	knexQueryBuilder: Knex.QueryBuilder,
	Dialect: FxSqlQueryDialect.Dialect,
	where: FxSqlQuerySubQuery.SubQueryBuildDescriptor,
	opts: FxSqlQuery.ChainBuilderOptions
) {
	/* start of deal with case `whereExists` */
	const whereList = [];
	const link_table = where.exists.table_linked;

	/**
	 * @example whereExists('table2', 'table1', [['fid1', 'fid2'], ['id1', 'id2']], { col1: 1, col2: 2 })
	 */
	if(Array.isArray(where.exists.link_info[0]) && Array.isArray(where.exists.link_info[1])) {
		const col_tuple_for_aligning_from = where.exists.link_info[0];
		const col_tuple_for_aligning_to = where.exists.link_info[1];
		for (let i = 0; i < col_tuple_for_aligning_from.length; i++) {
			whereList.push(Dialect.escapeId(col_tuple_for_aligning_from[i]) + " = " + Dialect.escapeId(link_table, col_tuple_for_aligning_to[i]));
		}
	} else {
		const [table_from, table_to] = where.exists.link_info
		/**
		 * @example whereExists('table2', 'table1', ['fid', 'id'], { col1: 1, col2: 2 })
		 */
		if (table_from && table_to)
			whereList.push(Dialect.escapeId(table_from) + " = " + Dialect.escapeId(link_table, table_to));
	}

	const exists_join_key = whereList.length ? " AND " : "";

	return [
		[
			"EXISTS (" +
			"SELECT * FROM " + Dialect.escapeId(where.exists.table) + " " +
			"WHERE " + whereList.join(" AND "),

			buildOrGroup(knexQueryBuilder, Dialect, { table: null, wheres: where.wheres }, opts) +
			")"
		].join(exists_join_key)
	];
	/* end of deal with case `whereExists` */
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

function isSqlComparatorPayload (
	non_special_kv: FxSqlQuerySubQuery.NonConjunctionInputValue
): non_special_kv is FxSqlQuerySql.DetailedQueryWhereCondition {
	if (typeof non_special_kv !== 'object') return false;
	if (! ('sql_comparator' in non_special_kv)) return false;

	return typeof non_special_kv.sql_comparator === "function"
}

function transformSqlComparatorLiteralObject (
	non_special_kv: FxSqlQuerySubQuery.NonConjunctionInputValue,
	payload_k: string,
	payload: FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres']
): false | FxSqlQueryComparator.QueryComparatorObject {
	if (typeof non_special_kv !== 'object') return false;

	const keys = Object.keys(non_special_kv) as [FxSqlQueryComparator.ComparatorNameType]
	const op: FxSqlQueryComparator.ComparatorNameType = keys.find(k => k in ComparatorsHash);

	if (!op)
		return false;

	const literal_kv = non_special_kv as FxSqlQueryComparator.QueryComparatorLiteralObject;
	const modifiers = literal_kv.modifiers = literal_kv.modifiers || {};

	const fn = ComparatorsHash[op] as FxSqlQueryComparator.ComparatorHash[FxSqlQueryComparator.ComparatorNameType]

	let input = literal_kv[op];
	// non in-style tuple op contains: `between`, `not_between`
	const is_in_style = ['not_in', 'in'].includes(op);
	const in_input_arr = Array.isArray(input);
	if (modifiers.is_date) {
		let to_filter = in_input_arr ? input : [input]
		const args_0 = (to_filter)
			.map((x: any) => new Date(x))
			.filter((x: Date) => x + '' !== 'Invalid Date')

		if (args_0.length === to_filter.length) {
			to_filter = args_0
			input = in_input_arr ? to_filter : to_filter[0]
		}
	}

	const apply_args = in_input_arr && !is_in_style ? input : [input];
	const result = fn.apply(null, apply_args);

	payload[payload_k] = result;
	return result;

	return false;
}

function isConjunctionWhereConditionInput (
	k: string,
	where_conditem_value: FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres'][string]
): where_conditem_value is FxSqlQuerySubQuery.ConjunctionInputValue {
	return WHERE_CONJUNCTIONS.indexOf(k) >= 0;
}

function isUnderscoreSqlInput (
	k: string,
	where_conditem_value: FxSqlQuerySubQuery.SubQueryBuildDescriptor['wheres'][string]
): where_conditem_value is FxSqlQuerySubQuery.UnderscoreSqlInput {
	return k === '__sql';
}

function isInStyleOperator (
	op: string,
	where_conditem_value: FxSqlQuerySql.DetailedQueryWhereCondition<any>
): where_conditem_value is FxSqlQuerySql.DetailedQueryWhereCondition__InStyle {
	return !!~['in', 'not_in'].indexOf(op);
}

function processInStyleWhereConditionInput (
	val_in_detailed_query_condition: FxSqlQuerySql.DetailedQueryWhereCondition__InStyle['val'], // FxSqlQueryComparator.InputValue_in['in'] | FxSqlQueryComparator.InputValue_not_in['not_in'],
	query: string[],
	Dialect: FxSqlQueryDialect.Dialect,
	where: FxSqlQuerySubQuery.SubQueryBuildDescriptor,
	k: string,
	opts: FxSqlQuery.ChainBuilderOptions,
	transformed_result_op: FxSqlQueryComparator.NormalizedInOperator
): void {
	if (val_in_detailed_query_condition.length === 0) {
		// #274: IN with empty arrays should be a false sentence
		query.push('FALSE');
	} else {
		query.push(
			`${buildComparisonKey(Dialect, where.table, k)} ${transformed_result_op} ${Dialect.escapeVal(val_in_detailed_query_condition, opts.timezone)}`
		);
	}
}
