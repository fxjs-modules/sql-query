// Transforms:
// "name LIKE ? AND age > ?", ["John", 23]
// into:
// "name LIKE 'John' AND age > 23"
export const escapeQuery: FxSqlQueryHelpler.HelperModule['escapeQuery'] = function (
	Dialect: FxSqlQueryDialect.Dialect,
	query: FxSqlQuerySql.SqlFragmentStr,
	args: FxSqlQuerySql.SqlAssignmentValues
): FxSqlQuerySql.SqlFragmentStr {
	let pos = 0;

	return query.replace(/\?{1,2}/g, function (match) {
		if (match == '?') {
			return Dialect.escapeVal(args[pos++]);
		} else if (match == '??') {
			return Dialect.escapeId(args[pos++] as FxSqlQuerySql.SqlEscapeArgIdType);
		}
	});
}

export const dateToString: FxSqlQueryHelpler.HelperModule['dateToString'] = function (
	date: number|Date, timeZone: FxSqlQuery.FxSqlQueryTimezone, opts: FxSqlQuery.ChainBuilderOptions
): string {
	const dt = new Date(date);

	if (timeZone != 'local') {
		const tz = convertTimezone(timeZone);

		dt.setTime(dt.getTime() + (dt.getTimezoneOffset() * 60000));
		if (tz !== false) {
			dt.setTime(dt.getTime() + (tz * 60000));
		}
	}

	const year   = dt.getFullYear();
	const month  = zeroPad(dt.getMonth() + 1);
	const day    = zeroPad(dt.getDate());
	const hour   = zeroPad(dt.getHours());
	const minute = zeroPad(dt.getMinutes());
	const second = zeroPad(dt.getSeconds());
	const milli  = zeroPad(dt.getMilliseconds(), 3);

	if (opts.dialect == 'mysql' || timeZone == 'local') {
		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + milli;
	} else {
		return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second + '.' + milli + 'Z';
	}
}

export const zeroPad: FxSqlQueryHelpler.HelperModule['zeroPad'] = function (
	number: string|number, n: number = 2
): string {
	number = "" + number;

	while (number.length < n) {
		number = "0" + number;
	}
	return number;
}

function convertTimezone(tz: FxSqlQuery.FxSqlQueryTimezone): false | number {
	if (tz == "Z") return 0;

	const m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
	if (m) {
		return (m[1] == '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
	}
	return false;
}

export function get_table_alias (
	sql: FxSqlQuerySql.SqlQueryChainDescriptor, table: string
): string {
	for (let i = 0; i < sql.from.length; i++) {
		if (sql.from[i].table == table) {
			return pickAliasFromFromDescriptor(sql.from[i]);
		}
	}
	return table;
};

// export function parse_table_alias (
// 	table: string, sql: FxSqlQuerySql.SqlQueryChainDescriptor
// ): string {
// 	let [_, table_alias] = parseTableInputStr(table)
// 	if (table_alias)
// 		return table_alias;

// 	return get_table_alias(sql, table)
// }

export const parseTableInputStr: FxSqlQueryHelpler.HelperModule['parseTableInputStr'] = function (
	table_name: FxSqlQuerySql.SqlTableInputType
): FxSqlQuerySql.SqlTableTuple {
	if (!table_name)
		throw `invalid input table_name!`

	let ta_tuple: FxSqlQuerySql.SqlTableTuple = ['', ''];

	if (typeof table_name === 'string') {
		table_name = table_name.trim()

		if (table_name.indexOf(' as ') > 0) {
			ta_tuple = table_name.split(' as ').slice(0, 2) as FxSqlQuerySql.SqlTableTuple
		} else {
			ta_tuple = table_name.split(' ').slice(0, 2) as FxSqlQuerySql.SqlTableTuple
		}
	} else {
		ta_tuple = table_name.slice(0, 2) as FxSqlQuerySql.SqlTableTuple
	}

	return ta_tuple
}

export function pickAliasFromFromDescriptor(fd: FxSqlQuerySql.QueryFromDescriptor) {
	return fd.alias || fd.a
}

export function pickColumnAsFromSelectFieldsDescriptor(sitem: FxSqlQuerySql.SqlSelectFieldItemDescriptor): FxSqlQuerySql.SqlSelectFieldItemDescriptor['as'] {
	return sitem.as || sitem.a
}

export function autoIncreatementTableIndex (from: FxSqlQuerySql.SqlQueryChainDescriptor['from']) {
	return from.length + 1;
}

export function defaultTableAliasNameRule (idx: number) {
	return `t${idx}`
}

export const DialectTypes: FxSqlQueryDialect.DialectType[] = ['mysql', 'sqlite', 'mssql']

export function ucfirst (str: string = '') {
	if (str.length <= 1)
		return str.toUpperCase()

	return str[0].toUpperCase() + str.slice(1)
}

export function ensureNumber (num: any) {
	if (typeof num !== 'number') {
		num = parseInt(num);
	}

	if (isNaN(num))
		return 0;

	return num;
}

export function bufferToString (buffer: Class_Buffer | Buffer, dialect: FxSqlQueryDialect.DialectType) {
	switch (dialect) {
		case 'mssql':
			return "X'" + buffer.toString("hex") + "'";
		case 'mysql':
			return "X'" + buffer.toString('hex')+ "'";
		case 'sqlite':
			return "X'" + buffer.toString("hex") + "'";
		case 'postgresql':
			return "'\\x" + buffer.toString("hex") + "'";
	}
}

export function escapeValIfNotString (val: any, Dialect: FxSqlQueryDialect.Dialect, opts: FxSqlQuery.ChainBuilderOptions) {
	// never escapeVal with those types, knex would escape them automatically
	const _type = typeof val;

	if (_type === 'string')
		return val;
	else if (_type === 'number')
		return val;
	else if (_type === 'boolean')
		return val;
	else if (_type === 'function')
		return Dialect.knex.raw( val(Dialect) );
	else if (val instanceof Date)
		// TODO: how to suppor timezone?
		return val;
	else if (val instanceof Array)
		return val;
	else if (val === null)
		return val;
	else if (val === undefined)
		return val = null;

	return Dialect.escapeVal(val, opts.timezone);
}

export function cutOffOrderDirectionFromColumnFirstStr (col_name: string): {
	col_name: string
	direction: FxSqlQuerySql.SqlOrderDescriptor['d']
} {
	const result = {
		col_name,
		direction: 'ASC' as FxSqlQuerySql.SqlOrderDescriptor['d']
	}

	if (typeof col_name !== 'string')
		return result

	if (col_name[0] === '-') {
		result.col_name = col_name.substr(1)
		result.direction = 'DESC'
	}

	return result
}
