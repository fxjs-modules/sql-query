var common = exports;
var Query  = require('../');

common.Query = Query;
common.Text  = Query.Text;

common.Select = function (qOpts) {
	var q = new (Query.Query)(qOpts);

	return q.select();
};
common.Create = function (qOpts){
    var q = new (Query.Query)(qOpts);

    return q.create();
};
common.Insert = function (qOpts) {
	var q = new (Query.Query)(qOpts);

	return q.insert();
};

common.Update = function (qOpts) {
	var q = new (Query.Query)(qOpts);

	return q.update();
};

common.Remove = function (qOpts) {
	var q = new (Query.Query)(qOpts);

	return q.remove();
};

common.getDialect = function (dialect) {
	return require('../lib/Dialects/' + dialect);
};

common.getProtocol = function () {
	return process.env.QUERT_PROTOCOL || 'mysql'
}
