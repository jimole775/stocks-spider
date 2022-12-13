const os = require('os')
const { execSync } = require('child_process')
const readline = require('readline')
const {
  accessSync, constants, rmSync, mkdirSync, writeFileSync, createReadStream
} = require('fs')

const HASH_LENGTH = 7
const PACKAGE_FILE = './package.json'
const PACKAGE_FILE_LOCK = './package-lock.json'
const COMMITLINT_CONFIG = './commitlint.conf.js'
const DOCUMENT_DIST = 'docs'
const CHANGELOG = `${DOCUMENT_DIST}/CHANGELOG.md`
const VERSION_LIMIT = '99.99.99-999'
const VERSION_REGEXP = /^v?(\d{1,2}\.\d{1,2}\.\d{1,2}(-\d{1,})?)$/
const VERSION_TYPES = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease']
const COMMIT_SIGNS = ['feat', 'fix', 'pref', 'revert']
const PARAMETER_ACCESS = ['v', 'version', 'm', 'message', 't', 'test']
const CHANGELOG_TYPE = { WHOLE: 0, DEFAULT: 1, APPEND: 2 }
const DEPEND_PACKAGES = [
  'prettier', 'commitizen', 'husky', 'lint-staged',
  '@commitlint/cli', '@commitlint/config-conventional',
  'conventional-changelog-cli', 'cz-conventional-changelog'
]
const STORE_NAME = cmd('git remote show -n')
const BRANCH_NAME = cmd('git rev-parse --abbrev-ref HEAD')

const CMD_PARAMS = getCmdParams()
const CURRENT_VERSION = getCurrentVersion()
const NEXT_VERSION = growupVersionNumber(CURRENT_VERSION)

const MESSAGE = {
  DUCPLICATE: 'a commit version already in CHANGLOG.md, maybe has not featrue to be update.',
  VERSION: `"chore: updates version ${CURRENT_VERSION} to ${NEXT_VERSION}"`,
  CHANGELOG: `"chore: creates CHANGELOG.md of iteration version which ${NEXT_VERSION}"`,
  EMPTY: `please make sure your gitlab or github remote address!`
}

const rollbackStack = {
  stash: [],
  version: [],
  changelog: [],
  tag: []
}

!CMD_PARAMS.t && main()

async function main () {
  if (!STORE_NAME || !BRANCH_NAME) return new Error(MESSAGE.EMPTY)
  await monitor()
  // await loadDepends()
  await configUserInfo()
  await stashGitWorkspace()
  await updateVersion()
  await configCommitlint()
  await updateChangelog()
  await updateTag()
  await distashGitWorkspace()
  await resetRollbackStack()
  process.exit(0)
}

async function cmdRevert (message) {
  console.log('[version] starting rollback working, from ', message)
  await revertTag()
  await revertChangelog()
  await revertVersion()
  await distashGitWorkspace()
  await resetRollbackStack()
  process.exit(0)
}

function monitor () {
  process.on('SIGINT', cmdRevert)
  process.on('SIGTERM', cmdRevert)
  process.on('SIGBREAK', cmdRevert)
  process.on('SIGQUIT', cmdRevert)
  process.on('SIGKILL', cmdRevert)
  process.on('SIGLOST', cmdRevert)
  process.on('unhandledRejection', cmdRevert)
  process.on('uncaughtException', cmdRevert)
  return Promise.resolve()
}

function resetRollbackStack () {
  rollbackStack.stash = []
  rollbackStack.version = []
  rollbackStack.changelog = []
  rollbackStack.tag = []
  return Promise.resolve()
}

