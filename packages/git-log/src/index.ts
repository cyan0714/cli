import { execSync } from 'child_process'
import { cosmiconfig } from 'cosmiconfig'
import OpenAI from 'openai'
import ora from 'ora'
import { ConfigOptions } from './configType.js'
import { confirm } from '@inquirer/prompts'

async function getGitLogs(author: string, startDate: string, endDate: string) {
  try {
    const explorer = cosmiconfig('git-log')
    const result = await explorer.search(process.cwd())

    if (!result?.config) {
      console.error('没找到配置文件 git-log.config.js')
      process.exit(1)
    }

    const config: ConfigOptions = result.config

    const systemContent = config.systemSetting
    const command = `git log --format='%s' --since="${startDate}" --until="${endDate}" --author="${author}" | grep -v 'Merge' | awk '{sub(/^[^:]*:/, ""); print NR ". " $0}'`

    console.log('查询时间范围:', startDate, '至', endDate)
    console.log('查询作者:', author)

    const res = execSync(command, { encoding: 'utf-8' })
    if (res) {
      const isSumarize = await confirm({ message: '是否对提交信息进行分析', default: false })
      if (!isSumarize) {
        console.log('提交信息:', res)
        process.exit(0)
      }
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      })

      const prompt = `请分析这些 git 提交信息并提供详细总结：
      时间段：${startDate} 至 ${endDate}
      作者：${author}
      提交信息：
      ${res}
      
      ${systemContent}`

      const spinner = ora('AI 分析中...').start()
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是 git 提交信息分析专家' },
          { role: 'user', content: prompt },
        ],
      })
      spinner.stop()

      console.log('\n提交信息:\n', res)
      console.log('\nAI 分析:\n', response.choices[0].message.content)
    } else {
      console.log('该时间范围内没有提交记录')
    }
  } catch (error) {
    console.error('执行命令失败:', error)
  }
}

export default getGitLogs
