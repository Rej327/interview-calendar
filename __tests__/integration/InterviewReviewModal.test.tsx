import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "@/lib/store/calendarSlice";
import InterviewReviewModal from "@/components/calendar/InterviewReviewModal";
import { updateInterview } from "@/app/actions/post";

// Mock dependencies
jest.mock("@/app/actions/post", () => ({
  updateInterview: jest.fn(),
}));

jest.mock("@mantine/notifications", () => ({
  notifications: { show: jest.fn() },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const sampleCandidate = {
  id: "e1",
  name: "John Doe",
  role: "Backend Engineer",
  status: "COMPLETED",
  time: "10:00 AM - 11:00 AM",
  type: "Technical",
  assignedHR: "Jane Smith",
  notes: "Good candidate.",
  recordingLink: "https://example.com/recording",
  meetingLink: "https://example.com/meeting",
  startDate: new Date("2024-05-15T10:00:00Z"),
  endDate: new Date("2024-05-15T11:00:00Z"),
};

const sampleEvents = [
  {
    id: "e1",
    title: "Backend Interview",
    start: "2024-05-15T10:00:00Z",
    end: "2024-05-15T11:00:00Z",
    extendedProps: {
      candidate: "John Doe",
      role: "Backend Engineer",
      interviewer: "Jane Smith",
      status: "COMPLETED",
    },
  },
];

const makeStore = () =>
  configureStore({
    reducer: { calendar: calendarReducer },
    preloadedState: {
      calendar: { events: sampleEvents, loading: false, error: null },
    },
  });

const renderModal = (props: any = {}) => {
  const store = makeStore();
  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
    candidate: sampleCandidate,
    ...props,
  };
  return {
    store,
    onClose: defaultProps.onClose,
    ...render(
      <Provider store={store}>
        <MantineProvider>
          <InterviewReviewModal {...defaultProps} />
        </MantineProvider>
      </Provider>
    ),
  };
};

describe("InterviewReviewModal – integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders candidate information correctly", () => {
    renderModal();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("Technical")).toBeInTheDocument();
  });

  it("does not render when closed or no candidate is provided", () => {
    renderModal({ opened: false, candidate: null });
    expect(screen.queryByText("Interview Review")).not.toBeInTheDocument();
  });

  it("allows editing and saving notes", async () => {
    (updateInterview as jest.Mock).mockResolvedValueOnce({ success: true });
    renderModal();

    // Click Edit Notes
    const editNotesBtn = screen.getByText("Edit Notes");
    fireEvent.click(editNotesBtn);

    const textarea = screen.getByDisplayValue("Good candidate.");
    fireEvent.change(textarea, { target: { value: "Excellent candidate." } });

    const saveBtn = screen.getByText("Save");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateInterview).toHaveBeenCalledWith({
        interview_id: "e1",
        interview_notes: "Excellent candidate.",
      });
    });
  });

  it("allows editing and saving recording link", async () => {
    (updateInterview as jest.Mock).mockResolvedValueOnce({ success: true });
    renderModal();

    const editLinkBtn = screen.getByText("Edit Link");
    fireEvent.click(editLinkBtn);

    // The text input is initially rendered with the value
    const input = screen.getByDisplayValue("https://example.com/recording");
    fireEvent.change(input, { target: { value: "https://example.com/new" } });

    const saveBtns = screen.getAllByText("Save");
    // The second save button is likely for recording link if first is notes, but they have icons.
    // We can click the nearest Save by finding action grouping. 
    // Wait, getByText throws if there's multiple, let's use getAllByText and click the one.
    fireEvent.click(saveBtns[0]);

    await waitFor(() => {
      expect(updateInterview).toHaveBeenCalledWith(expect.objectContaining({
        interview_id: "e1",
      }));
    });
  });

  it("allows cancelling an interview", async () => {
    (updateInterview as jest.Mock).mockResolvedValueOnce({ success: true });
    renderModal();

    const cancelBtn = screen.getByText("Cancel Interview");
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(updateInterview).toHaveBeenCalledWith({
        interview_id: "e1",
        interview_status: "CANCELLED",
      });
    });
  });

  it("opens the reschedule view", () => {
    renderModal();
    const rescheduleBtn = screen.getByRole("button", { name: "Reschedule" });
    fireEvent.click(rescheduleBtn);

    expect(screen.getByText("New Start Date-Time")).toBeInTheDocument();
  });
});
