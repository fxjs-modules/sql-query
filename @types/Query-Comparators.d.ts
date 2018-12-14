declare namespace FxSqlQuery {
	type QueryComparatorType =
		string
		| 'between'
		| 'not_between'
		| 'like'
		| 'not_like'
		| 'eq'
		| 'ne'
		| 'gt'
		| 'gte'
		| 'lt'
		| 'lte'
		| 'not_in'
		| 'sql'

	type QueryComparatorExprType = string | RegExp
	type QueryComparatorObject = {
		// value
		val?: any
		// expression regular
		expr?: QueryComparatorExprType
		// from field
		from?: string
		// to field
		to?: string
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
		not_in: FxSqlQueryComparatorFunction.not_in
	}

	type ComparatorNames = keyof ComparatorHash
}

declare namespace FxSqlQueryComparatorFunction {
	interface between {
		(a: string, b: string): FxSqlQuery.QueryComparatorObject
	}
	interface not_between {
		(a: string, b: string): FxSqlQuery.QueryComparatorObject
	}
	interface like {
		(expr: FxSqlQuery.QueryComparatorExprType): FxSqlQuery.QueryComparatorObject
	}
	interface not_like {
		(expr: FxSqlQuery.QueryComparatorExprType): FxSqlQuery.QueryComparatorObject
	}
	interface eq {
		(v: any): FxSqlQuery.QueryComparatorObject
	}
	interface ne {
		(v: any): FxSqlQuery.QueryComparatorObject
	}
	interface gt {
		(v: any): FxSqlQuery.QueryComparatorObject
	}
	interface gte {
		(v: any): FxSqlQuery.QueryComparatorObject
	}
	interface lt {
		(v: any): FxSqlQuery.QueryComparatorObject
	}
	interface lte {
		(v: any): FxSqlQuery.QueryComparatorObject
	}
	interface not_in {
		(v: any): FxSqlQuery.QueryComparatorObject
	}
}