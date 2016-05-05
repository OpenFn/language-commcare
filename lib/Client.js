'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.post = post;

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function post(_ref) {
  var url = _ref.url;
  var body = _ref.body;
  var authToken = _ref.authToken;
  var apiVersion = _ref.apiVersion;
  var action = _ref.action;

  return new Promise(function (resolve, reject) {
    _superagent2.default.post(url).type('form').query({
      "commcare_ACTION": action,
      "commcare_OUTPUT_FORMAT": "JSON",
      "commcare_ERROR_FORMAT": "JSON",
      "authtoken": authToken,
      "commcare_API_VERSION": apiVersion
    }).send(body).end(function (error, res) {
      if (!!error || !res.ok) {
        reject(error);
      }

      resolve(res);
    });
  });
}
