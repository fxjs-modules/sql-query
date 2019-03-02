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

	interface DetailedQueryWhereCondition extends FxSqlQueryComparator.QueryComparatorObject {
		// from table name
		from: string
		// target table name
		to: string
		expr: FxSqlQueryComparator.QueryComparatorExprType
		val: any
		where: WhereObj
	}

	interface QueryWhereConjunctionHash {
		or?: FxSqlQueryComparator.Input[]
		and?: FxSqlQueryComparator.Input[]
		not_or?: FxSqlQueryComparator.Input[]
		not_and?: FxSqlQueryComparator.Input[]
		not?: FxSqlQueryComparator.Input[]
	}

	interface QueryWhereExtendItem {
		// table
		t: string
		// link
		l: FxSqlQueryHelpler.Arraiable<any>
		// table linked
		tl: string
	}

	interface SqlColumnDescriptor {
		data: any,
		type?: {
			(): string
		}
	}

	type NormalizedSimpleSqlColumnType = string | '*'
	type SqlColumnType = SqlColumnDescriptor[] | string[] | NormalizedSimpleSqlColumnType

	interface SqlSelectFieldsDescriptor {
		// fun name
		f?: string
		// column name
		c?: SqlColumnType
		// table alias
		alias?: string
		// args to describe what columns to select
		a?: FxSqlQuerySql.SqlColumnType
		// fun_stack
		s?: FxSqlQuery.SupportedAggregationFunction[]
		// pure sql
		sql?: string

		select?: string
		having?: string
	}

	interface SqlSelectFieldsGenerator {
		(dialect: FxSqlQueryDialect.Dialect): string
	}
	type SqlSelectFieldsType = SqlSelectFieldsDescriptor | SqlSelectFieldsGenerator

	interface QueryFromDescriptorOpts {
		joinType: string
	}

	interface QueryFromDescriptor {
		// table
		t: string
		// table alias
		a: string
		// ?
		j?: QueryFromJoinTupleDescriptor[]
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
		// from id column name
		string,
	]

	interface SqlOrderDescriptor {
		c: any
		d: any
	}
	type SqlOrderPayloadType = SqlOrderDescriptor | SqlFragmentStr

	type SqlGroupByType = string

	interface SqlFoundRowItem {
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
