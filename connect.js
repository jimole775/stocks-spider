const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const dbjson = require('./temp.json')
// Connection URL
const url = 'mongodb://localhost:27017'
const model = {
    simulateRoll: {'1,2,3': {'bit 1': {'head 1': 1}}},
    natrueRoll: {'1,2,3': {'bit 1': {'head 1': 1}}},
}
const simulateRoll = [
    {
        code: '123',
        bit1: {'head 1': 1, 'head 2': 1},
        bit2: {'head 1': 1, 'head 2': 1},
        bit3: {'head 1': 1, 'head 2': 1},
    }
]

// Database Name
const dbName = 'stocks'

const docNames = ['base_synthetical']

// Create a new MongoClient
const client = new MongoClient(url)

// Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err)
    const db = client.db(dbName)
    // reset(db)
    insertDocuments(db)
    // updateDocument(db)
    client.close()
})

function reset(db) {
    // const collection1 = db.collection(docNames[0])
    // const collection2 = db.collection(docNames[1])
    db['simulate_roll'].drop()
    db['nature_roll'].drop()
}

// 把对象转成数组
function transformData(srcObj) {
    srcObj = queryFields(srcObj)
    const res = []
    Object.keys(srcObj).forEach((key, index) => {
        const line = {}
        const item = srcObj[key]
        Object.keys(item).forEach((itemKey, itemIndex) => {
            line[itemKey] = JSON.stringify(item[itemKey])
        })
        res.push(line)
    })
    return res
}

function sortingKeys(srcObj) {
    if (Object.prototype.toString.call(srcObj) !== '[object Object]') return srcObj
    
    // bit, head
    const newObj = {}
    const keys = Object.keys(srcObj).sort()
    keys.forEach(key => {
        newObj[key] = srcObj[key]
    })

    return newObj
}

function queryFields(rollCollection) {
    Object.keys(rollCollection).forEach((fileName, fileIndex) => {
        rollCollection[fileName] = sortingKeys(rollCollection[fileName])
        const fileData = rollCollection[fileName]
        fileData['code'] = fileName.split('.')[0] // 过滤掉后缀和 "." 符号
        fileData['sum'] = 0
        Object.keys(fileData).forEach((bitKey, bitIndex) => {
            fileData[bitKey] = sortingKeys(fileData[bitKey])
            const bitData = fileData[bitKey]
            bitData['sum'] = 0            
            Object.keys(bitData).forEach((headKey, headIndex) => {
                // if (bitData[headKey] === 1) {
                //     delete bitData[headKey]
                // }
                if (bitData[headKey] && headKey !== 'sum') bitData['sum'] += bitData[headKey]   
            })
            if (bitData['sum']) fileData['sum'] += bitData['sum']
        })
    })
    return rollCollection
}

const insertDocuments = function (db, callback) {
    // Get the documents collection
    const collection1 = db.collection(docNames[0])
    // const collection2 = db.collection(docNames[1])
    debugger
    // Insert some documents
    collection1.insertMany(dbjson, function (err, result) {
        assert.equal(err, null)
        // assert.equal(3, result.result.n)
        // assert.equal(3, result.ops.length)
        callback && callback(result)
    })
}

// 更新表（文档）数据
const updateDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection(docName)
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ a : 1 }, { $set: { b : 2 }}, 
    function(err, result) {
        assert.equal(err, null)
        assert.equal(1, result.result.n)
        console.log("Updated the document with the field a equal to 2")
        callback && callback(result)
    })
}
  
// 删除表（文档）数据
const removeDocument = function(db, callback) {
    // Get the documents collection
    const collection = db.collection(docName)
    // Delete document where a is 3
    collection.deleteOne({ a : 3 }, function(err, result) {
        assert.equal(err, null)
        assert.equal(1, result.result.n)
        console.log("Removed the document with the field a equal to 3")
        callback && callback(result)
    }) 
}