async function updateVersion () {
  // 如果特殊tag，可以允许重复的特性
  if (VERSION_REGEXP.test(NEXT_VERSION)) {
    const duplicateLine = await getDuplicateVersion()
    // todo 正常commit
    if (duplicateLine) {
      const message = `${MESSAGE.DUCPLICATE}\nduplicate commit:\n ${duplicateLine}.`
      return Promise.reject(new Error(message))
    }
  }

  await modifyFileVersoion(PACKAGE_FILE)
  await modifyFileVersoion(PACKAGE_FILE_LOCK)

  cmd('git add .')
  rollbackStack.version.push([cmd, 'git reset -q HEAD'])

  cmd(`git commit -m ${MESSAGE.VERSION}`)
  rollbackStack.version.push([cmd, 'git reset --soft HEAD~'])

  cmd(`git push ${STORE_NAME} ${BRANCH_NAME}`)
  rollbackStack.version.push([cmd, 'git reset --soft HEAD~'])

  return Promise.resolve()
}

function modifyFileVersoion (fileName) {
  return new Promise(async (resolve) => {
    if (!hasModule(fileName)) return resolve('')
    const json = require(fileName)
    const versionNo = NEXT_VERSION.replace(VERSION_REGEXP, '$1')
    json.version = versionNo
    // 针对 package-lock 的packages的version属性的变更
    const packages = json.packages || {}
    if (packages['']) packages[''].version = versionNo
    if (packages[json.name]) packages[json.name].version = versionNo

    const pertyCodes = await codesPretting(JSON.stringify(json), 'json')
    writeFileSync(fileName, pertyCodes, { encoding: 'utf8' })
    rollbackStack.version.push([cmd, `git checkout -q ${fileName}`])
    return resolve('')
  })
}

async function updateChangelog () {
  // 运行之前，需要在当前项目确认 commitizen, cz-conventional-changelog 已经安装
  // 1. 安装 commitizen 指令
  // `npm install --save-dev commitizen`
  // 2. 安装cz-conventional-changelog包，并初始化 conventional-changelog 的配置
  // `commitizen init cz-conventional-changelog --save --save-exact`
  // 3. 生产log
  // `conventional-changelog -p angular -i ${CHANGELOG} -s -r ${logType}`
  let logType = CHANGELOG_TYPE.APPEND

  if (!hasModule(DOCUMENT_DIST)) mkdirSync(DOCUMENT_DIST)
  if (!hasModule(CHANGELOG)) {
    logType = CHANGELOG_TYPE.WHOLE
  } else {
    if (['minor', 'major', 'preminor', 'premajor'].includes(CMD_PARAMS.v || CMD_PARAMS.version)) {
      rmSync(CHANGELOG)
      rollbackStack.changelog.push([cmd, `git checkout -q -- ${CHANGELOG}`])
      logType = CHANGELOG_TYPE.APPEND
    }
  }

  if (!hasModule('./node_modules/cz-conventional-changelog')) {
    cmd(`commitizen init cz-conventional-changelog --save --save-exact`)
  }

  cmd(`conventional-changelog -p angular -i ${CHANGELOG} -s -r ${logType}`)

  // clean 和 checkout 一起使用，确保“新增”和“变更”都能还原
  rollbackStack.changelog.push([cmd, `git clean -f -q -- ${CHANGELOG}`])
  rollbackStack.changelog.push([cmd, `git checkout -q -- ${CHANGELOG}`])

  cmd(`git add ${CHANGELOG}`)
  rollbackStack.changelog.push([cmd, `git reset -q HEAD -- ${CHANGELOG}`])

  cmd(`git commit -m ${MESSAGE.CHANGELOG}`)
  rollbackStack.changelog.push([cmd, `git reset --soft HEAD~`])

  cmd(`git push ${STORE_NAME} ${BRANCH_NAME}`)
  rollbackStack.version.push([cmd, 'git reset --soft HEAD~'])
  return Promise.resolve()
}

