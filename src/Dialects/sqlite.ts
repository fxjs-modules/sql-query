/// <reference path="../../@types/index.d.ts" />

import util    = require("util");
import helpers = require("../Helpers");


const DataTypes = {
	isSQLITE: true,
	id:      'INTEGER PRIMARY KEY AUTOINCREMENT',
	int:     'INTEGER',
	float:   'FLOAT(12,2)',
	bool:    'TINYINT(1)',
	text:    'TEXT'
};

function escape (
	query: FxSqlQuerySql.SqlFragmentStr,
	args: FxSqlQuerySql.SqlAssignmentValues
) {
	return helpers.escapeQuery(Dialect, query, args);
}

const escapeId = require("./mysql").escapeId;

function escapeVal (val: any, timeZone?: FxSqlQuery.FxSqlQueryTimezone) {
	if (val === undefined || val === null || typeof val === "symbol") {
		return 'NULL';
	}

	if (Array.isArray(val)) {
		if (val.length === 1 && Array.isArray(val[0])) {
			return "(" + val[0].map(escapeVal.bind(this)) + ")";
		}
		return "(" + val.map(escapeVal.bind(this)).join(", ") + ")";
	}

	if (util.isDate(val)) {
		return "'" + helpers.dateToString(val, timeZone || "local", { dialect: 'sqlite' }) + "'";
	}

	if (Buffer.isBuffer(val)) {
		return helpers.bufferToString( val, 'sqlite');
	}

	switch (typeof val) {
		case "number":
			if (!isFinite(val)) {
				val = val.toString();
				break;
			}
			return val;
		case "boolean":
			return val ? 1 : 0;
		case "function":
			return val(Dialect);
		case "string":
			break;
		case "bigint":
			return val.toString();
		default:
			val = JSON.stringify(val);
	}

	// No need to escape backslashes with default PostgreSQL 9.1+ config.
	// Google 'postgresql standard_conforming_strings' for details.
	return "'" + val.replace(/\'/g, "''") + "'";
};

const Dialect: FxSqlQueryDialect.Dialect = {
	type: 'sqlite',
	DataTypes,
	escape,
	escapeId,
	escapeVal,
	limitAsTop: false,
	knex: null
}

export = Dialect
