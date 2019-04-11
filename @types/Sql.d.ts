/// <reference path="Comparators.d.ts" />

declare namespace FxSqlQuerySql {
	// type ValueToSet = (string|number)
	type DataToSet = {
		[key: string]: any
	}

	type SqlResultStr = string
	type SqlFragmentStr = string
	type SqlQueryStr = string

	type SqlEscapeArgType = string | number | boolean | Date | String | Number | RegExp | Symbol
	type SqlEscapeArgIdType = string | number

	type SqlAssignmentValues = SqlEscapeArgType[]
	type SqlAssignmentTuple = [FxSqlQuerySql.SqlFragmentStr, [...SqlAssignmentValues]?]

	type SqlTableRaw = string
	type SqlTableAliasRaw = string
	type SqlTableTuple = [string, string]
	type SqlTableInputType = SqlTableRaw | SqlTableAliasRaw | SqlTableTuple

	type WhereObj = {
		str: string
		escapes: any[]
	}

	// ['f1', 'f2'] ---> (`t1.f1` = `t2.f2`)
	type WhereExistsLinkTuple_L1 = FxSqlQueryHelpler.BinaryTuple<string>
	// [['f1', 'f2'[, ...]], ['ff1', 'ff2'[, ...]]] ---> (`t1.f1` = `t2.f2`) AND (`t1.ff1` = `t2.ff2`) [...]
	type WhereExistsLinkTuple_L2 = FxSqlQueryHelpler.BinaryTuple<string[]>
	type WhereExistsLinkTuple = WhereExistsLinkTuple_L1 | WhereExistsLinkTuple_L2

	interface DetailedQueryWhereCondition<T = any> extends FxSqlQueryComparator.QueryComparatorObject<T> {
		// from table name
		from: string
		// target table name
		to: string
		expr: FxSqlQueryComparator.QueryComparatorExprType
		val: T
		where: WhereObj
	}
	type DetailedQueryWhereCondition__InStyle = DetailedQueryWhereCondition<
		FxSqlQueryComparator.InputValue_in['in'] | FxSqlQueryComparator.InputValue_not_in['not_in']
	>

	interface QueryWhereConjunctionHash {
		or?: FxSqlQueryComparator.Input[]
		and?: FxSqlQueryComparator.Input[]
		not_or?: FxSqlQueryComparator.Input[]
		not_and?: FxSqlQueryComparator.Input[]
		not?: FxSqlQueryComparator.Input[]
	}

	interface QueryWhereExtendItem {
		// table
		table: string
		// link
		link_info: FxSqlQueryHelpler.Arraiable<any>
		// table linked
		table_linked: string
	}

	type SqlColumnDescriptorDataType = any
	interface SqlColumnDescriptor {
		data: SqlColumnDescriptorDataType,
		type? (): string
	}

	type NormalizedSimpleSqlColumnType = string | '*'
	type SqlColumnType = (SqlColumnDescriptor|string)[] | NormalizedSimpleSqlColumnType

	// item to describe what columns to select
	interface SqlSelectFieldItemDescriptor {
		// fun name
		func_name?: string
		// column name
		column_name?: SqlColumnType
		// column as
		as?: FxSqlQuerySql.NormalizedSimpleSqlColumnType,
		a?: SqlSelectFieldItemDescriptor['as'],
		// fun_stack
		func_stack?: FxSqlQuery.SupportedAggregationFunction[]
		// pure sql
		sql?: string

		// GUESS: useful when this object refer to one complex descriptor?
		select?: string
		// having sub query statement
		having?: string
	}
	// @deprecated, use `SqlSelectFieldItemDescriptor` instead
	type SqlSelectFieldsDescriptor = SqlSelectFieldItemDescriptor

	interface SqlSelectFieldsGenerator {
		(dialect: FxSqlQueryDialect.Dialect): string
	}
	type SqlSelectFieldsType = SqlFragmentStr | SqlSelectFieldItemDescriptor | SqlSelectFieldsGenerator

	interface QueryFromDescriptorOpts {
		joinType: string
	}

	interface QueryFromDescriptor {
		// table
		table: string
		// table alias
		alias: string, a?: string
		// ?
		joins?: QueryFromJoinTupleDescriptor[]
		// selected fields
		select?: SqlSelectFieldsType[]
		// from opts
		opts?: QueryFromDescriptorOpts
	}

	type QueryFromJoinTupleDescriptor = [
		// from id column name
		string,
		// to table alias name
		string,
		// to id column name
		string,
	]

	type SqlTableOrderTuple = [
		// table(alias) name
		string,
		// column name
		string
	]
	interface SqlOrderDescriptor {
		// column name or SqlTableOrderTuple
		c: string | SqlTableOrderTuple
		// order
		d: 'DESC' | 'ASC'
	}
	type SqlOrderPayloadType = SqlOrderDescriptor | FxSqlQuery.OrderSqlStyleTuple[0]

	type SqlGroupByType = string

	interface SqlFoundRowItem {
		[k: string]: any
	}

	// type SqlQueryDescriptorWhereItem = SqlWhereDescriptor | string

	interface SqlQueryChainDescriptor {
		from?: QueryFromDescriptor[]
		table?: string
		// values to set in UPDATE like command
		set?: DataToSet
		where?: FxSqlQuerySubQuery.SubQueryBuildDescriptor[]
		order?: SqlOrderPayloadType[]
		offset?: number
		limit?: number

		found_rows?: SqlFoundRowItem[] | boolean
		group_by?: SqlGroupByType[]

		where_exists?: boolean
	}
}
