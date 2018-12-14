/// <reference path="Sql.d.ts" />

declare namespace FxSqlQueryDialect {
	type DialectType = 'mysql' | 'mssql' | 'sqlite'

	interface DataTypesDescriptorBase {
		id: string
		int: string
		float: string
		bool: string
		text: string
	}

	type DialectFieldType = keyof DataTypesDescriptorBase
	
	interface DataTypesDescriptor extends DataTypesDescriptorBase {
		isSQLITE?: boolean
	}

	interface fn_escape {
		(
			query: FxSqlQuerySql.SqlFragmentStr,
			args: FxSqlQuerySql.SqlAssignmentValues
		): string
	}

	interface fn_escapeId {
		(...els: FxSqlQuerySql.SqlEscapeArgIdType[]): string
	}

	interface fn_escapeVal {
		(val: FxSqlQuerySql.SqlEscapeArgType, timezone?: FxSqlQuery.FxSqlQueryTimezone): string
	}

	interface Dialect {
		DataTypes: DataTypesDescriptor

		escape: fn_escape
		escapeId: fn_escapeId
		escapeVal: fn_escapeVal

		defaultValuesStmt: string
		limitAsTop: boolean
	}
}
