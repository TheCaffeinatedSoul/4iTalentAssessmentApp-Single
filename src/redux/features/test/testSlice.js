import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    setTest: (state, action) => {
      return [action.payload];
    },
    updateTest: (state, action) => {
      return [...state, ...action.payload];
    },
  },
});

export const testSelector = (state) => state.test;

export const { setTest, updateTest } = testSlice.actions;

export default testSlice.reducer;
