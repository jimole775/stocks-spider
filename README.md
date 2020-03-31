## 环境依赖
首先，要运行本APP，需要确保你的系统可以正常运行 nodejs 和 chromium，nodejs就不说了

chromium 是 puppeteer 库的底层依赖，必须安装，否则 puppeteer 的核心API无法使用

但是由于 chromium 是墙外资源，如果你没有梯子，那么只有自己配置了

#### 1. 非翻墙情况下

不能翻墙的话，需要自己去下载 chromium

首先运行 `npm install puppeteer --ignore-scripts` 安装 puppeteer

然后到 [这里](https://chromium.en.lo4d.com/download) 下载一个 chromium 资源包

下载完成后，解压出资源目录 *`chrome-win/`* 把它整个复制粘贴到 

> :/[你的项目]/node_modules/puppeteer/.local-chromium/win64-722234/chrome-win/

如果没有找到 *`.local-chromium/win64-722234/`* 目录，就用DOS工具创建一个

**注意**: *`/win64-722234/`* 是 puppeteer@2.1.1 用来声明依赖的 chromium 的最低版本的，所以，只要 chromium 的版本高于 **722234**  ，就可以把资源包扔进 *`/win64-722234/`* 目录

#### 2. 翻墙的情况下

如果你有梯子，就不用考虑那么多

直接运行 `npm i` 或者 `yarn` 即可，chromium 会被自动安装

## 项目依赖
接下来就是安装项目的其他依赖包，运行 `npm i` 或者 `yarn` 即可
## 运行项目
`npm run dev`
