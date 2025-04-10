import { configureStore, PayloadAction } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { PersistConfig, persistStore } from 'redux-persist';
import authReducer from './redux/authSlice';
import memberHomeReducer from './redux/memberHomeSlice';

const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage,
};

const appReducer = combineReducers({
  auth: authReducer,
  memberHome: memberHomeReducer
});

const rootReducer = (state: any, action: PayloadAction) => {
  if (action.type === 'logout') {
    state = undefined; // resets the whole store
  }
  return appReducer(state, action);
};

export default rootReducer;

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer
});

export const logout = () => ({
  type: 'logout',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
