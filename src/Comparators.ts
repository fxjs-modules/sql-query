type between = FxSqlQueryComparatorFunction.between
function between (a: string, b: string) {
	return createSpecialObject({ from: a, to: b }, 'between');
};

type not_between = FxSqlQueryComparatorFunction.not_between
function not_between (a: string, b: string) {
	return createSpecialObject({ from: a, to: b }, 'not_between');
};

type like = FxSqlQueryComparatorFunction.like
function like (expr: FxSqlQueryComparator.QueryComparatorExprType) {
	return createSpecialObject({ expr: expr }, 'like');
};

type not_like = FxSqlQueryComparatorFunction.not_like
function not_like (expr: FxSqlQueryComparator.QueryComparatorExprType) {
	return createSpecialObject({ expr: expr }, 'not_like');
};


type eq = FxSqlQueryComparatorFunction.eq
function eq (v: any) {
	return createSpecialObject({ val: v }, 'eq');
};

type ne = FxSqlQueryComparatorFunction.ne
function ne (v: any) {
	return createSpecialObject({ val: v }, 'ne');
};

type gt = FxSqlQueryComparatorFunction.gt
function gt (v: any) {
	return createSpecialObject({ val: v }, 'gt');
};

type gte = FxSqlQueryComparatorFunction.gte
function gte (v: any) {
	return createSpecialObject({ val: v }, 'gte');
};

type lt = FxSqlQueryComparatorFunction.lt
function lt (v: any) {
	return createSpecialObject({ val: v }, 'lt');
};

type lte = FxSqlQueryComparatorFunction.lte
function lte (v: any) {
	return createSpecialObject({ val: v }, 'lte');
};

type not_in = FxSqlQueryComparatorFunction.not_in
function not_in (v: any) {
	return createSpecialObject({ val: v }, 'not_in');
};

export = {
	between,
	not_between,
	like,
	not_like,
	eq,
	ne,
	gt,
	gte,
	lt,
	lte,
	not_in,
} as FxSqlQueryComparator.ComparatorHash

function createSpecialObject(
	obj: object,
	tag: FxSqlQueryComparator.QueryComparatorType
): FxSqlQueryComparator.QueryComparatorObject {
	Object.defineProperty(obj, "sql_comparator", {
		configurable : false,
		enumerable   : false,
		value        : function () { return tag; }
	});

	return obj as FxSqlQueryComparator.QueryComparatorObject;
}
