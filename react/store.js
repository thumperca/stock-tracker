//  Core dependencies
import { createStore, applyMiddleware } from "redux";
import { createLogger } from 'redux-logger'

// //  reducer
import reducer from './reducer.js';

//  initial state
import initalState from "./state";

const logger = createLogger({});

//  create redux store
const store = createStore(reducer, initalState, applyMiddleware(logger));

export default store;
