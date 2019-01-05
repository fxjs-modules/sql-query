/// <reference types="fibjs" />

/// <reference path="Helper.d.ts" />
/// <reference path="Query.d.ts" />
/// <reference path="Query-Aggregation.d.ts" />
/// <reference path="Query-Comparators.d.ts" />
/// <reference path="Query-ChainBuilder.d.ts" />
/// <reference path="Sql.d.ts" />
/// <reference path="Field.d.ts" />
/// <reference path="Dialect.d.ts" />

declare module "@fxjs/sql-query" {
    export const comparators: FxSqlQuery.ComparatorHash
    export const Text: FxSqlQuery.TypedQueryObjectWrapper<'text'>

    export const Query: FxSqlQuery.Class_Query
}