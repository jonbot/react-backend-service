import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { createLogger } from 'redux-logger';
import rootReducer from "../store/reducers";

const initialState = {};
const loggerMiddleware = createLogger();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const allMiddleware = applyMiddleware(thunkMiddleware, loggerMiddleware);

export const store = createStore(rootReducer, initialState, allMiddleware);