function configCommitlint () {
  const json = require(PACKAGE_FILE)
  if (!json['lint-staged']) json['lint-staged'] = {}
  if (!json['commitlint']) json['commitlint'] = {}
  if (!json['husky']) json['husky'] = {}
  if (!json['husky']['hooks']) json['husky']['hooks'] = {}
  if (!json['config']) json['config'] = {}
  json['lint-staged'] = { '*.{js,vue}': ['vue-cli-service lint', 'git add'] }
  json['commitlint'] = { 'extends': ['@commitlint/config-conventional'] }
  json['husky']['hooks']['pre-commit'] = 'lint-staged'
  json['husky']['hooks']['commit-msg'] = 'commitlint --edit ./.git/COMMIT_EDITMSG'
  json['config']['commitizen'] = { 'path': './node_modules/cz-conventional-changelog' }
  writeFileSync(PACKAGE_FILE, codesPretting(JSON.stringify(json), 'json'), { encoding: 'utf8' })
  cmd(`git add ${PACKAGE_FILE}`)
  cmd(`git commit -m "commitlint config in ${PACKAGE_FILE}"`)
  cmd(`git push ${STORE_NAME} ${BRANCH_NAME}`)

  if (!hasModule(COMMITLINT_CONFIG)) {
    const content = `module.exports = {
      extends: ['@commitlint/configconventional'],
      rules: {
        'type-enum': [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']],
        'subject-full-stop': [0, 'never'],
        'subjectcase': [0, 'never']
      }
    }`
    writeFileSync(COMMITLINT_CONFIG, codesPretting(content), { encoding: 'utf8' })
    cmd(`git add ${COMMITLINT_CONFIG}`)
    cmd(`git commit -m "commitlint config in ${COMMITLINT_CONFIG}"`)
    cmd(`git push ${STORE_NAME} ${BRANCH_NAME}`)
  }
  return Promise.resolve()
}

function updateTag () {
  const date = getDate()
  const message = CMD_PARAMS.m || CMD_PARAMS.message
  cmd(`git tag -a ${NEXT_VERSION} -m "${message || date}"`)
  rollbackStack.tag.push([cmd, `git tag -d ${NEXT_VERSION}`])
  cmd(`git push --tags`)
  rollbackStack.tag.push([cmd, `git push ${STORE_NAME} :refs/tags/${NEXT_VERSION}`])
  return Promise.resolve()
}

function growupVersionNumber (v) {
  // 重新考虑【预】发版类型 prexxx 的版本号的处理逻辑
  const limitArray = VERSION_LIMIT.split('.')
  const majorLimit = Number(limitArray[0])
  const minorLimit = Number(limitArray[1])
  const patchLimit = Number(limitArray[2].split('-')[0])
  // v的默认结构：v1.x.x-xx
  const versionNo = v.replace('v', '')

  // 如果没定义 growType
  // 设置默认升级小版本 patch
  const growType = CMD_PARAMS.v || CMD_PARAMS.version || 'patch'

  // 如果 growType 为版本号，直接返回
  if (VERSION_REGEXP.test(growType)) {
    console.log('[version] next version:', growType)
    return growType
  }

  // 自定义的版本号，比如：vue_v1.0.1-release
  if (growType && !VERSION_TYPES.includes(growType)) {
    console.log('[version] next version:', growType)
    return growType
  }

  let majorVersion = Number(versionNo.split('.')[0])
  let minorVersion = Number(versionNo.split('.')[1])
  let patchVersion = Number(versionNo.split('.')[2].split('-')[0])
  let preVersion = Number(versionNo.split('.')[2].split('-')[1])

  if (growType === 'prerelease') {
    if (Number.isNaN(preVersion)) {
      patchVersion = patchVersion + 1
      preVersion = 0
    } else {
      preVersion = preVersion + 1
    }
  } else {
    // prepatch preminor premajor 都视为 preVersion === NaN
    // 这样就可以让 updatePatch() updateMinor() updateMajor() 直接升级对应的版本号
    if (/^pre/.test(growType)) {
      preVersion = NaN
    }

    if (['patch', 'prepatch'].includes(growType)) {
      updatePatch()
    }

    if (['minor', 'preminor'].includes(growType)) {
      updateMinor()
    }

    if (['major', 'premajor'].includes(growType)) {
      updateMajor()
    }

    // prepatch preminor premajor 不管如何计算，预版本号都会置为 0
    if (/^pre/.test(growType)) {
      preVersion = 0
    }
  }
  const mainPart = `${majorVersion}.${minorVersion}.${patchVersion}`
  const prePart = `${Number.isNaN(preVersion) ? '' : '-' + preVersion}`
  console.log('[version] next version:', 'v' + mainPart + prePart)
  return 'v' + mainPart + prePart

  function updateMajor () {
    if (Number.isNaN(preVersion)) {
      majorVersion = majorVersion + 1
      patchVersion = 0
      minorVersion = 0
    } else {
      if (patchVersion !== 0 || minorVersion !== 0) {
        majorVersion = majorVersion + 1
        patchVersion = 0
        minorVersion = 0
      }
      preVersion = NaN
    }
    if (majorVersion > majorLimit) {
      patchVersion = patchLimit
      minorVersion = minorLimit
      majorVersion = majorLimit
    }
  }
  function updateMinor () {
    if (Number.isNaN(preVersion)) {
      minorVersion = minorVersion + 1
      patchVersion = 0
    } else {
      if (patchVersion !== 0) {
        minorVersion = minorVersion + 1
        patchVersion = 0
      }
      preVersion = NaN
    }
    if (minorVersion > minorLimit) updateMajor()
  }
  function updatePatch () {
    if (Number.isNaN(preVersion)) {
      patchVersion = patchVersion + 1
    } else {
      preVersion = NaN
    }
    if (patchVersion > patchLimit) updateMinor()
  }
}

