import { configureStore } from "@reduxjs/toolkit";
import querySlice from "./features/query/querySlice";
import sectionSlice from "./features/section/sectionSlice";
import testSlice from "./features/test/testSlice";
import responseSlice from "./features/response/responseSlice";

export const store = configureStore({
  reducer: {
    test: testSlice,
    query: querySlice,
    section: sectionSlice,
    response: responseSlice,
  },
});
