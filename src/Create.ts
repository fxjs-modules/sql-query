/// <reference path="../@types/index.d.ts" />

/**
 * Really lightweight templating
 * @param template
 * @param args
 * @returns {string}
 */
function tmpl (template: string, args: {[key: string]: string}) {
	var has = {}.hasOwnProperty;
	for (var key in args) {
		if (!has.call(args, key)) {
			continue;
		}
		var token = '{{' + key + '}}';
		template = template.split(token).join(args[key]);
	}

	return template;
};
/**
 * Builds a list of fields according to the used dialect
 * @param dialect
 * @param structure
 * @returns {string}
 */
function buildFieldsList (dialect: FxSqlQueryDialect.Dialect, structure: FxSqlQueryColumns.FieldItemTypeMap) {
	if (!structure) {
		return "";
	}
	var tpl = "'{{NAME}}' {{TYPE}}", fields = [], has = {}.hasOwnProperty;
	for (var field in structure) {
		if (has.call(structure, field)) {
			fields.push(tmpl(tpl, {
				NAME: field,
				TYPE: dialect.DataTypes[structure[field]]
			}));
		}
	}

	return fields.join(',');
};

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
		var fieldsList, template = "CREATE TABLE '{{TABLE_NAME}}'({{FIELDS_LIST}})";

		if(!this.tableName){
			return '';
		}

		fieldsList = buildFieldsList(this.Dialect, this.structure);

		return tmpl(template, {
			TABLE_NAME: this.tableName,
			FIELDS_LIST: fieldsList
		});

	}
}
