/// <reference types="fibjs" />

import util    = require("util");
import helpers = require("../Helpers");

const DataTypes = {
	id:    'INT IDENTITY(1,1) NOT NULL PRIMARY KEY',
	int:   'INT',
	float: 'FLOAT',
	bool:  'BIT',
	text:  'TEXT'
};


const escape = function (
	query: FxSqlQuerySql.SqlFragmentStr,
	args: FxSqlQuerySql.SqlAssignmentValues
) {
	return helpers.escapeQuery(Dialect, query, args);
}

function escapeId (...els: any[]) {
	return els.map(function (el) {
		if (typeof el == "object") {
			return el.str.replace(/\?:(id|value)/g, function (m: string) {
				if (m == "?:id") {
					return escapeId(el.escapes.shift());
				}

				return escapeVal(el.escapes.shift());
			});
		}
		return "[" + el + "]";
	}).join(".");
};

const escapeVal = function (val: any, timeZone?: FxSqlQuery.FxSqlQueryTimezone) {
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
		return "'" + helpers.dateToString(val, timeZone || "local", { dialect: 'mssql' }) + "'";
	}

	if (Buffer.isBuffer(val)) {
		return "X'" + val.toString("hex") + "'";
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
		default:
			val = JSON.stringify(val);
	}

	return "'" + val.replace(/\'/g, "''") + "'";
};

const Dialect: FxSqlQueryDialect.Dialect = {
	DataTypes,
	escape,
	escapeId,
	escapeVal,
	defaultValuesStmt: "DEFAULT VALUES",
	limitAsTop: true,
}

export = Dialect
