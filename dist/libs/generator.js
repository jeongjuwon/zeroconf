"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _dataloader = _interopRequireDefault(require("dataloader"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _resolvers = require("../classes/resolvers");

var _subscribers = require("../classes/subscribers");

var _composer = require("./composer");

var _dataLoader = _interopRequireDefault(require("./dataLoader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Op = _sequelize.default.Op;

var getListQueryFields = function getListQueryFields(zeroConf, type, fieldName, model) {
  var hooks = zeroConf.hooks,
      pubSub = zeroConf.pubSub;
  var TypeName = model.convertedName.TypeName;
  var path = "".concat(type, ".").concat(fieldName);
  var config = {
    path: path,
    model: model,
    hooks: hooks,
    pubSub: pubSub
  };
  var Resolver = type === 'Query' ? new _resolvers.ListResolver(config) : new _subscribers.ListSubscriber(config);
  (0, _composer.addResolver)(path, {
    resolve: Resolver.resolve,
    subscribe: Resolver.subscribe
  });
  return {
    type: "[".concat(TypeName, "]"),
    args: {
      start: 'Int',
      limit: 'Int',
      order: "".concat(TypeName, "OrderInput"),
      where: 'JSON'
    }
  };
};

var getRowQueryFields = function getRowQueryFields(zeroConf, type, fieldName, model) {
  var hooks = zeroConf.hooks,
      pubSub = zeroConf.pubSub;
  var TypeName = model.convertedName.TypeName;
  var path = "".concat(type, ".").concat(fieldName);
  var config = {
    path: path,
    model: model,
    hooks: hooks,
    pubSub: pubSub
  };
  var Resolver = type === 'Query' ? new _resolvers.RowResolver(config) : new _subscribers.RowSubscriber(config);
  (0, _composer.addResolver)(path, {
    resolve: Resolver.resolve,
    subscribe: Resolver.subscribe
  });
  return {
    type: "".concat(TypeName),
    args: {
      where: "".concat(TypeName, "WhereInput!")
    }
  };
};

var getCountQueryFields = function getCountQueryFields(zeroConf, type, TypeNames, model) {
  var hooks = zeroConf.hooks,
      pubSub = zeroConf.pubSub;
  var path = "".concat(type, ".num").concat(TypeNames);
  (0, _composer.addResolver)(path, {
    resolve: new _resolvers.CountResolver({
      path: path,
      model: model,
      hooks: hooks,
      pubSub: pubSub
    }).resolve
  });
  return {
    type: 'Int!',
    args: {
      where: 'JSON'
    }
  };
};

var getMutationFields = function getMutationFields(zeroConf) {
  var fields = {};
  var hooks = zeroConf.hooks,
      pubSub = zeroConf.pubSub,
      models = zeroConf.models;

  var _arr = Object.values(models);

  for (var _i = 0; _i < _arr.length; _i++) {
    var model = _arr[_i];
    var TypeName = model.convertedName.TypeName;
    (0, _composer.addResolver)("Mutation.create".concat(TypeName), {
      resolve: new _resolvers.CreateResolver({
        path: "Mutation.create".concat(TypeName),
        model: model,
        hooks: hooks,
        pubSub: pubSub
      }).resolve
    });
    fields["create".concat(TypeName)] = {
      type: TypeName,
      args: {
        input: "".concat(TypeName, "CreationInput!")
      }
    };
    (0, _composer.addResolver)("Mutation.update".concat(TypeName), {
      resolve: new _resolvers.UpdateResolver({
        path: "Mutation.update".concat(TypeName),
        model: model,
        hooks: hooks,
        pubSub: pubSub
      }).resolve
    });
    fields["update".concat(TypeName)] = {
      type: TypeName,
      args: {
        where: "".concat(TypeName, "WhereInput!"),
        input: "".concat(TypeName, "UpdateInput!")
      }
    };
    (0, _composer.addResolver)("Mutation.delete".concat(TypeName), {
      resolve: new _resolvers.DeleteResolver({
        path: "Mutation.delete".concat(TypeName),
        model: model,
        hooks: hooks,
        pubSub: pubSub
      }).resolve
    });
    fields["delete".concat(TypeName)] = {
      type: 'Int',
      args: {
        where: "".concat(TypeName, "WhereInput!")
      }
    };
  }

  return fields;
};

var generateMutation = function generateMutation(zeroConf) {
  var fields = _objectSpread({}, getMutationFields(zeroConf));

  (0, _composer.addFields)('Mutation', fields);
};

var generateChildren = function generateChildren(zeroConf) {
  var models = zeroConf.models;

  var _arr2 = Object.values(models);

  var _loop = function _loop() {
    var model = _arr2[_i2];
    var sourceModel = model;
    var tableAttributes = sourceModel.tableAttributes;

    var filtered = _lodash.default.filter(tableAttributes, function (attr) {
      return attr.references;
    });

    _lodash.default.each(filtered, function (attr) {
      var _addFields;

      var sourceKey = attr.field,
          _attr$references = attr.references,
          targetKey = _attr$references.key,
          targetModelName = _attr$references.model;
      var targetModel = models[targetModelName];
      var childPath = "".concat(sourceModel.convertedName.TypeName, ".").concat(targetModel.convertedName.typeName);
      (0, _composer.addResolver)(childPath, {
        resolve: function () {
          var _resolve = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee2(parent, args, context, info) {
            var loader;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    loader = _dataLoader.default.query(context, childPath,
                    /*#__PURE__*/
                    function () {
                      var _ref = _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee(ids) {
                        var result;
                        return regeneratorRuntime.wrap(function _callee$(_context) {
                          while (1) {
                            switch (_context.prev = _context.next) {
                              case 0:
                                targetModel.hasOne(sourceModel, {
                                  foreignKey: sourceKey,
                                  targetKey: targetKey
                                });
                                _context.next = 3;
                                return targetModel.findAll({
                                  include: [{
                                    attributes: [],
                                    model: sourceModel
                                  }],
                                  where: _defineProperty({}, targetKey, parent[sourceKey])
                                });

                              case 3:
                                result = _context.sent;
                                return _context.abrupt("return", _dataLoader.default.groupMapping(result, ids, targetKey, true));

                              case 5:
                              case "end":
                                return _context.stop();
                            }
                          }
                        }, _callee);
                      }));

                      return function (_x5) {
                        return _ref.apply(this, arguments);
                      };
                    }());
                    return _context2.abrupt("return", loader.load(parent[sourceKey]));

                  case 2:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          function resolve(_x, _x2, _x3, _x4) {
            return _resolve.apply(this, arguments);
          }

          return resolve;
        }()
      });
      var childrenPath = "".concat(sourceModel.convertedName.TypeName, ".").concat(targetModel.convertedName.typeNames);
      (0, _composer.addResolver)(childrenPath, {
        resolve: function () {
          var _resolve2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee4(parent, args, context, info) {
            var loader;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    loader = _dataLoader.default.query(context, childrenPath,
                    /*#__PURE__*/
                    function () {
                      var _ref2 = _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee3(ids) {
                        var result;
                        return regeneratorRuntime.wrap(function _callee3$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                targetModel.hasMany(sourceModel, {
                                  foreignKey: sourceKey,
                                  targetKey: targetKey
                                });
                                _context3.next = 3;
                                return targetModel.findAll({
                                  include: [{
                                    attributes: [],
                                    model: sourceModel
                                  }],
                                  where: _defineProperty({}, targetKey, parent[sourceKey])
                                });

                              case 3:
                                result = _context3.sent;
                                return _context3.abrupt("return", _dataLoader.default.groupMapping(result, ids, targetKey, false));

                              case 5:
                              case "end":
                                return _context3.stop();
                            }
                          }
                        }, _callee3);
                      }));

                      return function (_x10) {
                        return _ref2.apply(this, arguments);
                      };
                    }());
                    return _context4.abrupt("return", loader.load(parent[sourceKey]));

                  case 2:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4);
          }));

          function resolve(_x6, _x7, _x8, _x9) {
            return _resolve2.apply(this, arguments);
          }

          return resolve;
        }()
      });
      (0, _composer.addFields)(sourceModel.convertedName.TypeName, (_addFields = {}, _defineProperty(_addFields, targetModel.convertedName.typeName, {
        type: targetModel.convertedName.TypeName
      }), _defineProperty(_addFields, targetModel.convertedName.typeNames, {
        type: "[".concat(targetModel.convertedName.TypeName, "]")
      }), _addFields));
    });
  };

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    _loop();
  }
};

