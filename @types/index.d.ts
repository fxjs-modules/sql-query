/// <reference types="fibjs" />
/// <reference types="@fxjs/knex" />

/// <reference path="Helper.d.ts" />
/// <reference path="Aggregation.d.ts" />
/// <reference path="Comparators.d.ts" />
/// <reference path="Query.d.ts" />
/// <reference path="Query-ChainBuilder.d.ts" />
/// <reference path="Sql.d.ts" />
/// <reference path="Field.d.ts" />
/// <reference path="Dialect.d.ts" />

declare module "@fxjs/sql-query" {
    export const comparators: FxSqlQueryComparator.ComparatorHash
    export const Text: FxSqlQuery.TypedQueryObjectWrapper<'text'>
	export const Helpers: FxSqlQueryHelpler.HelperModule

    export const Query: typeof FxSqlQuery.Class_Query
}
