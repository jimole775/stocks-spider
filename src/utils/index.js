module.exports = {
  ...require('./assert'),
  Link: require('./link'),
  sleep: require('./sleep'),
  quest: require('./quest'), // superagent的封装
  unique: require('./unique'), // 去重
  diffrence: require('./diffrence'), // 比对
  initPage: require('./init-page'),
  cmdParam: require('./cmd-param'),
  buildPath: require('./build-path'),
  removeDir: require('./remove-dir'),
  hasUnlinks: require('./has-unlinks'),
  BunchThread: require('./bunch-thread'),
  moneyFormat: require('./money-format'),
  readDirSync: require('./read-dir-sync'),
  connectStock: require('./connect-stock'),
  BunchLinking: require('./bunch-linking'),
  readFileSync: require('./read-file-sync'),
  writeFileSync: require('./write-file-sync'),
  recordUsedApi: require('./record-used-api'),
  klineApiFactory: require('./kline-api-factory'),
  dealApiFactory: require('./deal-api-factory'),
  hasRefreshLinks: require('./has-refresh-links'),
  removeSiblingDir: require('./remove-sibling-dir'),
  getPathSeparator: require('./get-path-separator'), // 获取路径分隔符
  requestApiInBunch: require('./request-api-in-bunch'),
}
