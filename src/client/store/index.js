import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from './users/users.reducer';

const store = createStore(reducer, applyMiddleware(thunk));

export default store;
