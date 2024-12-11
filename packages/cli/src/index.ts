#!/usr/bin/env node
import create from '@cyan0714-cli/create'
import { Command } from 'commander'
import fse from 'fs-extra'
import path from 'node:path'
import { execSync } from 'child_process'
import generate from '@cyan0714-cli/generate'

const pkgJson = fse.readJSONSync(path.join(import.meta.dirname, '../package.json'))

const program = new Command()

// 获取今天凌晨的日期字符串
function getTodayDateString() {
  const today = new Date()
  return today.toISOString().split('T')[0] + 'T08:00:00'
}

program.name('cyan0714-cli').description('脚手架 cli').version(pkgJson.version)

program
  .command('create')
  .description('创建项目')
  .action(async () => {
    create()
  })

program.command('generate')
  .description('生成组件（基于 AI）')
  .action(async () => {
    generate();
  });

program
  .command('gl')
  .description('获取指定作者的 git 提交记录')
  .option('-a, --author <name>', '作者名称', 'chenshiyan')
  .action((options) => {
    try {
      const dateStr = getTodayDateString();
      const command = `git log --format='%s' --since="${dateStr}" --author="${options.author}" | grep -v 'Merge' | awk '{sub(/^[^:]*:/, ""); print NR ". " $0}'`;
      
      console.log('查询日期:', dateStr);
      console.log('查询作者:', options.author);
      
      const result = execSync(command, { encoding: 'utf-8' });
      if (result) {
        console.log(result);
      } else {
        console.log('今天还没有提交记录');
      }
    } catch (error) {
      console.error('执行命令失败:', error);
    }
  });

program.parse()
