import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface CandidatesState {
  candidates: any[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: CandidatesState = {
  candidates: [],
  totalCount: 0,
  loading: false,
  error: null,
};

export const fetchCandidates = createAsyncThunk(
  "candidates/fetchCandidates",
  async (params: { 
    limit: number; 
    offset: number; 
    sort_column?: string; 
    sort_direction?: string; 
    query?: string; 
    status_filters?: string[]; 
    role_filters?: string[]; 
  }, { rejectWithValue }) => {
    try {
      const { fetchCandidatesPaginated } = await import("@/app/actions/get");
      const result = await fetchCandidatesPaginated(params);
      if (!result.success) throw new Error(result.message || "Failed to fetch candidates");
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCandidate = createAsyncThunk(
  "candidates/addCandidate",
  async (input_data: { full_name: string; email: string; avatar_url: string; role_id: string }, { rejectWithValue }) => {
    try {
      const { createCandidate } = await import("@/app/actions/post");
      const result = await createCandidate(input_data);
      if (!result.success) throw new Error(result.message || "Failed to add candidate");
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCandidate = createAsyncThunk(
  "candidates/updateCandidate",
  async (input_data: { candidate_id: string; full_name?: string; email?: string; avatar_url?: string; status?: string; role_id?: string }, { rejectWithValue }) => {
    try {
      const { updateCandidate: updateCandidateAction } = await import("@/app/actions/update");
      const result = await updateCandidateAction(input_data);
      if (!result.success) throw new Error(result.message || "Failed to update candidate");
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCandidate = createAsyncThunk(
  "candidates/deleteCandidate",
  async (candidate_id: string, { rejectWithValue }) => {
    try {
      const { deleteCandidate: deleteCandidateAction } = await import("@/app/actions/delete");
      const result = await deleteCandidateAction(candidate_id);
      if (!result.success) throw new Error(result.message || "Failed to delete candidate");
      return candidate_id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCandidateJourney = createAsyncThunk(
  "candidates/fetchCandidateJourney",
  async (hiring_process_id: string, { rejectWithValue }) => {
    try {
      const { fetchCandidateJourney: fetchJourneyAction } = await import("@/app/actions/get");
      const result = await fetchJourneyAction(hiring_process_id);
      if (!result.success) throw new Error(result.message || "Failed to fetch candidate journey");
      return result.data;
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
      .addCase(fetchCandidates.fulfilled, (state, action: PayloadAction<{ total_count: number; records: any[] }>) => {
        state.loading = false;
        state.candidates = action.payload.records;
        state.totalCount = action.payload.total_count;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addCandidate.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCandidate.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.candidates.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(addCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCandidate.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCandidate.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.candidates.findIndex((c) => c.candidate_id === action.payload.candidate_id);
        if (index !== -1) {
          state.candidates[index] = action.payload;
        }
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCandidate.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCandidate.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.candidates = state.candidates.filter((c) => c.candidate_id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default candidatesSlice.reducer;
