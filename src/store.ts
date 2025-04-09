import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { PersistConfig, persistStore } from 'redux-persist';
import authReducer from './redux/authSlice';
import memberDataReducer from './redux/memberDataSlice';

const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  member: memberDataReducer
});

//@ts-ignore
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // Add other middleware if needed
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
