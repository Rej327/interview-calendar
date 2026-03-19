import React from "react";
import { screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import DayView from "../../components/calendar/DayView";

const mockScheduleData = [
  {
    date: "16",
    day: "MON",
    month: "October 2023",
    events: [
      {
        id: "1",
        title: "HR Interview: Alexander Wright",
        time: "09:00 AM - 10:00 AM (1h)",
        assigned: "Sarah Miller",
        status: "DONE",
        color: "teal",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"],
      },
    ],
  },
];

const renderDayView = (props: any) => {
  return render(
    <MantineProvider>
      <DayView {...props} />
    </MantineProvider>,
  );
};

describe("DayView", () => {
  it("renders date and day correctly", () => {
    renderDayView({ scheduleData: mockScheduleData, onEventClick: jest.fn() });
    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText("MON")).toBeInTheDocument();
  });

  it("renders event details", () => {
    renderDayView({ scheduleData: mockScheduleData, onEventClick: jest.fn() });
    expect(
      screen.getByText("HR Interview: Alexander Wright"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sarah Miller/)).toBeInTheDocument();
  });

  it("shows no events message when data is empty", () => {
    renderDayView({ scheduleData: [], onEventClick: jest.fn() });
    expect(screen.getByText(/Nothing Scheduled/)).toBeInTheDocument();
  });
});
