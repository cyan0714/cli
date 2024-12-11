import { input } from '@inquirer/prompts'
import fse from 'fs-extra'
import OpenAI from 'openai'
import path from 'path'
import { remark } from 'remark'
import ora from 'ora'

const client = new OpenAI({
  apiKey: 'sk-Vz04N6HeW2ljy6AvViXvO14RDPV5LlJLdy5lauUgr2SkVj1S',
  baseURL: 'https://api.302.ai/v1',
})

const systemContent = `
# Role: 前端工程师

## Profile

- author: Cyan
- language: 中文
- description: 你非常擅长写 React 组件

## Goals

- 根据用户需求生成组件代码

## Skills

- 熟练掌握 typescript

- 会写高质量的 React 组件

## Constraints

- 用到的组件来源于 antd

- 样式用 scss 写

## Workflows

根据用户描述生成的组件，规范如下：

组件包含 4 类文件:

    1、index.ts
    这个文件中的内容如下：
    export { default as [组件名] } from './[组件名]';
    export type { [组件名]Props } from './interface';

    2、interface.ts
    这个文件中的内容如下，请把组件的props内容补充完整：
    interface [组件名]Props {}
    export type { [组件名]Props };

    4、[组件名].tsx
    这个文件中存放组件的真正业务逻辑，不能编写内联样式，如果需要样式必须在 5、styles.ts 中编写样式再导出给本文件用

    5、styles.scss
    这个文件中必须用 scss 给组件写样式，导出提供给 4、[组件名].tsx

    每个文件之间通过这样的方式分隔：

    # [目录名]/[文件名]

    目录名是用户给出的组件名

## Initialization

作为前端工程师，你知道你的[Goals]，掌握技能[Skills]，记住[Constraints], 与用户对话，并按照[Workflows]进行回答，提供组件生成服务
`

async function generate() {
  let componentDir = ''
  while (!componentDir) {
    componentDir = await input({ message: '生成组件的目录', default: 'src/components' })
  }

  let componentDesc = ''
  while (!componentDesc) {
    componentDesc = await input({
      message: '组件描述',
      default: '生成一个 Table 的 React 组件，有包含 name、age、email 属性的 data 数组参数',
    })
  }
  
  const spinner = ora('AI 生产代码中...').start()
  const res = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: componentDesc },
    ],
  })
  spinner.stop()

  const markdown = res.choices[0].message.content || ''

  await remark()
    .use(function (...args) {
      return function (tree: any) {
        let curPath = ''
        for (let i = 0; i < tree.children.length; i++) {
          const node = tree.children[i]
          if (node.type === 'heading') {
            curPath = path.join(componentDir, node.children[0].value)
          } else {
            try {
              fse.ensureFileSync(curPath)
              fse.writeFileSync(curPath, node.value)

              console.log('文件创建成功：', curPath)
            } catch (e) {}
          }
        }
      }
    })
    .process(markdown)
}

generate()

export default generate
