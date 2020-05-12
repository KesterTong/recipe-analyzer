/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./tests/fake_sidebar.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/redux-thunk/es/index.js":
/*!**********************************************!*\
  !*** ./node_modules/redux-thunk/es/index.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nfunction createThunkMiddleware(extraArgument) {\n  return function (_ref) {\n    var dispatch = _ref.dispatch,\n        getState = _ref.getState;\n    return function (next) {\n      return function (action) {\n        if (typeof action === 'function') {\n          return action(dispatch, getState, extraArgument);\n        }\n\n        return next(action);\n      };\n    };\n  };\n}\n\nvar thunk = createThunkMiddleware();\nthunk.withExtraArgument = createThunkMiddleware;\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (thunk);\n\n//# sourceURL=webpack:///./node_modules/redux-thunk/es/index.js?");

/***/ }),

/***/ "./src/Dropdown.tsx":
/*!**************************!*\
  !*** ./src/Dropdown.tsx ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\n// Copyright 2020 Google LLC\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//    https://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\nconst React = __webpack_require__(/*! react */ \"react\");\n// TODO: make selected a controlled property.\nexports.Dropdown = (props) => {\n    return (React.createElement(\"div\", { className: \"block form-group\" },\n        React.createElement(\"label\", { htmlFor: props.id }, props.label),\n        React.createElement(\"select\", { value: props.selected, onChange: props.onChange, id: props.id }, props.options.map((option) => (React.createElement(\"option\", { value: option.value }, option.label))))));\n};\n\n\n//# sourceURL=webpack:///./src/Dropdown.tsx?");

/***/ }),

/***/ "./src/Main.tsx":
/*!**********************!*\
  !*** ./src/Main.tsx ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\n// Copyright 2020 Google LLC\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//    https://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\nconst React = __webpack_require__(/*! react */ \"react\");\nconst Dropdown_1 = __webpack_require__(/*! ./Dropdown */ \"./src/Dropdown.tsx\");\nexports.Main = (props) => {\n    return (React.createElement(React.Fragment, null,\n        React.createElement(Dropdown_1.Dropdown, { id: \"recipe\", label: \"Selected Recipe\", options: props.recipeTitles\n                ? props.recipeTitles.map((title, index) => ({\n                    value: index,\n                    label: title,\n                }))\n                : [{ value: 0, label: \"Loading...\" }], selected: props.selectedRecipeIndex, onChange: (event) => props.selectRecipe(Number(event.target.value)) }),\n        React.createElement(\"div\", { className: \"block form-group button-group\" },\n            React.createElement(\"button\", null, \"Delete\"),\n            React.createElement(\"button\", null, \"Insert Above\"),\n            React.createElement(\"button\", null, \"Insert Below\"))));\n};\n\n\n//# sourceURL=webpack:///./src/Main.tsx?");

/***/ }),

/***/ "./src/MainContainer.ts":
/*!******************************!*\
  !*** ./src/MainContainer.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst redux_1 = __webpack_require__(/*! redux */ \"redux\");\nconst react_redux_1 = __webpack_require__(/*! react-redux */ \"react-redux\");\nconst Main_1 = __webpack_require__(/*! ./Main */ \"./src/Main.tsx\");\nconst store_1 = __webpack_require__(/*! ./store */ \"./src/store/index.ts\");\nfunction mapStateToProps(state) {\n    return {\n        recipeTitles: state.type == \"Loading\" ? null : state.document.recipes.map(recipe => recipe.title),\n        selectedRecipeIndex: state.type == \"Loading\" ? 0 : state.selectedRecipeIndex,\n    };\n}\nfunction mapDispatchToProps(dispatch) {\n    return redux_1.bindActionCreators({\n        selectRecipe: store_1.selectRecipe,\n    }, dispatch);\n}\nexports.MainContainer = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(Main_1.Main);\n\n\n//# sourceURL=webpack:///./src/MainContainer.ts?");

/***/ }),

/***/ "./src/store/actions.ts":
/*!******************************!*\
  !*** ./src/store/actions.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\n// Copyright 2020 Google LLC\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//    https://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\nconst types_1 = __webpack_require__(/*! ./types */ \"./src/store/types.ts\");\nfunction updateDocument(document) {\n    return {\n        type: types_1.ActionType.UPDATE_DOCUMENT,\n        document,\n    };\n}\nexports.updateDocument = updateDocument;\nfunction selectRecipe(index) {\n    return {\n        type: types_1.ActionType.SELECT_RECIPE,\n        index,\n    };\n}\nexports.selectRecipe = selectRecipe;\n\n\n//# sourceURL=webpack:///./src/store/actions.ts?");

/***/ }),

/***/ "./src/store/index.ts":
/*!****************************!*\
  !*** ./src/store/index.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n// Copyright 2020 Google LLC\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//    https://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\nfunction __export(m) {\n    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];\n}\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst redux_1 = __webpack_require__(/*! redux */ \"redux\");\nconst redux_thunk_1 = __webpack_require__(/*! redux-thunk */ \"./node_modules/redux-thunk/es/index.js\");\nconst types_1 = __webpack_require__(/*! ./types */ \"./src/store/types.ts\");\n__export(__webpack_require__(/*! ./actions */ \"./src/store/actions.ts\"));\n__export(__webpack_require__(/*! ./types */ \"./src/store/types.ts\"));\nfunction rootReducer(state = types_1.initialState, action) {\n    switch (action.type) {\n        case types_1.ActionType.UPDATE_DOCUMENT:\n            return {\n                type: \"Active\",\n                document: action.document,\n                selectedRecipeIndex: 0,\n            };\n        case types_1.ActionType.SELECT_RECIPE:\n            if (state.type == \"Loading\") {\n                return state;\n            }\n            return Object.assign(Object.assign({}, state), { selectedRecipeIndex: action.index });\n        default:\n            return state;\n    }\n}\nconst logger = (store) => (next) => (action) => {\n    console.log(\"dispatching\", action);\n    let result = next(action);\n    console.log(\"next state\", store.getState());\n    return result;\n};\nexports.store = redux_1.createStore(rootReducer, redux_1.applyMiddleware(redux_thunk_1.default, logger));\n\n\n//# sourceURL=webpack:///./src/store/index.ts?");

