function deferred() {
    let methods;
    const promise = new Promise((resolve, reject)=>{
        methods = {
            resolve,
            reject
        };
    });
    return Object.assign(promise, methods);
}
async function createWebSocketClient(options) {
    const prom = deferred();
    const client = new WebSocket("ws://0.0.0.0:" + options.port);
    client.onopen = function() {
        prom.resolve();
    };
    client.onerror = function(e) {
        console.log("client got error");
        console.log(e);
    };
    await prom;
    console.log("ws client connected");
    return client;
}
var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _value, _callbacks;
class ReactivePrimitive {
    constructor(initialValue){
        _value.set(this, void 0);
        _callbacks.set(this, new Set);
        __classPrivateFieldSet(this, _value, initialValue);
    }
    valueOf() {
        return this.value;
    }
    [(_value = new WeakMap(), _callbacks = new WeakMap(), Symbol.toPrimitive)]() {
        return this.value;
    }
    get [Symbol.toStringTag]() {
        return `Destiny<${typeof __classPrivateFieldGet(this, _value)}>`;
    }
    async *[Symbol.asyncIterator]() {
        while(true){
            yield await this._nextUpdate();
        }
    }
    _nextUpdate() {
        return new Promise((resolve)=>{
            const cb = (v)=>{
                resolve(v);
                __classPrivateFieldGet(this, _callbacks).delete(cb);
            };
            __classPrivateFieldGet(this, _callbacks).add(cb);
        });
    }
    bind(callback, noFirstCall = false) {
        __classPrivateFieldGet(this, _callbacks).add(callback);
        if (!noFirstCall) callback(__classPrivateFieldGet(this, _value));
        return this;
    }
    update() {
        this.set(__classPrivateFieldGet(this, _value));
        return this;
    }
    set(value, ...noUpdate) {
        if (value !== __classPrivateFieldGet(this, _value)) {
            __classPrivateFieldSet(this, _value, value);
            [
                ...__classPrivateFieldGet(this, _callbacks).values()
            ].filter((cb)=>!noUpdate.includes(cb)
            ).forEach((cb)=>cb(value)
            );
        }
        return this;
    }
    set value(value) {
        this.set(value);
    }
    get value() {
        return __classPrivateFieldGet(this, _value);
    }
    static from(updater, ...refs) {
        const currentValue = ()=>updater(...refs.map((v)=>v.value
            ))
        ;
        const newRef = new ReactivePrimitive(currentValue());
        refs.forEach((ref)=>ref.bind(()=>queueMicrotask(()=>newRef.value = currentValue()
                )
            , true)
        );
        return newRef;
    }
    pipe(callback) {
        return ReactivePrimitive.from(callback, this);
    }
    truthy(valueWhenTruthy, valueWhenFalsy) {
        return this.pipe((v)=>v ? valueWhenTruthy : valueWhenFalsy
        );
    }
    falsy(valueWhenFalsy, valueWhenTruthy) {
        return this.pipe((v)=>v ? valueWhenTruthy : valueWhenFalsy
        );
    }
    ternary(condition, yes, no) {
        return this.pipe((v)=>condition(v) ? yes : no
        );
    }
}
var __classPrivateFieldSet1 = this && this.__classPrivateFieldSet || function(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet1 = this && this.__classPrivateFieldGet || function(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _resolve, _promise;
class Ref {
    constructor(){
        _resolve.set(this, void 0);
        _promise.set(this, new Promise((resolve)=>{
            __classPrivateFieldSet1(this, _resolve, resolve);
        }));
    }
    set value(element) {
        __classPrivateFieldGet1(this, _resolve).call(this, element);
    }
    then(callbackFn) {
        __classPrivateFieldSet1(this, _promise, __classPrivateFieldGet1(this, _promise).then(callbackFn));
        return this;
    }
    catch(callbackFn) {
        __classPrivateFieldSet1(this, _promise, __classPrivateFieldGet1(this, _promise).then(callbackFn));
        return this;
    }
    finally(callbackFn) {
        __classPrivateFieldGet1(this, _promise).finally(callbackFn);
        return this;
    }
}
_resolve = new WeakMap(), _promise = new WeakMap();
const pseudoRandomEncode = (count, coprime)=>(seed)=>seed * coprime % count
;
const idEncoder = pseudoRandomEncode(2n ** 20n, 387420489n);
function* pseudoRandomIdGenerator() {
    let i = 0n;
    while(true){
        yield idEncoder(++i).toString(36);
    }
}
const pseudoRandomId = pseudoRandomIdGenerator();
const registeredComponents = new Map();
function pascalToKebab(input) {
    return input.replace(/(?<!^)([A-Z])/g, "-$1").toLowerCase();
}
function register(componentConstructor, noHash = true) {
    const registeredName = registeredComponents.get(componentConstructor);
    if (registeredName) {
        return registeredName;
    }
    const givenName = componentConstructor.name;
    const name = `${givenName ? pascalToKebab(givenName) : "anonymous"}${noHash ? "" : `-${pseudoRandomId.next().value}`}`;
    customElements.define(name, componentConstructor);
    registeredComponents.set(componentConstructor, name);
    return name;
}
const deferredElements = new Map();
function xml(strings, ...props) {
    return parser1(strings, props, "xml");
}
const propToWatcherMap = {
    value: "input",
    checked: "change",
    valueAsDate: "change",
    valueAsNumber: "change"
};
function matchChangeWatcher(attributeName) {
    return propToWatcherMap[attributeName] ?? "";
}
function doOrBind(element, key, value, whatToDo) {
    if (value instanceof ReactivePrimitive) {
        const changeWatcher = matchChangeWatcher(key);
        if (changeWatcher) {
            element.addEventListener(changeWatcher, (e)=>{
                value.set(e.currentTarget?.[key], whatToDo);
            });
        }
        value.bind(whatToDo);
    } else {
        whatToDo(value);
    }
}
function attribute(attributes, element) {
    for (const [key, value] of attributes){
        doOrBind(element, key, value, (value1)=>element.setAttribute(key, String(value1))
        );
    }
}
function isObject(input) {
    return input && typeof input === "object";
}
function destinyRef(value, element) {
    if (!(value instanceof Ref)) {
        throw new TypeError(`Attribute value for destiny:ref must be a Ref, but it was [${isObject(value) ? `${value.constructor.name} (Object)` : `${String(value)} (${typeof value})`}] in \n${element.outerHTML}`);
    }
    queueMicrotask(()=>{
        value.value = element;
    });
}
function destinyIn(value, element) {
    if (!(value instanceof Function)) {
        throw new TypeError("Value of destiny:in must be a function");
    }
    queueMicrotask(()=>queueMicrotask(()=>void value(element)
        )
    );
}
function destinyOut(element, value) {
    deferredElements.set(element, value);
}
function destiny(data, element) {
    for (const [key, value] of data){
        switch(key){
            case "ref":
                destinyRef(value, element);
                break;
            case "in":
                destinyIn(value, element);
                break;
            case "out":
                destinyOut(element, value);
                break;
            default:
                throw new Error(`Invalid property "destiny:${key}" on element:\n${element.outerHTML}.`);
        }
    }
}
function prop(props, element) {
    for (const [key, value] of props){
        doOrBind(element, key, value, (item)=>element[key] = item
        );
    }
}
function call(methodCalls, element) {
    for (const [key, value] of methodCalls){
        doOrBind(element, key, value, (value1)=>{
            if (typeof element[key] === "function") {
                if (Array.isArray(value1)) {
                    element[key](...value1);
                } else {
                    element[key](value1);
                }
            }
        });
    }
}
function on(eventListeners, element) {
    for (const [key, value] of eventListeners){
        if (Array.isArray(value)) {
            element.addEventListener(key, ...value);
        } else {
            element.addEventListener(key, value);
        }
    }
}
function assignElementData(element, data) {
    attribute(data.attribute, element);
    destiny(data.destiny, element);
    prop(data.prop, element);
    call(data.call, element);
    on(data.on, element);
}
class DestinyElement1 extends HTMLElement {
    constructor(){
        super();
        Object.defineProperty(this, "forwardProps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "assignedData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                prop: new Map(),
                on: new Map(),
                call: new Map(),
                destiny: new Map(),
                attribute: new Map()
            }
        });
        Object.defineProperty(this, "template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: xml`<slot />`
        });
        if (new.target === DestinyElement1) {
            throw new TypeError("Can't initialize abstract class.");
        }
        const shadow = this.attachShadow({
            mode: "open"
        });
        queueMicrotask(()=>{
            if (this.forwardProps) {
                this.forwardProps.then((element)=>{
                    assignElementData(element, this.assignedData);
                });
            }
            shadow.appendChild(this.template.content);
        });
    }
    set destinySlot(_) {
    }
    replaceWith(...nodes) {
        if (this.destinySlot) {
            this.destinySlot.replaceItem(this, ...nodes);
        } else {
            super.replaceWith(...nodes);
        }
    }
    out(callback) {
        deferredElements.set(this, callback);
        return this;
    }
}
Object.defineProperty(DestinyElement1, "captureProps", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: false
});
const reactiveObjectFlag = Symbol("Reactive Object");
function reactiveObject1(input, parent) {
    let current = input;
    const prototypeChain = [];
    do {
        prototypeChain.unshift(Object.getOwnPropertyDescriptors(current));
    }while (current = Reflect.getPrototypeOf(current))
    Object.seal(Object.defineProperties(input, Object.fromEntries(Object.entries(Object.assign(prototypeChain.shift(), ...prototypeChain, {
        [reactiveObjectFlag]: {
            writable: false,
            enumerable: false,
            value: true
        }
    })).filter(([, { value , configurable  }])=>typeof value !== "function" && configurable
    ).map(propertyDescriptorToReactive1(parent)))));
    return input;
}
var __classPrivateFieldSet2 = this && this.__classPrivateFieldSet || function(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet2 = this && this.__classPrivateFieldGet || function(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _value1, _indices, _callbacks1, _length;
function toNumber(value) {
    try {
        return Number(value);
    } catch  {
        return NaN;
    }
}
const reactiveArrayProxyConfig = {
    deleteProperty (target, property) {
        const index = toNumber(property);
        if (!Number.isNaN(index)) {
            target.splice(index, 1);
            return true;
        } else {
            return false;
        }
    },
    get (target, property) {
        const index = toNumber(property);
        if (!Number.isNaN(index)) {
            return target.get(index);
        } else {
            const value = target[property];
            return typeof value === "function" ? value.bind(target) : value;
        }
    },
    set (target, property, value) {
        const index = toNumber(property);
        if (!Number.isNaN(index)) {
            target.splice(index, 1, value);
            return true;
        } else {
            return false;
        }
    }
};
class NotImplementedError extends Error {
    constructor(message1){
        super(message1);
        this.name = "NotImplementedError";
    }
}
class ReactiveArray1 {
    constructor(...input1){
        _value1.set(this, void 0);
        _indices.set(this, void 0);
        _callbacks1.set(this, new Set);
        _length.set(this, void 0);
        __classPrivateFieldSet2(this, _value1, makeNonPrimitiveItemsReactive1(input1, this));
        __classPrivateFieldSet2(this, _length, ReactivePrimitive.from(()=>__classPrivateFieldGet2(this, _value1).length
        , this));
        __classPrivateFieldSet2(this, _indices, input1.map((_, i)=>new ReactivePrimitive(i)
        ));
        return new Proxy(this, reactiveArrayProxyConfig);
    }
    *[(_value1 = new WeakMap(), _indices = new WeakMap(), _callbacks1 = new WeakMap(), _length = new WeakMap(), Symbol.iterator)]() {
        yield* __classPrivateFieldGet2(this, _value1);
    }
    async *[Symbol.asyncIterator]() {
        while(true){
            yield await this._nextUpdate();
        }
    }
    _nextUpdate() {
        return new Promise((resolve)=>{
            const cb = (...props)=>{
                resolve(props);
                __classPrivateFieldGet2(this, _callbacks1).delete(cb);
            };
            __classPrivateFieldGet2(this, _callbacks1).add(cb);
        });
    }
    get length() {
        return __classPrivateFieldGet2(this, _length);
    }
    get value() {
        return __classPrivateFieldGet2(this, _value1).slice(0);
    }
    setValue(items) {
        this.splice(0, __classPrivateFieldGet2(this, _value1).length, ...items);
        return this;
    }
    get(index) {
        const i = index < 0 ? __classPrivateFieldGet2(this, _value1).length + index : index;
        return __classPrivateFieldGet2(this, _value1)[i];
    }
    set(index, value) {
        this.splice(index, 1, value);
        return value;
    }
    _argsForFullUpdate() {
        return [
            0,
            __classPrivateFieldGet2(this, _value1).length,
            ...__classPrivateFieldGet2(this, _value1)
        ];
    }
    pipe(callback) {
        const ref = new ReactivePrimitive(callback(...this._argsForFullUpdate()));
        this.bind((...args)=>{
            ref.value = callback(...args);
        }, true);
        return ref;
    }
    bind(callback, noFirstRun = false) {
        __classPrivateFieldGet2(this, _callbacks1).add(callback);
        if (!noFirstRun) {
            callback(0, 0, ...__classPrivateFieldGet2(this, _value1));
        }
        return this;
    }
    unbind(callback) {
        __classPrivateFieldGet2(this, _callbacks1).delete(callback);
        return this;
    }
    concat(...items) {
        const newArr = this.clone();
        this.bind(newArr.splice.bind(newArr));
        const lengthTally = [
            this.length, 
        ];
        function currentOffset(cutoff, index = 0) {
            let tally = index;
            for(let i = 0; i < cutoff; i++){
                tally += lengthTally[i].value;
            }
            return tally;
        }
        for (const [i, item] of items.entries()){
            if (item instanceof ReactiveArray1) {
                item.bind((index, deleteCount, ...values)=>newArr.splice(currentOffset(i, index), deleteCount, ...values)
                );
                lengthTally.push(item.length);
            } else if (item instanceof ReactivePrimitive) {
                item.bind((value)=>newArr.splice(currentOffset(i), 1, value)
                );
                lengthTally.push({
                    value: 1
                });
            } else if (Array.isArray(item)) {
                newArr.splice(currentOffset(i), 0, ...item);
                lengthTally.push({
                    value: item.length
                });
            } else {
                newArr.splice(currentOffset(i), 0, item);
                lengthTally.push({
                    value: 1
                });
            }
        }
        return newArr;
    }
    copyWithin(target, start = 0, end = __classPrivateFieldGet2(this, _value1).length) {
        const { length  } = __classPrivateFieldGet2(this, _value1);
        target = (target + length) % length;
        start = (start + length) % length;
        end = (end + length) % length;
        const deleteCount = Math.min(length - start, end - start);
        this.splice(target, deleteCount, ...__classPrivateFieldGet2(this, _value1).slice(start, deleteCount + start));
        return this;
    }
    fill(value, start = 0, end = __classPrivateFieldGet2(this, _value1).length) {
        const length = end - start;
        this.splice(start, length, ...Array.from({
            length
        }, ()=>value
        ));
        return this;
    }
    mutFilter(callback) {
        __classPrivateFieldGet2(this, _value1).flatMap((v, i, a)=>callback(v, i, a) ? [] : i
        ).reduce((acc, indexToDelete)=>{
            if (!acc.length || acc[0][0] + acc[0][1] !== indexToDelete) {
                acc.unshift([
                    indexToDelete,
                    1
                ]);
            } else {
                acc[0][1]++;
            }
            return acc;
        }, []).forEach((args)=>{
            this.splice(...args);
        });
        return this;
    }
    mutMap(callback) {
        __classPrivateFieldGet2(this, _value1).flatMap((v, i, a)=>{
            const newValue = callback(v, i, a);
            return newValue === v ? [] : {
                index: i,
                value: newValue
            };
        }).reduce((acc, { index , value  })=>{
            if (!acc.length || acc[0][0] + acc[0][1] !== index) {
                acc.unshift([
                    index,
                    1,
                    value
                ]);
            } else {
                acc[0][1]++;
                acc[0].push(value);
            }
            return acc;
        }, []).forEach((args)=>{
            this.splice(...args);
        });
        return this;
    }
    pop() {
        return this.splice(-1, 1)[0];
    }
    push(...items) {
        this.splice(__classPrivateFieldGet2(this, _value1).length, 0, ...items);
        return this.length;
    }
    reverse() {
        this.setValue(__classPrivateFieldGet2(this, _value1).reverse());
        return this;
    }
    shift() {
        return this.splice(0, 1)[0];
    }
    sort(compareFn) {
        this.setValue(__classPrivateFieldGet2(this, _value1).sort(compareFn));
        return this;
    }
    splice(start, deleteCount = __classPrivateFieldGet2(this, _value1).length - start, ...items) {
        if (start > __classPrivateFieldGet2(this, _value1).length) {
            throw new RangeError("Out of bounds assignment. Sparse arrays are not allowed. Consider using .push() instead.");
        }
        this._adjustIndices(start, deleteCount, items);
        const reactiveItems = makeNonPrimitiveItemsReactive1(items, this);
        const deletedItems = __classPrivateFieldGet2(this, _value1).splice(start, deleteCount, ...reactiveItems);
        this._dispatchUpdateEvents(start, deleteCount, reactiveItems);
        return deletedItems;
    }
    _dispatchUpdateEvents(start, deleteCount, newItems = []) {
        for (const callback of __classPrivateFieldGet2(this, _callbacks1)){
            queueMicrotask(()=>{
                callback(start, deleteCount, ...newItems);
            });
        }
    }
    _adjustIndices(start, deleteCount, items) {
        const shiftedBy = items.length - deleteCount;
        if (shiftedBy) {
            for(let i = start + deleteCount; i < __classPrivateFieldGet2(this, _indices).length; i++){
                __classPrivateFieldGet2(this, _indices)[i].value += shiftedBy;
            }
        }
        const removedIndices = __classPrivateFieldGet2(this, _indices).splice(start, deleteCount, ...items.map((_, i)=>new ReactivePrimitive(i + start)
        ));
        for (const removedIndex of removedIndices){
            removedIndex.value = -1;
        }
    }
    update() {
        this._dispatchUpdateEvents(0, 0);
        return this;
    }
    unshift(...items) {
        this.splice(0, 0, ...items);
        return this.length;
    }
    filter(callback) {
        const newArr = new ReactiveArray1;
        this.bind(()=>newArr.setValue(__classPrivateFieldGet2(this, _value1).filter(callback))
        );
        return newArr;
    }
    flat(depth = 1) {
        throw new NotImplementedError("See https://github.com/0kku/destiny/issues/1");
    }
    flatMap(callback) {
        throw new NotImplementedError("See https://github.com/0kku/destiny/issues/1");
    }
    map(callback) {
        const cb = (v, i)=>callback(v, __classPrivateFieldGet2(this, _indices)[i], this)
        ;
        const newArr = new ReactiveArray1(...__classPrivateFieldGet2(this, _value1).map(cb));
        __classPrivateFieldGet2(this, _callbacks1).add((index, deleteCount, ...values)=>newArr.splice(index, deleteCount, ...values.map((v, i)=>cb(v, i + index)
            ))
        );
        return newArr;
    }
    clone() {
        return new ReactiveArray1(...__classPrivateFieldGet2(this, _value1));
    }
    slice(start = 0, end = __classPrivateFieldGet2(this, _value1).length - 1) {
        const newArr = new ReactiveArray1(...__classPrivateFieldGet2(this, _value1).slice(start, end));
        this.bind((index, deleteCount, ...values)=>newArr.splice(index - start, deleteCount, ...values.slice(0, end - start - index))
        );
        return newArr;
    }
    indexOf(...args) {
        const index = __classPrivateFieldGet2(this, _value1).indexOf(...args);
        return index === -1 ? new ReactivePrimitive(-1) : __classPrivateFieldGet2(this, _indices)[index];
    }
    lastIndexOf(...args) {
        const index = __classPrivateFieldGet2(this, _value1).lastIndexOf(...args);
        return index === -1 ? new ReactivePrimitive(-1) : __classPrivateFieldGet2(this, _indices)[index];
    }
    join(...args) {
        return this.pipe(()=>__classPrivateFieldGet2(this, _value1).join(...args)
        );
    }
    every(...args) {
        return this.pipe(()=>__classPrivateFieldGet2(this, _value1).every(...args)
        );
    }
    some(...args) {
        return this.pipe(()=>__classPrivateFieldGet2(this, _value1).some(...args)
        );
    }
    exclusiveSome(cb) {
        return this.pipe(()=>{
            const mappedValues = __classPrivateFieldGet2(this, _value1).map(cb);
            return mappedValues.includes(false) && mappedValues.includes(true);
        });
    }
    forEach(...args) {
        __classPrivateFieldGet2(this, _value1).forEach(...args);
        this.bind((_index, _deleteCount, ...addedItems)=>addedItems.forEach(...args)
        );
    }
    reduce(...args) {
        return this.pipe(()=>__classPrivateFieldGet2(this, _value1).reduce(...args)
        );
    }
    reduceRight(...args) {
        return this.pipe(()=>__classPrivateFieldGet2(this, _value1).reduceRight(...args)
        );
    }
    find(...args) {
        return __classPrivateFieldGet2(this, _value1).find(...args);
    }
    findIndex(...args) {
        const index = __classPrivateFieldGet2(this, _value1).findIndex(...args);
        return index === -1 ? new ReactivePrimitive(-1) : __classPrivateFieldGet2(this, _indices)[index];
    }
    entries() {
        const array = new ReactiveArray1(...__classPrivateFieldGet2(this, _value1).entries());
        this.bind((index, deleteCount, ...addedItems)=>{
            array.splice(index, deleteCount, ...addedItems.entries());
        }, true);
        return array;
    }
    keys() {
        const array = new ReactiveArray1(...__classPrivateFieldGet2(this, _value1).keys());
        this.bind((index, deleteCount, ...addedItems)=>{
            array.splice(index, deleteCount, ...addedItems.keys());
        }, true);
        return array;
    }
    values() {
        const array = new ReactiveArray1(...__classPrivateFieldGet2(this, _value1).values());
        this.bind((index, deleteCount, ...addedItems)=>{
            array.splice(index, deleteCount, ...addedItems.values());
        }, true);
        return array;
    }
    includes(...args) {
        return this.pipe(()=>__classPrivateFieldGet2(this, _value1).includes(...args)
        );
    }
}
const cache = new WeakMap;
function isReactive(input1) {
    return [
        ReactiveArray3,
        ReactivePrimitive, 
    ].some((constr)=>input1 instanceof constr
    ) || input1 && typeof input1 === "object" && reactiveObjectFlag in input1;
}
function generateFn(templ, args) {
    const functionBody = templ.reduce((acc, v, i)=>`${acc}args[${i - 1}]${isReactive(args[i - 1]) ? ".value" : ""}${v}`
    );
    return new Function("args", `return (${functionBody})`);
}
function reactive1(initialValue1, options = {
}) {
    if (isReactive(initialValue1)) {
        return initialValue1;
    }
    const { parent  } = options;
    let ref;
    if (isObject(initialValue1)) {
        if (Array.isArray(initialValue1)) {
            ref = new ReactiveArray4(...initialValue1);
        } else if (initialValue1 instanceof Promise) {
            const temp = new ReactivePrimitive(options.fallback);
            void initialValue1.then((value)=>temp.value = value
            );
            ref = temp;
        } else if (isSpecialCaseObject2(initialValue1)) {
            ref = new ReactivePrimitive(initialValue1);
        } else {
            return reactiveObject2(initialValue1, options.parent);
        }
    } else {
        ref = new ReactivePrimitive(initialValue1);
    }
    if (parent) {
        ref.bind(()=>parent.update()
        );
    }
    return ref;
}
class Renderable {
}
var __classPrivateFieldSet3 = this && this.__classPrivateFieldSet || function(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet3 = this && this.__classPrivateFieldGet || function(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _template, _props;
class TemplateResult extends Renderable {
    constructor(template, props){
        super();
        _template.set(this, void 0);
        _props.set(this, void 0);
        __classPrivateFieldSet3(this, _template, template);
        __classPrivateFieldSet3(this, _props, props);
    }
    get content() {
        const content = __classPrivateFieldGet3(this, _template).content.cloneNode(true);
        hookSlotsUp1(content, __classPrivateFieldGet3(this, _props));
        return content;
    }
}
_template = new WeakMap(), _props = new WeakMap();
const templateCache = new WeakMap();
function getFromCache(key, set, props1) {
    const template1 = templateCache.get(key);
    if (!template1) {
        const newTemplate = set();
        templateCache.set(key, newTemplate);
        return newTemplate[0];
    } else {
        for (const [k, v] of template1[1]){
            if (props1[k] !== v) return set()[0];
        }
        return template1[0];
    }
}
function parser(strings, props1, parser1) {
    const template1 = getFromCache(strings, ()=>createTemplate1(strings, props1, parser1)
    , props1);
    return new TemplateResult(template1, props1);
}
const parser1 = parser;
function propertyDescriptorToReactive(parent) {
    return (propertyDescriptorEntry)=>{
        const [key, descriptor] = propertyDescriptorEntry;
        const get = descriptor.get?.bind(descriptor);
        const set = descriptor.set?.bind(descriptor);
        if (get && !set || !get && set) {
            return propertyDescriptorEntry;
        }
        descriptor.configurable = false;
        const ref = reactive3(descriptor.value, {
            parent
        });
        if (!(get && set)) {
            descriptor.value = ref;
        } else {
            if (!(ref instanceof ReactivePrimitive)) {
                descriptor.writable = false;
            }
            descriptor.get = ()=>{
                get();
                return ref;
            };
            descriptor.set = (value)=>{
                if (ref instanceof ReactivePrimitive) {
                    set(value);
                    ref.value = get();
                } else {
                    throw new TypeError(`Illegal assignment to reactive object field ${key}`);
                }
            };
        }
        return propertyDescriptorEntry;
    };
}
function makeNonPrimitiveItemsReactive(items, parent) {
    return items.map((v)=>{
        return isReactive(v) || !isObject(v) || isSpecialCaseObject1(v) ? v : reactive2(v, {
            parent: parent
        });
    });
}
const specialCaseObjects = [
    Function,
    Date,
    RegExp,
    DocumentFragment,
    TemplateResult, 
];
function isSpecialCaseObject(input1) {
    const type = typeof input1;
    if (type === "function") return true;
    else if (type !== "object") return false;
    else return specialCaseObjects.some((constr)=>input1 instanceof constr
    );
}
function resolveSlotPositions(value) {
    return [
        ...value.matchAll(/(?<start>^.+?)?__internal_(?<index>[0-9]+)_(?<after>.+?(?=__internal_(?:[0-9]+)_|$))?/gu)
    ];
}
function kebabToCamel(input1) {
    return input1.replace(/(-[a-z])/g, (match)=>match[1].toUpperCase()
    );
}
const validNamespaces = [
    "attribute",
    "prop",
    "call",
    "on",
    "destiny"
];
function isValidNamespace(input1) {
    return validNamespaces.includes(input1);
}
function parseAttributeName(input1) {
    const { namespace ="attribute" , attributeNameRaw ,  } = /(?:(?<namespace>[a-z]+):)?(?<attributeNameRaw>.+)/.exec(input1)?.groups ?? {
    };
    const attributeName = namespace !== "attribute" ? kebabToCamel(attributeNameRaw) : attributeNameRaw;
    if (!isValidNamespace(namespace)) {
        throw new Error("Invalid namespace");
    }
    return [
        namespace,
        attributeName
    ];
}
function resolveAttributeValue(val, props1) {
    let attrVal;
    if (val.length === 1 && !val[0].groups.start && !val[0].groups.after) {
        attrVal = props1[Number(val[0].groups.index)];
    } else {
        const resolvedValue = val.reduce((acc, value)=>{
            const item = props1[Number(value.groups.index)];
            if (item instanceof ReactivePrimitive) {
                acc.items.push(item);
                acc.trailings.push(value.groups.after ?? "");
            } else {
                acc.trailings[acc.trailings.length - 1] += String(item) + (value.groups.after ?? "");
            }
            return acc;
        }, {
            items: [],
            trailings: [
                val[0]?.groups.start ?? ""
            ]
        });
        if (resolvedValue.items.length) {
            attrVal = ReactivePrimitive.from((...args)=>resolvedValue.trailings.reduce((a, v, i)=>a + String(args[i]) + v
                )
            , ...resolvedValue.items);
        } else {
            attrVal = resolvedValue.trailings[0];
        }
    }
    return attrVal;
}
function hookAttributeSlotsUp(templ, props1) {
    const attributeSlots = Object.values(templ.querySelectorAll("[destiny\\:attr],[data-capture-props]"));
    for (const element of attributeSlots){
        const { captureProps  } = element.dataset;
        const values = {
            prop: new Map(),
            on: new Map(),
            call: new Map(),
            destiny: new Map(),
            attribute: new Map()
        };
        for (const { name , value  } of element.attributes){
            const val = resolveSlotPositions(value);
            if (!val.length) {
                if (captureProps && name !== "destiny:attr") {
                    const [namespace, attributeName] = parseAttributeName(name);
                    values[namespace].set(attributeName, value);
                }
                continue;
            }
            const attrVal = resolveAttributeValue(val, props1);
            const [namespace, attributeName] = parseAttributeName(name);
            values[namespace].set(attributeName, attrVal);
        }
        if (captureProps) {
            queueMicrotask(()=>{
                element.assignedData = values;
            });
        } else {
            assignElementData(element, values);
        }
    }
}
function hookSlotsUp(template1, props1) {
    hookAttributeSlotsUp(template1, props1);
    hookContentSlotsUp1(template1, props1);
}
function hookContentSlotsUp(templ, props1) {
    const contentSlots = Object.values(templ.querySelectorAll("[destiny\\:content]"));
    for (const contentSlot of contentSlots){
        const index = contentSlot.getAttribute("destiny:content");
        const item = props1[Number(index)];
        if (item instanceof ReactivePrimitive) {
            const slot = new Slot3(contentSlot);
            item.bind((value)=>{
                slot.update(valueToFragment3(value));
            });
        } else if (item instanceof ReactiveArray2) {
            new SlotArray1(contentSlot, item);
        } else {
            new Slot3(contentSlot, valueToFragment3(item));
        }
    }
}
function nodeToFragment(node) {
    const fragment = new DocumentFragment;
    fragment.append(node);
    return fragment;
}
const nonRenderedValues = new Set([
    undefined,
    null,
    true,
    false, 
]);
const shouldBeRendered = (input1)=>!nonRenderedValues.has(input1)
;
const stringifyValue = (input1)=>shouldBeRendered(input1) ? String(input1) : ""
;
function valueToFragment1(value) {
    if (value instanceof TemplateResult) {
        return value.content;
    } else if (value instanceof DocumentFragment) {
        return value;
    } else if (value instanceof Node) {
        return nodeToFragment(value);
    } else if (Array.isArray(value)) {
        return arrayToFragment1(value);
    } else {
        return nodeToFragment(new Text(stringifyValue(value)));
    }
}
function arrayToFragment(values) {
    const fragment = new DocumentFragment;
    fragment.append(...values.filter(shouldBeRendered).map(valueToFragment2));
    return fragment;
}
var __classPrivateFieldSet4 = this && this.__classPrivateFieldSet || function(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet4 = this && this.__classPrivateFieldGet || function(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _id, _startAnchor, _endAnchor, _nodes;
let counter = 0;
class Slot1 {
    constructor(placeholderNode, content){
        _id.set(this, counter++);
        _startAnchor.set(this, new Comment(`<DestinySlot(${__classPrivateFieldGet4(this, _id)})>`));
        _endAnchor.set(this, new Comment(`</DestinySlot(${__classPrivateFieldGet4(this, _id)})>`));
        _nodes.set(this, void 0);
        __classPrivateFieldSet4(this, _nodes, [
            placeholderNode
        ]);
        placeholderNode.replaceWith(__classPrivateFieldGet4(this, _startAnchor), placeholderNode, __classPrivateFieldGet4(this, _endAnchor));
        if (content) {
            this.update(content);
        }
    }
    replaceItem(whatToReplace, ...nodes) {
        const location = __classPrivateFieldGet4(this, _nodes).indexOf(whatToReplace);
        if (location < 0) throw new Error("Can't replace an item that isn't here.");
        const newNodes = nodes.flatMap((v)=>typeof v === "string" ? new Text(v) : v instanceof DocumentFragment ? [
                ...v.childNodes
            ] : v
        );
        this._brandNodes(newNodes);
        whatToReplace.before(...newNodes);
        void this._disposeNodes([
            whatToReplace
        ]);
        __classPrivateFieldGet4(this, _nodes).splice(location, 1, ...newNodes);
    }
    _brandNodes(nodes) {
        nodes.forEach((node)=>node.destinySlot = this
        );
    }
    update(input) {
        const fragment = input instanceof TemplateResult ? input.content : input;
        void this._disposeCurrentNodes();
        __classPrivateFieldSet4(this, _nodes, Object.values(fragment.childNodes));
        this._brandNodes(__classPrivateFieldGet4(this, _nodes));
        __classPrivateFieldGet4(this, _endAnchor).before(fragment);
    }
    async _disposeNodes(nodesToDisposeOf) {
        await Promise.all(nodesToDisposeOf.map((node)=>deferredElements.get(node)?.(node)
        ));
        for (const node of nodesToDisposeOf){
            node.remove();
        }
    }
    async _disposeCurrentNodes() {
        await this._disposeNodes(__classPrivateFieldGet4(this, _nodes).splice(0, __classPrivateFieldGet4(this, _nodes).length));
    }
    async remove() {
        await this._disposeCurrentNodes();
        __classPrivateFieldGet4(this, _startAnchor).remove();
        __classPrivateFieldGet4(this, _endAnchor).remove();
    }
    insertBeforeThis(...nodes) {
        __classPrivateFieldGet4(this, _startAnchor).before(...nodes);
    }
}
_id = new WeakMap(), _startAnchor = new WeakMap(), _endAnchor = new WeakMap(), _nodes = new WeakMap();
var __classPrivateFieldGet5 = this && this.__classPrivateFieldGet || function(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet5 = this && this.__classPrivateFieldSet || function(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _startAnchor1, _endAnchor1, _source, _domArray;
class SlotArray {
    constructor(placeholderNode1, source){
        _startAnchor1.set(this, new Comment("<DestinyArray>"));
        _endAnchor1.set(this, new Comment("</DestinyArray>"));
        _source.set(this, void 0);
        _domArray.set(this, []);
        Object.defineProperty(this, "update", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (index, deleteCount, ...items)=>{
                this._removeFromDom(index, deleteCount);
                this._insertToDom(index, ...items);
            }
        });
        placeholderNode1.replaceWith(__classPrivateFieldGet5(this, _startAnchor1), __classPrivateFieldGet5(this, _endAnchor1));
        __classPrivateFieldSet5(this, _source, source);
        __classPrivateFieldGet5(this, _source).bind(this.update);
    }
    _insertToDom(index, ...fragments) {
        fragments.forEach((fragment, i)=>{
            const where = i + index;
            const slotPlaceholder = new Comment("Destiny slot placeholder");
            if (!__classPrivateFieldGet5(this, _domArray).length || where > __classPrivateFieldGet5(this, _domArray).length - 1) {
                __classPrivateFieldGet5(this, _endAnchor1).before(slotPlaceholder);
            } else {
                __classPrivateFieldGet5(this, _domArray)[where].insertBeforeThis(slotPlaceholder);
            }
            __classPrivateFieldGet5(this, _domArray).splice(where, 0, new Slot2(slotPlaceholder, fragment));
        });
    }
    _removeFromDom(from, count) {
        const to = Math.min(from + count, __classPrivateFieldGet5(this, _domArray).length);
        for(let i = from; i < to; i++){
            void __classPrivateFieldGet5(this, _domArray)[i].remove();
        }
        __classPrivateFieldGet5(this, _domArray).splice(from, count);
    }
}
_startAnchor1 = new WeakMap(), _endAnchor1 = new WeakMap(), _source = new WeakMap(), _domArray = new WeakMap();
const xmlDocument = new DOMParser().parseFromString(`<xml\n    xmlns="http://www.w3.org/1999/xhtml"\n    xmlns:on="p:u"\n    xmlns:prop="p:u"\n    xmlns:call="p:u"\n    xmlns:destiny="p:u"\n  />`, "application/xhtml+xml");
const xmlRange = xmlDocument.createRange();
const xmlRoot = xmlDocument.querySelector("xml");
xmlRange.setStart(xmlRoot, 0);
xmlRange.setEnd(xmlRoot, 0);
function parseString(string, parser2) {
    const templateElement = document.createElement("template");
    if (parser2 === "html") {
        templateElement.innerHTML = string;
    } else {
        templateElement.content.append(xmlRange.createContextualFragment(string));
    }
    return templateElement;
}
function isTextNode(input2) {
    return input2.nodeType === Node.TEXT_NODE;
}
function isElement(input2) {
    return input2.nodeType === Node.ELEMENT_NODE;
}
function createPlaceholder(index) {
    const placeholder = document.createElement("template");
    placeholder.setAttribute("destiny:content", String(index));
    return placeholder;
}
function prepareContentSlots(contentSlots) {
    contentSlots.forEach((contentSlot)=>{
        const raw = contentSlot.node.textContent ?? "";
        const nodes = contentSlot.slots.flatMap((slot, i, a)=>[
                new Text(raw.slice(a[i - 1]?.end ?? 0, slot.start)),
                createPlaceholder(slot.index), 
            ]
        );
        contentSlot.node.replaceWith(...nodes, new Text(raw.slice(contentSlot.slots.pop()?.end)));
    });
}
function resolveSlots(template1) {
    const walker = document.createTreeWalker(template1.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    const contentSlots = [];
    while(walker.nextNode()){
        const node = walker.currentNode;
        if (isTextNode(node)) {
            const matches = node.wholeText.matchAll(/__internal_([0-9]+)_/gu);
            const fragment = {
                node,
                slots: [
                    ...matches
                ].map((match)=>({
                        index: Number(match[1]),
                        start: match.index,
                        end: match.index + match[0].length
                    })
                )
            };
            if (fragment.slots.length) {
                contentSlots.push(fragment);
            }
        } else if (isElement(node)) {
            for (const { value  } of node.attributes){
                if (value.includes("__internal_")) {
                    node.setAttribute("destiny:attr", "");
                }
            }
        }
    }
    prepareContentSlots(contentSlots);
}
function createTemplate([first, ...strings], props1, parser2) {
    let string = first;
    const tagProps = new Map();
    for (const [i, fragment] of strings.entries()){
        const prop1 = props1[i];
        if (string.endsWith("<")) {
            tagProps.set(i, prop1);
            if (isDestinyElement3(prop1)) {
                string += register(prop1, false);
                if (prop1.captureProps) {
                    string += " data-capture-props=\"true\"";
                }
                string += fragment;
            } else if (prop1 instanceof Promise) {
                string += `${register(DestinyFallback1, false)} prop:for="__internal_${i}_" data-capture-props="true"${fragment}`;
            } else {
                string += String(prop1) + fragment;
            }
        } else if (string.endsWith("</")) {
            tagProps.set(i, prop1);
            if (isDestinyElement3(prop1)) {
                string += register(prop1, false) + fragment;
            } else if (prop1 instanceof Promise) {
                string += register(DestinyFallback1, false) + fragment;
            } else {
                string += String(prop1) + fragment;
            }
        } else {
            string += `__internal_${i}_${fragment}`;
        }
    }
    const templateElement = parseString(string, parser2);
    resolveSlots(templateElement);
    return [
        templateElement,
        tagProps
    ];
}
function isDestinyElement1(input2) {
    return Boolean(input2) && typeof input2 === "function" && Object.prototype.isPrototypeOf.call(DestinyElement2, input2);
}
const DestinyElement2 = DestinyElement1;
class DestinyFallback extends DestinyElement1 {
    constructor(){
        super();
        Object.defineProperty(this, "forwardProps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Ref()
        });
        Object.defineProperty(this, "template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: xml`\n    Loading...\n  `
        });
        queueMicrotask(async ()=>{
            const module = await this.assignedData.prop.get("for");
            const component = Object.values(module).shift();
            if (!component || !isDestinyElement2(component)) {
                throw new Error(`Invalid component constructor ${String(component)}`);
            }
            this.replaceWith(xml`\n          <${component}\n            destiny:ref="${this.forwardProps}"\n            call:append="${[
                ...this.childNodes
            ]}"\n          />\n        `.content);
        });
    }
}
Object.defineProperty(DestinyFallback, "captureProps", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: true
});
register(class CCall extends HTMLElement {
    client = null;
    async connectedCallback() {
        const script = document.createElement("script");
        script.type = "module";
        script.src = '/public/components/button.js';
        document.body.appendChild(script);
        this.innerHTML = `<p>Remember to refresh the extensions to make a call!</p>\n\n        <div class="row flex">\n\n            <div class="col-6 text-align-c">\n                <p>Select an extension to call from</p>\n                <select id="extension-to-call-from">\n                    <option value="" selected>Select...</option>\n                </select>\n            </div>\n\n            <div class="col-6 text-align-c">\n                <p>Select an extension to call to</p>\n                <select id="extension-to-call-to">\n                    <option value="" selected>Select...</option>\n                </select>\n            </div>\n\n        </div>\n\n        <div class="row">\n            <a-button id="initiate-call">Initiate Call</a-button>\n        </div>\n\n        <div class="row">\n            <audio id="audio-remote" controls>\n                <p>Your browser doesn't support HTML5 audio.</p>\n            </audio>\n        </div>\n`;
        this.initialiseSocketClient();
        this.createEventListeners();
    }
    createEventListeners() {
        this.querySelector("#extension-to-call-from").addEventListener("change", ()=>{
            const chosenExtension = this.querySelector("#extension-to-call-from").value;
            const $options = this.querySelectorAll("select#extension-to-call-to option");
            $options.forEach(($option)=>{
                if ($option.value === chosenExtension) {
                    $option.classList.add("hide");
                } else {
                    $option.classList.remove("hide");
                }
            });
        });
        this.querySelector("#extension-to-call-to").addEventListener("change", (event)=>{
            const chosenExtension = this.querySelector("#extension-to-call-to").value;
            const $options = this.querySelectorAll("select#extension-to-call-from option");
            $options.forEach(($option)=>{
                if ($option.value === chosenExtension) {
                    $option.classList.add("hide");
                } else {
                    $option.classList.remove("hide");
                }
            });
        });
        this.querySelector("#initiate-call").addEventListener("click", (event)=>{
            const from = this.querySelector("#extension-to-call-from").value;
            const to = this.querySelector("#extension-to-call-to").value;
            this.client.send(JSON.stringify({
                send_packet: {
                    to: "make-call",
                    message: {
                        to_extension: Number(to),
                        from_extension: Number(from)
                    }
                }
            }));
        });
    }
    handleGetExtensions(message) {
        const extensions = message;
        const $extensionToCallFrom = this.querySelector("#extension-to-call-from");
        const $extensionToCallTo = this.querySelector("#extension-to-call-to");
        message.forEach((extension)=>{
            let $option;
            $option = document.createElement("option");
            $option.value = extension;
            $option.innerText = extension;
            $extensionToCallFrom.appendChild($option);
            $option = document.createElement("option");
            $option.value = extension;
            $option.innerText = extension;
            $extensionToCallTo.appendChild($option);
        });
    }
    async initialiseSocketClient() {
        this.client = await createWebSocketClient({
            port: 1668
        });
        this.client.send(JSON.stringify({
            connect_to: [
                "get-extensions",
                "make-call"
            ]
        }));
        this.client.onmessage = (msg)=>{
            if (msg.data.indexOf("Connected to") > -1) {
                return;
            }
            const data = JSON.parse(msg.data);
            data.message = JSON.parse(data.message);
            if (data.to === "get-extensions") {
                this.handleGetExtensions(data.message);
            }
        };
        this.client.send(JSON.stringify({
            send_packet: {
                to: "get-extensions",
                data: ""
            }
        }));
    }
});
const peerConnection = new RTCPeerConnection();
let isAlreadyCalling = false;
register(class CVideo extends HTMLElement {
    socket = null;
    async connectedCallback() {
        const script = document.createElement("script");
        script.type = "module";
        script.src = '/public/components/button.js';
        document.body.appendChild(script);
        this.innerHTML = `<div id="video-chat">\n    <video id="user-video" autoplay playsinline controls></video>\n    <span>\n        <a-button id="call-user" class="success" value="call">Waiting for a friend...</a-button>\n        <a-button id="end-call" class="error hide">End Call</a-button>\n    </span>\n    <hr>\n    <video id="peer-video" autoplay playsinline controls></video>\n</div>\n`;
        await this.initialiseSocketClient();
        this.registerListeners();
    }
    async initialiseSocketClient() {
        this.socket = await createWebSocketClient({
            port: 1669
        });
        this.socket.onmessage = (message2)=>{
            if (message2.data.indexOf("Connected to") > -1) {
                return false;
            }
            console.log(message2.data);
            const data = JSON.parse(message2.data);
            switch(data.to){
                case "room":
                    this.handleRoom(data.message);
                    break;
                case "call-made":
                    this.handleCallMade(data.message);
                    break;
                case "answer-made":
                    this.handleAnswerMade(data.message);
                    break;
                default: break;
            }
        };
    }
    handleRoom(data) {
        const callUserElement = this.querySelector("#call-user");
        const theirId = callUserElement.getAttribute("socket-id");
        if (theirId && !data.users.length) {
            const peerVideoElement = this.querySelector("video#peer-video");
            peerVideoElement.srcObject = null;
            const endCallElement = this.querySelector("#end-call");
            callUserElement.classList.remove("hide");
            endCallElement.classList.add("hide");
        }
        if (!theirId && data.users.length) {
        }
        callUserElement.textContent = data.users[0] ? "Call User!" : "Waiting for a friend...";
        callUserElement.setAttribute("socketId", data.users[0]);
    }
    callUser(socketId) {
        peerConnection.createOffer().then((offer)=>{
            return peerConnection.setLocalDescription(new RTCSessionDescription(offer));
        }).then(()=>{
            this.socket.send(JSON.stringify({
                to: "call-user",
                message: {
                    offer: peerConnection.localDescription,
                    to: socketId
                }
            }));
        });
    }
    async handleCallMade(data) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        this.socket.send(JSON.stringify({
            to: "make-answer",
            message: {
                answer,
                to: data.socket
            }
        }));
    }
    async handleAnswerMade(data) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        if (!isAlreadyCalling) {
            this.callUser(data.socket);
            isAlreadyCalling = true;
        }
        isAlreadyCalling = false;
    }
    async displayMyVideoAndGetTracks() {
        navigator.getUserMedia({
            video: true,
            audio: true
        }, (stream)=>{
            const localVideo = document.getElementById("user-video");
            if (localVideo) {
                localVideo.srcObject = stream;
            }
            const tracks = stream.getTracks();
            tracks.forEach((track)=>{
                peerConnection.addTrack(track, stream);
            });
        }, (error)=>{
            console.warn(error.message);
        });
    }
    registerListeners() {
        this.displayMyVideoAndGetTracks();
        peerConnection.ontrack = ({ streams: [stream]  })=>{
            const remoteVideo = this.querySelector("#peer-video");
            if (remoteVideo) {
                remoteVideo.srcObject = stream;
                const callUserElement = this.querySelector("#call-user");
                const endCallElement = this.querySelector("#end-call");
                callUserElement.classList.add("hide");
                endCallElement.classList.remove("hide");
            }
        };
        peerConnection.oniceconnectionstatechange = (data)=>{
            if (peerConnection.iceConnectionState === "failed" || peerConnection.iceConnectionState === "disconnected" || peerConnection.iceConnectionState === "closed") {
                const peerVideo = this.querySelector("video#peer-video");
                peerVideo.srcObject = null;
                window.location.href = "/chat";
            }
        };
        this.socket.send(JSON.stringify({
            connect_to: [
                "room"
            ]
        }));
        this.socket.send(JSON.stringify({
            send_packet: {
                to: "room"
            }
        }));
        this.querySelector("#call-user").addEventListener("click", (event)=>{
            const callUserElement = this.querySelector("call-user");
            const id = callUserElement.getAttribute("socketId");
            if (!id) {
                return false;
            }
            this.callUser(id);
        });
        this.querySelector("#end-call").addEventListener("click", function() {
            peerConnection.close();
            window.location.href = "/chat";
        });
    }
});
register(class CHome extends HTMLElement {
    connectedCallback() {
        const script = document.createElement("script");
        script.type = "module";
        script.src = '/public/components/anchor.js';
        document.body.appendChild(script);
        this.innerHTML = `\n      <div style="display: flex">\n    <anchor-link href="/call">Call</anchor-link>\n    <anchor-link href="/chat">Chat</anchor-link>\n    <anchor-link href="/video">Video</anchor-link>\n</div>\n`;
    }
});
const reactiveObject2 = reactiveObject1;
const ReactiveArray2 = ReactiveArray1;
const ReactiveArray3 = ReactiveArray1;
const ReactiveArray4 = ReactiveArray1;
const reactive2 = reactive1;
const reactive3 = reactive1;
const propertyDescriptorToReactive1 = propertyDescriptorToReactive;
const makeNonPrimitiveItemsReactive1 = makeNonPrimitiveItemsReactive;
const isSpecialCaseObject1 = isSpecialCaseObject;
const isSpecialCaseObject2 = isSpecialCaseObject;
const hookSlotsUp1 = hookSlotsUp;
const hookContentSlotsUp1 = hookContentSlotsUp;
const arrayToFragment1 = arrayToFragment;
const valueToFragment2 = valueToFragment1;
const valueToFragment3 = valueToFragment1;
const Slot2 = Slot1;
const Slot3 = Slot1;
const SlotArray1 = SlotArray;
const createTemplate1 = createTemplate;
const isDestinyElement2 = isDestinyElement1;
const isDestinyElement3 = isDestinyElement1;
const DestinyFallback1 = DestinyFallback;
