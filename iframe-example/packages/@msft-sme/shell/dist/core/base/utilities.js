/* tslint:disable */
// this code has been worked on other platform, and refactoring may cause other problem so keeps as is.
var MsftSme;
(function (MsftSme) {
    'use strict';
    var global = window;
    var FunctionGlobal = Function;
    var MathGlobal = Math;
    var ObjectGlobal = Object;
    // See Mark Miller’s explanation of what this does.
    // http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
    //
    // For example:
    // const array_slice: <T>(target: T[]|IArguments, start?: number, end?: number) => T[] = MsPortalFx.uncurryThis(Array.prototype.slice);
    // Then the call can be strong typed, rather than call/apply with only runtime check.
    //
    // This also **might** have the nice side-effect of reducing the size of
    // the minified code by reducing x.call() to merely x()
    var call = FunctionGlobal.call;
    var apply = FunctionGlobal.apply;
    function uncurryThis(f) {
        return function () {
            return call.apply(f, arguments);
        };
    }
    MsftSme.uncurryThis = uncurryThis;
    var _applyCall = uncurryThis(apply);
    MsftSme.applyCall = _applyCall;
    MsftSme.applyUncurry = _applyCall; // most uncurry function can be call by _applyCall  except for array_concat; (see below.)
    // declare variable such that  minimize better and code readibility
    var array_prototype = Array.prototype;
    var array_prototype_concat = array_prototype.concat; // array concat does not work well with uncurryThis since it flatten the arguments array.
    var array_prototype_push = array_prototype.push;
    var array_filter = uncurryThis(array_prototype.filter);
    var array_forEach = uncurryThis(array_prototype.forEach);
    var array_join = uncurryThis(array_prototype.join);
    var array_push = uncurryThis(array_prototype_push);
    var array_slice = uncurryThis(array_prototype.slice);
    var array_splice = uncurryThis(array_prototype.splice);
    var array_indexof = uncurryThis(array_prototype.indexOf);
    var array_isArray = Array.isArray;
    var string_prototype = String.prototype;
    var string_concat = uncurryThis(string_prototype.concat);
    var string_split = uncurryThis(string_prototype.split);
    var string_substring = uncurryThis(string_prototype.substring);
    var string_indexOf = uncurryThis(string_prototype.indexOf);
    var string_toLowerCase = uncurryThis(string_prototype.toLowerCase);
    var object_hasOwnProperty = uncurryThis(ObjectGlobal.prototype.hasOwnProperty);
    var object_propertyIsEnumerable = uncurryThis(ObjectGlobal.prototype.propertyIsEnumerable);
    var object_keys_original = ObjectGlobal.keys;
    var _undefined = undefined;
    var object_freeze = ObjectGlobal.freeze;
    var functionType = "function";
    var stringType = "string";
    var numberType = "number";
    var objectType = "object";
    var undefinedType = "undefined";
    /**
     * For testing only. Use Object.keys.
     */
    function _objectKeysPolyfill(o) {
        switch (typeof o) {
            case stringType:
                var arr = [];
                for (var i in o) {
                    array_push(arr, i);
                }
                return arr;
            case functionType:
            case objectType:
            case undefinedType:
                return object_keys_original(o);
            default:// probably some other native type
                return [];
        }
    }
    MsftSme._objectKeysPolyfill = _objectKeysPolyfill;
    // intentionally put inside an anonymous function.
    // presense of try-catch impacts the browser's ability
    // to optimize code in the same function context.
    (function () {
        try {
            object_keys_original("");
        }
        catch (err) {
            // it threw so this browser is in ES5 mode (probably IE11)
            // let's polyfill Object.keys
            ObjectGlobal.keys = _objectKeysPolyfill;
        }
    })();
    var object_keys = ObjectGlobal.keys;
    function isTypeOf(obj, type) {
        return typeof obj === type;
    }
    function isDate(obj) {
        return obj instanceof Date;
    }
    var regex_NonSpace = /\S/;
    function getDisposeFunc(value) {
        var dispose = value && value.dispose;
        return isTypeOf(dispose, functionType) && dispose;
    }
    function forEachKey(obj, iterator) {
        array_forEach(object_keys(obj), function (k) {
            iterator(k, obj[k]);
        });
    }
    MsftSme.forEachKey = forEachKey;
    /**
     * Shortcut for Object.keys(obj || {}).length.
     * @return number.
     */
    function keysLength(obj) {
        return object_keys(obj || {}).length;
    }
    MsftSme.keysLength = keysLength;
    /**
     * Determines whether an object has properties on it.
     * Will return true for the following inputs: [], {}, "", 0, 1, true, false, new Date(), function() {}.
     * Will return false for the following inputs: [1], {a:1}, "123".
     * @return boolean.
     */
    function isEmpty(obj) {
        return !keysLength(obj);
    }
    MsftSme.isEmpty = isEmpty;
    /**
     * Detect a value is Disposable.
     *
     * @param value The value to check against value.dispose is a function.
     * @return boolean.
     */
    function isDisposable(value) {
        return !!getDisposeFunc(value);
    }
    MsftSme.isDisposable = isDisposable;
    function _disposeDisposable(value) {
        if (array_isArray(value)) {
            array_forEach(value, _disposeDisposable);
        }
        var dispose = getDisposeFunc(value);
        if (dispose) {
            dispose.call(value); //  dispose typically rely on this is the object.
        }
    }
    /**
     * call value.dispose() if a value is Disposable.
     *
     * @param value The value to call value.dispose()
     * @return boolean;
     */
    MsftSme.disposeDisposable = function () {
        array_forEach(arguments, _disposeDisposable);
    };
    /**
     * Detect a value is null.
     *
     * @param value The value to check against null.
     * @return boolean.
     */
    function isNull(value) {
        return value === null;
    }
    MsftSme.isNull = isNull;
    /**
     * Detect a value is undefined.
     *
     * @param value The value to check against undefined.
     * @return boolean.
     */
    function isUndefined(value) {
        return value === _undefined;
    }
    MsftSme.isUndefined = isUndefined;
    /**
     * Indicates whether the specified object is null or undefined.
     *
     * @param value The value to test.
     * @returns True if the value parameter is null or undefined; otherwise, false.
     */
    function isNullOrUndefined(value) {
        return value === null || value === _undefined;
    }
    MsftSme.isNullOrUndefined = isNullOrUndefined;
    /**
     * Indicates whether the specified object is not null or undefined.
     *
     * @param value The value to test.
     * @returns True if the value parameter is null or undefined; otherwise, false.
     */
    function notNullOrUndefined(value) {
        return value !== null && value !== _undefined;
    }
    MsftSme.notNullOrUndefined = notNullOrUndefined;
    /**
     * Checks if the string is null, undefined or whitespace.
     *
     * @param  value The target string.
     * @return true if the string is null, undefined or whitespace; otherwise, false.
     */
    function isNullOrWhiteSpace(value) {
        // http://jsperf.com/empty-string-test-regex-vs-trim/4
        return isNullOrUndefined(value) || (isTypeOf(value, stringType) && !regex_NonSpace.test(value)); // if can't find any characters other than space.
    }
    MsftSme.isNullOrWhiteSpace = isNullOrWhiteSpace;
    //#region Array
    /**
     * Firds the index of the first element of an array that matches the predicate.
     *
     * @param predicate The Predicate function.
     * @param startIndex The starting index.  If negative, it find from the end of the array.
     *        If you want to continue the next search from the back you much pass in startIndex = (prevReturn - length -1)
     *
     * @return The first index that matches the predicate.
     */
    function findIndex(array, predicate, startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        if (array) {
            var length = array.length;
            var stop = length;
            var step = 1;
            var index = startIndex;
            if (length) {
                if (startIndex < 0) {
                    index += length;
                    step = stop = -1;
                }
                if (!predicate) {
                    return index < length && index >= 0 ? index : -1;
                }
                while (index !== stop) {
                    if (predicate(array[index], index, array)) {
                        return index;
                    }
                    index += step;
                }
            }
        }
        return -1;
    }
    MsftSme.findIndex = findIndex;
    /**
     * Finds the first element of an array that matches the predicate.
     *
     * @param predicate The Predicate function.
     * @param startIndex The starting index.  If negative, it find from the end of the array.
     *        If you want to continue the next search from the back you much pass in startIndex = (prevReturn - length -1)
     *
     * @return The first element that matches the predicate.
     */
    function find(array, predicate, startIndex) {
        var index = findIndex(array, predicate, startIndex);
        return index < 0 ? _undefined : array[index];
    }
    MsftSme.find = find;
    /**
     * Returns the first element of the sequence.
     *
     * @return The element
     */
    function first(array) {
        return array ? array[0] : _undefined;
    }
    MsftSme.first = first;
    /**
     * Returns the last element of the sequence.
     *
     * @return The element
     */
    function last(array) {
        var length = array ? array.length : 0;
        return length ? array[length - 1] : _undefined;
    }
    MsftSme.last = last;
    /**
     * Removes all values that equal the given item and returns them as an array
     *
     * @param item The value to be removed.
     * @return The removed items.
     */
    function remove(array, itemOrPredicate, startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        var removedItems = [];
        var removedCount = 0;
        var predicate;
        if (isTypeOf(itemOrPredicate, functionType)) {
            predicate = itemOrPredicate;
        }
        for (var i = startIndex, l = array.length; i < l; i++) {
            var item = array[i];
            if (removedCount) {
                array[i - removedCount] = item; //shift the item to the offset
            }
            if (itemOrPredicate === item || (predicate && predicate(item))) {
                removedCount++;
                array_push(removedItems, item);
            }
        }
        if (removedCount) {
            array_splice(array, -1 * removedCount); // remove that many item form the end;
        }
        return removedItems;
    }
    MsftSme.remove = remove;
    // This function use findIndex, put it here for minimizer friendly
    // sourceUnique is a flag to optimize the performance, set to  true if you know source is unique already.
    function pushUnique(uniqueTarget, source, predicate, sourceUnique) {
        if (sourceUnique === void 0) { sourceUnique = false; }
        if (array_isArray(source)) {
            var getIndex = predicate ?
                function (value) { return findIndex(uniqueTarget, function (resultValue) { return predicate(resultValue, value); }); } :
                function (value) { return uniqueTarget.indexOf(value); };
            var appendTarget = (sourceUnique) ? [] : uniqueTarget; // if source is already unique, we accumlate to a sperated array to increase the perf.
            for (var i = 0, l = source.length; i < l; i++) {
                var value = source[i];
                if (getIndex(value) < 0) {
                    array_push(appendTarget, value);
                }
            }
            if (sourceUnique) {
                array_prototype_push.apply(uniqueTarget, appendTarget);
            }
        }
        return uniqueTarget;
    }
    MsftSme.pushUnique = pushUnique;
    /**
     * Returns a unique set from this array based on the predicate.
     *
     * @param predicate The predicate function. Added to the result if the predicate returns false.
     * @return A new array with the unique values.
     */
    function unique(array, predicate) {
        return pushUnique([], array, predicate);
    }
    MsftSme.unique = unique;
    function union() {
        var result = [];
        var lastArrayIndex = arguments.length - 2;
        var predicate = arguments[lastArrayIndex + 1];
        // If the predicate is not a function, it means that it is the last array to union.
        if (!isTypeOf(predicate, functionType)) {
            predicate = _undefined;
            lastArrayIndex++;
        }
        for (var i = 0; i <= lastArrayIndex; i++) {
            var source = unique(arguments[i], predicate); // make a smaller set
            pushUnique(result, source, predicate, true /* source Unique*/);
        }
        return result;
    }
    MsftSme.union = union;
    /**
     * Merge multiple T, T[] into a combine T[] exclude null or undefined arguments.
     *
     * @param data, a list fo T, T[]
     * @returns concattenated array.
     */
    MsftSme.merge = function () {
        // Don't use TypeScript's built-in "... rest" args syntax for perf-critical
        // paths because it constructs the args array even if you don't need it,
        var ret = [];
        var data = array_filter(arguments, notNullOrUndefined);
        return array_prototype_concat.apply(ret, data);
    };
    /**
     * Projects each element of a sequence to a sequence and flattens the resulting sequences into one sequence.
     *
     * @param selector The projection function.
     * @return A flattened array.
     */
    function mapMany(array, selector) {
        return MsftSme.merge.apply(null, array.map(selector));
    }
    MsftSme.mapMany = mapMany;
    /**
     * Sorts an array using a stable sort algorithm.
     *
     * This method returns a new array, it does not sort in place.
     *
     * @param compare The Compare function.
     * @return Sorted array.
     */
    function stableSort(array, compare) {
        var array2 = array.map(function (v, i) { return { i: i, v: v }; });
        array2.sort(function (a, b) {
            return compare(a.v, b.v) || (a.i - b.i);
        });
        return array2.map(function (v) { return v.v; });
    }
    MsftSme.stableSort = stableSort;
    function toString(item) {
        return item ? item.toString() : String(item);
    }
    function extendArrayIntoMap(objToExtend, sourceItems, getKeyCallback, getValueCallback, onlyIfNotExist) {
        getKeyCallback = getKeyCallback || toString;
        // The use of args here is to reduce the array creation call and make sure the function context this is the sourceItems.
        var args = [sourceItems, /*item*/ , /*index*/ , ""];
        for (var i = 0, l = sourceItems.length; i < l; i++) {
            var item = sourceItems[i];
            args[1] = item;
            args[2] = i;
            args[3] = _undefined;
            var key = call.apply(getKeyCallback, args);
            if (!onlyIfNotExist || objToExtend[key] === _undefined) {
                args[3] = key; // This is convient for the get value function to know the key that previous interpreted by getKeyCallback
                var value = getValueCallback ? call.apply(getValueCallback, args) : item;
                // Only extend this key if the value return is not undefined.
                if (value !== _undefined) {
                    objToExtend[key] = value;
                }
            }
        }
    }
    MsftSme.extendArrayIntoMap = extendArrayIntoMap;
    function extendStringMapIntoMap(objToExtend, sourceItems, getValueCallback, onlyIfNotExist) {
        // The use of args here is to reduce the array creation call and make sure the function context this is the sourceItems.
        var args = [sourceItems, /*item*/ ,];
        forEachKey(sourceItems, function (key, item) {
            if (!onlyIfNotExist || objToExtend[key] === _undefined) {
                args[1] = item;
                args[2] = key; // This is convient for the get value function to know the key that previous interpreted by getKeyCallback
                var value = getValueCallback ? call.apply(getValueCallback, args) : (item || key);
                // Only extend this key if the value return is not undefined.
                if (value !== _undefined) {
                    objToExtend[key] = value;
                }
            }
        });
    }
    MsftSme.extendStringMapIntoMap = extendStringMapIntoMap;
    function getStringMapFunc(keys) {
        if (array_isArray(keys)) {
            // make a copy of keys so that future changes to the input array do not impact the behavior of the returned function.
            keys = array_slice(keys);
        }
        else {
            keys = arguments;
        }
        return function () {
            // Most people call .hasOwnProperty or .constructor (which it should not)
            // since there is no guarantee that any object return to have those function -Expecially in generic function.
            // http://stackoverflow.com/questions/12017693/why-use-object-prototype-hasownproperty-callmyobj-prop-instead-of-myobj-hasow
            // Unfortunately, this need to be changed.
            var ret = {};
            array_forEach(arguments, function (value, index) {
                var key = keys[index];
                if (value !== _undefined) {
                    ret[key] = value;
                }
            });
            return ret;
        };
    }
    MsftSme.getStringMapFunc = getStringMapFunc;
    /**
     * Helpers funciton to create a object lightweight constructor
     *
     * @param keys the ordered argument keys
     *
     * @return The function that will return string map base on the arguments index order of keys
     */
    function applyStringMapFunc(keys) {
        return getStringMapFunc.apply(_undefined, keys);
    }
    MsftSme.applyStringMapFunc = applyStringMapFunc;
    /**
     * Helpers funciton to create a object of type NameValue<N, T>
     *
     * @param name name
     * @param value value
     *
     * @return an object of NameValue<N, T>
     */
    MsftSme.getNameValue = getStringMapFunc("name", "value");
    /**
     * Get a list of typeScript Enum into Array
     *
     * @param tsEnumeration The Type script Enum Array
     * @param sort optional whether to sort by enum's value
     * @return all NameValue<string, number>[] for this typeScriptEnum
     */
    function getEnumArray(tsEnumeration, sort) {
        var retVal = [];
        forEachKey(tsEnumeration, function (key, val) {
            if (isTypeOf(key, stringType) && isTypeOf(val, numberType)) {
                array_push(retVal, MsftSme.getNameValue(key, val));
            }
        });
        return sort ? retVal.sort(function (a, b) { return a.value - b.value; }) : retVal;
    }
    MsftSme.getEnumArray = getEnumArray;
    /**
     * Coerce an input into an array if it isn't already one.
     */
    function makeArray(input) {
        if (!array_isArray(input)) {
            if (isNullOrUndefined(input)) {
                input = [];
            }
            else {
                input = [input];
            }
        }
        return input;
    }
    MsftSme.makeArray = makeArray;
    //#endregion Array
    //#region Date
    /**
     * Checks if given dates are equal.
     *
     * @param left Left hand side date.
     * @param left Right hand side date.
     * @return True if left date is equal to right date.
     */
    function areEqualDates(left, right) {
        return isDate(left) && isDate(right) && !(left > right || left < right);
    }
    MsftSme.areEqualDates = areEqualDates;
    /**
     * Round down the date.getTime() to seconds
     *
     * @param date.
     * @return the getTime in seconds
     */
    function toSeconds(date) {
        // The old function use toString to trim off microseconds to time comparsion for stablesort
        // return new Date(x.toString()).getTime();  --- this is slow:
        // http://jsperf.com/truncating-decimals
        // x = new Date()
        //Wed Feb 17 2016 12:15:39 GMT- 0800(Pacific Standard Time)
        //y = new Date(x.toString()).getTime()
        //1455740139000
        //z = (x.getTime() / 1000) | 0
        //1455740139
        return (date.getTime() / 1000) | 0;
    }
    MsftSme.toSeconds = toSeconds;
    //#endregion Date
    //#region Math
    var hexCharsLowerCase = string_split("0123456789abcdef", "");
    var hexBytesLower = [];
    array_forEach(hexCharsLowerCase, function (upper) {
        array_forEach(hexCharsLowerCase, function (lower) {
            array_push(hexBytesLower, upper + lower);
        });
    });
    var sizeOfGuidInBytes = 20;
    var tempUintArray = new Uint8Array(sizeOfGuidInBytes);
    var tempStringArray = new Array(sizeOfGuidInBytes);
    function applyAndOr(index, and, or) {
        var temp = tempUintArray[index] & and;
        tempUintArray[index] = temp | or;
    }
    ////// TODO: const globalCrypto = <Crypto>(window.crypto || (<any>window).msCrypto);
    var globalCrypto = (window.crypto || window.msCrypto);
    // c.f. rfc4122 (UUID version 4 = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
    //  xx  xx  xx  xx  -   xx  xx  -  4x  xx  -   yx  xx  -   xx  xx  xx  xx  xx  xx
    //  00  11  22  33  4   55  66  7  88  99  10  11  12  13  14  15  16  17  18  19
    function newGuidCrypto() {
        globalCrypto.getRandomValues(tempUintArray);
        applyAndOr(8, 0x0F, 0x40); // set upper half of the 8th byte to 0x4
        applyAndOr(11, 0x3F, 0x80); // set the two most significant bits of the 11th byte to 10b
        for (var i = 0; i < sizeOfGuidInBytes; i++) {
            tempStringArray[i] = hexBytesLower[tempUintArray[i]];
        }
        tempStringArray[4] = tempStringArray[7] = tempStringArray[10] = tempStringArray[13] = "-";
        return MsftSme.applyUncurry(string_concat, "", tempStringArray);
    }
    /**
     * HelperReturns hex number string.
     *
     * @param len The number of the output string length
     * @return a hexnumber string of length len
     */
    function getRandomHexString(len) {
        var tmp;
        var ret = new Array(len);
        // This implementation optimization of speed mimimize the cost of Math.random.
        // equal chance for all number
        while (len) {
            tmp = 4294967296 * MathGlobal.random() | 0; // get the max integer our of 32 digit.
            var times = 8; // for every random number we can harvest 8 times.
            while (times--) {
                ret[--len] = hexCharsLowerCase[tmp & 0xF]; // fill from the back.
                if (len < 0) {
                    return ret; // we filled all the bucket, return now.
                }
                tmp >>>= 4; // zero fill right shift to ensure return is always positive number.
            }
        }
    }
    function newGuidFallback() {
        // c.f. rfc4122 (UUID version 4 = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
        var guid = getRandomHexString(36);
        guid[8] = guid[13] = guid[18] = guid[23] = "-"; // fill in the dash.
        guid[14] = "4"; // set the 4 in the guid.
        // "Set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively"
        // guid[19] = hexValues[8 + (Math.random() * 4) | 0]; /*clockSequenceHi*/
        guid[19] = hexCharsLowerCase[8 + (hexCharsLowerCase.indexOf(guid[19]) & 0x3)]; // Since guid[19] is already random. reused the numbe by get its index rather than another Math.random call.
        return _applyCall(string_concat, "", guid);
    }
    /**
     * Returns a GUID such as xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx.
     *
     * @return New GUID.
     */
    MsftSme.newGuid = globalCrypto ? newGuidCrypto : newGuidFallback;
    var maxCounter = 0xFFF;
    function toHexString(counter) {
        return hexBytesLower[counter >> 4] + hexCharsLowerCase[counter & 0xF];
    }
    /**
     * Returns a function that can generate globally unique identifiers.
     * Generates a new guid every 4096 calls and concatenates it with an
     * auto incrementing number.  This maintains a complient GUID 4 format
     * if no prefix is added.
     *
     * @return a globally unique string generating function.
     */
    function getUniqueIdGenerator(prefix) {
        prefix = prefix ? (prefix + "-") : "";
        // use a range for counter that gives us 3 digits with minimum effort
        var guid = "";
        var counter = maxCounter;
        return function () {
            if (++counter > maxCounter) {
                counter = 0;
            }
            if (!counter) {
                guid = prefix + MsftSme.newGuid().substring(0, 33);
            }
            return guid + toHexString(counter);
        };
    }
    MsftSme.getUniqueIdGenerator = getUniqueIdGenerator;
    /**
     * Returns a function that can generate unique id under the prefix
     * Concatenates prefix with an auto incrementing number.
     *
     * @return a unique string generating function which return a prefix with auto incrementing number
     */
    function getIdGenerator(prefix) {
        // use two counters and
        // limit the size of the lower counter because
        // toString is expensive for large numbers
        var counterUpper = -1;
        var counterLower = maxCounter;
        var realPrefix = "";
        return function () {
            if (++counterLower > maxCounter) {
                counterLower = 0;
                counterUpper++;
                realPrefix = prefix + counterUpper.toString(16) + "-";
            }
            return realPrefix + toHexString(counterLower);
        };
    }
    MsftSme.getIdGenerator = getIdGenerator;
    /**
     * Returns a globally unique identifier string.
     * Lighter-weight than newGuid.
     *
     * @return a globally unique string.
     */
    MsftSme.getUniqueId = getUniqueIdGenerator();
    /**
     * Rounds a number to the specified precision.
     *
     * @param number The number to round.
     * @param precision The precision to round the number to. Defaults to 0.
     * @returns The rounded number.
     */
    function round(number, precision) {
        precision = MathGlobal.pow(10, precision || 0);
        return MathGlobal.round(Number(number) * precision) / precision;
    }
    MsftSme.round = round;
    /**
     * Truncates a number to the integer part.
     *
     * @param value The number to truncate.
     * @return The integer number.
     */
    function truncate(value) {
        // Converts to integer by bit operation
        return value | 0;
    }
    MsftSme.truncate = truncate;
    /**
     * Returns the result of the boolean exclusive-or operator.
     *
     * @param a First operand.
     * @param b Second operand.
     * @return true if the arguments have different values, false otherwise.
     */
    function xor(a, b) {
        return a ? !b : b;
    }
    MsftSme.xor = xor;
    //#endregion Map
    //#region Number
    /**
     * Generates a random integer between min and max inclusive.
     *
     * @param min The minimum integer result.
     * @param max The maximum integer result.
     * @return A random integer.
     */
    function random(min, max) {
        if (min === _undefined || max === _undefined || min > max) {
            return;
        }
        return MathGlobal.floor(MathGlobal.random() * (max - min + 1)) + min;
    }
    MsftSme.random = random;
    //#endregion Number
    //#region Object
    /**
     * Determines whether an object has a property with the specified name.
     * @param target the object to check.
     * @param v A property name.
     */
    MsftSme.hasOwnProperty = object_hasOwnProperty;
    /**
     * Determines whether an object has an enumerable property with the specified name.
     * @param target the object to check.
     * @param v A property name.
     */
    MsftSme.propertyIsEnumerable = object_propertyIsEnumerable;
    /**
     * Returns a boolean reflecting whether two scalar values (not object-typed, not array-typed, not function-typed)
     * are equal.  Accounts for the fact that JavaScript Date derives from Object.
     * The caller is responsible for supplying exclusively number-, string- or Date-typed values here.
     *
     * @param left The first scalar value.
     * @param right The second scalar value.
     * @return A boolean reflecting whether the two scalar values are equal.
     */
    function areEqual(left, right) {
        return left === right || areEqualDates(left, right);
    }
    MsftSme.areEqual = areEqual;
    /**
     * Verifies that two arrays are equal.
     *
     * @param array1 The array to check.
     * @param array2 The array to compare the first array to.
     * @returns A value indicating whether or not the two arrays are equal.
     */
    function arrayEquals(array1, array2) {
        if (array1 === array2) {
            return true;
        }
        else if (!array1 || !array2) {
            return false;
        }
        else if (array1.length !== array2.length) {
            return false;
        }
        else {
            for (var i = 0; i < array1.length; i++) {
                if (array1[i] !== array2[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    MsftSme.arrayEquals = arrayEquals;
    function getTypeOf(x) {
        var typeOfX = typeof x;
        if (typeOfX === objectType) {
            if (x === null) {
                typeOfX = "null";
            }
            else if (array_isArray(x)) {
                typeOfX = "array";
            }
            else if (isDate(x)) {
                typeOfX = "date";
            }
        }
        return typeOfX;
    }
    MsftSme.getTypeOf = getTypeOf;
    /**
    * Checks for deep equality of two object.
    *
    * @param a Object 1
    * @param b Object 2
    * @param mapFunc Optional parameter, used convert value conversion use on the value to compare
    * @return true if both of the object contains the same information; false otherwise;
    */
    function deepEqualsMap(a, b, mapFunc) {
        var i;
        if (mapFunc) {
            a = mapFunc(a);
            b = mapFunc(b);
        }
        if (a === b) {
            return true;
        }
        else if (!a || !b) {
            return false;
        }
        var typeofInput = getTypeOf(a);
        if (typeofInput !== getTypeOf(b)) {
            return false;
        }
        switch (typeofInput) {
            case "array":
                var aArray = a;
                return a.length === b.length &&
                    aArray.every(function (v, index) { return deepEqualsMap(v, b[index], mapFunc); });
            case "date":
                return a.getTime() === b.getTime();
            case objectType:
                var keysOfInput = object_keys(a);
                return keysOfInput.length === keysLength(b) &&
                    keysOfInput.every(function (key) { return deepEqualsMap(a[key], b[key], mapFunc); });
            default:
                // basic type that failed the === check
                return false;
        }
    }
    /**
     * Checks if a given value is a javascript object or not.
     *
     * @param value Value to test.
     * @return True if value is an object, false otherwise.
     */
    function isObject(value) {
        return typeof value === objectType;
    }
    MsftSme.isObject = isObject;
    /**
     * Checks if a given value is a plain object or not.
     *
     * @param value Value to test.
     * @return True if value is an object, false otherwise.
     */
    function isPlainObject(value) {
        return getTypeOf(value) === objectType;
    }
    MsftSme.isPlainObject = isPlainObject;
    /**
     * Maps each value of the input object. Values that map to null or undefined are skipped.
     *
     * @param obj Input object whose properties are to be mapped.
     * @param callback Invoked for each property of the object to perform the mapping.
     * @param arg An Optional value that can be passed to callback.
     * @return An array of mapped values.
     */
    function map(obj, callback, arg) {
        var callBackArgs = [obj, /*item*/ , /*key*/ , arg];
        var keys = object_keys(obj);
        var ret = keys.map(function (key) {
            callBackArgs[1] = obj[key]; // item;
            callBackArgs[2] = key; // key;
            return call.apply(callback, callBackArgs);
        });
        // Flatten any nested arrays and exclude null, undefined items.
        return MsftSme.merge.apply(null, ret);
    }
    MsftSme.map = map;
    /**
     * Shallow copy from a key/value pairs object.
     *
     * @param to An un-typed object to be populated.
     * @param from An un-typed object with values to populate.
     * @param scopes Scoped down the list for shallowCopy
     */
    function shallowCopyFromObject(to, from, scopes) {
        // http://jsperf.com/shallowcopyobjects/3
        scopes = scopes || object_keys(from);
        for (var i = 0; i < scopes.length; i++) {
            var key = scopes[i];
            var value = from[key];
            if (value !== _undefined) {
                to[key] = value;
            }
        }
    }
    MsftSme.shallowCopyFromObject = shallowCopyFromObject;
    /**
     * Merges a property from a destination object from a source object
     * @param dest The destination object
     * @param src The source object
     * @param propName The name of the property to assign
     */
    function deepAssignProperty(dest, src, propName) {
        var value = src[propName];
        // if there is no value, dont assign.
        if (isNullOrUndefined(value)) {
            return;
        }
        if (!isObject(value) || !MsftSme.hasOwnProperty(dest, propName)) {
            // If the src prop is not an object or the prop is not defined on the dest then set the prop directly
            dest[propName] = value;
        }
        else {
            // Otherwise merge to src prop with the dest prop
            dest[propName] = deepAssignInternal(dest[propName], src[propName]);
        }
    }
    /**
     * Internal method for merging one object with another
     * @param dest The destination object
     * @param src The source object
     */
    function deepAssignInternal(dest, src) {
        // if the to destination is the same object as the source, save some time by just returning
        if (dest === src) {
            return dest;
        }
        // loop through the src objects properties and merge them deeply to the dest
        for (var propName in src) {
            if (MsftSme.hasOwnProperty(src, propName)) {
                deepAssignProperty(dest, src, propName);
            }
        }
        // loop through the src symbols properties and merge them deeply to the dest
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(src);
            symbols.forEach(function (symbol) {
                if (MsftSme.propertyIsEnumerable(src, symbol)) {
                    deepAssignProperty(dest, src, symbol);
                }
            });
        }
        // return the destination object
        return dest;
    }
    /**
     * Merges a set of source objects to a destination object
     * @param dest The destination object
     * @param sources  the source objects
     */
    function deepAssign(dest) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        // merge all sources into the dest object in order
        sources.forEach(function (src) {
            return deepAssignInternal(dest, src);
        });
        // return the dest object
        return dest;
    }
    MsftSme.deepAssign = deepAssign;
    /**
     * Searchs an object for a value at a given path.
     * @param object The object to search in
     * @param path the path to walk
     * @param replace internal use, indicates that this is the first pass.
     * @returns the object at the end of the path
     */
    function getValueInternal(object, path, firstPass) {
        // return null if either argument is not provided
        if (isNullOrUndefined(object) || isNullOrUndefined(path)) {
            return null;
        }
        // always convert path to string
        var strPath = '' + path;
        // on the first pass, replace delimiters in the object path with *
        if (firstPass) {
            strPath = strPath.replace(/\]\.|\.|\[|\]/g, "*");
        }
        // find the next delimiter
        var index = strPath.indexOf('*');
        // if there are no more delimiters, return the object at the path
        if (index === -1) {
            return object[strPath];
        }
        // split the path at the delimiter. Use the first segment as our next object and the second segment for the remaing path
        var next = strPath.slice(0, index);
        var remainingPath = strPath.slice(index + 1);
        if (object[next] !== undefined && remainingPath.length > 0) {
            // dive in recursively to the next object
            return getValueInternal(object[next], remainingPath, false);
        }
        // we found our target object. Return it
        return object[next];
    }
    /**
     * Searchs an object for a value at a given path.
     * @param object The object to search in
     * @param path the path to walk
     * @returns the object at the end of the path
     */
    function getValue(object, path) {
        // call our internal get value function
        return getValueInternal(object, path, true);
    }
    MsftSme.getValue = getValue;
    //#endregion Object
    //#region String
    /**
     * Determines if the current string ends with the given string.
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     * http://jsperf.com/string-prototype-endswith/18
     *
     * @param input The input string.
     * @param searchString The characters to be searched for at the end of this string.
     * @param position Optional. Search within this string as if this string were only this long; defaults to this string's actual length, clamped within the range established by this string's length.
     * @return A value indicating whether or not the input string ends with the search string.
     */
    function endsWith(input, searchString, position) {
        if (!isTypeOf(searchString, stringType)) {
            return false;
        }
        input = isNullOrUndefined(input) ? "" : String(input);
        var strLen = input.length;
        if (position === _undefined || position > strLen) {
            position = strLen;
        }
        position -= searchString.length;
        var lastIndex = string_indexOf(input, searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    }
    MsftSme.endsWith = endsWith;
    /**
     * Compares the current string to another string and returns a value indicating their relative ordering.
     *
     * @param input The input string to compare.
     * @param other The value to compare the input string to.
     * @param locales The optional array of locale values that will be passed to localeCompare.
     * @param options The options supported by localeCompare.
     * @return 0, if the strings are equal; a negative number if the current string is ordered before value; a positive non-zero number if the current string is orered after value.
     */
    function localeCompareIgnoreCase(input, other, locales, options) {
        if (isNullOrUndefined(input)) {
            return -1;
        }
        if (!isTypeOf(other, stringType)) {
            return 1;
        }
        return input.toLocaleLowerCase().localeCompare(other.toLocaleLowerCase(), locales, options);
    }
    MsftSme.localeCompareIgnoreCase = localeCompareIgnoreCase;
    /**
     * Repeats the string the specified number of times.
     * @param input The input string.
     * @param count The number of times to repeat the string.
     * @returns The result string.
     *  http://jsperf.com/repeatstring2
     */
    function repeat(input, count) {
        var ret = "";
        count = (count < 0) ? 0 : count;
        while (count--) {
            ret += input;
        }
        return ret;
    }
    MsftSme.repeat = repeat;
    /**
     * reverse the string.
     * @param input The input string.
     * @returns The result string.
     */
    function reverse(input) {
        var ret = "";
        var length = input.length;
        while (length) {
            ret += input[--length];
        }
        return ret;
    }
    MsftSme.reverse = reverse;
    /**
     * Return a function that will perform join with that separator
     *
     * @returns a function that will join the parts together with the character, for example.
     *   joinPaths = getJoinFunc("/");
     *   joinByDash = getJoinFunc("-");
     *
     *  joinPaths("a", "b", "c") will return  "a/b/c";
     *  joinByDash("a", "b", "c") will return  "a-b-c";
     */
    function getJoinFunc(sep) {
        return function () {
            return array_join(arguments, sep);
        };
    }
    MsftSme.getJoinFunc = getJoinFunc;
    ;
    /**
     * Return a function that will perform quote the input.  (Mimizer helper).
     *
     * @returns a function that will join the parts together with the character(s).
        For example.
            quote = getQuoteFunc("'");
            parenthesis = getQuoteFunc("(", ")");
            poMarker = getQuoteFunc("####");
     *
     * quote("abc") will return "'abc'";
     * parenthesis("abc") will reutrn "(abc)";
     * poMarker("abc") will return "####abc####";
     */
    function getQuoteFunc(prefix, suffix) {
        prefix = prefix || "";
        suffix = suffix || prefix;
        return function (input) {
            return prefix + input + suffix;
        };
    }
    MsftSme.getQuoteFunc = getQuoteFunc;
    ;
    /**
     * Replaces all instances of a value in a string.
     *
     * @param input The input string.
     * @param searchValue The value to replace.
     * @param replaceValue The value to replace with.
     * @return A new string with all instances of searchValue replaced with replaceValue.
     */
    function replaceAll(input, searchValue, replaceValue) {
        return input.replace(new RegExp(regexEscape(searchValue), "g"), replaceValue);
    }
    MsftSme.replaceAll = replaceAll;
    /**
     * Replaces multiple instances of search values and replacement values in a string.
     *
     * @param input The input string.
     * @param replacementMap A string map where each key represents the string to replace, and that key's value represents the value to replace it with.
     * @return A new string with replacementMap values replaced.
     */
    function replaceMany(input, replacementMap) {
        var escapedMap = {}, hasValuesToReplace = false;
        for (var searchValue in (replacementMap || {})) {
            if (replacementMap.hasOwnProperty(searchValue)) {
                escapedMap[regexEscape(searchValue)] = replacementMap[searchValue];
                hasValuesToReplace = true;
            }
        }
        if (!hasValuesToReplace) {
            return input;
        }
        var regex = new RegExp(object_keys(escapedMap).join("|"), "g");
        return input.replace(regex, function (match) { return replacementMap[match]; });
    }
    MsftSme.replaceMany = replaceMany;
    /**
     * Splits a string into the specified number of parts.
     * Differs from string.split in that it leaves the last part containing the remaining string (with separators in it).
     * string.split truncates the extra parts.
     * @param input The string to be split.
     * @param separator A string that identifies the character or characters to be used as the separator.
     * @param limit A value used to limit the number of elements returned in the array.
     * @return An array of strings whose length is at most the value of limit.
     */
    function split(input, separator, limit) {
        var retVal = [];
        if (input && separator && limit) {
            var startIndex = 0;
            var seplength = separator.length;
            var indexOf = 0;
            // reduce the limit by one.
            // we'll only break the string into limit - 1 parts
            // and put the remaining in the last spot.
            limit--;
            while (true) {
                if (retVal.length >= limit || // only one spot left in the array. push remaining string into array and exit.
                    (indexOf = string_indexOf(input, separator, startIndex)) < 0) {
                    array_push(retVal, string_substring(input, startIndex));
                    break;
                }
                array_push(retVal, string_substring(input, startIndex, indexOf));
                startIndex = indexOf + seplength;
            }
        }
        return retVal;
    }
    MsftSme.split = split;
    /**
     * Determines if the current string starts with the given string.
     * http://jsperf.com/string-startswith/49
     *
     * @param input The input string.
     * @param searchString The characters to be searched for at the start of this string.
     * @param position Optional. The position in this string at which to begin searching for searchString; defaults to 0.
     * @return A value indicating whether or not the input string begins with the search string.
     */
    function startsWith(input, searchString, position) {
        input = isNullOrUndefined(input) ? "" : String(input);
        position = (isNullOrUndefined(position) || position < 0) ? 0 : MathGlobal.min(position, input.length);
        return input.lastIndexOf(searchString, position) === position;
    }
    MsftSme.startsWith = startsWith;
    /**
     * Trims all occurrences of the given set of strings off the end of the input.
     */
    function trimEnd(input) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        input = input || "";
        while (input) {
            var match = values.first(function (value) {
                return value && endsWith(input, value);
            });
            if (!match) {
                break;
            }
            input = string_substring(input, 0, input.length - match.length);
        }
        return input;
    }
    MsftSme.trimEnd = trimEnd;
    /**
     * Trims all occurrences of the given set of strings off the start of the input.
     */
    function trimStart(input) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        input = input || "";
        while (input) {
            var match = values.first(function (value) {
                return value && startsWith(input, value);
            });
            if (!match) {
                break;
            }
            input = string_substring(input, match.length);
        }
        return input;
    }
    MsftSme.trimStart = trimStart;
    /**
     * Ensures that the given string ends with the suffix provided.
     * If it already does, it just returns the input string.
     * If it does not, then the suffix is appended and the result is returned.
     */
    function ensureSuffix(input, suffix) {
        input = input || "";
        if (!endsWith(input, suffix)) {
            input += suffix;
        }
        return input;
    }
    MsftSme.ensureSuffix = ensureSuffix;
    /**
     * Ensures that the given string starts with the prefix provided.
     * If it already does, it just returns the input string.
     * If it does not, then the prefix is applied and the result is returned.
     */
    function ensurePrefix(input, prefix) {
        input = input || "";
        if (!startsWith(input, prefix)) {
            input = prefix + input;
        }
        return input;
    }
    MsftSme.ensurePrefix = ensurePrefix;
    function pathJoin(pathSeparator, pathComponents) {
        if (!array_isArray(pathComponents)) {
            pathComponents = array_slice(arguments, 1);
        }
        var output = "";
        array_forEach((pathComponents || []), function (current) {
            if (!output) {
                output = current || "";
            }
            else if (current) {
                output = trimEnd(output, pathSeparator) + ensurePrefix(current, pathSeparator);
            }
        });
        return output;
    }
    MsftSme.pathJoin = pathJoin;
    //#endregion String
    //#region Uri
    /**
     * Parse an uri and return the Authority of the uri.
     *
     * @param uri The string of uri.
     * @return Authority of the uri.
     */
    function getUriAuthority(uri, includePort) {
        if (includePort === void 0) { includePort = true; }
        // If uri starts with "//" or "https://" or "http://", authority will start after that.
        // Otherwise authority starts from very beginning.
        // Authority will end before one of those characters "?/#" or end of string.
        if (!uri) {
            return uri;
        }
        if (startsWith(uri, "//")) {
            uri = string_substring(uri, index + 2);
        }
        else {
            var index = string_indexOf(uri, "://");
            if (index > -1) {
                uri = string_substring(uri, index + 3);
            }
        }
        var endChars = includePort ? /[?#/]/ : /[?#/:]/;
        var endIndex = uri.search(endChars);
        endIndex = endIndex > -1 ? endIndex : uri.length;
        return string_substring(uri, 0, endIndex);
    }
    MsftSme.getUriAuthority = getUriAuthority;
    /**
     * Verify if one Url is subdomain of another Url.
     *
     * @param domain The string of domain.
     * @param subdomain The string of subdomain
     * @return True if subdomain is subdomain of domain.
     */
    function isSubdomain(domain, subdomain) {
        if (!domain || !subdomain || domain.length < subdomain.length) {
            return false;
        }
        var lowerCaseDomain = string_toLowerCase(domain);
        var lowerCaseSubdomain = string_toLowerCase(subdomain);
        return (lowerCaseDomain === lowerCaseSubdomain) || endsWith(lowerCaseDomain, "." + lowerCaseSubdomain);
    }
    MsftSme.isSubdomain = isSubdomain;
    /**
     * Returns whether the given URI is an absolute URI.
     *
     * @param uri The URI.
     * @return A boolean value indicating whether the URI is absolute.
     */
    function isUriAbsolute(uri) {
        return string_indexOf(uri, "://") !== -1 || startsWith(uri, "//");
    }
    MsftSme.isUriAbsolute = isUriAbsolute;
    //#endregion Uri
    //#region Element
    /** Gets a CSS property value
     * @param  {HTMLElement} element The Element
     * @param  {string} property - The CSS property name
     * @returns {any} - The value of the CSS property (type depends on property retrieved)
     */
    function getStyle(element, property) {
        if (!element) {
            return null;
        }
        // first try to get the value directly from the element
        var value = element.style[property];
        if (!isNullOrWhiteSpace(value)) {
            return value;
        }
        // otherwise get the computed style
        return getComputedStyle(element)[property];
    }
    MsftSme.getStyle = getStyle;
    /**
     * Gets the classes applied to an element
     * @param  {HTMLElement} element The Element
     * @returns {string[]} - The classes currently applied to the element
     */
    function getClasses(element) {
        if (element) {
            var classes = element.className.trim();
            if (!MsftSme.isNullOrWhiteSpace(classes)) {
                return classes.split(' ');
            }
        }
        return [];
    }
    MsftSme.getClasses = getClasses;
    /**
     * Returns the first element in the current elements ancestory that is focusable.
     *
     * 'Focusable' is defined as the following:
     *  - input, select, textarea, button, object
     *  - anchor with href
     *  - have a non-negative tab index
     *
     * An element is not focusable if any of the following is true (even if it meets a condition above)
     *  - negative tab index
     *  - disabled
     *  - display: none
     *  - visibility: hidden
     *
     * @param element The element to start from.
     * @return the first focusable ancestor of the element
     */
    function isFocusable(element, includeNegativeTabIndex) {
        if (includeNegativeTabIndex === void 0) { includeNegativeTabIndex = false; }
        if (!element) {
            return false;
        }
        // if the element is disabled or 'not displayed'/hidden, it is not focusable
        if (element['disabled'] || getStyle(element, 'display') === 'none' || getStyle(element, 'visibility') === 'hidden') {
            return false;
        }
        // if the tab index is set, let it determine focusability
        // have to check has attribute because
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4365703/
        if (element.hasAttribute('tabindex') && !isNullOrUndefined(element.tabIndex)) {
            return element.tabIndex >= 0 || (includeNegativeTabIndex && !element.classList.contains('sme-hidden-focus'));
        }
        // anchors with an href are also focusable
        if (element.tagName === 'A' && element.hasAttribute('href')) {
            return true;
        }
        // Otherwise only naturably focusable elements can recieve focus
        var focusableTags = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'OBJECT'];
        return focusableTags.some(function (tag) { return tag === element.tagName; });
    }
    MsftSme.isFocusable = isFocusable;
    /**
     * Returns the first element in the current elements ancestory that is focusable.
     * Will return the element itself if it is focusable
     * @param element The element to start from.
     * @return the first focusable ancestor of the element
     */
    function getFocusableAncestor(element) {
        if (!element) {
            return null;
        }
        return isFocusable(element) ? element : getFocusableAncestor(element.parentElement);
    }
    MsftSme.getFocusableAncestor = getFocusableAncestor;
    /**
     * describes the position of the desired element in a list of elements
     */
    var ElementPosition;
    (function (ElementPosition) {
        ElementPosition[ElementPosition["First"] = 0] = "First";
        ElementPosition[ElementPosition["Previous"] = 1] = "Previous";
        ElementPosition[ElementPosition["Next"] = 2] = "Next";
        ElementPosition[ElementPosition["Last"] = 3] = "Last";
    })(ElementPosition = MsftSme.ElementPosition || (MsftSme.ElementPosition = {}));
    /**
     * find an element in a particular position with a specific condition relative to input element
     * Does a DFS for this element relative the ancestor zone of input element
     * @param element The current element
     * @param condition The function to check the kind of element we are looking for
     * @param position The ElementPosition of the desired element relative to input element
     */
    function findElementFromAncestorZoneDFS(element, condition, position) {
        var ancestor = getAncestorZone(element);
        var allElements = getAllElements(ancestor, condition);
        return getElement(allElements, element, position);
    }
    MsftSme.findElementFromAncestorZoneDFS = findElementFromAncestorZoneDFS;
    /**
     * find an element in a particular position with a specific condition relative to input element
     * Does a DFS for this element relative the ancestor trap of input element
     * @param element The current element
     * @param condition The function to check the kind of element we are looking for
     * @param position The ElementPosition of the desired element relative to input element
     */
    function findElementFromAncestorTrapDFS(element, condition, position) {
        var ancestor = getAncestorTrap(element);
        var allElements = getAllElements(ancestor, condition);
        return getElement(allElements, element, position);
    }
    MsftSme.findElementFromAncestorTrapDFS = findElementFromAncestorTrapDFS;
    /**
     * find an element in a particular position with a specific condition relative to input element
     * Does a DFS for this element relative the root of the graph
     * @param element The current element
     * @param condition The function to check the kind of element we are looking for
     * @param position The ElementPosition of the desired element relative to input element
     */
    function findElementFromRootDFS(element, condition, position) {
        var root = getRootElement();
        var allElements = getAllElements(root, condition);
        return getElement(allElements, element, position);
    }
    MsftSme.findElementFromRootDFS = findElementFromRootDFS;
    /**
     * find an element in a particular position with a specific condition relative to input element
     * Does a DFS for this element relative the input element
     * @param element The current element
     * @param condition The function to check the kind of element we are looking for
     * @param position The ElementPosition of the desired element relative to input element
     */
    function findChildElementDFS(element, condition, position) {
        var allElements = getAllElements(element, condition);
        return getElement(allElements, element, position);
    }
    MsftSme.findChildElementDFS = findChildElementDFS;
    /**
     * gets a element from a list of elements in the position relative to the current element
     * @param elements the list of elements
     * @param currentElement the current element
     * @param position the ElementPosition we want relative to the current element
     */
    function getElement(elements, currentElement, position) {
        if (elements && elements.length > 0) {
            var currentIndex = 0;
            switch (position) {
                case ElementPosition.Next:
                    currentIndex = elements.findIndex(function (x) { return x.isSameNode(currentElement); });
                    return currentIndex + 1 < elements.length ? elements[currentIndex + 1] : currentElement;
                case ElementPosition.Previous:
                    currentIndex = elements.findIndex(function (x) { return x.isSameNode(currentElement); });
                    return currentIndex - 1 >= 0 ? elements[currentIndex - 1] : currentElement;
                case ElementPosition.First:
                    return elements.first();
                case ElementPosition.Last:
                    return elements.last();
                default:
                    return currentElement;
            }
        }
        return null;
    }
    MsftSme.getElement = getElement;
    /**
     * finds all elements starting at the input element that meet the given condition
     * @param element the element from which to start the depth first search
     * @param condition the function that determines whether the desired condition has been met
     */
    function getAllElements(element, condition) {
        if (!element) {
            return null;
        }
        // depth first search starting at element
        var allElements = [];
        var conditionalElements = [];
        allElements.push(element);
        while (allElements.length > 0) {
            var currentElement = allElements.pop();
            if (currentElement.tagName.toLowerCase() !== "svg") {
                if (condition(currentElement)) {
                    conditionalElements.push(currentElement);
                }
                for (var i = currentElement.childElementCount - 1; i >= 0; i--) {
                    var child = currentElement.children.item(i);
                    allElements.push(child);
                }
                // if the current element is an iframe, start traversing the iframe's body
                try {
                    if (currentElement.contentDocument && currentElement.contentDocument.body) {
                        allElements.push(currentElement.contentDocument.body);
                    }
                }
                catch (error) {
                    // if we can't grab the content document, then we are very likely sideloading a tool in chrome
                    // you can disable same origin security policy to test accessibility or try in edge
                    // if this happens, we want to just get as much information as we can about the available elements
                    // TODO: log this when this code is moved to different file
                }
            }
        }
        // we need to reverse to get the actual order of elements on the page
        return conditionalElements;
    }
    MsftSme.getAllElements = getAllElements;
    /**
     * returns the root of the DOM graph
     */
    function getRootElement() {
        // we want to try to grab the document body from the window because document.body gives us the body of the current iframe only
        try {
            if (window.parent && window.parent.document && window.parent.document.body) {
                return window.parent.document.body;
            }
        }
        catch (error) {
            // if we can't grab the document from the window, then we are very likely sideloading a tool in chrome
            // you can disable same origin security policy to test accessibility or try in edge
            // if this happens, we want to just get as much information as we can about the available elements
            // TODO: log this when this code is moved to different file
        }
        return document.body;
    }
    MsftSme.getRootElement = getRootElement;
    /**
     * Finds the next zone
     * @param element the current zone or an element in the current zone
     */
    function getNextZone(element) {
        return findElementFromRootDFS(getAncestorZone(element) || element, isZone, ElementPosition.Next);
    }
    MsftSme.getNextZone = getNextZone;
    /**
     * gets the first focusable element in the next zone
     * if a zone has no focusable elements, it is skipped
     * @param element the current element
     */
    function getNextZoneElement(element) {
        if (!element) {
            return null;
        }
        // we are at the end of the page
        var nextZone = getNextZone(element);
        if (element.isSameNode(nextZone)) {
            return null;
        }
        var firstFocusableElement = getFirstFocusableDescendent(nextZone);
        return firstFocusableElement ? firstFocusableElement : getNextZoneElement(nextZone);
    }
    MsftSme.getNextZoneElement = getNextZoneElement;
    /**
     * Finds the previous zone
     * @param element the current zone or an element in the current zone
     */
    function getPreviousZone(element) {
        return findElementFromRootDFS(getAncestorZone(element), isZone, ElementPosition.Previous);
    }
    MsftSme.getPreviousZone = getPreviousZone;
    /**
     * gets the first focusable element in the previous zone
     * if a zone has no focusable elements, it is skipped
     * @param element the current element
     * @param originalElement the element from which we begin the search. Set automatically if unset by user
     */
    function getPreviousZoneElement(element, originalElement) {
        if (!element) {
            return null;
        }
        // save the first element we see so we can skip empty zones later on
        if (!originalElement) {
            return getPreviousZoneElement(element, element);
        }
        // we are at the beginning of the page
        var previousZone = getPreviousZone(element);
        if (previousZone.isSameNode(element)) {
            return null;
        }
        var firstFocusableElement = getFirstFocusableDescendent(previousZone);
        return firstFocusableElement && firstFocusableElement !== originalElement ? firstFocusableElement : getPreviousZoneElement(previousZone, originalElement);
    }
    MsftSme.getPreviousZoneElement = getPreviousZoneElement;
    /**
     * gets the zone that the current element is in
     * @param element the element
     */
    function getAncestorZone(element) {
        if (!element) {
            return null;
        }
        return isZone(element) ? element : getAncestorZone(element.parentElement);
    }
    MsftSme.getAncestorZone = getAncestorZone;
    /**
     * determine if an element is in a trap, if so return the trap element
     * @param element HTML element to check
     */
    function getAncestorTrap(element) {
        if (!element) {
            return null;
        }
        return isTrap(element) ? element : getAncestorTrap(element.parentElement);
    }
    MsftSme.getAncestorTrap = getAncestorTrap;
    /**
     * gets the next child zone of the current zone
     * @param element the current zone or an element in the current zone
     */
    function getDescendentZone(element) {
        // if there is no parent zone, just look from the current element forward
        return findChildElementDFS(getAncestorZone(element) || element, isZone, ElementPosition.First);
    }
    MsftSme.getDescendentZone = getDescendentZone;
    /**
     * gets the first focusable descendent of the current element
     * @param element the current element
     */
    function getFirstFocusableDescendent(element) {
        if (!element) {
            return null;
        }
        return isFocusable(element) ? element : getFirstFocusableDescendent(findChildElementDFS(element, isFocusable || isZone, ElementPosition.First));
    }
    MsftSme.getFirstFocusableDescendent = getFirstFocusableDescendent;
    function getLastElementInZone(element) {
        return findElementFromAncestorZoneDFS(element, isFocusable, ElementPosition.Last);
    }
    MsftSme.getLastElementInZone = getLastElementInZone;
    function getFirstElementInZone(element) {
        return findElementFromAncestorZoneDFS(element, isFocusable, ElementPosition.First);
    }
    MsftSme.getFirstElementInZone = getFirstElementInZone;
    /**
     * gets the next focusable element in the current zone
     * @param element the current element
     */
    function getNextFocusableElement(element) {
        return findElementFromAncestorZoneDFS(element, isFocusable, ElementPosition.Next);
    }
    MsftSme.getNextFocusableElement = getNextFocusableElement;
    /**
     * gets the previous focusable element in the current zone
     * @param element the current element
     */
    function getPreviousFocusableElement(element) {
        return findElementFromAncestorZoneDFS(element, isFocusable, ElementPosition.Previous);
    }
    MsftSme.getPreviousFocusableElement = getPreviousFocusableElement;
    /**
     * gets the ancestor of an element that meets the specified condition
     * @param element the current element
     * @param condition the function that will check if element meets the desired condition
    */
    function getSpecificAncestor(element, condition) {
        if (!element) {
            return null;
        }
        return condition(element) ? element : getSpecificAncestor(element.parentElement, condition);
    }
    MsftSme.getSpecificAncestor = getSpecificAncestor;
    /**
     * gets the next focusable element in the current trap
     * @param element the current element
     */
    function getNextFocusableElementInTrap(element) {
        return findElementFromAncestorTrapDFS(element, isFocusable, ElementPosition.Next);
    }
    MsftSme.getNextFocusableElementInTrap = getNextFocusableElementInTrap;
    /**
     * gets the previous focusable element in the current trap
     * @param element the current element
     */
    function getPreviousFocusableElementInTrap(element) {
        return findElementFromAncestorTrapDFS(element, isFocusable, ElementPosition.Previous);
    }
    MsftSme.getPreviousFocusableElementInTrap = getPreviousFocusableElementInTrap;
    /**
     * gets all body elements on the page
     */
    function getAllBodys() {
        var root = getRootElement();
        return getAllElements(root, isBody);
    }
    MsftSme.getAllBodys = getAllBodys;
    /**
     * true if given element is a body element
     * @param element the element
     */
    function isBody(element) {
        return element.tagName === 'BODY';
    }
    MsftSme.isBody = isBody;
    /**
     * true if the given element is a zone
     * @param element the element
     */
    function isZone(element) {
        if (!element) {
            return false;
        }
        var role = element.getAttribute('role');
        var zoneRoles = ['grid', 'tablist', 'table', 'menubar', 'navigation', 'dialog'];
        var tag = element.tagName;
        // TODO: utilities should not know about specific sme tags.
        // These tags should instead use the appropriete roles to identify them as focus zones.
        // 'form' is ok because it is a standard html5 element.
        var zoneTags = ['FORM', 'SME-ACTION-BAR', 'SME-BREADCRUMB-HEADER', 'SME-DETAILS', 'SME-SETTINGS-FOOTER'];
        return zoneRoles.some(function (zoneRole) { return zoneRole === role; })
            || element.classList.contains('sme-focus-zone')
            || zoneTags.some(function (zoneTag) { return zoneTag === tag; })
            || (element.classList.contains('growl') && element.childElementCount > 0);
    }
    MsftSme.isZone = isZone;
    /**
     * true if the given element is a trap
     * @param element the element
     */
    function isTrap(element) {
        if (!element) {
            return false;
        }
        var role = element.getAttribute('role');
        var trapRoles = ['dialog', 'alertdialog'];
        return trapRoles.some(function (trapRole) { return trapRole === role; }) || element.classList.contains('sme-focus-trap');
    }
    MsftSme.isTrap = isTrap;
    /**
     * return true if element is a form
     * @param element the element
     */
    function isForm(element) {
        if (!element) {
            return false;
        }
        return element.tagName === 'FORM';
    }
    MsftSme.isForm = isForm;
    /**
     * gets the ancestor form of an element
     * @param element the element
     */
    function getAncestorForm(element) {
        if (!element) {
            return null;
        }
        return isForm(element) ? element : getAncestorForm(element.parentElement);
    }
    MsftSme.getAncestorForm = getAncestorForm;
    /**
     * return true if we are inside a search box that has its own arrow key controls
     * @param element the element
     * @param isRightArrow the right arrow was clicked
     */
    function useArrowKeysWithinSearchbox(element, isRightArrow) {
        if (!element) {
            return false;
        }
        if (isSearchBox(element)) {
            var inputElement = element;
            var innerTextLength = inputElement.value ? inputElement.value.length : 0;
            return (!isRightArrow && inputElement.selectionStart !== null && inputElement.selectionStart > 0)
                || (isRightArrow && inputElement.selectionEnd !== null && inputElement.selectionEnd < innerTextLength);
        }
        return false;
    }
    MsftSme.useArrowKeysWithinSearchbox = useArrowKeysWithinSearchbox;
    /**
     * true if given element is a search box
     * @param element the element
     */
    function isSearchBox(element) {
        if (!element) {
            return false;
        }
        var inputElement = element;
        return element.tagName === 'INPUT' && inputElement && inputElement.type === 'search';
    }
    MsftSme.isSearchBox = isSearchBox;
    /**
     * returns ancestor table of current element
     * @param element the current element
     */
    function getAncestorTable(element) {
        if (!element) {
            return null;
        }
        return element.tagName === 'TABLE' ? element : getAncestorTable(element.parentElement);
    }
    MsftSme.getAncestorTable = getAncestorTable;
    /**
     * returns the next row in the current table
     * @param element the current element
     */
    function getNextRowInTable(element) {
        return findElementFromAncestorZoneDFS(element, isTableRow, ElementPosition.Next);
    }
    MsftSme.getNextRowInTable = getNextRowInTable;
    /**
     * returns the previous row in the current table
     * @param element the current element
     */
    function getPreviousRowInTable(element) {
        return findElementFromAncestorZoneDFS(element, isTableRow, ElementPosition.Previous);
    }
    MsftSme.getPreviousRowInTable = getPreviousRowInTable;
    /**
     * returns true if the current element is a table row
     * @param element the current element
     */
    function isTableRow(element) {
        return element.tagName === 'TR';
    }
    MsftSme.isTableRow = isTableRow;
    /**
     * returns true if the current element is a table cell
     * @param element the current element
     */
    function isTableCell(element) {
        return element.tagName === 'TD';
    }
    MsftSme.isTableCell = isTableCell;
    /**
     * returns true if the current element is inside a table cell
     * @param element the current element
     */
    function isInTableCell(element) {
        if (!element) {
            return false;
        }
        return isTableCell(element) ? true : isInTableCell(element.parentElement);
    }
    MsftSme.isInTableCell = isInTableCell;
    //#endregion Element
    /**
     * Escapes regular expression special characters -[]/{}()*+?.\^$|
     *
     * @param str The string to escape.
     * @return The escaped string.
     */
    function regexEscape(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    MsftSme.regexEscape = regexEscape;
    /**
     * No-op function.
     */
    MsftSme.noop = function () {
    };
    var primitiveTypes = {};
    array_forEach(["boolean", undefinedType, numberType, stringType, "symbol"], function (item) { primitiveTypes[item] = true; });
    /**
     * Returns whether the given data is primitive data type.
     * ECMAScript 6 standard defines 6 primitive data types: Boolean, Null, Undefined, Number, String, Symbol(new in ECMAScript 6)
     *
     * @param data The input data.
     * @return A boolean value indicating whether the data is primitive data type.
     */
    function isPrimitive(data) {
        return data === null || typeof data in primitiveTypes;
    }
    MsftSme.isPrimitive = isPrimitive;
    /**
     * Applies polyfills as properties to the prototype of the given object.
     * If force is specified the polyfills will overwrite any existing properties.
     */
    function polyfill(type, fills, force) {
        var proto = type.prototype;
        forEachKey(fills, function (funcName, func) {
            if (force || !proto[funcName]) {
                ObjectGlobal.defineProperty(proto, funcName, {
                    value: func,
                    configurable: true,
                    enumerable: false,
                    writable: true
                });
            }
        });
    }
    MsftSme.polyfill = polyfill;
    var mapSupportedMaxInteger = 50;
    var intToStringMap = [];
    var stringToIntMap = {};
    for (var index = 0; index <= mapSupportedMaxInteger; index++) {
        var strVal = index + "";
        intToStringMap[index] = strVal;
        stringToIntMap[strVal] = index;
    }
    function validateRequiredMaxInteger(requiredMaxInteger) {
        if (requiredMaxInteger > mapSupportedMaxInteger) {
            throw new Error("The requiredMaxInteger(" + requiredMaxInteger + ") should be less than " + mapSupportedMaxInteger);
        }
        if (requiredMaxInteger <= 0) {
            throw new Error("The requiredMaxInteger(" + requiredMaxInteger + ") should be greater than zero.");
        }
    }
    /**
     * Get a readonly map that is a faster alternative to cast a string to small and non-negative integers.
     * - Doesn't support negative integer since the performance is significantly decreased for negative integer.
     * - The JSperf links: http://jsperf.com/int-to-string-map/4, http://jsperf.com/cast-int-to-string-in-loop.
     *
     * The StringToIntMap is mainly used to convert string to const enum. For example:
     * const enum Fruit {
     *   Unknown = 0,
     *   Apple = 1,
     *   Banana = 2,
     *   Max = 3
     * }
     * var stringToIntMap = utilities.getStringToIntMap(Fruit.Max);
     * strictEqual(stringToIntMap["1"], Fruit.Apple);
     * strictEqual(stringToIntMap["2"], Fruit.Banana);
     *
     * @param requiredMaxInteger The required max integer.
     * @returns The object have one to one mapping between the string and the corresponding integer. e.g. {"0":0,"1":1,"2":2,"3":3,"4":4, ... }.
     */
    function getIntToStringMap(requiredMaxInteger) {
        validateRequiredMaxInteger(requiredMaxInteger);
        return intToStringMap;
    }
    MsftSme.getIntToStringMap = getIntToStringMap;
    /**
     * Get a readonly map that is a faster alternative to cast a small and non-negative integer to string.
     * - Doesn't support negative integer since the performance is significantly decreased for negative integer.
     * - The JSperf links: http://jsperf.com/parseint-vs-map-lookup/2, http://jsperf.com/parseint-vs-map-lookup-2
     *
     * The intToStringMap is mainly used to convert const enum to string. For example:
     * const enum Fruit {
     *     Unknown = 0,
     *     Apple = 1,
     *     Banana = 2,
     *     Max = 3
     * }
     *
     * var stringToIntMap = utilities.getStringToIntMap(Fruit.Max);
     * strictEqual(intToStringMap[Fruit.Unknown], "0");
     * strictEqual(intToStringMap[Fruit.Apple], "1");
     *
     * @param requiredMaxInteger The required max integer.
     * @returns The array to have increment integer in string representation. e.g. ["0","1","2","3","4", ...].
     */
    function getStringToIntMap(requiredMaxInteger) {
        validateRequiredMaxInteger(requiredMaxInteger);
        return stringToIntMap;
    }
    MsftSme.getStringToIntMap = getStringToIntMap;
    /**
     * Makes a shallow clone of the source object with the same prototype and rebinds all functions
     * on the clone to use the source object as 'this'.
     *
     * @param object The source object.
     * @return The cloned object.
     */
    function cloneAndRebindFunctions(object) {
        var clone = ObjectGlobal.create(ObjectGlobal.getPrototypeOf(object));
        for (var key in object) {
            var value = object[key];
            if (isTypeOf(value, functionType)) {
                clone[key] = value.bind(object); // This preserves ko_isObservable(value).
            }
            else if (object_hasOwnProperty(object, key)) {
                clone[key] = value;
            }
        }
        return clone;
    }
    MsftSme.cloneAndRebindFunctions = cloneAndRebindFunctions;
    function toLowerCaseOnlyWithValue(value) {
        return value && value.toLowerCase();
    }
    /**
     * Takes a value and lower cases recursively.
     * For a string, returns the lower case string (non-value remains non-value).
     * For an object, recursively converts all string properties to lower case strings, including arrays of values.
     * For an array, returns an array with all string values converted to lower case.
     *
     * @param source The source value to make lower case.
     * @returns The lower case value.
     */
    function lowerCaseAllStrings(source) {
        if (source) {
            var type = typeof source;
            if (type === "string") {
                return toLowerCaseOnlyWithValue(source);
            }
            else if (Array.isArray(source)) {
                return source.map(function (arrayValue) { return lowerCaseAllStrings(arrayValue); });
            }
            else if (type === "object") {
                var sourceAsStringMap_1 = source;
                MsftSme.forEachKey(sourceAsStringMap_1, function (key) {
                    sourceAsStringMap_1[key] = lowerCaseAllStrings(sourceAsStringMap_1[key]);
                });
                return sourceAsStringMap_1;
            }
        }
        return source;
    }
    MsftSme.lowerCaseAllStrings = lowerCaseAllStrings;
    var sideLoadKey = 'MsftSme.SideLoad@';
    /**
     * Read all side-loading settings on current loaded domain.
     */
    function sideLoadRead() {
        // Read sideload data from localstorage
        var global = window;
        var length = global.localStorage.length;
        var keys = [];
        for (var index = 0; index < length; index++) {
            var key_1 = global.localStorage.key(index);
            if (key_1.startsWith(sideLoadKey)) {
                keys.push(key_1);
            }
        }
        var data = {};
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var item = JSON.parse(global.localStorage.getItem(key));
            data[item.origin] = item;
        }
        // Read sideload data from 'sideload' url parameter
        var query = decodeURIComponent(window.location.search.substring(1));
        var sideloadParam = query
            .split('&')
            .map(function (p) {
            var kvp = p.split('=');
            return { key: kvp[0], value: kvp[1] };
        })
            .find(function (p) { return p.key && p.key.toLowerCase() === 'sideload'; });
        // if we found the parameter and it has a value, then process the sideload data
        if (sideloadParam && sideloadParam.value) {
            // sideload parameter should be a comma seperated list
            sideloadParam.value.split(',')
                .forEach(function (s) { data[s] = { origin: s }; });
        }
        return data;
    }
    function sideLoad(originUri) {
        if (arguments.length > 1) {
            throw new Error("Incorrect syntax for side loading. Please use 'MsftSme.sideload(<origin>);' where '<originUri>' is similar to 'http://localhost:4201'. The new syntax will load any module from the manifest at <originUri>/manifest.json at runtime.");
        }
        if (originUri) {
            if (!['http://', 'https://'].some(function (prefix) { return originUri.startsWith(prefix); })) {
                throw new Error("Incorrect syntax for side loading. To ensure cross origin sideloads support, please begin your sideload origin with \"http://\" or \"https://\". Ex. \"MsftSme.sideload('http://" + originUri + "')\"");
            }
            var item = {
                origin: originUri
            };
            global.localStorage.setItem(sideLoadKey + originUri, JSON.stringify(item));
            var data = {};
            data[originUri] = item;
            return data;
        }
        return sideLoadRead();
    }
    MsftSme.sideLoad = sideLoad;
    /**
     * Reset all side-loading settings on current loaded domain.
     */
    function sideLoadReset() {
        var global = window;
        var length = global.localStorage.length;
        var keys = [];
        for (var index = 0; index < length; index++) {
            var key = global.localStorage.key(index);
            if (key.startsWith(sideLoadKey)) {
                keys.push(key);
            }
        }
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            global.localStorage.removeItem(key);
        }
    }
    MsftSme.sideLoadReset = sideLoadReset;
    var consoleDebugKey = 'MsftSme.ConsoleDebug';
    /**
     * Read debug console setting.
     */
    function consoleDebugRead() {
        // first check for a query parameter that tells us what debug level to use
        var query = decodeURIComponent(window.location.search.substring(1));
        var consoleDebugParam = query
            .split('&')
            .map(function (p) {
            var kvp = p.split('=');
            return { key: kvp[0], value: kvp[1] };
        })
            .find(function (p) { return p.key && p.key.toLowerCase() === 'consoledebug'; });
        // if we found the parameter and it has a value, then process that as our sideload setting data
        if (consoleDebugParam && consoleDebugParam.value) {
            try {
                var level = parseInt(consoleDebugParam.value);
                return level;
            }
            catch (ex) {
                console.error("Error reading \"consoleDebug\" parameter: " + ex.message);
            }
        }
        // then we fallback to what is saved in localStorage
        var data = JSON.parse(global.localStorage.getItem(consoleDebugKey));
        if (data && data.level) {
            return data.level;
        }
        // fallback again to whatever was passed into the Init call
        var smeWindow = global;
        if (smeWindow && smeWindow.MsftSme && smeWindow.MsftSme.Init) {
            return smeWindow.MsftSme.Init.logLevel;
        }
        // return null if not set yet. using default see at core-enviromnent.
        return null;
    }
    function consoleDebug(level) {
        if (level) {
            console.log('1:Critical, 2:Error, 3:Warning, 4:Success, 5:Informational, 6:Verbose, 7:Debug');
            global.localStorage.setItem(consoleDebugKey, JSON.stringify({ level: level }));
            global.MsftSme.Init.logLevel = level;
            return level;
        }
        return consoleDebugRead();
    }
    MsftSme.consoleDebug = consoleDebug;
    /**
     * Reset all side-loading settings on current loaded domain.
     */
    function consoleDebugReset() {
        global.localStorage.removeItem(consoleDebugKey);
    }
    MsftSme.consoleDebugReset = consoleDebugReset;
    /**
     * Gets the localized strings initialized by localization manager. The LocalizationManager should have
     * been used to get the localized strings. This can also be achieved by calling SmeEnvironment.initEnvironment().
     * @returns an object containing all the localized strings, or null if noe localized strings have been fetched yet
     */
    function resourcesStrings() {
        if (!global.MsftSme.Resources || !global.MsftSme.Resources.strings) {
            throw new Error('Unable to access localized ResourcesStrings data.');
        }
        return global.MsftSme.Resources.strings;
    }
    MsftSme.resourcesStrings = resourcesStrings;
    /**
     * Gets current session identification.
     * Within the same browser session, the session ID is the same on shell and all modules.
     */
    function sessionId() {
        var global = window;
        return global.MsftSme.Init.sessionId;
    }
    MsftSme.sessionId = sessionId;
    /**
     * Gets the self object of global MsftSme.
     */
    function self() {
        return window.MsftSme;
    }
    MsftSme.self = self;
    /** array.ts */
    polyfill(Array, {
        concatUnique: function (other, predicate) {
            return union(this, other, predicate);
        },
        first: function (predicate, startIndex) {
            // Intentionally not using _.find here, since here if we don't find the element
            // we return null. In _.find when this happens we return undefined.
            var index = findIndex(this, predicate, startIndex);
            return index < 0 ? null : this[index];
        },
        firstIndex: function (predicate, startIndex) {
            return findIndex(this, predicate, startIndex);
        },
        last: function () {
            if (this.length < 1) {
                throw new Error("Cannot get the last element because the array is empty.");
            }
            return this[this.length - 1];
        },
        mapMany: function (selector) {
            return mapMany(this, selector);
        },
        remove: function (item) {
            return remove(this, function (current) { return current === item; });
        },
        stableSort: function (compare) {
            return stableSort(this, compare);
        },
        // Deprecated. Remove on or after 2016/02/01.
        toNumberMap: function (keySelector) {
            var ret = [];
            this.forEach(function (value) {
                ret[keySelector(value)] = value;
            });
            return ret;
        },
        unique: function (predicate) {
            return unique(this, predicate);
        }
    });
    /** string.ts */
    var namedFormatSpecifierRegex = /\{[a-zA-Z$_\d]*\}/g;
    var numberedFormatSpecifierRegex = /\{(\d+)\}/g;
    function format() {
        var restArgs = arguments, value = this;
        var matched = false, retVal;
        var isFormatObject = restArgs.length === 1 && restArgs[0] && typeof restArgs[0] === "object";
        var isFormatObjectWithTokenFormatter = restArgs.length === 2 && restArgs[0] && typeof restArgs[0] === "object" && (typeof restArgs[1] === "function" || restArgs[1] === null);
        var tokenFormatter = isFormatObjectWithTokenFormatter ? restArgs[1] : null;
        if (isFormatObject || isFormatObjectWithTokenFormatter) {
            var actualArg = restArgs[0];
            retVal = value.replace(namedFormatSpecifierRegex, function (match) {
                var name = match.substring(1, match.length - 1);
                if (actualArg.hasOwnProperty(name)) {
                    matched = true;
                    var tokenValue = actualArg[name];
                    return tokenFormatter ? tokenFormatter(tokenValue) : tokenValue;
                }
                else {
                    return match;
                }
            });
        }
        // we get here in two cases:
        //    1. we don't have a format object
        //    2. we do have a format object but it's properties didn't match any of the named parameters.
        //       this often happens when developers write code like:
        //          try {
        //              ...
        //          } catch(err) {
        //              log("abc: {0}".format(err));
        //          }
        //       in this scenario also we want to match by number.
        //
        if (!matched) {
            retVal = value.replace(numberedFormatSpecifierRegex, function (match, num) {
                if (num < restArgs.length) {
                    var tokenValue = restArgs[num];
                    return tokenFormatter ? tokenFormatter(tokenValue) : tokenValue;
                }
                else {
                    return match;
                }
            });
        }
        return retVal;
    }
    polyfill(String, {
        format: format,
        localeCompareIgnoreCase: function (value, locales, options) {
            return localeCompareIgnoreCase(this, value, locales, options);
        },
        replaceAll: function (searchValue, replaceValue) {
            return replaceAll(this, searchValue, replaceValue);
        },
        replaceMany: function (replacementMap) {
            return replaceMany(this, replacementMap);
        },
        repeat: function (count) {
            return repeat(this, count);
        },
        startsWith: function (searchString, position) {
            return startsWith(this, searchString, position);
        },
        endsWith: function (searchString, position) {
            return endsWith(this, searchString, position);
        },
    }, /* force */ true);
    // Keyboard codes
    var KeyCode;
    (function (KeyCode) {
        KeyCode[KeyCode["Backspace"] = 8] = "Backspace";
        KeyCode[KeyCode["Tab"] = 9] = "Tab";
        KeyCode[KeyCode["Enter"] = 13] = "Enter";
        KeyCode[KeyCode["Shift"] = 16] = "Shift";
        KeyCode[KeyCode["Ctrl"] = 17] = "Ctrl";
        KeyCode[KeyCode["Alt"] = 18] = "Alt";
        KeyCode[KeyCode["Pause"] = 19] = "Pause";
        KeyCode[KeyCode["CapsLock"] = 20] = "CapsLock";
        KeyCode[KeyCode["Escape"] = 27] = "Escape";
        KeyCode[KeyCode["Space"] = 32] = "Space";
        KeyCode[KeyCode["PageUp"] = 33] = "PageUp";
        KeyCode[KeyCode["PageDown"] = 34] = "PageDown";
        KeyCode[KeyCode["End"] = 35] = "End";
        KeyCode[KeyCode["Home"] = 36] = "Home";
        KeyCode[KeyCode["LeftArrow"] = 37] = "LeftArrow";
        KeyCode[KeyCode["UpArrow"] = 38] = "UpArrow";
        KeyCode[KeyCode["RightArrow"] = 39] = "RightArrow";
        KeyCode[KeyCode["DownArrow"] = 40] = "DownArrow";
        KeyCode[KeyCode["Insert"] = 45] = "Insert";
        KeyCode[KeyCode["Delete"] = 46] = "Delete";
        KeyCode[KeyCode["Num0"] = 48] = "Num0";
        KeyCode[KeyCode["Num1"] = 49] = "Num1";
        KeyCode[KeyCode["Num2"] = 50] = "Num2";
        KeyCode[KeyCode["Num3"] = 51] = "Num3";
        KeyCode[KeyCode["Num4"] = 52] = "Num4";
        KeyCode[KeyCode["Num5"] = 53] = "Num5";
        KeyCode[KeyCode["Num6"] = 54] = "Num6";
        KeyCode[KeyCode["Num7"] = 55] = "Num7";
        KeyCode[KeyCode["Num8"] = 56] = "Num8";
        KeyCode[KeyCode["Num9"] = 57] = "Num9";
        KeyCode[KeyCode["A"] = 65] = "A";
        KeyCode[KeyCode["B"] = 66] = "B";
        KeyCode[KeyCode["C"] = 67] = "C";
        KeyCode[KeyCode["D"] = 68] = "D";
        KeyCode[KeyCode["E"] = 69] = "E";
        KeyCode[KeyCode["F"] = 70] = "F";
        KeyCode[KeyCode["G"] = 71] = "G";
        KeyCode[KeyCode["H"] = 72] = "H";
        KeyCode[KeyCode["I"] = 73] = "I";
        KeyCode[KeyCode["J"] = 74] = "J";
        KeyCode[KeyCode["K"] = 75] = "K";
        KeyCode[KeyCode["L"] = 76] = "L";
        KeyCode[KeyCode["M"] = 77] = "M";
        KeyCode[KeyCode["N"] = 78] = "N";
        KeyCode[KeyCode["O"] = 79] = "O";
        KeyCode[KeyCode["P"] = 80] = "P";
        KeyCode[KeyCode["Q"] = 81] = "Q";
        KeyCode[KeyCode["R"] = 82] = "R";
        KeyCode[KeyCode["S"] = 83] = "S";
        KeyCode[KeyCode["T"] = 84] = "T";
        KeyCode[KeyCode["U"] = 85] = "U";
        KeyCode[KeyCode["V"] = 86] = "V";
        KeyCode[KeyCode["W"] = 87] = "W";
        KeyCode[KeyCode["X"] = 88] = "X";
        KeyCode[KeyCode["Y"] = 89] = "Y";
        KeyCode[KeyCode["Z"] = 90] = "Z";
        KeyCode[KeyCode["LeftWindows"] = 91] = "LeftWindows";
        KeyCode[KeyCode["RightWindows"] = 92] = "RightWindows";
        KeyCode[KeyCode["Select"] = 93] = "Select";
        KeyCode[KeyCode["Numpad0"] = 96] = "Numpad0";
        KeyCode[KeyCode["Numpad1"] = 97] = "Numpad1";
        KeyCode[KeyCode["Numpad2"] = 98] = "Numpad2";
        KeyCode[KeyCode["Numpad3"] = 99] = "Numpad3";
        KeyCode[KeyCode["Numpad4"] = 100] = "Numpad4";
        KeyCode[KeyCode["Numpad5"] = 101] = "Numpad5";
        KeyCode[KeyCode["Numpad6"] = 102] = "Numpad6";
        KeyCode[KeyCode["Numpad7"] = 103] = "Numpad7";
        KeyCode[KeyCode["Numpad8"] = 104] = "Numpad8";
        KeyCode[KeyCode["Numpad9"] = 105] = "Numpad9";
        KeyCode[KeyCode["Multiply"] = 106] = "Multiply";
        KeyCode[KeyCode["Add"] = 107] = "Add";
        KeyCode[KeyCode["Subtract"] = 109] = "Subtract";
        KeyCode[KeyCode["DecimaPoint"] = 110] = "DecimaPoint";
        KeyCode[KeyCode["Divide"] = 111] = "Divide";
        KeyCode[KeyCode["F1"] = 112] = "F1";
        KeyCode[KeyCode["F2"] = 113] = "F2";
        KeyCode[KeyCode["F3"] = 114] = "F3";
        KeyCode[KeyCode["F4"] = 115] = "F4";
        KeyCode[KeyCode["F5"] = 116] = "F5";
        KeyCode[KeyCode["F6"] = 117] = "F6";
        KeyCode[KeyCode["F7"] = 118] = "F7";
        KeyCode[KeyCode["F8"] = 119] = "F8";
        KeyCode[KeyCode["F9"] = 120] = "F9";
        KeyCode[KeyCode["F10"] = 121] = "F10";
        KeyCode[KeyCode["F11"] = 122] = "F11";
        KeyCode[KeyCode["F12"] = 123] = "F12";
        KeyCode[KeyCode["NumLock"] = 144] = "NumLock";
        KeyCode[KeyCode["ScrollLock"] = 145] = "ScrollLock";
        KeyCode[KeyCode["SemiColon"] = 186] = "SemiColon";
        KeyCode[KeyCode["EqualSign"] = 187] = "EqualSign";
        KeyCode[KeyCode["Comma"] = 188] = "Comma";
        KeyCode[KeyCode["Dash"] = 189] = "Dash";
        KeyCode[KeyCode["Period"] = 190] = "Period";
        KeyCode[KeyCode["ForwardSlash"] = 191] = "ForwardSlash";
        KeyCode[KeyCode["GraveAccent"] = 192] = "GraveAccent";
        KeyCode[KeyCode["OpenBracket"] = 219] = "OpenBracket";
        KeyCode[KeyCode["BackSlash"] = 220] = "BackSlash";
        KeyCode[KeyCode["CloseBraket"] = 221] = "CloseBraket";
        KeyCode[KeyCode["SingleQuote"] = 222] = "SingleQuote";
    })(KeyCode = MsftSme.KeyCode || (MsftSme.KeyCode = {}));
    global.MsftSme = MsftSme;
})(MsftSme || (MsftSme = {}));
/* tslint:enable */
//# sourceMappingURL=data:application/json;base64,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