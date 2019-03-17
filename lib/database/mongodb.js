"use strict";

var _Interface = require("./Interface");

var _mongojs = _interopRequireDefault(require("mongojs"));

var _uuid = require("uuid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MongoDB =
/*#__PURE__*/
function () {
  function MongoDB(_ref) {
    var dbpath = _ref.dbpath,
        collection = _ref.collection;

    _classCallCheck(this, MongoDB);

    this.db = (0, _mongojs.default)(dbpath, [collection]);
    this.collection = this.db.collection(collection);
    this.collection.createIndex({
      seq: -1,
      context: 1,
      snapshot: 1
    });
  }

  _createClass(MongoDB, [{
    key: "insertEvent",
    value: function insertEvent(context, evt) {
      var _this = this;

      var decorated = Object.assign({}, {
        _id: (0, _uuid.v1)(),
        seq: Date.now(),
        context: context
      }, evt);
      return new Promise(function (resolve, reject) {
        _this.collection.insert(decorated, function (err, data) {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        });
      });
    }
  }, {
    key: "getEvents",
    value: function getEvents(context) {
      var _this2 = this;

      var seq = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return new Promise(function (resolve, reject) {
        var query = {
          context: context
        };

        if (seq) {
          query.seq = {
            $gte: seq
          };
        }

        _this2.collection.find(query, function (err, list) {
          if (err) {
            return reject(err);
          }

          return resolve(list.map(function (l) {
            delete l._id;
            return l;
          }));
        });
      });
    }
  }, {
    key: "getSnapshot",
    value: function getSnapshot(context) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.collection.find({
          context: context,
          isSnapshot: true
        }).limit(1, function (err, snapshot) {
          if (err) {
            return reject(err);
          }

          return resolve(snapshot.length > 0 ? snapshot[0] : {});
        });
      });
    }
  }]);

  return MongoDB;
}();

module.exports = MongoDB;