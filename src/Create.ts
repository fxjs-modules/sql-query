/// <reference path="../@types/index.d.ts" />

/**
 * Instantiate a new CREATE-type query builder
 * @param Dialect
 * @returns {{table: table, field: field, fields: fields, build: build}}
 * @constructor
 */
export class CreateQuery implements FxSqlQuery.ChainBuilder__Create {
	tableName: string = null;
	structure: FxSqlQueryColumns.FieldItemTypeMap = {};

	constructor (private Dialect: FxSqlQueryDialect.Dialect) {}

	/**
	 * Set the table name
	 * @param table_name
	 * @returns {*}
	 */
	table (table_name: string) {
		this.tableName = table_name;

		return this;
	}
	/**
	 * Add a field
	 * @param name
	 * @param type
	 * @returns {Object}
	 */
	field (name: string, type: FxSqlQueryDialect.DialectFieldType) {
		this.structure[name] = type;

		return this;
	}
	/**
	 * Set all the fields
	 * @param fields
	 * @returns {Object}
	 */
	fields (fields?: FxSqlQueryColumns.FieldItemTypeMap) {
		if (!fields) {
			return this.structure as any;
		}
		this.structure = fields;

		return this;
	}

	/**
	 * Build a query from the passed params
	 * @returns {string}
	 */
	build () {
		if(!this.tableName){
			return '';
		}

		const structure = this.structure;
		const sqlBuilder = this.Dialect.knex.schema.createTable(this.tableName, function (t) {
			Object.keys(structure).forEach(field => {
				const desc = structure[field];
				switch (desc) {
					case 'id':
						t.increments(field);
						break
					case 'int':
						t.integer(field);
						break
					case 'float':
						t.float(field, 12, 2);
						break
					case 'bool':
						t.specificType(field, 'TINYINT(1)');
						break
					case 'text':
						t.text(field);
						break
				}
			})
		});

		return sqlBuilder.toQuery();
	}
}
