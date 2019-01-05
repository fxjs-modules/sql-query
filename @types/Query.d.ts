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
		new (opts?: QueryOptions): Class_Query

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
