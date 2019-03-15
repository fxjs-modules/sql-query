declare namespace FxSqlQueryComparator {
	type IdType = string | number
	type SimpleEqValueType = string | number | boolean | Date
	type NormalizedInOperator = 'in' | 'not_in' | 'IN' | 'NOT_IN'

    type InputValue_eq = { "eq": SimpleEqValueType }
    type InputValue_ne = { "ne": SimpleEqValueType }
    type InputValue_gt = { "gt": number }
    type InputValue_gte = { "gte": number }
    type InputValue_lt = { "lt": number }
    type InputValue_lte = { "lte": number }
    type InputValue_like = { "like": string }
    type InputValue_not_like = { "not_like": string }
    type InputValue_between = { "between": [number, number] }
    type InputValue_not_between = { "not_between": [number, number] }

    type InputValue_in = { "in": IdType[] }
	type InputValue_not_in = { "not_in": IdType[] }

	type InputComparatorObjectValue =
		InputValue_eq
		| InputValue_ne
		| InputValue_gt
		| InputValue_gte
		| InputValue_lt
		| InputValue_lte
		| InputValue_like
		| InputValue_not_like
		| InputValue_between
		| InputValue_not_between
		| InputValue_in
		| InputValue_not_in

	type InputValueType =
		SimpleEqValueType | InputComparatorObjectValue

	interface SubQueryComparatorInput {
		[k: string]: FxSqlQueryComparator.QueryComparatorObject
	}

	// compatible
	interface SubQuerySimpleEqInput {
		[k: string]: SimpleEqValueType
	}

	interface SubQueryInput {
		[k: string]: FxSqlQueryComparator.QueryComparatorObject | SimpleEqValueType
	}

	interface Input {
		[key: string]: InputValueType
	}

	type QueryComparatorExprType = string
	type QueryComparatorObject<T = any> = {
		sql_comparator: {
			(): ComparatorNames
		}
		// value
		val?: T
		// expression regular
		expr?: QueryComparatorExprType
		// from field
		from?: string
		// to field
		to?: string
	}

	interface QueryComparatorLiteralObject {
		between: any | any[]
		not_between: any | any[]
		like: any | any[]
		not_like: any | any[]
		eq: any | any[]
		ne: any | any[]
		gt: any | any[]
		gte: any | any[]
		lt: any | any[]
		lte: any | any[]
		in: any | any[]
		not_in: any | any[]
	}

	type ComparatorHash = {
		between: FxSqlQueryComparatorFunction.between
		not_between: FxSqlQueryComparatorFunction.not_between
		like: FxSqlQueryComparatorFunction.like
		not_like: FxSqlQueryComparatorFunction.not_like
		eq: FxSqlQueryComparatorFunction.eq
		ne: FxSqlQueryComparatorFunction.ne
		gt: FxSqlQueryComparatorFunction.gt
		gte: FxSqlQueryComparatorFunction.gte
		lt: FxSqlQueryComparatorFunction.lt
		lte: FxSqlQueryComparatorFunction.lte
		in: FxSqlQueryComparatorFunction.not_in
		not_in: FxSqlQueryComparatorFunction.not_in
	}

	type ComparatorNameType = keyof ComparatorHash
	// just compatible
	type ComparatorNames = ComparatorNameType

	type QueryComparatorType =
		ComparatorNameType
		| 'sql'
}

declare namespace FxSqlQueryComparatorFunction {
	interface between {
		(a: string, b: string): FxSqlQueryComparator.QueryComparatorObject
	}
	interface not_between {
		(a: string, b: string): FxSqlQueryComparator.QueryComparatorObject
	}
	interface like {
		(expr: FxSqlQueryComparator.QueryComparatorExprType): FxSqlQueryComparator.QueryComparatorObject
	}
	interface not_like {
		(expr: FxSqlQueryComparator.QueryComparatorExprType): FxSqlQueryComparator.QueryComparatorObject
	}
	interface eq {
		(v: any): FxSqlQueryComparator.QueryComparatorObject
	}
	interface ne {
		(v: any): FxSqlQueryComparator.QueryComparatorObject
	}
	interface gt {
		(v: any): FxSqlQueryComparator.QueryComparatorObject
	}
	interface gte {
		(v: any): FxSqlQueryComparator.QueryComparatorObject
	}
	interface lt {
		(v: any): FxSqlQueryComparator.QueryComparatorObject
	}
	interface lte {
		(v: any): FxSqlQueryComparator.QueryComparatorObject
	}
	interface not_in {
		(v: any): FxSqlQueryComparator.QueryComparatorObject
	}
}
