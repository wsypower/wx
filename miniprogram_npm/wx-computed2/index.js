module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = { exports: {} }; __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); if(typeof m.exports === "object") { __MODS__[modId].m.exports.__proto__ = m.exports.__proto__; Object.keys(m.exports).forEach(function(k) { __MODS__[modId].m.exports[k] = m.exports[k]; var desp = Object.getOwnPropertyDescriptor(m.exports, k); if(desp && desp.configurable) Object.defineProperty(m.exports, k, { set: function(val) { __MODS__[modId].m.exports[k] = val; }, get: function() { return __MODS__[modId].m.exports[k]; } }); }); if(m.exports.__esModule) Object.defineProperty(__MODS__[modId].m.exports, "__esModule", { value: true }); } else { __MODS__[modId].m.exports = m.exports; } } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1583997050085, function(require, module, exports) {


/* util */
let hasProto = '__proto__' in {};

function type(val) {
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}

function isUndef(v) {
    return v === undefined || v === null;
}

function isObject(obj) {
    return obj !== null && typeof obj  === 'object';
}

function isPlainObject(obj) {
    return type(obj) === 'object';
}

function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    });
}

function noop() {}

function remove(arr, item) {
    if (arr.length) {
        let index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

function parsePath(path) {
    let segments = path.split('.');
    return function (obj) {
        obj = obj.data;
        for (let seg of segments) {
            if (!obj) return;
            obj = obj[seg];
        }
        return obj;
    };
}

/* 依赖搜集器 */
let uid = 0;
class Dep {
    constructor() {
        this.id = uid++;
        this.subs = [];
    }
    addSub(sub) {
        this.subs.push(sub);
    }
    removeSub(sub) {
        remove(this.subs, sub);
    }
    depend() {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    }
    notify() {
        this.subs.forEach(sub => sub.update());
    }
}

/* 依赖搜集开关 */
Dep.target = null;
let targetStack = [];
Dep.pushTarget = function pushTarget(target) {
    targetStack.push(target);
    Dep.target = target;
};
Dep.popTarget = function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
};

/* array */
let arrayProto = Array.prototype;
let arrayMethods = Object.create(arrayProto);

let methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
];

methodsToPatch.forEach(method => {
    let original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
        let result = original.apply(this, args);
        let ob = this.__ob__;
        let inserted;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
            default: break;
        }
        if (inserted) ob.observeArray(inserted);
        ob.dep.notify();
        return result;
    });
});

function dependArray(value) {
    value.forEach(val => {
        val && val.__ob__ && val.__ob__.dep.depend();
        if (Array.isArray(val)) {
            dependArray(val);
        }
    });
}

/* 消息订阅器 */
class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();
        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            if (hasProto) {
                value.__proto__ = arrayMethods;
            } else {
                Object.getOwnPropertyNames(arrayMethods).forEach(key => {
                    def(value, key, arrayMethods[key]);
                });
            }
            this.observeArray(value);
        } else {
            this.walk(value);
        }
    }
    walk(value) {
        Object.keys(value).forEach(key => {
            // 忽略__xxx__类似的特殊属性
            if (!/^__.*__$/gi.test(key)) {
                defineReactive(value, key);
            }
        });
    }
    observeArray(value) {
        value.forEach(val => Observer.observe(val));
    }
}
Observer.observe = function observe(value) {
    if (!isObject(value)) return;
    let ob = null;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else if (isPlainObject(value) || Array.isArray(value)) {
        ob = new Observer(value);
    }
    return ob;
};

/* 定义响应式属性 */
function defineReactive(obj, key, val) {
    let dep = new Dep();
    let property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) return;
    if (isUndef(val)) {
        val = obj[key];
    }

    let childOb = Observer.observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get() {
            if (Dep.target) {
                dep.depend();
                if (childOb) {
                    childOb.dep.depend();
                    if (Array.isArray(val)) {
                        dependArray(val);
                    }
                }
            }
            return val;
        },
        set(newVal) {
            if (newVal === val || (newVal !== newVal && val !== val)) return;
            val = newVal;
            childOb = Observer.observe(newVal);
            dep.notify();
        }
    });
}

/* 观察者队列 */

let queue = [];
let index = 0;
let has = {};
let flushing = false;
let waiting = false;

