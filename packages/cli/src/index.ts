#!/usr/bin/env node
import create from '@cyan0714-cli/create';
import { Command } from 'commander';
import fse from 'fs-extra';
import path from 'node:path';

const pkgJson = fse.readJSONSync(path.join(import.meta.dirname, '../package.json'));

const program = new Command();

program
    .name('cyan0714-cli')
    .description('脚手架 cli')
    .version(pkgJson.version);

program.command('create')
    .description('创建项目')
    .action(async () => {
        create();
    });

program.parse();
