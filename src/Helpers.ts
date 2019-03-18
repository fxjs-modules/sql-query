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
