var path = require('path'),
    assert = require('assert'),
    assertLintFree = require('node-assert-lint-free'),
    namespaces = require('namespaces');

var emptyObj,
    simpleObj,
    complexObj;

var setup = function() {
    emptyObj = {};

    simpleObj = {
        test: 'test'
    };

    complexObj = {
        test: 'test',
        test2: {
            test2_1: 'test 2.1',
            test2_2: {
                test2_2_1: 'test 2.2.1',
                test2_2_2: 'test 2.2.2'
            }
        },
        test3: {
            test3_1: 'test 3.1'
        }
    };
};

function dynamicSetArgsFunction(/* obj, [key], val */) {
    var setArgs = parseSetArgs(arguments);
    return setArgs;
}

function dynamicGetArgsFunction(/* obj, [key] */) {
    var getArgs = parseGetArgs(arguments);
    return getArgs;
}

exports.testLintFree = function() {
    var root = path.join(__dirname, '../lib');
    assertLintFree(root);
};

exports.testParseSetArgsWithAllArguments = function() {
    setup();
    var parsedArgs = dynamicSetArgsFunction(simpleObj, 'testKey', 'testVal');
    assert.ok(parsedArgs.obj === simpleObj, "obj not found");
    assert.ok(parsedArgs.key === 'testKey', "key not found");
    assert.ok(parsedArgs.val === 'testVal', "val not found");
};

exports.testParseSetArgsWithoutKeyArgument = function() {
    setup();
    var parsedArgs = dynamicSetArgsFunction(simpleObj, 'testVal');
    assert.ok(parsedArgs.obj === simpleObj, "obj not found");
    assert.ok(parsedArgs.key === null, "key should be null");
    assert.ok(parsedArgs.val === 'testVal', "val not found");
};

exports.testParseGetArgsWithAllArguments = function() {
    setup();
    var parsedArgs = dynamicGetArgsFunction(simpleObj, 'testKey');
    assert.ok(parsedArgs.obj === simpleObj, "obj not found");
    assert.ok(parsedArgs.key === 'testKey', "key not found");
};

exports.testParseGetArgsWithoutKeyArgument = function() {
    setup();
    var parsedArgs = dynamicGetArgsFunction(simpleObj);
    assert.ok(parsedArgs.obj === simpleObj, "obj not found");
    assert.ok(parsedArgs.key === null, "key should be null");
};

exports.testFindNamespaceForGetArgs = function() {
    setup();
    var parsedArgs = dynamicGetArgsFunction(complexObj, 'test2.test2_2.test2_2_2');
    var namespace = findNamespace(parsedArgs);
    assert.ok(namespace === 'test 2.2.2', "could not find namespace");
};
exports.testFindNamespaceForGetArgsWithoutTopNamespace = function() {
    setup();
    // don't include top namespace value
    var parsedArgs = dynamicGetArgsFunction(complexObj, 'test2.test2_2.test2_2_2');
    var namespace = findNamespace(parsedArgs, false);
    assert.ok(namespace === complexObj.test2.test2_2, "could not find namespace");
    // non-existent key
};
exports.testFindNamespaceForGetArgsNonExistentKey = function() {
    setup();
    // non-existent key
    var parsedArgs = dynamicGetArgsFunction(complexObj, 'test2.test2_2.test2_2_2_1');
    var namespace = findNamespace(parsedArgs);
    assert.ok(namespace === undefined, "namespace should be undefined");
};
exports.testFindNamespaceForSetArgs = function() {
    setup();
    var parsedArgs = dynamicSetArgsFunction(complexObj, 'test2.test2_2.test2_2_2', 'testFindNamespaceForSetArgs');
    var namespace = findNamespace(parsedArgs);
    assert.ok(namespace === 'test 2.2.2', "could not find namespace");
};
exports.testFindNamespaceForSetArgsWithoutTopNamespace = function() {
    setup();
    // don't include top namespace value
    var parsedArgs = dynamicSetArgsFunction(complexObj, 'test2.test2_2.test2_2_2', 'testFindNamespaceForSetArgsWithoutTopNamespace');
    var namespace = findNamespace(parsedArgs, false);
    assert.ok(namespace === complexObj.test2.test2_2, "could not find namespace");
};
exports.testFindNamespaceForSetArgsNonExistentKey = function() {
    setup();
    // non-existent key
    var parsedArgs = dynamicSetArgsFunction(complexObj, 'test2.test2_2.test2_2_2_1', 'testFindNamespaceForSetArgsNonExistentKey');
    var namespace = findNamespace(parsedArgs);
    assert.ok(namespace === undefined, "namespace should be undefined");
};
exports.testCreateNamespace = function() {
    setup();
    var space = createNamespace(simpleObj, ['test2', 'test2_1']);
    assert.ok(simpleObj.test2.test2_1 !== undefined, "namespace was not created");
    assert.ok(space !== undefined, "namespace was not created");
};
exports.testSetValue = function() {
    setup();
    setValue(complexObj, 'test2.test2_2.test2_2_2', 'testSetValue');
    assert.ok(complexObj.test2.test2_2.test2_2_2 === 'testSetValue', "namespace was not set");
};
exports.testSetValueWithNewKey = function() {
    setup();
    // new key
    setValue(complexObj, 'test2.test2_2.test2_2_3', 'testSetValueWithNewKey');
    assert.ok(complexObj.test2.test2_2.test2_2_3 === 'testSetValueWithNewKey', "namespace was not set");
};
exports.testSetValueDeepNonExistentKey = function() {
    setup();
    setValue(complexObj, 'test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1', 'testSetValueDeepNonExistentKey');
    assert.ok(complexObj.test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1 === 'testSetValueDeepNonExistentKey', "namespace was not set");
};
exports.testSetValueInEmptyObj = function() {
    setup();
    setValue(emptyObj, 'test', 'testSetValueInEmptyObj1');
    assert.ok(emptyObj.test === 'testSetValueInEmptyObj1', "namespace was not set");
};
exports.testSetValueDeepInEmptyObj = function() {
    setup();
    setValue(emptyObj, 'test.test1.test2', 'testSetValueInEmptyObj2');
    assert.ok(emptyObj.test.test1.test2 === 'testSetValueInEmptyObj2', "namespace was not set");
};
exports.testGetValue = function() {
    setup();
    var namespace = getValue(complexObj, 'test2.test2_2.test2_2_2');
    assert.ok(namespace === 'test 2.2.2', "namespace was not found");
};
exports.testGetValueWithoutKey = function() {
    setup();
    var namespace = getValue(complexObj);
    assert.ok(namespace === complexObj, "namespace was not found");
};