var generateQuery = function generateQuery(zeroConf, type) {
  var fields = {};
  var models = zeroConf.models;

  var _arr3 = Object.values(models);

  for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
    var model = _arr3[_i3];
    var _model$convertedName = model.convertedName,
        typeName = _model$convertedName.typeName,
        typeNames = _model$convertedName.typeNames,
        TypeNames = _model$convertedName.TypeNames;
    fields[typeName] = getRowQueryFields(zeroConf, type, typeName, model);
    fields[typeNames] = getListQueryFields(zeroConf, type, typeNames, model);
    fields["num".concat(TypeNames)] = getCountQueryFields(zeroConf, type, TypeNames, model);
  }

  (0, _composer.addFields)(type, fields);
};

var generateQueryExtends = function generateQueryExtends(zeroConf) {
  var hooks = zeroConf.hooks,
      queryExtends = zeroConf.queryExtends;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop2 = function _loop2() {
      var _step$value = _step.value,
          type = _step$value.type,
          field = _step$value.field,
          returnType = _step$value.returnType,
          args = _step$value.args,
          resolver = _step$value.resolver;
      var path = "".concat(type, ".").concat(field);
      (0, _composer.addResolver)(path, {
        resolve: function () {
          var _resolve3 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee5(parent, resolverArgs, context, info) {
            var beforeHook, afterHook, newArgs, result;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    beforeHook = _lodash.default.get(hooks, "".concat(path, ".before"), null);
                    afterHook = _lodash.default.get(hooks, "".concat(path, ".after"), null);

                    if (!beforeHook) {
                      _context5.next = 8;
                      break;
                    }

                    _context5.next = 5;
                    return beforeHook(parent, resolverArgs, context, info);

                  case 5:
                    _context5.t0 = _context5.sent;
                    _context5.next = 9;
                    break;

                  case 8:
                    _context5.t0 = resolverArgs;

                  case 9:
                    newArgs = _context5.t0;
                    _context5.next = 12;
                    return resolver(parent, newArgs, context, info);

                  case 12:
                    result = _context5.sent;

                    if (!afterHook) {
                      _context5.next = 16;
                      break;
                    }

                    _context5.next = 16;
                    return afterHook(parent, newArgs, context, info);

                  case 16:
                    return _context5.abrupt("return", result);

                  case 17:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }));

          function resolve(_x11, _x12, _x13, _x14) {
            return _resolve3.apply(this, arguments);
          }

          return resolve;
        }()
      });
      (0, _composer.addFields)(type, _defineProperty({}, field, {
        args: args,
        type: returnType
      }));
    };

    for (var _iterator = queryExtends[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop2();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

var generator = function generator(zeroConf) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Query';

  if (type === 'Mutation') {
    generateMutation(zeroConf);
  }

  if (type === 'Query') {
    generateQuery(zeroConf, 'Query');
  }

  if (type === 'Subscription') {
    generateQuery(zeroConf, 'Subscription');
  }

  if (type === 'Children') {
    generateChildren(zeroConf);
  }

  if (type === 'QueryExtends') {
    generateQueryExtends(zeroConf);
  }
};

var _default = generator;
exports.default = _default;