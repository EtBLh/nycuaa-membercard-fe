import { RootState } from '@/store';
import { createSlice } from '@reduxjs/toolkit';

interface MemberDataState {
  step: number;
}

const initialState: MemberDataState = {
  step: 0,
};

const memberHomeSlice = createSlice({
  name: 'memberHome',
  initialState,
  reducers: {
    nextStep: (state) => {
      state.step = state.step + 1;
    },
    prevStep: (state) => {
      state.step = state.step - 1;
    },
  },
});

export const { nextStep, prevStep } = memberHomeSlice.actions;
export default memberHomeSlice.reducer;

export const selectStep = (state: RootState) => state.memberHome?.step;
