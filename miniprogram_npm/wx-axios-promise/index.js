module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = { exports: {} }; __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); if(typeof m.exports === "object") { __MODS__[modId].m.exports.__proto__ = m.exports.__proto__; Object.keys(m.exports).forEach(function(k) { __MODS__[modId].m.exports[k] = m.exports[k]; var desp = Object.getOwnPropertyDescriptor(m.exports, k); if(desp && desp.configurable) Object.defineProperty(m.exports, k, { set: function(val) { __MODS__[modId].m.exports[k] = val; }, get: function() { return __MODS__[modId].m.exports[k]; } }); }); if(m.exports.__esModule) Object.defineProperty(__MODS__[modId].m.exports, "__esModule", { value: true }); } else { __MODS__[modId].m.exports = m.exports; } } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1583997050076, function(require, module, exports) {
var __TEMP__ = require('./src/lib/method.js');var method = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./src/lib/parameter.js');var parameter = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./src/lib/mixin.js');var mixin = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./src/lib/intercept.js');var intercept = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./src/CopyProxy');var CopyProxy = __REQUIRE_DEFAULT__(__TEMP__);
var __TEMP__ = require('./utils/finally');var getFinally = __REQUIRE_DEFAULT__(__TEMP__);
getFinally();
/**
 * options：Object,默认Object，设置默认的request参数
 * proxt：Boolean，默认为true，是否将wx的所有api都封装成Promise
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = function Api(options = {}, proxy = true) {
  //默认为get
  function api(url, data) {
    return this.method({ url, data, method: api.defaults.method })
  }
  //导入method方法
  method(api)
  //设置默认参数
  parameter(api)
  //混入默认配置
  mixin(api)
  //导入拦截方法
  intercept(api)
  /**
  *options 设置defaults
  */
  api.build = function (options, proxy) {
    let cp = new CopyProxy(this);
    let obj = cp.clone()
    if (proxy)
      cp.make(obj, 'wx', key => (url, data) => this.method({ url, data, api: key }));
    obj.options(options)
    obj.create = Api;
    return obj
  }
  api.options = function (options) {
    Object.keys(options).forEach(val => this.defaults[val] = options[val])
  }
  return api.build(options, proxy)
};
}, function(modId) {var map = {"./src/lib/method.js":1583997050077,"./src/lib/parameter.js":1583997050078,"./src/lib/mixin.js":1583997050080,"./src/lib/intercept.js":1583997050082,"./src/CopyProxy":1583997050083,"./utils/finally":1583997050084}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050077, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = function method(api){
  //所有request支持method
  const config = [
    'get',
    'post',
    'put',
    'delete',
    'options',
    'head',
    'trace',
    'connect'
  ]
  config.forEach(val => {
    api[val] = (url, data) => api.method({ url, data, method: val })
  })
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050078, function(require, module, exports) {
var __TEMP__ = require('./interceptors.js');var interceptors = __REQUIRE_DEFAULT__(__TEMP__);
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = function parameter(api){
  api.defaults = {
    url: '',
    method: 'get',
    dataType: 'json',
    responseType: 'text',
    header: {
      'content-type': "application/json"
    }
  }
  api.interceptors = {
    response: interceptors(),
    request: interceptors(),
  }
};

}, function(modId) { var map = {"./interceptors.js":1583997050079}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050079, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = function interceptors() {
  return {
    use(resolve, reject) {
      if (typeof resolve === 'function') this.success = resolve;
      if (typeof reject === 'function') this.error = reject;
    },
    success(config) {
      return config
    },
    error(error) {
      return error;
    }
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050080, function(require, module, exports) {
var __TEMP__ = require('../../utils/common');var isProtocol = __TEMP__['isProtocol'];
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = function mixin(api){
  api.dataMerging = function (fnData, url, data) {
    if (typeof url === 'string') {
      fnData.url = this.pathMerge(url)
      fnData.data = data;
      this.fnDefaults(fnData)
    } else if (typeof url === 'object') {
      url.url = this.pathMerge(url.url)
      Object.assign(fnData, url)
      this.fnDefaults(fnData)
    }
  }
  //判断是否需要添加默认值url
  api.pathMerge = function (url) {
    return isProtocol(url) ? url : this.defaults.url + url
  }
  api.fnDefaults = function (fnData) {
    ['dataType', 'responseType', 'header'].forEach(val => fnData[val] = fnData[val] ? fnData[val] : this.defaults[val])
  }
};
}, function(modId) { var map = {"../../utils/common":1583997050081}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050081, function(require, module, exports) {
/**
 * 克隆一个全新对象，但不能对dom对象和function
 * */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var newObj = exports.newObj = obj => JSON.parse(JSON.stringify(obj));
//判断开头是否http://或者https://的
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var isProtocol = exports.isProtocol = str => {
  let b = new RegExp('^http[s]?://')
  return b.test(str)
};
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050082, function(require, module, exports) {
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = function intercept(api){
  //包装成Promise返回
  api.method = function ({ url, data, method, api = 'request' }) {
    //为了方便用户传值
    try {
      //拦截发起请求
      return new Promise((resolve, reject) => {
        //拦截 HTTPS 
        let fnData = this.unite({ url, data, method, resolve, reject });
        fnData = this.interceptors.request.success(fnData)
        wx[api](fnData)
      });
    } catch (e) {
      return this.interceptors.request.error(e)
    }
  }
  //拦截 HTTPS ，返回参数
  api.unite = function ({ url, data, method, resolve, reject }) {
    let fnData = {
      success: res => {
        let data = this.interceptors.response.success(res)
        resolve(data)
      },
      fail: res => {
        let data = this.interceptors.response.error(res)
        reject(data)
      }
    }
    fnData.method = method;
    this.dataMerging(fnData, url, data)
    return fnData
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050083, function(require, module, exports) {
// import { newObj } from '../utils/common'
//用以代理abi，生成wx.api的Promise
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = class CopyProxy {
  constructor(stuff) {
    this.stuff = stuff;
  }
  clone() {
    //克隆本体函数
    let obj = typeof this.stuff === 'function'
      ? this.stuff.bind(this.stuff) : {}

    Object.assign(obj, this.stuff)
    return obj;
  }

  /**
   * obj
   * obj要代理的key
   * 触发的函数(返回代理的key)
   * 通过Proxy自动生成函数
   * ---------------------
   * proxy相对于definProperty是惰性的，触发get有返回key值参数，
   * 而definProperty触发get是没有key返回的。所以一开始就需要循环出所有的key来劫持
   * */
  make(obj = {}, soil, fn) {
    if (typeof Proxy === 'function') {
      return this.proxy(obj, soil, fn)
    } else {
      return this.defineProperty(obj, soil, fn)
    }
  }
  proxy(obj, soil, fn) {
    this.stuff[soil] = {};
    obj[soil] = new Proxy(this.stuff[soil], {
      get(target, key, receiver) {
        if (!target[key]) target[key] = fn(key)
        // receiver会循环
        return Reflect.get(target, key, receiver);
      }
    })
    return obj
  }
  defineProperty(obj, soil, fn) {
    let soilKey = {}
    obj[soil] = {}
    Object.keys(wx).forEach(wxApi => {
      Object.defineProperty(obj[soil], wxApi, {
        get() {
          if (!soilKey[wxApi]) soilKey[wxApi] = fn(wxApi)
          return soilKey[wxApi]
        },
      })
    })
    return obj
  }
};
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1583997050084, function(require, module, exports) {
function getFinally(){
  Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
      value => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => { throw reason })
    );
  };
}
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });exports.default = getFinally;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1583997050076);
})()
//# sourceMappingURL=index.js.map