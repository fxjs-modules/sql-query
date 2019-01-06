/// <reference lib="es5" />

import { DialectTypes } from "./Helpers";

import { CreateQuery } from "./Create";
import { SelectQuery } from "./Select";
import { InsertQuery } from "./Insert";
import { UpdateQuery } from "./Update";
import { RemoveQuery } from "./Remove";

import ComparatorsHash 	= require("./Comparators");
import Helpers     		= require('./Helpers');

export const comparators = ComparatorsHash;
export const Text: FxSqlQuery.TypedQueryObjectWrapper<"text"> = buildQueryType<"text">("text");

export class Query implements FxSqlQuery.Class_Query {
	private Dialect: FxSqlQueryDialect.Dialect
	private opts: FxSqlQuery.QueryOptions
	private _fns: any = {}
	private _proxyFn (fn_name: string) {
		if (!this._fns[fn_name]) {
			switch (fn_name) {
				case 'escape':
					this._fns[fn_name] = Helpers.escapeQuery.bind(Helpers, this.Dialect)
					break
				case 'escapeId':
					this._fns[fn_name] = this.Dialect.escapeId.bind(this.Dialect)
					break
				case 'escapeVal':
					this._fns[fn_name] = this.Dialect.escapeVal.bind(this.Dialect)
					break
			}
		}

		return this._fns[fn_name]
	}

	constructor (_opts?: string | FxSqlQuery.QueryOptions) {
		let dialect: FxSqlQueryDialect.DialectType
		let opts: FxSqlQuery.QueryOptions = null
		if (typeof _opts == "string") {
			if (!DialectTypes.includes(dialect))
				throw `invalid dialect type ${_opts}`

			dialect = _opts as FxSqlQueryDialect.DialectType

			opts = { dialect };
		} else {
			opts = _opts || {};
		}
		this.opts = opts

		this.Dialect = require("./Dialects/" + (opts.dialect || "mysql"));

		this.escape = this._proxyFn('escape')
		this.escapeId = this._proxyFn('escapeId')
		this.escapeVal = this._proxyFn('escapeVal')
	}

	escape: FxSqlQuery.Class_Query['escape']
	escapeId: FxSqlQuery.Class_Query['escapeId']
	escapeVal: FxSqlQuery.Class_Query['escapeVal']

	create()　{
		return new CreateQuery(this.Dialect);
	}
	select () {
		return new SelectQuery(this.Dialect, this.opts);
	}
	insert () {
		return new InsertQuery(this.Dialect, this.opts);
	}
	update () {
		return new UpdateQuery(this.Dialect, this.opts);
	}
	remove () {
		return new RemoveQuery(this.Dialect, this.opts);
	}
}

function buildQueryType<T = string, TD = any>(type: T): FxSqlQuery.TypedQueryObjectWrapper<T, TD> {
	return function (data: TD) {
		var o: FxSqlQuery.TypedQueryObject<T, TD> = {
			data: data
		} as any;

		Object.defineProperty(o, "type", {
			value: function () {
				return type;
			},
			enumerable: false
		});

		return o;
	};
}

// deprecated :start
// use comparators plz
export const Comparators = Object.keys(ComparatorsHash);
export const between = ComparatorsHash.between
export const not_between = ComparatorsHash.not_between
export const like = ComparatorsHash.like
export const not_like = ComparatorsHash.not_like
export const eq = ComparatorsHash.eq
export const ne = ComparatorsHash.ne
export const gt = ComparatorsHash.gt
export const gte = ComparatorsHash.gte
export const lt = ComparatorsHash.lt
export const lte = ComparatorsHash.lte
export const not_in = ComparatorsHash.not_in
// deprecated :start
