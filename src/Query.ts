/// <reference lib="es2017" />

import util = require('util');

import { DialectTypes } from "./Helpers";

import { CreateQuery } from "./Create";
import { SelectQuery } from "./Select";
import { InsertQuery } from "./Insert";
import { UpdateQuery } from "./Update";
import { RemoveQuery } from "./Remove";

import ComparatorsHash 	= require("./Comparators");
export import Helpers     		= require('./Helpers');
export import Dialects 		= require('./Dialects')

export const comparators = ComparatorsHash;
export const Text: FxSqlQuery.TypedQueryObjectWrapper<"text"> = buildQueryType<"text">("text");

function mountKnex (
	this: FxSqlQuery.Class_Query,
	Dialect: FxSqlQuery.Class_Query['Dialect']
) {
	const FKnex = require('@fxjs/knex');
	// TODO: use really fresh dialect rather than shallow copy.
	this.Dialect = util.extend({}, Dialect);
	Object.defineProperty(this.Dialect, 'knex', {
		value: FKnex({ client: this.Dialect.type, useNullAsDefault: true }),
		writable: false,
		configurable: false
	})

	Object.defineProperty(this, 'knex', {
		value: this.Dialect.knex,
		writable: false,
		configurable: false
	})
}
export class Query implements FxSqlQuery.Class_Query {
	Dialect: FxSqlQueryDialect.Dialect
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
		let opts: FxSqlQuery.QueryOptions = null
		if (typeof _opts === "string") {
			if (!DialectTypes.includes(_opts as FxSqlQueryDialect.DialectType))
				throw `invalid dialect type ${_opts}`

			opts = { dialect: _opts as FxSqlQueryDialect.DialectType };
		} else {
			opts = _opts || {};
		}
		this.opts = opts

		opts.dialect = opts.dialect || 'mysql';

		mountKnex.call(this, Dialects[opts.dialect]);

		this.escape = this._proxyFn('escape')
		this.escapeId = this._proxyFn('escapeId')
		this.escapeVal = this._proxyFn('escapeVal')
	}

	knex: FXJSKnex.FXJSKnexModule.KnexInstance

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
