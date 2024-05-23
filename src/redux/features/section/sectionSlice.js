import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    sectionId: "",
    sectionName: "",
  },
];

export const sectionSlice = createSlice({
  name: "section",
  initialState,
  reducers: {
    setSection: (state, action) => {
      return [action.payload];
    },
    updateSection: (state, action) => {
      return [...state, ...action.payload];
    },
  },
});

export const sectionSelector = (state) => state.section;

export const { setSection, updateSection } = sectionSlice.actions;

export default sectionSlice.reducer;
