import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const responseSlice = createSlice({
  name: "response",
  initialState,
  reducers: {
    setResponse: (state, action) => {
      const {
        queryId,
        response,
        answerId,
        sectionId,
        descresponse,
        isFlagged,
      } = action.payload;
      const existingResponse = state.find((r) => r.queryId === queryId);

      if (existingResponse) {
        existingResponse.answerId = answerId;
        existingResponse.descresponse = descresponse || "";
      } else {
        state.push({
          queryId,
          response,
          answerId,
          sectionId,
          descresponse,
          isFlagged,
        });
      }
    },
    removeResponse: (state, action) => {
      const { queryId } = action.payload;
      const index = state.findIndex((r) => r.queryId === queryId);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    flagQuestion: (state, action) => {
      const { queryId } = action.payload;
      const existingResponse = state.find((r) => r.queryId === queryId);
      if (existingResponse) {
        existingResponse.isFlagged = true;
      } else {
        state.push({ queryId, isFlagged: true });
      }
    },
    unflagQuestion: (state, action) => {
      const { queryId } = action.payload;
      const existingResponseIndex = state.findIndex(
        (r) => r.queryId === queryId
      );
      if (existingResponseIndex !== -1) {
        const existingResponse = state[existingResponseIndex];
        const isUnanswered = Object.keys(existingResponse).length <= 2;
        if (isUnanswered) {
          state.splice(existingResponseIndex, 1);
        } else {
          existingResponse.isFlagged = false;
        }
      }
    },
    clearResponses: (state) => {
      return [];
    },
  },
});

export const {
  setResponse,
  clearResponses,
  removeResponse,
  flagQuestion,
  unflagQuestion,
} = responseSlice.actions;
export const responseSelector = (state) => state.response;
export default responseSlice.reducer;
