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
exports.__esModule = true;
var mongodb_1 = require("mongodb");
var uuid_1 = require("uuid");
var MongoDB = (function () {
    function MongoDB(dbpath, collectionName) {
        var _this = this;
        this.insertEvent = function (evt) { return __awaiter(_this, void 0, void 0, function () {
            var decorated, _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _b = (_a = Object).assign;
                        _c = [{}];
                        _d = {
                            _id: uuid_1.v1()
                        };
                        _e = evt.seq;
                        if (_e) return [3, 2];
                        return [4, this.getNextSequenceValue('es')];
                    case 1:
                        _e = (_f.sent());
                        _f.label = 2;
                    case 2:
                        decorated = _b.apply(_a, _c.concat([(_d.seq = _e,
                                _d), evt]));
                        return [2, this.collection.insertOne(decorated)];
                }
            });
        }); };
        this.getEvents = function (context, seq) {
            if (seq === void 0) { seq = 0; }
            return __awaiter(_this, void 0, void 0, function () {
                var query, docs;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            query = (_a = {}, _a[context.name] = context.value, _a);
                            if (seq) {
                                query.seq = {
                                    $gte: seq
                                };
                            }
                            return [4, this.collection
                                    .find(query)
                                    .sort({ seq: 1 })
                                    .toArray()];
                        case 1:
                            docs = _b.sent();
                            return [2, docs.map(function (l) {
                                    delete l._id;
                                    return l;
                                })];
                    }
                });
            });
        };
        this.dbpath = dbpath;
        this.collectionName = collectionName;
    }
    MongoDB.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, db, collection, sequences;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = new mongodb_1.MongoClient(this.dbpath, {
                            useNewUrlParser: true,
                            useUnifiedTopology: true
                        });
                        return [4, client.connect()];
                    case 1:
                        _a.sent();
                        return [4, client.db()];
                    case 2:
                        db = _a.sent();
                        return [4, db.collection(this.collectionName)];
                    case 3:
                        collection = _a.sent();
                        return [4, db.collection('__sequences')];
                    case 4:
                        sequences = _a.sent();
                        collection.createIndex({
                            seq: -1,
                            snapshot: 1
                        });
                        this.db = db;
                        this.collection = collection;
                        this.sequences = sequences;
                        return [2];
                }
            });
        });
    };
    MongoDB.prototype.getNextSequenceValue = function (sequenceName) {
        return __awaiter(this, void 0, void 0, function () {
            var sequenceDocument;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.sequences.findOneAndUpdate({ _id: sequenceName }, { $inc: { sequence_value: 1 } }, { upsert: true })];
                    case 1:
                        sequenceDocument = _a.sent();
                        if (!sequenceDocument.value) {
                            return [2, 1];
                        }
                        return [2, sequenceDocument.value.sequence_value];
                }
            });
        });
    };
    MongoDB.prototype.getSnapshot = function (context) {
        var _a;
        return this.collection.findOne((_a = {}, _a[context.name] = context.value, _a.isSnapshot = true, _a));
    };
    return MongoDB;
}());
exports.MongoDB = MongoDB;
exports["default"] = { MongoDB: MongoDB };
//# sourceMappingURL=mongo.js.map