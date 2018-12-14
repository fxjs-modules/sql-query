/// <reference path="Dialect.d.ts" />
/// <reference path="Query-ChainBuilder.d.ts" />

declare namespace FxSqlQuery {
	interface QueryOptions {
		dialect?: FxSqlQueryDialect.DialectType /*  | string */
		timezone?: FxSqlQueryTimezone
	}

	type QueryOrderDirection =
		// Z means 'z->a'
		'Z'
		// other string means 'a->z'
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

	interface Class_Query {
		escape: FxSqlQueryDialect.fn_escape
		escapeId: FxSqlQueryDialect.fn_escapeId
		escapeVal: FxSqlQueryDialect.fn_escapeVal

		create: () => ChainBuilder__Create
		select: () => ChainBuilder__Select
		insert: () => ChainBuilder__Insert
		update: () => ChainBuilder__Update
		remove: () => ChainBuilder__Remove
	}
}
