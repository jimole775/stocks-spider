## 环境依赖
需要保证系统可以安装 `nodejs` 和 `chromium`(由于 `chromium` 是墙外资源，如果你没有梯子，那么只有自己配置了)
#### 1. 翻墙的情况下

可以直接运行，`npm i` 或者 `yarn` ，chromium 会被自动安装，不用操心

#### 2. 非翻墙情况下

不能翻墙的话，需要自己去下载

首先运行 `npm install puppeteer --ignore-scripts` 安装 puppeteer

然后到 [这里](https://chromium.en.lo4d.com/download) 下载一个 chromium 资源包

下载完成后，解压出资源目录chrome-win把它整个复制粘贴到 

`:/[你的项目]/node_modules/puppeteer/.local-chromium/win64-722234/chrome-win/`

## 项目依赖
接下来就自动安装项目的其他依赖包，运行 `npm i` 或者 `yarn`
## 运行项目
`npm run dev`
