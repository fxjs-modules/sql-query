/// <reference path="Dialect.d.ts" />

declare namespace FxSqlQueryColumns {
	type SelectInputArgType = string | FxSqlQuerySql.SqlSelectFieldsDescriptor

	interface FieldItemTypeMap {
		[key: string]: FxSqlQueryDialect.DialectFieldType
	}
}
