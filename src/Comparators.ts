type between = FxSqlQueryComparatorFunction.between
export function between (a: string, b: string) {
	return createSpecialObject({ from: a, to: b }, 'between');
};

type not_between = FxSqlQueryComparatorFunction.not_between
export function not_between (a: string, b: string) {
	return createSpecialObject({ from: a, to: b }, 'not_between');
};

type like = FxSqlQueryComparatorFunction.like
export function like (expr: FxSqlQuery.QueryComparatorExprType) {
	return createSpecialObject({ expr: expr }, 'like');
};

type not_like = FxSqlQueryComparatorFunction.not_like
export function not_like (expr: FxSqlQuery.QueryComparatorExprType) {
	return createSpecialObject({ expr: expr }, 'not_like');
};


type eq = FxSqlQueryComparatorFunction.eq
export function eq (v: any) {
	return createSpecialObject({ val: v }, 'eq');
};

type ne = FxSqlQueryComparatorFunction.ne
export function ne (v: any) {
	return createSpecialObject({ val: v }, 'ne');
};

type gt = FxSqlQueryComparatorFunction.gt
export function gt (v: any) {
	return createSpecialObject({ val: v }, 'gt');
};

type gte = FxSqlQueryComparatorFunction.gte
export function gte (v: any) {
	return createSpecialObject({ val: v }, 'gte');
};

type lt = FxSqlQueryComparatorFunction.lt
export function lt (v: any) {
	return createSpecialObject({ val: v }, 'lt');
};

type lte = FxSqlQueryComparatorFunction.lte
export function lte (v: any) {
	return createSpecialObject({ val: v }, 'lte');
};

type not_in = FxSqlQueryComparatorFunction.not_in
export function not_in (v: any) {
	return createSpecialObject({ val: v }, 'not_in');
};

function createSpecialObject(
	obj: FxSqlQuery.QueryComparatorObject,
	tag: FxSqlQuery.QueryComparatorType
): FxSqlQuery.QueryComparatorObject {
	Object.defineProperty(obj, "sql_comparator", {
		configurable : false,
		enumerable   : false,
		value        : function () { return tag; }
	});

	return obj;
}
