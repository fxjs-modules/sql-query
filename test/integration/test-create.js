const test = require('test')
test.setup()

var common     = require('../common');
var assert     = require('assert');

odescribe('create', () => {
    it('create - mysql', () => {
		const queryOptions = { dialect: 'mysql' };

        assert.equal(
            common.Create(queryOptions).table('table1').build(),
            "create table `table1` ()"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').field('id','id').build(),
            "create table `table1` (`id` int unsigned not null auto_increment primary key)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_text: 'text'}).build(),
            "create table `table1` (`id` int unsigned not null auto_increment primary key, `a_text` text)"
        );
        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_num: 'int'}).build(),
            "create table `table1` (`id` int unsigned not null auto_increment primary key, `a_num` int)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_num: 'float'}).build(),
            "create table `table1` (`id` int unsigned not null auto_increment primary key, `a_num` float(12, 2))"
        );
        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_bool: 'bool'}).build(),
            "create table `table1` (`id` int unsigned not null auto_increment primary key, `a_bool` TINYINT(1))"
        );
    });

	it('create - sqlite', () => {
		const queryOptions = { dialect: 'sqlite' };

        assert.equal(
            common.Create(queryOptions).table('table1').build(),
            "create table `table1` ()"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').field('id','id').build(),
            "create table `table1` (`id` integer not null primary key autoincrement)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_text: 'text'}).build(),
            "create table `table1` (`id` integer not null primary key autoincrement, `a_text` text)"
        );
        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_num: 'int'}).build(),
            "create table `table1` (`id` integer not null primary key autoincrement, `a_num` integer)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_num: 'float'}).build(),
            "create table `table1` (`id` integer not null primary key autoincrement, `a_num` float)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_bool: 'bool'}).build(),
            "create table `table1` (`id` integer not null primary key autoincrement, `a_bool` TINYINT(1))"
        );
	});

	it('create - mssql', () => {
		const queryOptions = { dialect: 'mssql' };

        assert.equal(
            common.Create(queryOptions).table('table1').build(),
            "CREATE TABLE [table1] ()"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').field('id','id').build(),
            "CREATE TABLE [table1] ([id] int identity(1,1) not null primary key)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_text: 'text'}).build(),
            "CREATE TABLE [table1] ([id] int identity(1,1) not null primary key, [a_text] nvarchar(max))"
        );
        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_num: 'int'}).build(),
            "CREATE TABLE [table1] ([id] int identity(1,1) not null primary key, [a_num] int)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_num: 'float'}).build(),
            "CREATE TABLE [table1] ([id] int identity(1,1) not null primary key, [a_num] float)"
        );

        assert.equal(
            common.Create(queryOptions).table('table1').fields({id: 'id', a_bool: 'bool'}).build(),
            "CREATE TABLE [table1] ([id] int identity(1,1) not null primary key, [a_bool] TINYINT(1))"
        );
	});
})

if (require.main === module) {
    test.run(console.DEBUG)
}
