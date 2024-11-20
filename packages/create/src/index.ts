import { select, input, confirm } from '@inquirer/prompts'
import os from 'node:os'
import { NpmPackage } from '@cyan0714-cli/utils'
import path from 'node:path'
import ora from 'ora'
import fse from 'fs-extra'
import prompts from 'prompts'

async function create() {
  const projectTemplate = await select({
    message: '请选择项目模版',
    choices: [
      {
        name: 'react 项目',
        value: '@cyan0714-cli/template-react',
      },
      {
        name: 'vue 项目',
        value: '@cyan0714-cli/template-vue',
      },
    ],
  })

  let projectName = ''
  while (!projectName) {
    projectName = await input({ message: '请输入项目名' })
  }

  const pkg = new NpmPackage({
    name: projectTemplate,
    targetPath: path.join(os.homedir(), '.cyan0714-cli-template'),
  })

  if (!(await pkg.exists())) {
    const spinner = ora('下载模版中...').start()
    await pkg.install()
    await sleep(1000)
    spinner.stop()
  } else {
    const spinner = ora('更新模版中...').start()
    await pkg.update()
    await sleep(1000)
    spinner.stop()
  }

  const templatePath = path.join(pkg.npmFilePath, 'template')
  const targetPath = path.join(process.cwd(), projectName)

  if (fse.existsSync(targetPath)) {
    const empty = await confirm({ message: '该目录不为空，是否清空', default: false })
    if (empty) {
      fse.emptyDirSync(targetPath)
    } else {
      process.exit(0)
    }
  }

  fse.copySync(templatePath, targetPath)
}

function sleep(timeout: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

create()

export default create
