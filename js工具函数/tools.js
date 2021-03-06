//检测数据是不是除了symbol 外的原始数据
function isStatic(value) {
  return (typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          typeof value === 'undefined' ||
          value === 'null')
}

//检测数据是不是原始数据
function isPrimitive() {
  return isStatic(value) || typeof value === 'symbol'
}

//检测数据是不是引用类型的数据（例如：arrays、functions，objects，regexes，new Number(0).以及new String('')）
function isObject (value) {
    let type = typeof value;
    return value != null && (type == 'object' || type == 'function')
}

//检查value是否类对象。如果是一个类值，那么它不应该是null 而且typeof 后面的结果是 object
function isObjectLike (value) {
  return value != null && typeof value == 'object'
}

//获取数据类型 ，返回结果为 Number 、String ,Object,Array,Date
function getRawType(value) {
    return Object.prototype.toString.call(value).slice(8,-1)
}
// 判断数据是不是Object类型的数据
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

// 判断数据是不是数组类型的数据
function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}

//将isArray挂载到Array 上
Array.isArray = Array.isArray || isArray;

//数组从小到大排序
function sortAB(arr) {
  arr.sort(function (a,b) {return a-b})
}

//是不是正则对象
function isRegExp (value) {
  return Object.prototype.toString.call(value) === '[Object RegExg]'
}

//是不是时间对象
function isDate(value) {
  return Object.prototype.toString.call(value) === '[object Date]'
}

//是不是浏览器内置函数
//内置函数toString后的主体代码块为 [native code] ，而非内置函数则为相关代码，所以非内置函数可以进行拷贝(toString后掐头去尾再由Function转)
function isNative(value) {
  return typeof value === 'function' && /native code/.test(value.toString())
}

//检查是不是函数
function isFunction(value) {
  return Object.prototype.toString.call(value) === '[object Function]'
}

// 检查 value 是不是有效的类数组长度
function isLength(value) {
  return typeof value === 'number' && value > -1 && value % 1 == 0 && value <= Number.MAX_SAFE_INTEGER
}

//检查是否是类数组
function isArrayLike (valuje) {
  return value != null && isLength(value.length) && !isFunction(value)
}

//检查数组是否为空、
//如果是null，直接返回true；如果是类数组，判断数据长度；如果是Object对象，判断是否具有属性；如果是其他数据，直接返回false(也可改为返回true)
function isEmpty(value) {
  if(value == null) {
    return true
  }
  if(isArrayLike(value)) {
    return !value.length
  } else if (isPlainObject.call(value, key)) {
    for (let key in value) {
      if (hasOwnProperty.call(value,key)){
        return false
      }
    }
    return true
  }
  return false
}

//记忆函数：缓存函数的运算结果
// 它的实现原理：创建一个对象，将我们所写的东西保存到这个对象中，如果说我们后面再次用到了这个东西，
// 那么 JavaScript 就不需要再计算一遍了，直接将这个对象中我们需要的东西提取出来e'd
function cached (fn) {
  let cache = Object.create(null)
  return function cachedFn(str) {
    let hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}
//需要详细分析一下怎么使用
//横线转驼峰命名
let camelizeRE = /-(\w)/g;
function camelize(str) {
  return str.replace(camelizeRE,function(_,s) {
    console.log(arguments);
    return s ? s.toUpperCase() : '';
  })
}
let _camelize = cached(camelize)

// 驼峰命名转横线命名
let hyphenateRE = /B([A-Z])/g;
function hyphenate(str) {
  return str.replace(hyphenateRE,'-$1').toLowerCase()
}
let _hyphenate = cached(hyphenate);

//字符串首位大写
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
let _capitalize  = cached(capitalize)

//将属性混合到目标对象中
function extend (to,_from) {
  for (let key in _from) {
    to[key] = _from[key]
  }
  return to
}

//对象属性复制，浅拷贝
Object.assgin = Object.assign || function () {
  if(arguments.length == 0) throw new TypeError('Cannot convert undefined or null to object');
  let target = arguments[0],
  args = Array.prototype.slice.call(arguments,1),
  key
  args.forEach(function(item){
    for (key in item) {
      item.hasOwnProperty(key) && (target[key] = item[key])
    }
  })
  return target
}

/**
 * 把一个对象的每一项都转化成可观测对象
 * @param { Object } obj 对象
 */
function observable (obj) {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  let keys = Object.keys(obj);
  keys.forEach((key) =>{
    defineReactive(obj,key,obj[key])
  })
  return obj;
}
/**
 * 使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 */
function defineReactive (obj,key,val) {
  Object.defineProperty(obj, key, {
    get(){
      console.log(`${key}属性被读取了`);
      return val;
    },
    set(newVal){
      console.log(`${key}属性被修改了`);
      val = newVal;
    }
  })
}
//观察发布
class Dep {
  constructor() {
    this.subs = []
  }

  //增加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }

  //判断是否增加订阅者
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target)
    }
  }
  //通知订阅者更新
  notify(){
    this.subs.forEach((sub) =>{
      sub.update()
    })
  }
}
Dep.target = null;

function defineReactive2 (obj,key,val) {
  let dep = new Dep();
  Object.defineProperty(obj, key, {
    get(){
      dep.depend();
      console.log(`${key}属性被读取了`);
      return val;
    },
    set(newVal){
      val = newVal;
      console.log(`${key}属性被修改了`);
      dep.notify()                    //数据变化通知所有订阅者
    }
  })
}

function observable2 (obj) {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  let keys = Object.keys(obj);
  keys.forEach((key) =>{
    defineReactive2(obj,key,obj[key])
  })
  return obj;
}


/**异步处理错误抛出**/
async function errorCaptured(asyncFunc) {
  try {
    let res = await asyncFunc()
    return [null,res]
  } catch (e) {
    return [e,null]
  }
}

//使用案例
async function func() {
  let [err,res] = errorCaptured(asyncFunc)
  if(err){
    //...抛出错误
  }
  //...正常流程
}

