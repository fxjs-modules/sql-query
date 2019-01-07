declare namespace FxSqlQuerySubQuery {
	interface SubQueryBuildDescriptor {
		// table name
		t: string
		// where conditions
		/**
		 * there may be 3 kinds of normalized key-value:
		 * - FxSqlQueryComparator.SubQuerySimpleEqInput[]
		 * - FxSqlQueryComparator.InputValueType
		 * - FxSqlQueryComparator.QueryComparatorObject
		 */
		w: {
			[k: string]: FxSqlQueryComparator.SubQuerySimpleEqInput[] | FxSqlQueryComparator.InputValueType | FxSqlQueryComparator.QueryComparatorObject | UnderscoreSqlInput
		}
		// exists query info
		e?: FxSqlQuerySql.QueryWhereExtendItem
	}

	type SubQueryConditions = SubQueryBuildDescriptor['w']

	// {'__sql': [..., ?[...]]}
	type UnderscoreSqlInput = [FxSqlQuerySql.SqlAssignmentTuple]
	type NonConjunctionInputValue = FxSqlQueryComparator.InputValueType | FxSqlQueryComparator.QueryComparatorObject | UnderscoreSqlInput

	type WhereExistsTuple_Flatten = [
		// ['table1', {col1: 'v1'}, 'table2', {col2: 'v2'}]
		string, FxSqlQueryComparator.SubQuerySimpleEqInput, string, FxSqlQueryComparator.SubQuerySimpleEqInput
	]

	// only for sample
	interface ConjunctionInput__Sample {
		or?: FxSqlQueryComparator.SubQuerySimpleEqInput[]
		and?: FxSqlQueryComparator.SubQuerySimpleEqInput[]
		not_or?: FxSqlQueryComparator.SubQuerySimpleEqInput[]
		not_and?: FxSqlQueryComparator.SubQuerySimpleEqInput[]
		not?: FxSqlQueryComparator.SubQuerySimpleEqInput[]
	}
	// only for sample
	interface NonConjunctionInput__Sample {
		[k: string]: FxSqlQueryComparator.InputValueType
	}
}
