/*
 * @Author: l
 * @Date: 2019-03-04 00:01:27
 * @Last Modified by: lingzhengliang
 * @Last Modified time: 2019-03-05 11:52:06
 * @desc:生成项目
 */

const exec = require('child_process').exec;
const co = require('co');
const ora = require('ora');
const prompt = require('co-prompt');
const fs = require("fs");
const iconv = require('iconv-lite');
const inquirer = require( 'inquirer' );
const chalk = require('chalk');

const tip = require('../tip');
const tpls = require('../../templates.json');

const spinner = ora('Being generated.......');

const execRm = (err, projectName) => {
    spinner.stop();
    if (err) {
        console.log(err);
        tip.fail('Please run again！');
    }

    tip.suc('Initialization complete！');
    tip.info(`cd ${projectName} && npm install`);
}

const delDir = (path) => {
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

const download = (err, projectName) => {
    if (err) {
        console.log(err);
        tip.fail('Please run again！');
        process.exit();
    }

    const cmdStr = 'npm install';
    let projectPath = process.cwd() + '/' + projectName;
    
    let igonre = projectPath + '/.git';
    // 删除指定目录文件
    delDir(igonre);

    exec(cmdStr, { cwd: projectPath, encoding: 'buffer' }, (err, out, stderr) => {
       
        if (!err) {
            console.log(chalk.green.bold('\nsuccess:\n'), iconv.decode(out, 'cp936'));
        }
        execRm(err, projectName);
    })
}

const resolve = (result) => {
    const { tplName, url, branch, projectName } = result;
    // git命令，远程拉取项目并自定义项目名
    const cmdStr = `git clone ${url} ${projectName} && cd ${projectName} && git checkout ${branch}`;

    spinner.start();
    
    exec(cmdStr, (err, stdout, stderr) => {
        download(err, projectName);
    })
}

module.exports = () => {
    co(function *() {
        let ask = yield prompt('Am I handsome?：');
        if (!ask || ask.indexOf('no') > -1) {
            tip.fail('The wrong answer!');
            process.exit();
        }
        //let tplName = yield prompt('Template name：');
        let projectName  = yield prompt('Project name：');
        //tplName ? '' : tplName = 'react';
        let tplsKey = Object.keys(tpls);
        let questions = [{
            type: 'list',
            name: 'key',
            message: 'which template do you want to install?',
            choices: tplsKey
        }]

        inquirer.prompt(questions).then(answers => {
            let tpl = tpls[answers.key];
            let tplName = answers.key;
            if (!tpl) {
                tip.fail('Template does not exist!');
                process.exit();
            }
            
        })

        let inqr = new Promise((resolve, reject) => {
            inquirer.prompt(questions).then(answers => {
                let tpl = tpls[answers.key];
                let tplName = answers.key;
                if (!tpl) {
                    tip.fail('Template does not exist!');
                    reject();
                    process.exit();
                } else {
                    resolve({tplName, ...tpl})
                }
            })
        })
        
        return inqr.then(res => {
            return {
                ...res,
                projectName
            }
        }).catch(err => {
            console.log(err)
        })
    }).then(resolve);
}