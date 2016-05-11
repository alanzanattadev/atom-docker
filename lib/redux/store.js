'use babel'

import { createStore } from 'redux';
import app from './reducers';
let store = createStore(app);
export default store;
