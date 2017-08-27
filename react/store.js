//  Core dependencies
import { createStore, applyMiddleware } from "redux";
import logger from "redux-logger";

// //  reducer
import reducer from './reducer.js';

//  initial state
import initalState from "./state";

//  create redux store
const store = createStore(reducer, initalState, applyMiddleware(logger()));

export default store;
