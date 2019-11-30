"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var Inmemmory = (function () {
    function Inmemmory() {
        this.events = [];
    }
    Inmemmory.prototype.insertEvent = function (context, evt) {
        var _this = this;
        return new Promise(function (resolve) {
            var event = Object.assign({}, evt, {
                context: context,
                seq: _this.events.length
            });
            _this.events.push(event);
            resolve(event);
        });
    };
    Inmemmory.prototype.getEvents = function (context, seq) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(__spreadArrays(_this.events));
        });
    };
    Inmemmory.prototype.getSnapshot = function (context) {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this.events.find(function (e) { return e.isSnapshot; }));
        });
    };
    return Inmemmory;
}());
exports.Inmemmory = Inmemmory;
exports["default"] = { Inmemmory: Inmemmory };
//# sourceMappingURL=inmemmory.js.map