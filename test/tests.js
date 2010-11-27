var path = require('path'),
    assert = require('assert'),
    assertLintFree = require('node-assert-lint-free'),
    path = require('path'),
    namespaces = require('../namespaces.js');

var complexObj,
    simpleObj;

function getComplexObj() {
    return {
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
}

function getSimpleObj() {
    return {
        test: 'test'
    };
}

function dynamicSetArgsFunction(/* obj, [key], val */) {
    var setArgs = parseSetArgs(arguments);
    return setArgs;
}

function dynamicGetArgsFunction(/* obj, [key] */) {
    var getArgs = parseGetArgs(arguments);
    return getArgs;
}

var setup = function() {
    complexObj = getComplexObj();
    simpleObj = getSimpleObj();
};

exports.testLintFree = function() {
    var root = path.join(__dirname, '..');
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
    var parsedArgs = dynamicSetArgsFunction(complexObj, 'test2.test2_2.test2_2_2', 'something');
    var namespace = findNamespace(parsedArgs);
    assert.ok(namespace === 'test 2.2.2', "could not find namespace");
};
exports.testFindNamespaceForSetArgsWithoutTopNamespace = function() {
    setup();
    // don't include top namespace value
    var parsedArgs = dynamicSetArgsFunction(complexObj, 'test2.test2_2.test2_2_2', 'something');
    var namespace = findNamespace(parsedArgs, false);
    assert.ok(namespace === complexObj.test2.test2_2, "could not find namespace");
};
exports.testFindNamespaceForSetArgsNonExistentKey = function() {
    setup();
    // non-existent key
    var parsedArgs = dynamicSetArgsFunction(complexObj, 'test2.test2_2.test2_2_2_1', 'something');
    var namespace = findNamespace(parsedArgs);
    assert.ok(namespace === undefined, "namespace should be undefined");
};
exports.testCreateNamespace = function() {
    setup();
    var space = createNamespace(simpleObj, ['test2', 'test2_1']);
    assert.ok(simpleObj.test2.test2_1 !== undefined, "namespace was not created");
    assert.ok(space !== undefined, "namespace was not created");
};
exports.testSetValueWithKey = function() {
    setup();
    setValue(complexObj, 'test2.test2_2.test2_2_2', 'something');
    assert.ok(complexObj.test2.test2_2.test2_2_2 === 'something', "namespace was not set");
};
exports.testSetValueWithNewKey = function() {
    setup();
    // new key
    setValue(complexObj, 'test2.test2_2.test2_2_3', 'something else');
    assert.ok(complexObj.test2.test2_2.test2_2_3 === 'something else', "namespace was not set");
};
exports.testSetValueDeepNonExistentKey = function() {
    setup();
    setValue(complexObj, 'test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1', 'something else again');
    assert.ok(complexObj.test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1 === 'something else again', "namespace was not set");
};
exports.testSetValueWithoutKey = function() {
    setup();
    simpleObj.testX = 'test x';
    setValue(complexObj, simpleObj);
    assert.ok(complexObj.testX === 'test x', "namespace was not set");
};
exports.testGetValue = function() {
    setup();
    var namespace = getValue(complexObj, 'test2.test2_2.test2_2_2');
    //assert.ok(namespace === 'test 2.2.2', "namespace was not found");
};
exports.testGetValueWithoutKey = function() {
    setup();
    var namespace = getValue(complexObj);
    assert.ok(namespace === complexObj, "namespace was not found");
};
