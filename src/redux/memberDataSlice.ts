import { RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IMemberData {
  id: string;
  name: string;
  govid: string;
  email: string;
  phone?: string;
  permit: boolean
}

interface MemberDataState {
  member: IMemberData | null;
}

const initialState: MemberDataState = {
  member: null,
};

const memberDataSlice = createSlice({
  name: 'memberData',
  initialState,
  reducers: {
    setMemberData: (state, action: PayloadAction<IMemberData>) => {
      state.member = action.payload;
    },
    clearMemberData: (state) => {
      state.member = null;
    },
  },
});

export const { setMemberData, clearMemberData } = memberDataSlice.actions;
export default memberDataSlice.reducer;

export const selectMemberData = (state: RootState) => state.member;
