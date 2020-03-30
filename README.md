## 环境依赖
需要保证系统可以安装 `nodejs`, `chromium`(由于 `chromium` 需要翻墙, 所以可能需要手动去下载)
#### 1. 翻墙的情况下

可以直接运行，`npm install puppeteer` 或者 `yarn add puppeteer` 就可以了

#### 2. 非翻墙情况下

首先运行 `npm install puppeteer --ignore-scripts` 安装puppeteer

然后到 [这里](https://chromium.en.lo4d.com/download) 下载chromium

下载完成后，解压出资源目录chrome-win把它整个复制粘贴到 

`:/[你的项目]/node_modules/puppeteer/.local-chromium/win64-722234/chrome-win/`

## 项目依赖
接下来就自动安装项目依赖，运行 `npm i` 或者 `yarn`
## 运行项目
`npm run dev`
