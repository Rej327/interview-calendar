import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEvent } from "@/lib/types/interview";

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  selectedDate: string; // ISO string
}

const initialState: CalendarState = {
  events: [],
  loading: false,
  error: null,
  selectedDate: new Date().toISOString(),
};

export const fetchEvents = createAsyncThunk(
  "calendar/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch events");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    updateEvent: (state, action: PayloadAction<CalendarEvent>) => {
        const index = state.events.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
            state.events[index] = action.payload;
        }
    },
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
        state.events.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedDate, updateEvent, addEvent } = calendarSlice.actions;
export default calendarSlice.reducer;