/***/ }),

/***/ "./src/store/types.ts":
/*!****************************!*\
  !*** ./src/store/types.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports.initialState = {\n    type: \"Loading\",\n};\nvar ActionType;\n(function (ActionType) {\n    ActionType[\"UPDATE_DOCUMENT\"] = \"@UpdateDocument\";\n    ActionType[\"SELECT_RECIPE\"] = \"@SelectRecipe\";\n})(ActionType = exports.ActionType || (exports.ActionType = {}));\n\n\n//# sourceURL=webpack:///./src/store/types.ts?");

/***/ }),

/***/ "./tests/FakeDatabase.ts":
/*!*******************************!*\
  !*** ./tests/FakeDatabase.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n// Copyright 2020 Google LLC\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//    https://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\nObject.defineProperty(exports, \"__esModule\", { value: true });\n/**\n * An implementation of a Database that stores recipes in a Google Doc.\n */\nexports.FakeDatabase = {\n    parseDocument: () => {\n        return new Promise((resolve) => {\n            setTimeout(() => resolve({\n                recipes: [\n                    {\n                        totalNutrientValues: [\"1000\", \"200\"],\n                        ingredients: [\n                            {\n                                unit: \"cup\",\n                                amount: \"1\",\n                                ingredient: { description: \"flour\", url: \"#test\" },\n                                nutrientValues: [\"100\", \"20\"],\n                            },\n                            {\n                                unit: \"\",\n                                amount: \"2\",\n                                ingredient: { description: \"test2\", url: \"#bc\" },\n                                nutrientValues: [\"b\", \"c\"],\n                            },\n                        ],\n                        nutrientNames: [\"Protein\", \"Calories\"],\n                        rangeId: \"3e1qfk20lh8q\",\n                        title: \"Recipe 1\",\n                    },\n                    {\n                        totalNutrientValues: [\"1000\", \"200\"],\n                        ingredients: [\n                            {\n                                unit: \"cup\",\n                                amount: \"1\",\n                                ingredient: { description: \"flour\", url: \"#test\" },\n                                nutrientValues: [\"100\", \"20\"],\n                            },\n                            {\n                                unit: \"\",\n                                amount: \"2\",\n                                ingredient: { description: \"test2\", url: \"#bc\" },\n                                nutrientValues: [\"b\", \"c\"],\n                            },\n                        ],\n                        nutrientNames: [\"Protein\", \"Calories\"],\n                        rangeId: \"abcdefg\",\n                        title: \"Recipe 2\",\n                    },\n                ],\n                toc: [{ title: \"Recipe Template\", url: \"#heading=h.y3h0qes0821d\" }],\n            }), 1000);\n        });\n    },\n};\n\n\n//# sourceURL=webpack:///./tests/FakeDatabase.ts?");

/***/ }),

/***/ "./tests/fake_sidebar.tsx":
/*!********************************!*\
  !*** ./tests/fake_sidebar.tsx ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n// Copyright 2020 Google LLC\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//    https://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst ReactDOM = __webpack_require__(/*! react-dom */ \"react-dom\");\nconst React = __webpack_require__(/*! react */ \"react\");\nconst FakeDatabase_1 = __webpack_require__(/*! ./FakeDatabase */ \"./tests/FakeDatabase.ts\");\nconst react_redux_1 = __webpack_require__(/*! react-redux */ \"react-redux\");\nconst store_1 = __webpack_require__(/*! ../src/store */ \"./src/store/index.ts\");\nconst MainContainer_1 = __webpack_require__(/*! ../src/MainContainer */ \"./src/MainContainer.ts\");\nReactDOM.render(React.createElement(react_redux_1.Provider, { store: store_1.store },\n    React.createElement(\"div\", { style: { width: \"300px\" } },\n        React.createElement(MainContainer_1.MainContainer, { database: FakeDatabase_1.FakeDatabase }))), document.getElementById(\"root\"));\nFakeDatabase_1.FakeDatabase.parseDocument().then((document) => store_1.store.dispatch(store_1.updateDocument(document)));\n\n\n//# sourceURL=webpack:///./tests/fake_sidebar.tsx?");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = React;\n\n//# sourceURL=webpack:///external_%22React%22?");

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = ReactDOM;\n\n//# sourceURL=webpack:///external_%22ReactDOM%22?");

/***/ }),

/***/ "react-redux":
/*!*****************************!*\
  !*** external "ReactRedux" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = ReactRedux;\n\n//# sourceURL=webpack:///external_%22ReactRedux%22?");

/***/ }),

/***/ "redux":
/*!************************!*\
  !*** external "Redux" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = Redux;\n\n//# sourceURL=webpack:///external_%22Redux%22?");

/***/ })

/******/ });