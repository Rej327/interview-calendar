import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import candidatesReducer from "@/lib/store/candidatesSlice";
import CandidateJourneyDrawer from "@/components/candidates/CandidateJourneyDrawer";
import * as candidatesSlice from "@/lib/store/candidatesSlice";

jest.mock("@/lib/store/candidatesSlice", () => {
  const actual = jest.requireActual("@/lib/store/candidatesSlice");
  return {
    ...actual,
    fetchCandidateJourney: jest.fn(),
  };
});

jest.mock("@mantine/notifications", () => ({
  notifications: { show: jest.fn() },
}));

const makeStore = () =>
  configureStore({
    reducer: { candidates: candidatesReducer },
  });

const renderDrawer = (props: any = {}) => {
  const store = makeStore();
  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
    candidate: {
      id: "c1",
      name: "Alice Wonderland",
      role: "Designer",
      status: "IN_PROGRESS",
      avatar: "/alice.png",
      hiring_process_id: "hp1",
    },
    ...props,
  };
  return {
    store,
    ...render(
      <Provider store={store}>
        <MantineProvider>
          <CandidateJourneyDrawer {...defaultProps} />
        </MantineProvider>
      </Provider>
    ),
  };
};

describe("CandidateJourneyDrawer – integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders null if no candidate provided", () => {
    renderDrawer({ candidate: null });
    expect(screen.queryByText("Hiring Journey")).not.toBeInTheDocument();
  });

  it("dispatches fetchCandidateJourney and displays steps", async () => {
    const mockJourney = {
      process_info: {
        hiring_process_id: "hp1",
        hiring_process_created_at: "2024-05-10T00:00:00Z",
        role_title: "Designer",
        role_department: "Creative",
        candidate_name: "Alice Wonderland",
      },
      steps: [
        {
          interview_step_id: "s1",
          interview_step_name: "Initial Screening",
          interview_step_status: "COMPLETED",
          interview_step_order: 1,
          interviews: [
            {
              interview_id: "i1",
              interview_start_at: "2024-05-11T10:00:00Z",
              interview_end_at: "2024-05-11T11:00:00Z",
              interview_status: "CONFIRMED",
            },
          ],
        },
        {
          interview_step_id: "s2",
          interview_step_name: "Technical Assessment",
          interview_step_status: "IN_PROGRESS",
          interview_step_order: 2,
          interviews: [],
        },
      ],
    };

    // Note: We need mock resolved value to work with `createAsyncThunk.unwrap()`
    (candidatesSlice.fetchCandidateJourney as unknown as jest.Mock).mockReturnValue({
      type: "fetchCandidateJourney/mocked",
      unwrap: () => Promise.resolve(mockJourney),
    });

    renderDrawer();

    expect(candidatesSlice.fetchCandidateJourney).toHaveBeenCalledWith("hp1");

    await waitFor(() => {
      expect(screen.getByText("Alice Wonderland")).toBeInTheDocument();
    });

    // Validates the steps
    expect(screen.getByText("Initial Screening")).toBeInTheDocument();
    expect(screen.getByText("Technical Assessment")).toBeInTheDocument();
    
    // Check specific interview rendering
    expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
    
    // Check general notes fallback
    expect(screen.getByText(/Creative/i)).toBeInTheDocument();
  });
});
