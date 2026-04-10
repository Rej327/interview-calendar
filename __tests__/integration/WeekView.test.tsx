import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "@/lib/store/calendarSlice";
import WeekView from "@/components/calendar/WeekView";
import dayjs from "dayjs";

// Mock dependencies
jest.mock("@/app/actions/post", () => ({
  updateInterview: jest.fn(),
}));
jest.mock("@mantine/notifications", () => ({
  notifications: { show: jest.fn() },
}));

// Provide router mock if needed (not strictly needed for WeekView, but good practice)
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: { calendar: calendarReducer },
    preloadedState,
  });

const renderWeekView = (
  props: Partial<React.ComponentProps<typeof WeekView>> = {}
) => {
  const store = makeStore({
      calendar: { events: props.events || [], loading: false, error: null }
  });
  
  const defaultProps = {
    events: [],
    onEventClick: jest.fn(),
    selectedDate: new Date("2024-05-15T10:00:00.000Z"),
    onDateChange: jest.fn(),
    ...props,
  };

  return {
    store,
    onEventClick: defaultProps.onEventClick,
    onDateChange: defaultProps.onDateChange,
    ...render(
      <Provider store={store}>
        <MantineProvider>
          <WeekView {...defaultProps} />
        </MantineProvider>
      </Provider>
    ),
  };
};

describe("WeekView – rendering and interactions", () => {
  const sampleEvents = [
    {
      id: "e1",
      title: "Technical Interview",
      start: dayjs("2024-05-15").hour(10).minute(0).second(0).toISOString(),
      end: dayjs("2024-05-15").hour(11).minute(0).second(0).toISOString(),
      extendedProps: {
        candidate: "Jane Doe",
        role: "Frontend Engineer",
        interviewer: "John Smith",
        type: "DEPARTMENT" as const,
        status: "SCHEDULED" as const,
        avatar: "/avatar.png",
        color: "blue",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders week dates correctly", () => {
    renderWeekView({ selectedDate: new Date("2024-05-15T10:00:00.000Z") });
    expect(screen.getByText("May 12 – 18, 2024")).toBeInTheDocument();
  });

  it("renders events at correct times", () => {
    renderWeekView({
      selectedDate: new Date("2024-05-15T10:00:00.000Z"),
      events: sampleEvents,
    });
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
  });

  it("calls onEventClick when an event is clicked", () => {
    const { onEventClick } = renderWeekView({
      selectedDate: new Date("2024-05-15T10:00:00.000Z"),
      events: sampleEvents,
    });

    const eventBox = screen.getByText("Jane Doe");
    fireEvent.click(eventBox);
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "e1",
        candidateName: "Jane Doe",
      })
    );
  });

  it("allows navigation to next week", () => {
    const { onDateChange } = renderWeekView({ selectedDate: new Date("2024-05-15T10:00:00.000Z") });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]); // Left, Today, Right -> Right is 3rd button
    expect(onDateChange).toHaveBeenCalled();
  });
});