function getCurrentVersion () {
  cmd(`git fetch ${STORE_NAME} :refs/tag`)
  let tagString = cmd(`git tag --sort=-taggerdate`)
  let tags = splitLines(tagString)
  let res = 'v1.0.0'
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i]
    if (VERSION_REGEXP.test(tag)) {
      res = tag
      break
    }
  }
  console.log('[version] current version:', res)
  return res
}

function getCmdParams () {
  const res = {}
  const paramReg = /^-\w[\w-_]*$/ig
  const args = process.argv || []
  args.forEach((item, index) => {
    if (item && paramReg.test(item)) {
      let key = item.replace('-', '')
      let val = args[index + 1]
      if (PARAMETER_ACCESS.includes(key)) {
        if (paramReg.test(val)) val = true
        if (!val) val = true
        res[key] = val
      }
    }
  })
  return res
}

async function loadDepends () {
  for (let i = 0; i < DEPEND_PACKAGES.length; i++) {
    const packName = DEPEND_PACKAGES[i]
    await installPackage(packName)
  }
  return Promise.resolve()
}

function getDate () {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = date.getMonth() + 1
  const dd = date.getDate()
  return `${yyyy}-${mm}-${dd}`
}

function stashGitWorkspace() {
  const status = cmd('git status -s')
  if (status && status.length) {
    cmd('git add .')
    rollbackStack.stash.push([cmd, 'git reset -q HEAD'])
    cmd('git stash save "for update version"')
    rollbackStack.stash.push([cmd, 'git stash pop 0'])
  }

  // 如果无法pull, 先发布分支
  cmd(`git push -u ${STORE_NAME} ${BRANCH_NAME}`)

  // 保持最新，避免冲突
  cmd(`git pull ${STORE_NAME} ${BRANCH_NAME}`)

  return Promise.resolve()
}

async function revertVersion() {
  await callRollbackStack(rollbackStack.version)
  return Promise.resolve()
}

async function revertChangelog() {
  await callRollbackStack(rollbackStack.changelog)
  return Promise.resolve()
}

async function revertTag() {
  await callRollbackStack(rollbackStack.tag)
  return Promise.resolve()
}

async function distashGitWorkspace() {
  await callRollbackStack(rollbackStack.stash)
  return Promise.resolve()
}

