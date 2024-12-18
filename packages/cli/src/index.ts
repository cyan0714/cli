#!/usr/bin/env node
import create from '@cyan0714-cli/create'
import { Command } from 'commander'
import fse from 'fs-extra'
import path from 'node:path'
import generate from '@cyan0714-cli/generate'
import getGitLogs from '@cyan0714-cli/git-log'

const pkgJson = fse.readJSONSync(path.join(import.meta.dirname, '../package.json'))

const program = new Command()

// 获取今天凌晨的日期字符串
function getTodayDateStartString() {
  const today = new Date()
  return today.toISOString().split('T')[0] + 'T00:00:00'
}

// 获取今天结束的日期字符串
function getTodayDateEndString() {
  const today = new Date()
  return today.toISOString().split('T')[0] + 'T23:59:59'
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
  .option('-s, --start <date>', '开始日期', getTodayDateStartString())
  .option('-e, --end <date>', '结束日期', getTodayDateEndString())
  .action((options) => {
    getGitLogs(options.author, options.start, options.end);
  });

program.parse()
