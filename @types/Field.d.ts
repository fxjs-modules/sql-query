/// <reference path="Dialect.d.ts" />

declare namespace FxSqlQueryColumns {
	interface FieldItem {}

	interface FieldItemHash {
		[key: string]: FieldItem
	}

	interface FieldItemTypeMap {
		[key: string]: FxSqlQueryDialect.DialectFieldType
	}
}
