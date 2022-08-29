"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var path = require('path');
var quest = require("./utils/quest");
var cmdParam = require("./utils/cmd-param");
var readFileSync = require("./utils/read-file-sync");
var moment = require('moment');
module.exports = function config() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    global.env = 'prod';
                    global.blackName = /[ST|退]/;
                    // 命令行参数
                    global.crossEnv = cmdParam();
                    global.business = global.crossEnv.module;
                    // 如果执行busy指令，那么，每次只有1个web访问，并且需要睡眠3秒
                    // 主要是在公用WIFI中，不造成网络的负担
                    global.onBusyNetwork = global.crossEnv.netstat === 'busy';
                    global.sleepTimes = 3000; // 每一个访问的睡眠时长(ms)
                    global.bunchLimit = global.onBusyNetwork ? 1 : 50;
                    // 从站点上获取最后一天的交易日期
                    _a = global;
                    return [4 /*yield*/, getDate()
                        // vline模块配置项
                    ];
                case 1:
                    // 从站点上获取最后一天的交易日期
                    _a.finalDealDate = _b.sent();
                    // vline模块配置项
                    global.vline = {
                        time_dvd: 15 * 60 * 1000,
                        price_range: 0.05,
                        haevy_standard: 10 * 10000 // 大单的标准
                    };
                    // kline模块配置项
                    global.kline = {
                        page_size: 120 // 每次采集多少个交易日的数据
                    };
                    global.urlModel = readFileSync(path.resolve(__dirname, '../', 'url-model.yml'));
                    global.Mysql = require(path.join(__dirname, 'db-utils\\mysql\\index.js'));
                    // 资源路径别名
                    global.dir = {
                        root: path.resolve(__dirname, '../'),
                        src: path.join(__dirname),
                        utils: path.join(__dirname, 'utils'),
                        db_utils: path.join(__dirname, 'db-utils'),
                        db: {
                            home: "G:\\my_db\\stocks-spider",
                            api: "G:\\my_db\\stocks-spider\\api",
                            dict: "G:\\my_db\\stocks-spider\\dict",
                            stocks: "G:\\my_db\\stocks-spider\\stocks",
                            base_data: "G:\\my_db\\stocks-spider\\base.json"
                        }
                    };
                    // global.srcRoot = __dirname
                    // global.root = path.resolve(global.srcRoot, '../')
                    // global.utils = path.join(global.srcRoot, 'utils\\index.js')
                    // global.db_utils = path.join(global.srcRoot, 'db-utils\\mysql\\index.js')
                    // 数据库别名
                    // global.db_home = `G:\\my_db\\stocks-spider`
                    // global.path.db.api = `G:\\my_db\\stocks-spider\\api`
                    // global.path.db.dict = `G:\\my_db\\stocks-spider\\dict`
                    // global.path.db.stocks = `G:\\my_db\\stocks-spider\\stocks`
                    // global.path.db.base_data = `G:\\my_db\\stocks-spider\\base.json`
                    global.utils = require(path.join(__dirname, 'utils\\index.js'));
                    return [2 /*return*/, Promise.resolve(global)];
            }
        });
    });
};
function getDate() {
    var _this = this;
    // # 上证指数的数据，可以从里面筛出交易的时间
    // date: "http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176"
    // dateReg: "push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?"
    // SHome: "http://quote.eastmoney.com/zs000001.html"
    // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var dirtyData, pureData, curDate, dateString, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, quest('http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176')];
                case 1:
                    dirtyData = _a.sent();
                    pureData = JSON.parse(dirtyData.data.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'));
                    curDate = new Date((pureData.data.time || 0) * 1000);
                    dateString = moment(curDate).format('YYYY-MM-DD');
                    console.log(dateString);
                    return [2 /*return*/, resolve(dateString)];
                case 2:
                    error_1 = _a.sent();
                    console.log('getdate: ', error_1);
                    // 一般情况下，quest失败，不是网络异常，就是服务器异常，异常状态一般持续数秒或者数分钟，
                    // 为了防止无谓的请求，增加1秒间隔，多少能减少一下资源浪费
                    return [2 /*return*/, setTimeout(function () { getDate(); }, 1000)];
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
