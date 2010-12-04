var path = require('path'),
    assert = require('assert'),
    assertLintFree = require('node-assert-lint-free'),
    namespaces = require('namespaces');

var testCase = require('nodeunit').testCase;

function dynamicSetArgsFunction(/* obj, [key], val */) {
    var setArgs = parseSetArgs(arguments);
    return setArgs;
}

function dynamicGetArgsFunction(/* obj, [key] */) {
    var getArgs = parseGetArgs(arguments);
    return getArgs;
}

var tests = testCase({

    setUp: function (fn) {
        this.emptyObj = {};

        this.simpleObj = {
            test: 'test'
        };

        this.complexObj = {
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
        fn();
    },

    'lint free': function(test) {
        var root = path.join(__dirname, '../lib');
        assertLintFree(root);
        test.ok(true);
        test.done();
    },

    'parse set args with all arguments': function(test) {
        test.expect(3);
        var parsedArgs = dynamicSetArgsFunction(this.simpleObj, 'testKey', 'testVal');
        test.ok(parsedArgs.obj === this.simpleObj, "obj not found");
        test.ok(parsedArgs.key === 'testKey', "key not found");
        test.ok(parsedArgs.val === 'testVal', "val not found");
        test.done();
    },
    
    'parse set args with all arguments': function(test) {
        test.expect(3);
        var parsedArgs = dynamicSetArgsFunction(this.simpleObj, 'testKey', 'testVal');
        test.ok(parsedArgs.obj === this.simpleObj, "obj not found");
        test.ok(parsedArgs.key === 'testKey', "key not found");
        test.ok(parsedArgs.val === 'testVal', "val not found");
        test.done();
    },
    
    'parse set args wthout key argument': function(test) {
        test.expect(3);
        var parsedArgs = dynamicSetArgsFunction(this.simpleObj, 'testVal');
        test.ok(parsedArgs.obj === this.simpleObj, "obj not found");
        test.ok(parsedArgs.key === null, "key should be null");
        test.ok(parsedArgs.val === 'testVal', "val not found");
        test.done();
    },
    'parse get args with all arguments': function(test) {
        test.expect(2);
        var parsedArgs = dynamicGetArgsFunction(this.simpleObj, 'testKey');
        test.ok(parsedArgs.obj === this.simpleObj, "obj not found");
        test.ok(parsedArgs.key === 'testKey', "key not found");
        test.done();
    },
    'parse get args without key argument': function(test) {
        test.expect(2);
        var parsedArgs = dynamicGetArgsFunction(this.simpleObj);
        test.ok(parsedArgs.obj === this.simpleObj, "obj not found");
        test.ok(parsedArgs.key === null, "key should be null");
        test.done();
    },
    'fine namespace for get args': function(test) {
        test.expect(1);
        var parsedArgs = dynamicGetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2');
        var namespace = findNamespace(parsedArgs);
        test.ok(namespace === 'test 2.2.2', "could not find namespace");
        test.done();
    },
    'find namespace for get args without top namespace': function(test) {
        test.expect(1);
        // don't include top namespace value
        var parsedArgs = dynamicGetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2');
        var namespace = findNamespace(parsedArgs, false);
        test.ok(namespace === this.complexObj.test2.test2_2, "could not find namespace");
        test.done();
    },
    'find namespace for get args non-existent key': function(test) {
        test.expect(1);
        var parsedArgs = dynamicGetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2_1');
        var namespace = findNamespace(parsedArgs);
        test.ok(namespace === undefined, "namespace should be undefined");
        test.done();
    },
    'find namespace for set args': function(test) {
        test.expect(1);
        var parsedArgs = dynamicSetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2', 'testFindNamespaceForSetArgs');
        var namespace = findNamespace(parsedArgs);
        test.ok(namespace === 'test 2.2.2', "could not find namespace");
        test.done();
    },
    'find namespace for set args without top namespace': function(test) {
        test.expect(1);
        // don't include top namespace value
        var parsedArgs = dynamicSetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2', 'testFindNamespaceForSetArgsWithoutTopNamespace');
        var namespace = findNamespace(parsedArgs, false);
        test.ok(namespace === this.complexObj.test2.test2_2, "could not find namespace");
        test.done();
    },
    'find namespace for set args on existent key': function(test) {
        test.expect(1);
        // non-existent key
        var parsedArgs = dynamicSetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2_1', 'testFindNamespaceForSetArgsNonExistentKey');
        var namespace = findNamespace(parsedArgs);
        test.ok(namespace === undefined, "namespace should be undefined");
        test.done();
    },
    'create namespace': function(test) {
        test.expect(2);
        var space = createNamespace(this.simpleObj, ['test2', 'test2_1']);
        test.ok(this.simpleObj.test2.test2_1 !== undefined, "namespace was not created");
        test.ok(space !== undefined, "namespace was not created");
        test.done();
    },
    'set value': function(test) {
        test.expect(1);
        setValue(this.complexObj, 'test2.test2_2.test2_2_2', 'testSetValue');
        test.ok(this.complexObj.test2.test2_2.test2_2_2 === 'testSetValue', "namespace was not set");
        test.done();
    },
    'get value with new key': function(test) {
        test.expect(1);
        // new key
        setValue(this.complexObj, 'test2.test2_2.test2_2_3', 'testSetValueWithNewKey');
        test.ok(this.complexObj.test2.test2_2.test2_2_3 === 'testSetValueWithNewKey', "namespace was not set");
        test.done();
    },
    'set value deep non-existent key': function(test) {
        test.expect(1);
        setValue(this.complexObj, 'test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1', 'testSetValueDeepNonExistentKey');
        test.ok(this.complexObj.test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1 === 'testSetValueDeepNonExistentKey', "namespace was not set");
        test.done();
    },
    'set value in empty obj': function(test) {
        test.expect(1);
        setValue(this.emptyObj, 'test', 'testSetValueInEmptyObj1');
        test.ok(this.emptyObj.test === 'testSetValueInEmptyObj1', "namespace was not set");
        test.done();
    },
    'set value deep in empty obj': function(test) {
        test.expect(1);
        setValue(this.emptyObj, 'test.test1.test2', 'testSetValueInEmptyObj2');
        test.ok(this.emptyObj.test.test1.test2 === 'testSetValueInEmptyObj2', "namespace was not set");
        test.done();
    },
    'get value': function(test) {
        test.expect(1);
        var namespace = getValue(this.complexObj, 'test2.test2_2.test2_2_2');
        test.ok(namespace === 'test 2.2.2', "namespace was not found");
        test.done();
    },
    'get value without key': function(test) {
        test.expect(1);
        var namespace = getValue(this.complexObj);
        test.ok(namespace === this.complexObj, "namespace was not found");
        test.done();
    },
});

module.exports = tests;

