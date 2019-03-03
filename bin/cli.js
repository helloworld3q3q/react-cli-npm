#!/usr/bin/env node

'use strict';

const program = require('commander');
const packageInfo = require('../package.json');

// 生成项目
program.command('init').description('生成一个项目').alias('i')
	.action(() => {
		require('../lib/cmd/init')();
	})

// 添加模板
program.command('add').description('添加模板').alias('a')
	.action(() => {
		require('../lib/cmd/add')();
	})
	
// 删除模板
program.command('delete').description('删除模板').alias('d')
	.action(() => {
		require('../lib/cmd/delete')();
	})

// 模板列表
program.command('ls').description('模板列表').alias('d')
	.action(() => {
		require('../lib/cmd/list')();
	})
program.parse(process.argv);

if(!program.args.length){
	program.help()
}