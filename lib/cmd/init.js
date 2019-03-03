/*
 * @Author: l
 * @Date: 2019-03-04 00:01:27
 * @Last Modified by: lingzhengliang
 * @Last Modified time: 2019-03-04 00:46:39
 * @desc:生成项目
 */

const exec = require('child_process').exec;
const co = require('co');
const ora = require('ora');
const prompt = require('co-prompt');

const tip = require('../tip');
const tpls = require('../../templates.json');

const spinner = ora('正在生成.......');

const exeRm = (err, projectName) => {
    spinner.stop();
    if (err) {
        console.log(err);
        tip.fail('请重新运行！');
        process.exit();
    }

    tip.suc('初始化完成！');
    tip.info(`cd ${projectName} && npm install`);
}

const download = (err, projectName) => {
    if (err) {
        console.log(err);
        tip.fail('请重新运行！');
        process.exit();
    }

    exec('cd' + projectName + '&& rm -rf .git', (err, out) => {
        exeRm(err, projectName);
    });
}

const resolve = (result) => {
    const { tplName, url, branch, projectName } = result;
    // git命令，远程拉取项目并自定义项目名
    const cmdStr = `git clone ${url} ${projectName} && cd ${projectName} && git checkout ${branch}`;

    spinner.start();
    
    exec(cmdStr, (err) => {
        download(err, projectName);
    })
}

module.exports = () => {
    co(function *() {
        const ask = yield prompt('我帅么？：');
        if (!ask || ask.indexOf('不') > -1) {
            tip.fail('回答错误!');
            process.exit();
        }
        const tplName = yield prompt('模板名字：');
        const projectName  = yield prompt('项目名字：');

        if (!tpls[tplName]) {
            tip.fail('模板不存在!');
            process.exit();
        }
        return new Promise((resolve, reject) => {
            resolve({
                tplName,
                projectName,
                ...tpls[tplName]
            });
        });
    }).then(resolve);
}