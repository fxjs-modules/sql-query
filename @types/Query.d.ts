/// <reference types="@fxjs/knex" />

/// <reference path="Dialect.d.ts" />
/// <reference path="SubQuery.d.ts" />
/// <reference path="Query-ChainBuilder.d.ts" />

declare namespace FxSqlQuery {
    type OrderNormalizedTuple = [string|string[], "Z" | "A"]
    type OrderSqlStyleTuple = [FxSqlQuerySql.SqlFragmentStr, FxSqlQuerySql.SqlAssignmentValues?]
    type OrderNormalizedResult = OrderNormalizedTuple | OrderSqlStyleTuple

	interface QueryOptions {
		dialect?: FxSqlQueryDialect.DialectType /*  | string */
		timezone?: FxSqlQueryTimezone
	}

	type QueryOrderDirection =
		// Z means 'z->a'
		'Z'
		// other string means 'a->z'
		| 'A'
		| string

	type FxSqlQueryTimezone =
		'Z'
		| 'local'
		| string

	interface TypedQueryObject<T = 'text' | string, TD = any> {
		data: TD
		type(): T
	}
	interface TypedQueryObjectWrapper<T = 'text' | string, TD = any> {
		(data: TD): FxSqlQuery.TypedQueryObject<T, TD>
	}

	export class Class_Query {
		constructor (_opts?: string | FxSqlQuery.QueryOptions)

		Dialect: FxSqlQueryDialect.Dialect

		escape: FxSqlQueryDialect.Dialect['escape']
		escapeId: FxSqlQueryDialect.Dialect['escapeId']
		escapeVal: FxSqlQueryDialect.Dialect['escapeVal']

		create: () => ChainBuilder__Create
		select: () => ChainBuilder__Select
		insert: () => ChainBuilder__Insert
		update: () => ChainBuilder__Update
		remove: () => ChainBuilder__Remove
	}
}
