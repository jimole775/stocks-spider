## 环境依赖
需要保证系统可以安装 `nodejs` 和 `chromium`

nodejs就不用说了，由于 `chromium` 是墙外资源，如果你没有梯子，那么只有自己配置了

#### 1. 非翻墙情况下

不能翻墙的话，需要自己去下载 `chromium`

首先运行 `npm install puppeteer --ignore-scripts` 安装 puppeteer

然后到 [这里](https://chromium.en.lo4d.com/download) 下载一个 `chromium` 资源包

下载完成后，解压出资源目录 `chrome-win` 把它整个复制粘贴到 

`:/[你的项目]/node_modules/puppeteer/.local-chromium/win64-722234/chrome-win/`

如果 `:/[你的项目]/node_modules/puppeteer/` 下没有找到 `.local-chromium/win64-722234/` 目录，就用DOS工具创建一个

#### 2. 翻墙的情况下

要是有梯子，这便简单了

直接运行 `npm i` 或者 `yarn` 即可，`chromium` 会被自动安装，不用操心

## 项目依赖
接下来就是安装项目的其他依赖包，运行 `npm i` 或者 `yarn` 即可
## 运行项目
`npm run dev`
