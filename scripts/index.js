const chalk = require('chalk');

console.log(chalk.green('创建react app'));

const {program} = require('commander');
const inquirer = require('inquirer');
const package = require('../package.json');
const path = require('path');
const ora = require('ora');
const download = require('download-git-repo');
const fs = require('fs');
const handlebars = require('handlebars');

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];
if(major < 14){
  console.error('你现在的node版本'+ currentNodeVersion + '.\n' + '创建脚手架需要Node14及以上，请更新你的node版本');
  process.exit(1);
}

program
  .version(package.version,'-v, --version')
  .command('create <projectName>')
  .description('输入项目名称，初始化项目')
  .option('-t, --templat <string>', 'js or ts')
  .option('-d, --data <string>', 'redux or mobx')
  .option('-u, --ui <string>','antd or other')
  .action(async (projectName, cmd) =>{
    console.log('cmd', cmd, projectName);
    // 判断用户输入的项目名称是否为空(这个在用户使用命令行时已经判断无需重复)
    // 判断在该目录下是否已经存在该文件夹，如果已经存在提示用户已经存在，否则可以
    const root = path.resolve(projectName);
    const appName = path.basename(root);
    const isExistDir = fs.existsSync(projectName);
    if(isExistDir){
      console.log(chalk.red(root + '文件目录已经存在'));
      process.exit(1);
    }
    // 创建文件夹
    fs.mkdirSync(projectName);
    // 开始进行问答
    inquirer.prompt([
      {
        type: 'string',
        name: 'author',
        message: '请输入作者名称',
      }
    ]).then(author =>{
      inquirer.prompt([
        {
          type: 'list',
          name: 'version',
          message: '请选择项目版本号',
          default: '1.0.0',
          choices: ['1.0.0','2.0.0','3.0.0']
        }
      ]).then(answer => {
        console.log('结果', answer, author);
        const lqProcess = ora('正在创建...')
        lqProcess.start();
        download('direct:https://github.com/cl-1234/base-react-app.git#main', projectName,{clone: true}, err =>{
         if(err){
          console.log(chalk.red('下载脚手架', err))
          lqProcess.fail();
        }else{
          const fileName = `${projectName}/package.json`;
          const meta = {
            name: projectName,
            author,
            version: answer,
          };
          if(fs.existsSync(fileName)){
            // TODO:替换packjson中的name等需要替换的字段，目前先手动修改
            // const content = fs.readFileSync(fileName).toString();
            // const contentObj = JSON.parse(content);
            // contentObj.name = projectName;
            // contentObj.version = answer;
            // contentObj.author = author;
            // fs.writeFileSync(fileName, JSON.stringify(contentObj))
          }
          console.log(chalk.green('创建成功'));
          lqProcess.stop();
        }

      })
      })
    })
  })


program.parse(process.argv);