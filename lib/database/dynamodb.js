"use strict";

var _Interface = require("./Interface");

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _last = _interopRequireDefault(require("lodash/last"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DynamoDB =
/*#__PURE__*/
function () {
  function DynamoDB(_ref) {
    var _ref$table = _ref.table,
        table = _ref$table === void 0 ? process.env.DYNAMODB_TABLE : _ref$table,
        _ref$region = _ref.region,
        region = _ref$region === void 0 ? process.env.REGION : _ref$region,
        endpoint = _ref.endpoint;

    _classCallCheck(this, DynamoDB);

    this.table = table;
    var conf = {
      region: region,
      endpoint: endpoint
    };
    this.client = new _awsSdk.default.DynamoDB.DocumentClient(conf);
  }

  _createClass(DynamoDB, [{
    key: "insertEvent",
    value: function insertEvent(context, evt) {
      var _this = this;

      var params = {
        TableName: this.table,
        Item: Object.assign({}, {
          seq: Date.now()
        }, evt)
      };
      return new Promise(function (resolve, reject) {
        _this.client.put(params, function (err, data) {
          if (err) {
            return reject(err);
          }

          resolve(data);
        });
      });
    }
  }, {
    key: "getEvents",
    value: function getEvents(context) {
      var _this2 = this;

      var seq = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var params = {
        TableName: this.table,
        FilterExpression: 'seq >= :rkey and context = :ctx',
        ExpressionAttributeValues: {
          ':rkey': seq,
          ':ctx': context
        },
        ScanIndexForward: false
      };
      return new Promise(function (resolve, reject) {
        _this2.client.scan(params, function (err, result) {
          if (err) {
            return reject(err);
          }

          return resolve(result.Items);
        });
      });
    }
  }, {
    key: "getSnapshot",
    value: function getSnapshot(context) {
      var _this3 = this;

      var params = {
        TableName: this.table,
        FilterExpression: 'context = :ctx AND isSnapshot = :snp',
        ExpressionAttributeValues: {
          ':ctx': context,
          ':snp': true
        },
        ScanIndexForward: false
      };
      return new Promise(function (resolve, reject) {
        _this3.client.scan(params, function (err, result) {
          if (err) {
            return reject(err);
          }

          var l = (0, _last.default)(result.Items) || {};
          return resolve(l);
        });
      });
    }
  }]);

  return DynamoDB;
}();

module.exports = DynamoDB;