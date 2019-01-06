/// <reference path="Helper.d.ts" />
/// <reference path="Dialect.d.ts" />
/// <reference path="Query.d.ts" />
/// <reference path="Sql.d.ts" />
/// <reference path="Field.d.ts" />

declare namespace FxSqlQuery {

	type QueryWhereConditionPayloadUnit = FxSqlQuerySql.QueryWhereCondition | string | null

	interface ChainBuilderOptions extends QueryOptions {}

	interface ChainBuilder {
		build(): string
	}

	interface ChainBuilderPaginationMixin {
		offset(offset: number): this
		limit(limit: number|string): this
	}

	interface ChainBuilderSortMixin {
		order(column: string, dir: QueryOrderDirection): this
		order(column: FxSqlQuerySql.SqlFragmentStr, assignment_tuple: [...FxSqlQuerySql.SqlAssignmentValues]): this
	}

	type ChainBuilder__SelectAggregationFunColumnArg = (string | string[])[]
	interface ChainBuilder__Select
		extends ChainBuilder, FxSqlQuery.SupportedAggregationsMixin, ChainBuilderPaginationMixin, ChainBuilderSortMixin
	{
		select: (fields: FxSqlQueryColumns.FieldItemHash|FxSqlQueryColumns.FieldItemHash[]) => this
		where: (...whereConditions: FxSqlQuerySql.QueryWhereConditionHash[]) => this
		whereExists: (table: string, table_link: string, link: string, cond: FxSqlQuerySql.QueryWhereConditionHash) => this
		groupBy: (...args: FxSqlQuerySql.SqlGroupByType[]) => this
		from: (
			table: string,
			from_id?: FxSqlQueryHelpler.Arraiable<string>,
			to_table?: string,
			to_id?: FxSqlQueryHelpler.Arraiable<string>,
			fromOpts?: FxSqlQuerySql.QueryFromDescriptorOpts
		) => this

		[extra: string]: any
	}
	interface ChainBuilder__Insert extends ChainBuilder {
		into(table: string): this | ChainBuilder__Insert
		set(values: FxSqlQuerySql.DataToSet): this | ChainBuilder__Insert
	}

	interface ChainBuilder__Create extends ChainBuilder {
		table(table: string): this | ChainBuilder__Create
		field(table: string, type: FxSqlQueryDialect.DialectFieldType): this | ChainBuilder__Create

		fields: {
			(): FxSqlQueryColumns.FieldItemHash
			(fields: FxSqlQueryColumns.FieldItemHash): ChainBuilder__Create
		}
	}

	interface ChainBuilder__Update extends ChainBuilder {
		where: (...whereConditions: FxSqlQuerySql.QueryWhereConditionHash[]) => ChainBuilder__Update
		into(table: string): this | ChainBuilder__Update
		set(values: FxSqlQuerySql.DataToSet): this | ChainBuilder__Update
	}

	interface ChainBuilder__Remove
		extends ChainBuilder, ChainBuilderPaginationMixin
	{
		order(column: string, dir: QueryOrderDirection): this
		where: (...whereConditions: FxSqlQuerySql.QueryWhereConditionHash[]) => this
		from(table: string): this
	}
}
