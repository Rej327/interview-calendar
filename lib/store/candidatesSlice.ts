import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface CandidatesState {
  candidates: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CandidatesState = {
  candidates: [],
  loading: false,
  error: null,
};

export const fetchCandidates = createAsyncThunk(
  "candidates/fetchCandidates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/candidates");
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch candidates");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default candidatesSlice.reducer;