function flushWatcherQueue() {
    flushing = true;
    queue.sort((a, b) => a.id - b.id);
    for (index = 0; index < queue.length; index++) {
        let watcher = queue[index];
        has[watcher.id] = null;
        watcher.run();
    }
    index = queue.length = 0;
    has = {};
    flushing = waiting = false;
}

function queueWatcher(watcher) {
    let id = watcher.id;
    if (!has[id]) {
        has[id] = true;
        if (!flushing) {
            queue.push(watcher);
        } else {
            let i = queue.length - 1;
            while (i > index && queue[index].id > id) i--;
            queue.splice(i + 1, 0, watcher);
        }
        if (!waiting) {
            waiting = true;
            setTimeout(flushWatcherQueue, 0);
        }
    }
}

/* 观察者 */
let uid$2 = 0;
class Watcher {
    constructor(vm, key, expOrFn, cb) {
        this.id = uid$2++;
        this.vm = vm;
        // computed key
        this.key = key;
        // watch callback
        this.cb = cb || noop;
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();
        this.getter = noop;
        // 小程序setData时会触发setter，避免在setter中改变依赖项目而进入死循环
        this.isUpdating = false;

        if (typeof expOrFn === 'function') {
            // for computed
            this.getter = expOrFn;
        } else {
            // for watch
            this.getter = parsePath(expOrFn);
        }

        this.value = this.get();
        this.updateView();
    }
    get() {
        Dep.pushTarget(this);
        let value = '';
        try {
            value = this.getter.call(this.vm, this.vm);
        } catch (e) {

        } finally {
            Dep.popTarget();
            this.cleanupDeps();
        }
        return value;
    }
    addDep(dep) {
        let id = dep.id;
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    }
    cleanupDeps() {
        this.deps.forEach(dep => {
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this);
            }
        });
        let tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
    }
    update() {
        queueWatcher(this);
    }
    run() {
        let value = this.getter.call(this.vm, this.vm);
        if (value !== this.value || isObject(value)) {
            let oldVal = this.value;
            this.value = value;
            this.updateView();
            this.cb.call(this.vm, this.value, oldVal);
        }
    }
    depend() {
        this.deps.forEach(dep => dep.depend());
    }
    // 包装小程序更新视图的方法
    updateView() {
        if (!this.key || isUndef(this.value)) return;
        this.isUpdating = true;
        this.vm.setData({
            [this.key]: this.value
        });
        this.isUpdating = false;
    }
}

/* 各种初始化 */
function initData(vm) {
    Observer.observe(vm.data);
}

function initComputed(vm) {
    let computed = vm.computed;
    Object.keys(computed).forEach(key => {
        let userDef = computed[key];
        let getter = typeof userDef === 'function' ? userDef : userDef.get;
        let watcher = new Watcher(vm, key, getter || noop, noop);
        defineComputed(watcher, vm.data, key, userDef);
    });
}

let propertyConfig = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
};
function defineComputed(watcher, target, key, userDef) {
    if (typeof userDef === 'function') {
        propertyConfig.get = createComputedGetter(watcher);
        propertyConfig.set = noop;
    } else {
        propertyConfig.get = userDef.get ? createComputedGetter(watcher) : noop;
        propertyConfig.set = createComputedSetter(watcher, userDef.set);
    }
    Object.defineProperty(target, key, propertyConfig);
}

function createComputedGetter(watcher) {
    return function computedGetter() {
        if (watcher) {
            if (Dep.target) {
                watcher.depend();
            }
            return watcher.value;
        }
    };
}

function createComputedSetter(watcher, userDefSet) {
    return function computedSetter(val) {
        if (watcher) {
            if (!watcher.isUpdating) {
                userDefSet && userDefSet.call(watcher.vm, val);
            }
        }
    };
}

function initWatch(vm) {
    let watch = vm.watch;
    Object.keys(watch).forEach(key => new Watcher(vm, '', key, watch[key]));
}

/* 小程序中调用此接口进行注入 */
function vueComputed(vm) {
    if (!isPlainObject(vm)) {
        throw new Error('请传入小程序页面或组件实例！');
    }
    vm.data && initData(vm);
    vm.computed && initComputed(vm);
    vm.watch && initWatch(vm);
}

module.exports = vueComputed;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1583997050085);
})()
//# sourceMappingURL=index.js.map