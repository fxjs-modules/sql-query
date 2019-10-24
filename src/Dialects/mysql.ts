/// <reference types="@fibjs/types" />

import util    = require("util");
import helpers = require("../Helpers");

const DataTypes = {
	id:    'INTEGER PRIMARY KEY AUTO_INCREMENT',
	int:   'INTEGER',
	float: 'FLOAT(12,2)',
	bool:  'TINYINT(1)',
	text:  'TEXT'
};

function escape (
	query: FxSqlQuerySql.SqlFragmentStr,
	args: FxSqlQuerySql.SqlAssignmentValues
) {
	return helpers.escapeQuery(Dialect, query, args);
}

function escapeId (...els: (string | {str: string, escapes: string[]})[]): string {
	return els.map(function (el) {
		if (typeof el == "object") {
			return el.str.replace(/\?:(id|value)/g, function (m: string) {
				if (m == "?:id") {
					return escapeId(el.escapes.shift());
				}

				return escapeVal(el.escapes.shift());
			});
		}
		return "`" + el.replace(/`/g, '``') + "`";
	}).join(".");
};

function escapeVal (val: any, timeZone?: FxSqlQuery.FxSqlQueryTimezone) {
	if (val === undefined || val === null || typeof val === "symbol") {
		return 'NULL';
	}

	if (Buffer.isBuffer(val)) {
		return helpers.bufferToString( val, 'mysql');
	}

	if (Array.isArray(val)) {
		return arrayToList(val, timeZone || "local");
	}

	if (util.isDate(val)) {
		val = helpers.dateToString(val, timeZone || "local", { dialect: 'mysql' });
	} else {
		switch (typeof val) {
			case 'boolean':
				return (val) ? 'true' : 'false';
			case 'number':
				if (!isFinite(val)) {
					val = val.toString();
					break;
				}
				return val + '';
			case "object":
				return objectToValues(val, timeZone || "Z");
			case "function":
				return val(Dialect);
			case 'bigint':
				return val.toString();
		}
	}

	val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s: string) {
		switch(s) {
			case "\0": return "\\0";
			case "\n": return "\\n";
			case "\r": return "\\r";
			case "\b": return "\\b";
			case "\t": return "\\t";
			case "\x1a": return "\\Z";
			default: return "\\" + s;
		}
	});

	return "'" + val + "'";
};

function objectToValues(object: {[key: string]: any}, timeZone: FxSqlQuery.FxSqlQueryTimezone): string {
	var values = [];
	for (var key in object) {
		var value = object[key];

		if(typeof value === 'function') {
			continue;
		}

		values.push(escapeId(key) + ' = ' + escapeVal(value, timeZone));
	}

	return values.join(', ');
}

function arrayToList(array: any[], timeZone?: FxSqlQuery.FxSqlQueryTimezone): string {
	return "(" + array.map(function(v) {
		if (Array.isArray(v)) return arrayToList(v);
		return escapeVal(v, timeZone);
	}).join(', ') + ")";
}

const Dialect: FxSqlQueryDialect.Dialect = {
	type: 'mysql',
	DataTypes,
	escape,
	escapeId,
	escapeVal,
	limitAsTop: false,
	knex: null
}

export = Dialect