function cmd (line) {
  try {
    console.log('[version] command line:', line)
    const res = execSync(line, { encoding: 'utf8' })
    return typeof res === 'string' ? res.trim() : res
  } catch (error) {
    return ''
  }
}

function codesPretting (content, type = 'babel') {
  const prettier = require('prettier')
  return prettier.format(content, { parser: type })
}

function installPackage (packzip) {
  return new Promise((resolve) => {
    loop(packzip, resolve)
  })
  function loop(packzip, resolve) {
    if (hasModule(`./node_modules/${packzip}`)) {
      resolve()
    } else {
      console.log(`[version] attempting to install ${packzip}...`)
      execSync(`npm install --save-dev ${packzip}`)
      loop(packzip, resolve)
    }
  }
}

// 判断需不需要配置git的user信息
function configUserInfo () {
  return new Promise((resolve) => {
    const queryStax = isWindows() ? 'findstr user' : 'grep user'
    const localGitUserInfo = cmd(`git config --local --list | ${queryStax}`)
    const globalGitUserInfo = cmd(`git config --global --list | ${queryStax}`)
    const regx = /(user\.(email|name)[=.\r\n@\w\d'"]*?user\.(email|name))/ig
    // local 和 global，只要有一个有就行
    const hadUserInfo = regx.test(`${localGitUserInfo}${globalGitUserInfo}`)
    if (!hadUserInfo) {
      const inquirer = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      inquirer.question('please config your gitlab\'s user.name:', (name) => {
        if (name && name.length) {
          cmd(`git config --local user.name ${name.trim()}`)
          inquirer.question('please config your gitlab\'s user.email:', (email) => {
            if (email && email.length) {
              cmd(`git config --local user.email ${email.trim()}`)
              inquirer.close()
              resolve('')
            }
          })
        }
      })
    } else {
      resolve('')
    }
  })
}

// 版本是否重复的判断，应该从最后一个 commit 的内容开始判断
async function getDuplicateVersion () {
  const lastLine = await getLastFeatCommit()
  const revertHash = lastLine.substring(0, HASH_LENGTH)
  const regx = new RegExp(`\\[${revertHash}\\]`, 'ig')
  if (!hasModule(CHANGELOG)) return Promise.resolve('')
  const readmeStream = createReadStream(CHANGELOG)
  const rl = readline.createInterface({ input: readmeStream })
  return new Promise((resolve) => {
    rl.on('line', (line) => {
      if (regx.test(line)) {
        rl.close()
        readmeStream.close()
        resolve(line)
      }
    })
    rl.on('close', () => {
      resolve('')
      rl.close()
      readmeStream.close()
    })
  })
}

function getLastFeatCommit (n) {
  return new Promise((resolve) => {
    loop(resolve, 1)
  })

  function loop (resolve, n) {
    const lineString = cmd(`git log -n ${n} --pretty=format:"%h|%s"`)
    const lastLine = splitLines(lineString).pop()
    const regx = new RegExp(`(${COMMIT_SIGNS.join(':|')}:|Revert)\\s`)
    if (regx.test(lastLine)) {
      return resolve(lastLine)
    } else {
      loop(resolve, ++n)
    }
  }
}

function hasModule (path) {
  try {
    accessSync(path, constants.F_OK | constants.R_OK | constants.W_OK)
    return true
  } catch (error) {
    return false
  }
}

function isWindows () {
  const platform = os.platform()
  return /^win/.test(platform)
}

// 中间报错需要帮助用户进行操作回滚
function callRollbackStack (stack = []) {
  return new Promise(async (resolve) => {
    let item = null
    while ((item = stack.pop())) {
      const func = item[0]
      const param = item[1]
      if (typeof func === 'function') {
        console.log('[version] rollback command:', param)
        await func.apply(null, typeof param === 'string' ? [param] : param)
      }
    }
    resolve('')
  })
}

function splitLines (src = '') {
  src = src.replace(/[\r\n]+/g, '|')
  return src.trim().split('|')
}
