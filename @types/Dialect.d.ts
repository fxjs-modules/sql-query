/// <reference types="@fxjs/knex" />
/// <reference path="Sql.d.ts" />
declare namespace FxSqlQueryDialect {
	type DialectType = 'mysql' | 'mssql' | 'sqlite' | 'postgresql'

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
			(...els: (FxSqlQuerySql.SqlEscapeArgIdType | {str: string, escapes: string[]})[]): string
		}
		escapeVal: {
			(val: FxSqlQuerySql.SqlEscapeArgType, timezone?: FxSqlQuery.FxSqlQueryTimezone): string
			(vals: FxSqlQuerySql.DetailedQueryWhereCondition__InStyle['val'], timezone?: FxSqlQuery.FxSqlQueryTimezone): string
		}

		defaultValuesStmt: string
		limitAsTop: boolean

		knex: FXJSKnex.FXJSKnexModule.KnexInstance
	}

	type fn_escape = Dialect['escape']
	type fn_escapeId = Dialect['escapeId']
	type fn_escapeVal = Dialect['escapeVal']
}
