declare namespace FxSqlQuerySubQuery {
	interface SubQueryBuildDescriptor {
		// table name or its alias name
		t: string
		// where conditions
		/**
		 * there may be 3 kinds of normalized key-value:
		 * - FxSqlQueryComparator.SubQueryInput[]
		 * - FxSqlQueryComparator.InputValueType
		 * - FxSqlQueryComparator.QueryComparatorObject
		 */
		w: {
			[k: string]: FxSqlQueryComparator.SubQueryInput[] | FxSqlQueryComparator.InputValueType | FxSqlQueryComparator.QueryComparatorObject | UnderscoreSqlInput
		}
		// exists query info
		e?: FxSqlQuerySql.QueryWhereExtendItem
	}

	type SubQueryConditions = SubQueryBuildDescriptor['w']

	// {'__sql': [..., ?[...]]}
	type UnderscoreSqlInput = [FxSqlQuerySql.SqlAssignmentTuple]
	type NonConjunctionInputValue = FxSqlQueryComparator.InputValueType | FxSqlQueryComparator.QueryComparatorObject | UnderscoreSqlInput

	type WhereExistsTuple_Flatten = [
		// ['table1', {col1: 'v1'}, 'table2', {col2: Query.gte('v2')}]
		string, FxSqlQueryComparator.SubQueryInput, string, FxSqlQueryComparator.SubQueryInput
	]

	// only for sample
	interface ConjunctionInput__Sample {
		or?: FxSqlQueryComparator.SubQueryInput[]
		and?: FxSqlQueryComparator.SubQueryInput[]
		not_or?: FxSqlQueryComparator.SubQueryInput[]
		not_and?: FxSqlQueryComparator.SubQueryInput[]
		not?: FxSqlQueryComparator.SubQueryInput[]
	}
	// only for sample
	interface NonConjunctionInput__Sample {
		[k: string]: FxSqlQueryComparator.InputValueType
	}
}
