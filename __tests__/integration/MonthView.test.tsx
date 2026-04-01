import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import MonthView from '../../components/calendar/MonthView';

const renderMonthView = (props: any) => {
  return render(
    <MantineProvider>
      <MonthView {...props} />
    </MantineProvider>
  );
};

describe('MonthView', () => {
  it('renders month title and navigation', () => {
    renderMonthView({ onEventClick: jest.fn() });
    expect(screen.getByText('October 2024')).toBeInTheDocument();
    expect(screen.getByText('TODAY')).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    renderMonthView({ onEventClick: jest.fn() });
    expect(screen.getByText('MON')).toBeInTheDocument();
    expect(screen.getByText('FRI')).toBeInTheDocument();
    expect(screen.getByText('SUN')).toBeInTheDocument();
  });

  it('renders events in the calendar grid', () => {
    renderMonthView({ onEventClick: jest.fn() });
    // Check for "Sarah Jen" which is an event on day 1
    expect(screen.getByText(/Sarah Jen/)).toBeInTheDocument();
    expect(screen.getByText(/Global Sync/)).toBeInTheDocument();
  });

  it('renders upcoming agenda section', () => {
    renderMonthView({ onEventClick: jest.fn() });
    expect(screen.getByText('Upcoming Agenda')).toBeInTheDocument();
    expect(screen.getByText(/Technical Assessment/)).toBeInTheDocument();
    expect(screen.getByText(/Culture Fit • Maria Garcia/)).toBeInTheDocument();
  });

  it('calls onEventClick when an event in the grid is clicked', () => {
    const onEventClick = jest.fn();
    renderMonthView({ onEventClick });
    
    const event = screen.getByText(/Sarah Jen/);
    fireEvent.click(event);
    
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({
      title: expect.stringContaining('Sarah Jen'),
    }));

  });
});
