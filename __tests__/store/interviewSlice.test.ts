import { configureStore } from "@reduxjs/toolkit";
import interviewReducer, {
  fetchInterviews,
  updateInterviewStatus,
  setActiveTab,
  setSelectedInterview,
} from "@/lib/store/interviewSlice";
import { InterviewStatus, InterviewType, type CalendarEvent } from "@/lib/types/interview";

// Mock global fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

const makeStore = () =>
  configureStore({ reducer: { interviews: interviewReducer } });

const MOCK_INTERVIEW: CalendarEvent = {
  id: "iv1",
  title: "Technical Screen: Alice",
  start: "2024-06-01T10:00:00Z",
  end: "2024-06-01T11:00:00Z",
  extendedProps: {
    candidate: "Alice Brown",
    interviewer: "Bob Smith",
    role: "Software Engineer",
    status: InterviewStatus.SCHEDULED,
    type: InterviewType.DEPARTMENT,
  },
};

beforeEach(() => mockFetch.mockReset());

// ─── Sync reducers ────────────────────────────────────────────────────────────
describe("interviewSlice – sync reducers", () => {
  it("has correct initial state", () => {
    const store = makeStore();
    const s = store.getState().interviews;
    expect(s.items).toEqual([]);
    expect(s.loading).toBe(false);
    expect(s.activeTab).toBe("today");
    expect(s.selectedInterview).toBeNull();
  });

  it("setActiveTab updates activeTab", () => {
    const store = makeStore();
    store.dispatch(setActiveTab("upcoming"));
    expect(store.getState().interviews.activeTab).toBe("upcoming");
  });

  it("setSelectedInterview sets and clears selectedInterview", () => {
    const store = makeStore();
    store.dispatch(setSelectedInterview(MOCK_INTERVIEW));
    expect(store.getState().interviews.selectedInterview?.id).toBe("iv1");

    store.dispatch(setSelectedInterview(null));
    expect(store.getState().interviews.selectedInterview).toBeNull();
  });
});

// ─── fetchInterviews thunk ───────────────────────────────────────────────────
describe("interviewSlice – fetchInterviews thunk", () => {
  it("sets loading=true while pending", () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    const store = makeStore();
    store.dispatch(fetchInterviews());
    expect(store.getState().interviews.loading).toBe(true);
  });

  it("populates items on fulfilled", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true, data: [MOCK_INTERVIEW] }),
    });

    const store = makeStore();
    await store.dispatch(fetchInterviews());
    const state = store.getState().interviews;

    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("iv1");
  });

  it("sets error on rejected", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false, message: "Network error" }),
    });

    const store = makeStore();
    await store.dispatch(fetchInterviews());
    const state = store.getState().interviews;

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Network error");
  });

  it("handles fetch exception gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

    const store = makeStore();
    await store.dispatch(fetchInterviews());
    expect(store.getState().interviews.error).toBe("Connection refused");
  });
});

it("updates item in list and selectedInterview on fulfilled", async () => {
  // Seed store with one interview
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ success: true, data: [MOCK_INTERVIEW] }),
  });
  const store = makeStore();
  await store.dispatch(fetchInterviews());
  store.dispatch(setSelectedInterview(MOCK_INTERVIEW));

  const updatedInterview = {
    ...MOCK_INTERVIEW,
    extendedProps: { ...MOCK_INTERVIEW.extendedProps, status: InterviewStatus.COMPLETED },
  };
  mockFetch.mockResolvedValueOnce({
    json: async () => ({ success: true, data: updatedInterview }),
  });

  await store.dispatch(
    updateInterviewStatus({ id: "iv1", status: InterviewStatus.COMPLETED }),
  );
  const state = store.getState().interviews;

  expect(state.items[0].extendedProps.status).toBe(InterviewStatus.COMPLETED);
  expect(state.selectedInterview?.extendedProps.status).toBe(InterviewStatus.COMPLETED);
  expect(mockFetch).toHaveBeenCalledWith(
    "/api/events/iv1",
    expect.objectContaining({
      method: "PATCH",
    }),
  );
});
