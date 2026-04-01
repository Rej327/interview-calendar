import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "./calendarSlice";
import candidatesReducer from "./candidatesSlice";
import interviewReducer from "./interviewSlice";
import rolesReducer from "./rolesSlice";

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    candidates: candidatesReducer,
    interviews: interviewReducer,
    roles: rolesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
