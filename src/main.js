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
;
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var sniffStockHome, sniffDailyDeals, analyzerDeals, analyzerKlines, fs, path, base, codeMap_1, nameMap_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, require('./global.config')()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, require('./app/base/assistants/build-base-data')()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, require('./app/base/assistants/build-dict')()];
                case 3:
                    _a.sent();
                    console.log('Base info was loaded!');
                    sniffStockHome = require('./app/base/business/sniff-stock-home');
                    sniffDailyDeals = require('./app/base/business/sniff-daily-deals');
                    analyzerDeals = require('./app/analyze/deals');
                    analyzerKlines = require('./app/analyze/klines');
                    console.log('Main function was mounted!');
                    if (!['kline', 'quote', 'all'].includes(global.business)) return [3 /*break*/, 5];
                    console.log('Sniff stock home!');
                    return [4 /*yield*/, sniffStockHome(global.business)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!['deal', 'all'].includes(global.business)) return [3 /*break*/, 7];
                    console.log('Sniff daily deals!');
                    return [4 /*yield*/, sniffDailyDeals()];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    if (!['shadowline', 'all'].includes(global.business)) return [3 /*break*/, 9];
                    console.log('Analyzes deals into shadowline!');
                    return [4 /*yield*/, analyzerDeals.shadowline()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    if (!['vline', 'all'].includes(global.business)) return [3 /*break*/, 11];
                    console.log('Analyzes deals into vline!');
                    return [4 /*yield*/, analyzerDeals.vline()];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    if (!['strokeline', 'all'].includes(global.business)) return [3 /*break*/, 13];
                    console.log('Analyzes deals into strokeline!');
                    return [4 /*yield*/, analyzerDeals.strokeline()];
                case 12:
                    _a.sent();
                    _a.label = 13;
                case 13:
                    if (!['uline', 'all'].includes(global.business)) return [3 /*break*/, 15];
                    console.log('Analyzes klines into uline!');
                    return [4 /*yield*/, analyzerKlines.uline()];
                case 14:
                    _a.sent();
                    _a.label = 15;
                case 15:
                    if (!['lowerpoint', 'all'].includes(global.business)) return [3 /*break*/, 17];
                    console.log('Analyzes klines into lowerpoint!');
                    return [4 /*yield*/, analyzerKlines.lowerpoint()];
                case 16:
                    _a.sent();
                    _a.label = 17;
                case 17:
                    if (['test'].includes(global.business)) {
                        fs = require('fs');
                        path = require('path');
                        base = require(global.path.db.base_data);
                        codeMap_1 = {};
                        nameMap_1 = {};
                        base.data.forEach(function (stockItem) {
                            codeMap_1[stockItem.code] = stockItem.name;
                            nameMap_1[stockItem.name] = stockItem.code;
                        });
                        fs.writeFileSync(path.join(global.path.db.dict, 'code-name.json'), JSON.stringify(codeMap_1));
                        fs.writeFileSync(path.join(global.path.db.dict, 'name-code.json'), JSON.stringify(nameMap_1));
                        // fs.writeFileSync(global.path.db.base_data, JSON.stringify(base))
                    }
                    console.log('Process was end!');
                    process.exit();
                    return [2 /*return*/];
            }
        });
    });
})();
