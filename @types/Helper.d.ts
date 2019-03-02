/// <reference path="Query.d.ts" />
declare namespace FxSqlQueryHelpler {
	type Arraiable<T> = T | T[]
	type BinaryTuple<T1, T2=T1> = [T1, T2]

	interface HelperModule {
		escapeQuery (
			Dialect: FxSqlQueryDialect.Dialect,
			query: FxSqlQuerySql.SqlFragmentStr,
			args: FxSqlQuerySql.SqlAssignmentValues
		): FxSqlQuerySql.SqlFragmentStr
		dateToString ( date: number|Date, timeZone: FxSqlQuery.FxSqlQueryTimezone, opts: FxSqlQuery.ChainBuilderOptions ): string
		zeroPad ( number: string|number, n?: number ): string
		// convertTimezone: {
		// 	(tz: FxSqlQuery.FxSqlQueryTimezone ): false | number
		// }
		get_table_alias ( sql: FxSqlQuerySql.SqlQueryChainDescriptor, table: string ): string
		parseTableInputStr ( table_name: FxSqlQuerySql.SqlTableInputType ): FxSqlQuerySql.SqlTableTuple

		DialectTypes: FxSqlQueryDialect.DialectType[]
	}
}
