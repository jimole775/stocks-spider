"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var mysql = require('mysql');
var assert = require('../../utils/assert');
function Mysql(option) {
    this.connection = mysql.createConnection({
        host: option.host,
        user: option.user,
        password: option.password
    });
    this.connection.connect();
    this.connection.query("CREATE DATABASE IF NOT EXISTS ".concat(option.database, ";"));
    this.connection.query("USE ".concat(option.database, ";"));
}
// Mysql.prototype.connection = {}
// Mysql.prototype.connect = function (option) {
// }
Mysql.prototype.create = function (table, map, callback) {
    var _this = this;
    if (!table)
        return new Error('创建表需要确认表名!');
    var keys = Object.keys(map);
    var values = Object.values(map);
    var entities = [];
    keys.forEach(function (key) {
        entities.push("".concat(key, " ").concat(map[key], " DEFAULT NULL"));
    });
    var sql = "CREATE TABLE IF NOT EXISTS ".concat(table, " (\n    id INT UNSIGNED NOT NULL AUTO_INCREMENT,\n    ").concat(entities.join(',\n'), ",\n    PRIMARY KEY(id)\n  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
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
};
Mysql.prototype.insert = function (table, map, callback) {
    var _this = this;
    if (!table)
        return new Error('插入表单数据需要确认表单名!');
    var keys = Object.keys(map);
    var values = Object.values(map);
    var sql = "INSERT INTO ".concat(table, " (").concat(keys, ") VALUES (").concat(values, ");");
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
};
Mysql.prototype.delete = function (table, map) {
    if (!table)
        return new Error('删除表单数据需要确认表单名!');
    var sql = "";
    if (map) {
        var entities = Object.entries(map).map(function (entries) { return entries.join('='); });
        sql = "DELETE FROM ".concat(table, " WHERE ").concat(entities);
    }
    else {
        sql = "DROP TABLE ".concat(table);
    }
    try {
        this.connection.query(sql);
    }
    catch (error) {
        console.log(error);
    }
};
Mysql.prototype.query = function (table, map, callback) {
    var _this = this;
    if (!table)
        return new Error('查询表单数据需要确认表单名!');
    var limit = '';
    var query = [];
    Object.keys(map).forEach(function (key) {
        var value = map[key];
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
    console.log('asdasd', table, map, sql);
    return new Promise(function (resolve, reject) {
        try {
            _this.connection.query(sql, function (err, result) {
                console.log('1111', err, result);
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
};
Mysql.prototype.update = function (table, map, callback) {
    var _this = this;
    if (!table)
        return new Error('更新表单数据需要确认表单名!');
    return new Promise(function (resolve, reject) {
        var sql = "UPDATE ".concat(table, " SET (").concat(mapToUpdateSql(map), ") WHERE id=").concat(map.id, ";");
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
};
Mysql.prototype.count = function (table, callback) {
    var _this = this;
    if (!table)
        return new Error('需要确认表单名!');
    return new Promise(function (resolve, reject) {
        try {
            _this.connection.query("SELECT count(*) FROM ".concat(table), function (err, result) {
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
};
Mysql.prototype.custom = function (table, sql, callback) {
    var _this = this;
    if (!table)
        return new Error('需要确认表单名!');
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
};
Mysql.prototype.disconnect = function (callback) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.connection.end(function (err) {
            if (err)
                return reject(err);
            if (callback)
                callback();
            resolve();
        });
    });
};
function mapToUpdateSql(map) {
    var cmap = __assign({}, map);
    delete cmap.id; // 去掉 id 字段
    var res = [];
    Object.keys(cmap).forEach(function (key) {
        res.push("".concat(key, "='").concat(cmap[key], "'"));
    });
    return res.join(',');
}
module.exports = Mysql;
