"use strict";
exports.__esModule = true;
var mysql = require('mysql');
var assert = require('../../utils/assert');
var Mysql = /** @class */ (function () {
    function Mysql(option) {
        this.create = create.bind(this);
        this.insert = insert.bind(this);
        this.del = del.bind(this);
        this.query = query.bind(this);
        this.update = update.bind(this);
        this.count = count.bind(this);
        this.custom = custom.bind(this);
        this.disconnect = disconnect.bind(this);
        this.connection = mysql.createConnection({
            host: option.host,
            user: option.user,
            password: option.password
        });
        this.connection.connect();
        this.connection.query("CREATE DATABASE IF NOT EXISTS ".concat(option.database, ";"));
        this.connection.query("USE ".concat(option.database, ";"));
        return this;
    }
    return Mysql;
}());
function create(table, map, callback) {
    var _this = this;
    if (!table)
        return Promise.reject('创建表需要确认表名!');
    var entries = Object.entries(map);
    var sentences = [];
    entries.forEach(function (entr) {
        sentences.push("".concat(entr[0], " ").concat(entr[1], " DEFAULT NULL"));
    });
    var sql = "CREATE TABLE IF NOT EXISTS ".concat(table, " (\n    id INT UNSIGNED NOT NULL AUTO_INCREMENT,\n    ").concat(sentences.join(',\n'), ",\n    PRIMARY KEY(id)\n  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
    return new Promise(function (resolve, reject) {
        try {
            _this.connection.query(sql, function (err, result) {
                if (err)
                    return reject(err);
                if (callback)
                    callback(result);
                resolve(result);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function insert(table, map, callback) {
    // if (!table) return new Error('插入表单数据需要确认表单名!')
    var keys = Object.keys(map);
    var values = Object.values(map);
    var sql = "INSERT INTO ".concat(table, " (").concat(keys, ") VALUES (").concat(values, ");");
    return new Promise(function (resolve, reject) {
        try {
            this.connection.query(sql, function (err, result) {
                if (err)
                    return reject(err);
                if (callback)
                    callback(result);
                resolve(result);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function del(table, map, callback) {
    if (!table)
        return Promise.reject('删除表单数据需要确认表单名!');
    var sql = "";
    if (map) {
        var entities = Object.entries(map).map(function (entries) { return entries.join('='); });
        sql = "DELETE FROM ".concat(table, " WHERE ").concat(entities);
    }
    else {
        sql = "DROP TABLE ".concat(table);
    }
    return new Promise(function (resolve, reject) {
        try {
            this.connection.query(sql, function (err, result) {
                if (err)
                    return reject(err);
                if (callback)
                    callback(result);
                resolve(result);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function query(table, map, callback) {
    if (!table)
        return Promise.reject('查询表单数据需要确认表单名!');
    var limit = '';
    var query = [];
    Object.entries(map).forEach(function (entries) {
        var key = entries[0];
        var value = entries[1];
        if (assert.isDate(value)) {
            if (/start/.test(key)) {
                var startKey = key.replace(/start/, '').replace(/^\w/, function (a) { return a.toLocaleLowerCase(); });
                query.push("".concat(startKey, ">='").concat(value, "'"));
            }
            else if (/end/.test(key)) {
                var endKey = key.replace(/end/, '').replace(/^\w/, function (a) { return a.toLocaleLowerCase(); });
                query.push("".concat(endKey, "<='").concat(value, "'"));
            }
            else {
                query.push("".concat(key, "='").concat(value, "'"));
            }
        }
        else if (key === 'page' || key === 'size') {
            limit = "".concat(map.page * map.size, ",").concat(map.size);
        }
        else {
            query.push("".concat(key, "=").concat(value));
        }
    });
    var sql = "SELECT * FROM ".concat(table);
    if (query.length) {
        sql += " WHERE ".concat(query.join(' AND '));
    }
    if (limit) {
        sql += " LIMIT ".concat(limit);
    }
    return new Promise(function (resolve, reject) {
        try {
            this.connection.query(sql, function (err, result) {
                if (err)
                    return reject(err);
                if (callback)
                    callback(result);
                resolve(result);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function update(table, map, callback) {
    if (!table)
        return Promise.reject('更新表单数据需要确认表单名!');
    return new Promise(function (resolve, reject) {
        var sql = "UPDATE ".concat(table, " SET (").concat(mapToUpdateSql(map), ") WHERE id=").concat(map.id, ";");
        try {
            this.connection.query(sql, function (err, result) {
                if (err)
                    return reject(err);
                if (callback)
                    callback(result);
                resolve(result);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function count(table, callback) {
    if (!table)
        return Promise.reject('需要确认表单名!');
    return new Promise(function (resolve, reject) {
        try {
            this.connection.query("SELECT count(*) FROM ".concat(table), function (err, result) {
                if (err)
                    return reject(err);
                var row = (result || [{}])[0];
                if (callback)
                    callback(row['count(*)']);
                resolve(row['count(*)']);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function custom(table, sql, callback) {
    if (!table)
        return Promise.reject('需要确认表单名!');
    return new Promise(function (resolve, reject) {
        try {
            this.connection.query(sql, function (err, result) {
                if (err)
                    return reject(err);
                if (callback)
                    callback(result);
                resolve(result);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function disconnect(callback) {
    return new Promise(function (resolve, reject) {
        this.connection.end(function (err) {
            if (err)
                return reject(err);
            if (callback)
                callback();
            resolve('');
        });
    });
}
function mapToUpdateSql(map) {
    var res = [];
    Object.entries(map).forEach(function (entries) {
        var key = entries[0];
        var val = entries[1];
        if (key !== 'id') {
            res.push("".concat(key, "='").concat(val, "'"));
        }
    });
    return res.join(',');
}
function isNotTable(tip, table) {
    if (!table)
        return Promise.reject("".concat(tip, "\u9700\u8981\u786E\u8BA4\u8868\u5355\u540D!"));
}
exports["default"] = Mysql;
