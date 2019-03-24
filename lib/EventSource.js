"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var mergeWith = require('lodash/mergeWith');

var last = require('lodash/last');

var isObject = require('lodash/isObject');

var EventSource =
/*#__PURE__*/
function () {
  function EventSource(db) {
    var aggregate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, EventSource);

    this.db = db;
    this.aggregate = aggregate;
    this.reducer = this.reducer.bind(this);
    this.customizer = this.customizer.bind(this);
  }

  _createClass(EventSource, [{
    key: "onEvent",
    value: function onEvent(evt) {
      return this.db.insertEvent(evt.context, evt);
    }
  }, {
    key: "customizer",
    value: function customizer(objValue, srcValue, key) {
      if (this.aggregate[key]) {
        return Number(objValue || 0) + Number(srcValue || 0);
      } // Delete existing value


      if (objValue === null) {
        return null;
      }

      if (objValue === null || objValue === undefined) {
        return srcValue;
      }

      if (isObject(objValue) && isObject(srcValue)) {
        // const obj = mergeWith(objValue, srcValue, this.customizer);
        var obj = mergeWith(objValue, srcValue, this.customizer);
        return obj;
      }

      return objValue;
    }
  }, {
    key: "reducer",
    value: function reducer(acc, cur) {
      var obj = mergeWith({}, cur, acc, this.customizer.bind(this));
      return obj;
    }
  }, {
    key: "getState",
    value: function getState(context) {
      var _this = this;

      var createSnapshot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      return this.db.getSnapshot(context).then(function (snapshot) {
        return _this.db.getEvents(context, snapshot.seq).then(function (events) {
          if (snapshot.seq) {
            return events.filter(function (e) {
              return e.seq > snapshot.seq || e.isSnapshot;
            });
          }

          return events;
        }).then(function (events) {
          if (!events || events.length === 0) {
            return snapshot;
          }

          var state = events.reduce(_this.reducer, {});

          if (createSnapshot && state) {
            state.seq = last(events).seq; // create a snapshot every time for increased efficiency

            _this.snapshot(state);
          } // clean the state object


          delete state.isSnapshot;
          delete state.seq;
          return state;
        });
      });
    }
  }, {
    key: "snapshot",
    value: function snapshot(state) {
      if (!state) {
        // Creates a state and then recourses back here
        return this.getState(state.context);
      }

      return this.db.insertEvent(state, true);
    }
  }]);

  return EventSource;
}();

module.exports = EventSource;