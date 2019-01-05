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

	interface Dialect {
		DataTypes: DataTypesDescriptor

		escape: {
			(
				query: FxSqlQuerySql.SqlFragmentStr,
				args: FxSqlQuerySql.SqlAssignmentValues
			): string
		}
		escapeId: {
			(...els: FxSqlQuerySql.SqlEscapeArgIdType[]): string
		}
		escapeVal: {
			(val: FxSqlQuerySql.SqlEscapeArgType, timezone?: FxSqlQuery.FxSqlQueryTimezone): string
		}

		defaultValuesStmt: string
		limitAsTop: boolean
	}

	type fn_escape = Dialect['escape']
	type fn_escapeId = Dialect['escapeId']
	type fn_escapeVal = Dialect['escapeVal']
}
