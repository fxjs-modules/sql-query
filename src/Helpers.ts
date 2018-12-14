// Transforms:
// "name LIKE ? AND age > ?", ["John", 23]
// into:
// "name LIKE 'John' AND age > 23"
export function escapeQuery (
	Dialect: FxSqlQueryDialect.Dialect,
	query: FxSqlQuerySql.SqlFragmentStr,
	args: FxSqlQuerySql.SqlAssignmentValues
) {
	let pos = 0;

	return query.replace(/\?{1,2}/g, function (match) {
		if (match == '?') {
			return Dialect.escapeVal(args[pos++]);
		} else if (match == '??') {
			return Dialect.escapeId(args[pos++] as FxSqlQuerySql.SqlEscapeArgIdType);
		}
	});
}

export function dateToString (date: number|Date, timeZone: FxSqlQuery.FxSqlQueryTimezone, opts: FxSqlQuery.ChainBuilderOptions) {
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

export function zeroPad(number: string|number, n: number = 2) {
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

export function get_table_alias (sql: FxSqlQuerySql.SqlQueryChainDescriptor, table: string): string {
	for (let i = 0; i < sql.from.length; i++) {
		if (sql.from[i].t == table) {
			return sql.from[i].a;
		}
	}
	return table;
};

export const DialectTypes: FxSqlQueryDialect.DialectType[] = ['mysql', 'sqlite', 'mssql']
