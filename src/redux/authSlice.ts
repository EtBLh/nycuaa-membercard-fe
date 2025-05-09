import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    }
  },
});

export const { setToken } = authSlice.actions;
export default authSlice.reducer;
export const selectToken = (state: RootState) => state.auth?.token;