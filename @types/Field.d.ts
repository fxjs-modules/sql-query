/// <reference path="Dialect.d.ts" />

declare namespace FxSqlQueryColumns {
	type SelectInputArgType = string | FxSqlQuerySql.SqlSelectFieldItemDescriptor

	interface FieldItemTypeMap {
		[key: string]: FxSqlQueryDialect.DialectFieldType
	}
}
