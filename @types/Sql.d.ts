declare namespace FxSqlQuerySql {
	type ValuesToSet = (string|number)[]

	type SqlResultStr = string
	type SqlFragmentStr = string
	type SqlQueryStr = string

	type SqlEscapeArgType = string | number | boolean | Date | String | Number | RegExp | Symbol
	type SqlEscapeArgIdType = string | number

	type SqlAssignmentValues = SqlEscapeArgType[]
	type SqlAssignmentTuple = [FxSqlQuerySql.SqlFragmentStr, [...SqlAssignmentValues]?]

	type WhereObj = {
		str: string
		escapes: any[]
	}
	type WherePureEscapableSqlTuple = [SqlAssignmentTuple]

	interface QueryWhereCondition {
		sql_comparator: {
			(): FxSqlQuery.QueryComparatorType
		}
		// from table name
		from: string
		// target table name
		to: string
		expr: FxSqlQuery.QueryComparatorExprType
		val: any
		where: WhereObj
	}

	type ListOfQueryWhereConditionItemHash = QueryWhereConditionHash[]
	type NonSpecialQueryWhereConditionItem = QueryWhereCondition | WherePureEscapableSqlTuple
	interface NonSpecialQueryWhereConditionItemHash {
		[k: string]: NonSpecialQueryWhereConditionItem
	}
	
	type ComplextQueryWhereConditionUnit = ListOfQueryWhereConditionItemHash | NonSpecialQueryWhereConditionItem
	interface QueryWhereConditionHash {
		// infact, those [k] must be `NonSpecialQueryWhereConditionItem`, such as part of NonSpecialQueryWhereConditionItemHash
		[k: string]: ComplextQueryWhereConditionUnit

		or: ListOfQueryWhereConditionItemHash
		and: ListOfQueryWhereConditionItemHash
		not_or: ListOfQueryWhereConditionItemHash
		not_and: ListOfQueryWhereConditionItemHash
		not: ListOfQueryWhereConditionItemHash
		__sql: WherePureEscapableSqlTuple
	}

	type QueryWhereConditionInputArg = QueryWhereConditionHash | string

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

	type SqlColumnType = SqlColumnDescriptor[] | string[] | string | '*'

	interface SqlSelectFieldsDescriptor {
		// fun name
		f?: string
		// column name
		c: SqlColumnType
		// table alias
		a?: string
		// fun_stack
		s?: FxSqlQuery.SupportedAggregationFunction[]
		// pure sql
		sql?: string

		select?: string
		having?: string
	}

	interface SqlSelectFieldsGenerator {
		(dialect: FxSqlQueryDialect.Dialect): SqlSelectFieldsDescriptor
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
		j?: any[]
		// selected fields
		select?: SqlSelectFieldsType[]
		// from opts
		opts?: QueryFromDescriptorOpts
	}

	interface SqlWhereDescriptor {
		// table name
		t: string
		// where conditions
		w: QueryWhereConditionHash
		// exists query info
		e?: QueryWhereExtendItem
	}

	interface SqlOrderDescriptor {
		c: any
		d: any
	}
	type SqlOrderPayloadType = SqlOrderDescriptor | SqlFragmentStr

	type SqlGroupByType = string

	interface SqlFoundRowItem {
	}

	type SqlQueryDescriptorWhereItem = SqlWhereDescriptor | string

	interface SqlQueryChainDescriptor {
		from?: QueryFromDescriptor[]
		table?: string
		// values to set in UPDATE like command
		set?: ValuesToSet
		where?: SqlQueryDescriptorWhereItem[]
		order?: SqlOrderPayloadType[]
		offset?: number
		limit?: number

		found_rows?: SqlFoundRowItem[] | boolean
		group_by?: SqlGroupByType[]

		where_exists?: boolean
	}
}
