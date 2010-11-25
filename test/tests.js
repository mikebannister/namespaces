var sys = require('sys'),
    unittest = require('unittest'),
    namespaces = require('../index');

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

function NamespacesTestCase() {
    unittest.TestCase.apply(this, arguments);
}
sys.inherits(NamespacesTestCase, unittest.TestCase);

NamespacesTestCase.prototype.extend({
    isSetUp: false,
    setUp: function () {
        this.complexObj = getComplexObj();
        this.simpleObj = getSimpleObj();
        this.isSetUp = true;
    },
    tearDown: function () {
        this.isSetUp = false;
    },
    testParseSetArgsWithAllArguments: function () {
        var parsedArgs = dynamicSetArgsFunction(this.simpleObj, 'testKey', 'testVal');
        this.assertOk(parsedArgs.obj === this.simpleObj, "obj not found");
        this.assertOk(parsedArgs.key === 'testKey', "key not found");
        this.assertOk(parsedArgs.val === 'testVal', "val not found");
    },
    testParseSetArgsWithoutKeyArgument: function () {
        var parsedArgs = dynamicSetArgsFunction(this.simpleObj, 'testVal');
        this.assertOk(parsedArgs.obj === this.simpleObj, "obj not found");
        this.assertOk(parsedArgs.key === null, "key should be null");
        this.assertOk(parsedArgs.val === 'testVal', "val not found");
    },
    testParseGetArgsWithAllArguments: function () {
        var parsedArgs = dynamicGetArgsFunction(this.simpleObj, 'testKey');
        this.assertOk(parsedArgs.obj === this.simpleObj, "obj not found");
        this.assertOk(parsedArgs.key === 'testKey', "key not found");
    },
    testParseGetArgsWithoutKeyArgument: function () {
        var parsedArgs = dynamicGetArgsFunction(this.simpleObj);
        this.assertOk(parsedArgs.obj === this.simpleObj, "obj not found");
        this.assertOk(parsedArgs.key === null, "key should be null");
    },
    testFindNamespaceForGetArgs: function() {
        var parsedArgs = dynamicGetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2');
        var namespace = findNamespace(parsedArgs);
        this.assertOk(namespace === 'test 2.2.2', "could not find namespace");
    },
    testFindNamespaceForGetArgsWithoutTopNamespace: function() {
        // don't include top namespace value
        var parsedArgs = dynamicGetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2');
        var namespace = findNamespace(parsedArgs, false);
        this.assertOk(namespace === this.complexObj.test2.test2_2, "could not find namespace");
        // non-existent key
    },
    testFindNamespaceForGetArgsNonExistentKey: function() {
        // non-existent key
        var parsedArgs = dynamicGetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2_1');
        var namespace = findNamespace(parsedArgs);
        this.assertOk(namespace === undefined, "namespace should be undefined");
    },
    testFindNamespaceForSetArgs: function() {
        var parsedArgs = dynamicSetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2', 'something');
        var namespace = findNamespace(parsedArgs);
        this.assertOk(namespace === 'test 2.2.2', "could not find namespace");
    },
    testFindNamespaceForSetArgsWithoutTopNamespace: function() {
        // don't include top namespace value
        var parsedArgs = dynamicSetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2', 'something');
        var namespace = findNamespace(parsedArgs, false);
        this.assertOk(namespace === this.complexObj.test2.test2_2, "could not find namespace");
    },
    testFindNamespaceForSetArgsNonExistentKey: function() {
        // non-existent key
        var parsedArgs = dynamicSetArgsFunction(this.complexObj, 'test2.test2_2.test2_2_2_1', 'something');
        var namespace = findNamespace(parsedArgs);
        this.assertOk(namespace === undefined, "namespace should be undefined");
    },
    testCreateNamespace: function() {
        var space = createNamespace(this.simpleObj, ['test2', 'test2_1']);
        this.assertOk(this.simpleObj.test2.test2_1 !== undefined, "namespace was not created");
        this.assertOk(space !== undefined, "namespace was not created");
    },
    testSetValueWithKey: function() {
        setValue(this.complexObj, 'test2.test2_2.test2_2_2', 'something');
        this.assertOk(this.complexObj.test2.test2_2.test2_2_2 === 'something', "namespace was not set");
    },
    testSetValueWithNewKey: function() {
        // new key
        setValue(this.complexObj, 'test2.test2_2.test2_2_3', 'something else');
        this.assertOk(this.complexObj.test2.test2_2.test2_2_3 === 'something else', "namespace was not set");
    },
    testSetValueDeepNonExistentKey: function() {
        setValue(this.complexObj, 'test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1', 'something else again');
        this.assertOk(this.complexObj.test2.test2_2.test2_2_3.test2_2_3_1.test2_2_3_1_1 === 'something else again', "namespace was not set");
    },
    testSetValueWithoutKey: function() {
        this.simpleObj.testX = 'test x';
        setValue(this.complexObj, this.simpleObj);
        this.assertOk(this.complexObj.testX === 'test x', "namespace was not set");
    },
    testGetValue: function() {
        var namespace = getValue(this.complexObj, 'test2.test2_2.test2_2_2');
        this.assertOk(namespace === 'test 2.2.2', "namespace was not found");
    },
    testGetValueWithoutKey: function() {
        var namespace = getValue(this.complexObj);
        this.assertOk(namespace === this.complexObj, "namespace was not found");
    }
});

exports.NamespacesTestCase = NamespacesTestCase;
