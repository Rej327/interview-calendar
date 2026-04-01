import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEvent, INTERVIEW_STATUS } from "@/lib/types/interview";

interface InterviewState {
  items: CalendarEvent[];
  loading: boolean;
  error: string | null;
  activeTab: string;
  selectedInterview: CalendarEvent | null;
}

const initialState: InterviewState = {
  items: [],
  loading: false,
  error: null,
  activeTab: "today",
  selectedInterview: null,
};

// We reuse the same endpoint but can add specific filters if needed
export const fetchInterviews = createAsyncThunk(
  "interviews/fetchInterviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch interviews");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateInterviewStatus = createAsyncThunk(
    "interviews/updateStatus",
    async ({ id, status }: { id: string; status: INTERVIEW_STATUS }, { rejectWithValue }) => {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Failed to update status");
        return data.data;
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }
  );

const interviewSlice = createSlice({
  name: "interviews",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSelectedInterview: (state, action: PayloadAction<CalendarEvent | null>) => {
      state.selectedInterview = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateInterviewStatus.fulfilled, (state, action: PayloadAction<CalendarEvent>) => {
          const index = state.items.findIndex(i => i.id === action.payload.id);
          if (index !== -1) {
              state.items[index] = action.payload;
          }
          if (state.selectedInterview?.id === action.payload.id) {
              state.selectedInterview = action.payload;
          }
      });
  },
});

export const { setActiveTab, setSelectedInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
