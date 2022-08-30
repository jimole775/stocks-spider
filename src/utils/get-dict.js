module.exports = function getDict (dictName) {
  const dictPath = path.join(global.$path.db.dict, dictName + '.json')
  if (fs.isExist(dictPath)) {
    return fs.readFileSync(dictPath)
  }
}
