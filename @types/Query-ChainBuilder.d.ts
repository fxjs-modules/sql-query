/// <reference path="Helper.d.ts" />
/// <reference path="Dialect.d.ts" />
/// <reference path="Query.d.ts" />
/// <reference path="Sql.d.ts" />
/// <reference path="Field.d.ts" />

declare namespace FxSqlQuery {
	type QueryWhereConditionPayloadUnit = FxSqlQuerySql.DetailedQueryWhereCondition | string | null

	interface ChainBuilderOptions extends QueryOptions {}

	interface ChainBuilder {
		build(): string
	}

	interface ChainBuilderPaginationMixin {
		offset(offset: number): this
		limit(limit: number|string): this
	}

	interface ChainBuilderSortMixin {
		/**
		 *
		 * @param column
		 * @param dir
		 *
		 * @sample
		 * .order('col1', 'Z')
		 * .order(['table1', 'col1'], 'A')
		 * .order('ID DESC')
		 * .order('?? DESC', ['ID'])
		 */
		order(column: FxSqlQuery.OrderNormalizedResult[0], dir?: FxSqlQuery.OrderNormalizedResult[1]): this
	}

	type ChainBuilder__SelectAggregationFunColumnArg = (string | string[])[]
	interface ChainBuilder__Select
		extends ChainBuilder, FxSqlQuery.SupportedAggregationsMixin, ChainBuilderPaginationMixin, ChainBuilderSortMixin
	{
		select: (fields: FxSqlQueryColumns.SelectInputArgType[]) => this
		/**
		 * .where('table1', {t1_col1: 'v1'}, 'table2', {t1_col2: 'v2'}, ...)
		 * .where({__sql: 'xxx'})
		 * .where({col1: 'v1', col1: 'v1'})
		 * .where(not: [ { col: 2 }, { col: 3 } ])
		 */
		where: (...whereConditions: (FxSqlQuerySubQuery.SubQueryBuildDescriptor['w'] | FxSqlQuerySubQuery.WhereExistsTuple_Flatten[0])[]) => this
		whereExists: (
			table: string,
			table_link: string,
			link: FxSqlQuerySql.WhereExistsLinkTuple,
			cond: FxSqlQuerySubQuery.SubQueryBuildDescriptor['w']
		) => this
		groupBy: (...args: FxSqlQuerySql.SqlGroupByType[]) => this
		fun: (fun: string, column?: FxSqlQuerySql.SqlColumnType, alias?: string) => this
		from: (
			table: FxSqlQuerySql.SqlTableInputType,
			from_id: FxSqlQueryHelpler.Arraiable<string>,
			to_table: string,
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
			(): FxSqlQueryColumns.FieldItemTypeMap
			(fields: FxSqlQueryColumns.FieldItemTypeMap): ChainBuilder__Create
		}
	}

	interface ChainBuilder__Update extends ChainBuilder {
		where: (...whereConditions: FxSqlQuerySubQuery.SubQueryBuildDescriptor['w'][]) => ChainBuilder__Update
		into(table: string): this | ChainBuilder__Update
		set(values: FxSqlQuerySql.DataToSet): this | ChainBuilder__Update
	}

	interface ChainBuilder__Remove
		extends ChainBuilder, ChainBuilderPaginationMixin
	{
		order(column: string, dir: QueryOrderDirection): this
		where: (...whereConditions: FxSqlQuerySubQuery.SubQueryBuildDescriptor['w'][]) => this
		from(table: string): this
	}
}
