import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "./calendarSlice";
import candidatesReducer from "./candidatesSlice";
import interviewReducer from "./interviewSlice";

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    candidates: candidatesReducer,
    interviews: interviewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
