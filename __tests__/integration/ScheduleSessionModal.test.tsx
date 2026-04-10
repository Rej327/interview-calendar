import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "@/lib/store/calendarSlice";
import interviewReducer from "@/lib/store/interviewSlice";
import ScheduleSessionModal from "@/components/interviews/ScheduleSessionModal";

import { quickAddInterview } from "@/app/actions/post";

// Mock dependencies
jest.mock("@/app/actions/get", () => ({
  fetchCandidates: jest.fn().mockResolvedValue({ success: true, data: [{ name: "Alice" }] }),
  fetchInterviewers: jest.fn().mockResolvedValue({ success: true, data: [{ full_name: "Bob" }] }),
  fetchRoles: jest.fn().mockResolvedValue({ success: true, data: [{ role_title: "Engineer" }] }),
}));

jest.mock("@/app/actions/post", () => ({
  quickAddInterview: jest.fn(),
}));

jest.mock("@mantine/notifications", () => ({
  notifications: { show: jest.fn() },
}));

const makeStore = () =>
  configureStore({
    reducer: { calendar: calendarReducer, interview: interviewReducer },
  });

const renderModal = (props: any = {}) => {
  const store = makeStore();
  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
    ...props,
  };
  return {
    store,
    onClose: defaultProps.onClose,
    ...render(
      <Provider store={store}>
        <MantineProvider>
          <ScheduleSessionModal {...defaultProps} />
        </MantineProvider>
      </Provider>
    ),
  };
};

describe("ScheduleSessionModal – integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders selects with loaded data", async () => {
    renderModal();
    // Native select options loaded from mocks will appear in document
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Engineer")).toBeInTheDocument();
    });
  });

  it("dispatches quickAddInterview on valid submit", async () => {
    (quickAddInterview as jest.Mock).mockResolvedValueOnce({ success: true });

    renderModal();

    await waitFor(() => screen.getByText("Alice"));

    const candidateSelect = screen.getByLabelText(/Candidate/i);
    const interviewerSelect = screen.getByLabelText(/Interviewer/i);
    const roleSelect = screen.getByLabelText(/Hiring Role/i);

    fireEvent.change(candidateSelect, { target: { value: "Alice" } });
    fireEvent.change(interviewerSelect, { target: { value: "Bob" } });
    fireEvent.change(roleSelect, { target: { value: "Engineer" } });

    // Assuming start_at and end_time have default values set
    const submitBtn = screen.getByRole("button", { name: "Confirmed & Schedule" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(quickAddInterview).toHaveBeenCalledWith(
        expect.objectContaining({
          candidate_name: "Alice",
          interviewer_name: "Bob",
          role_title: "Engineer",
        })
      );
    });
  });
});
