import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    queryId: "",
    query: "",
    questionNumber: "",
    answers: [],
  },
];

export const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      return [action.payload];
    },
    updateQuery: (state, action) => {
      return [...state, ...action.payload];
    },
  },
});

export const querySelector = (state) => state.query;

export const { setQuery, updateQuery } = querySlice.actions;

export default querySlice.reducer;
