import React from "react";
import { screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import WeekSidebar from "../../components/calendar/WeekSidebar";

describe("WeekSidebar", () => {
  it("renders stats boxes correctly", () => {
    render(
      <MantineProvider>
        <WeekSidebar />
      </MantineProvider>,
    );
    expect(screen.getByText("TOTAL SLOTS")).toBeInTheDocument();
    expect(screen.getByText("INTERVIEWS")).toBeInTheDocument();
    expect(screen.getByText("08")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders upcoming priority items", () => {
    render(
      <MantineProvider>
        <WeekSidebar />
      </MantineProvider>,
    );
    expect(screen.getByText("Senior Backend Dev")).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
  });
});
