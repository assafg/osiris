"use strict";

var _Interface = require("./Interface");

var _pg = require("pg");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PostresDB =
/*#__PURE__*/
function () {
  function PostresDB(_ref) {
    var _this = this;

    var connectionString = _ref.connectionString,
        table = _ref.table;

    _classCallCheck(this, PostresDB);

    this.table = table;
    this.client = new _pg.Client({
      connectionString: connectionString
    });
    this.client.connect(function (err) {
      if (err) {
        return console.log(err);
      }

      _this.initTable();
    });
  }

  _createClass(PostresDB, [{
    key: "initTable",
    value: function initTable() {
      var _this2 = this;

      this.client.query("CREATE TABLE IF NOT EXISTS \"".concat(this.table, "\" (\n                    id SERIAL NOT NULL PRIMARY KEY,\n                    context text NOT NULL,\n                    data JSON NOT NULL,\n                    isSnapshot boolean\n                )")).then(function () {
        _this2.client.query("CREATE INDEX IF NOT EXISTS context_idx ON \"".concat(_this2.table, "\"(context)"));
      }).catch(function (e) {
        if (e) {
          console.log(e);
        }
      });
    }
  }, {
    key: "insertEvent",
    value: function insertEvent(context, evt) {
      var query = "INSERT INTO \"".concat(this.table, "\"(context, data, isSnapshot) values($1, $2, $3)");
      delete evt.seq; // In PG the seq is the ID

      var isSnapshot = evt.isSnapshot;
      delete evt.isSnapshot;
      return this.client.query(query, [context, evt, isSnapshot]);
    }
  }, {
    key: "getEvents",
    value: function getEvents(context) {
      var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var query = "SELECT id as seq, data FROM \"".concat(this.table, "\" WHERE id>=$1 AND context=$2 ORDER by id");
      return this.client.query(query, [id, context]).then(function (res) {
        return res.rows;
      }).then(function (res) {
        return res.map(function (e) {
          return _objectSpread({}, e.data, {
            seq: e.seq,
            context: context
          });
        });
      });
    }
  }, {
    key: "getSnapshot",
    value: function getSnapshot(context) {
      var query = "select id as seq, data FROM ".concat(this.table, " WHERE context=$1 AND isSnapshot=true ORDER BY id DESC LIMIT 1");
      return this.client.query(query, [context]).then(function (res) {
        if (res.rows.length === 0) {
          return {};
        }

        return _objectSpread({}, res.rows[0].data, {
          seq: res.rows[0].seq,
          context: context
        });
      });
    }
  }]);

  return PostresDB;
}();

module.exports = PostresDB;