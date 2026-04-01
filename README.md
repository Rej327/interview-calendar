# Interview Calendar Application

This is a modern Next.js application designed to manage candidate interview schedules with a responsive, dynamic calendar interface. Built using the Mantine UI library, it features interactive **Month**, **Week**, and **Day** views.

## Current Features

- **Dynamic Calendar Views**: Seamlessly switch between daily, weekly, and monthly views to check your upcoming agenda.
- **Global State Management**: Powered by Redux (via `@reduxjs/toolkit`) for centralized state, enabling consistent data synchronization across views.
- **Interactive Event Handling**: Click on any interview slot to view full candidate details and progression tracks in a dedicated modal.
- **Efficiency Metrics**: See real-time calculated insights such as "Weekly Interviews" and "Avg. Time to Hire" on the sidebar.
- **Color-Coded Tracks**: Visual differentiation for interview types (HR, Department, Practical Test, Background Check).
- **Responsive Layout**: Advanced responsive grid layout adapts the sidebar widgets depending on your selected view.
- **Date Navigation**: Full navigation to previous/next periods and rapid return to "Today."

---

## Technical Overview - How The Calendar Works

The core of the calendar system resides in the `app/calendar/page.tsx` file, which manages the application state and orchestrates the presentation layers. Below is an elaboration of the specific internal rendering components.

### 1. Month View
**File Directory:** `c:\Users\Ep\Desktop\Projects\interview-calendar\components\calendar\MonthView.tsx`

The `MonthView` calculates an internal 42-day array (a 6x7 grid) starting from the beginning of the week that contains the first day of the selected month. The events are then matched onto their respective dates using `dayjs`.

```tsx
// \components\calendar\MonthView.tsx
45:     // Generate days for the month view based on selectedDate
46:     const startOfMonth = dayjs(selectedDate).startOf('month');
47:     const startOfGrid = startOfMonth.startOf('week');
48:     
49:     const days = Array.from({ length: 42 }, (_, i) => {
50:         const d = startOfGrid.add(i, 'day');
51:         const dayEvents = events.filter(e => dayjs(e.start).isSame(d, 'day'));
52:         
53:         return {
54:             fullDate: d,
55:             date: d.format("D"),
56:             isCurrentMonth: d.isSame(startOfMonth, 'month'),
57:             isToday: d.isSame(dayjs(), 'day'),
58:             events: dayEvents.map(e => ({
59:                 id: e.id,
60:                 name: e.extendedProps.candidate,
61:                 time: dayjs(e.start).format("h:mm A"),
62:                 color: e.extendedProps.color || 'blue',
63:                 raw: e
64:             }))
65:         };
66:     });
```

**Elaboration**:
- **Lines 46-47**: It initializes the mathematical boundary for the grid rendering. `startOfMonth.startOf('week')` guarantees the grid typically opens on a Sunday.
- **Lines 49-66**: We construct exactly 42 slots (which covers all possible month overflows in a standard grid) spanning out using `Array.from`.
- **Line 51**: `events.filter(...)` loops over the primary list of Redux calendar events and attaches only events mapping strictly to that individual parsed date slot.

---

### 2. Week View
**File Directory:** `c:\Users\Ep\Desktop\Projects\interview-calendar\components\calendar\WeekView.tsx`

The `WeekView` represents an hourly scheduling visual spanning 7 days. It constructs grid columns dynamically per day, looping vertically down an established "hours" array.

```tsx
// \components\calendar\WeekView.tsx
55:   // Generate dates for the week containing selectedDate
56:   const startOfWeek = dayjs(selectedDate).startOf("week");
57:   const days = Array.from({ length: 7 }, (_, i) => {
58:     const d = startOfWeek.add(i, "day");
...
189:         <Box style={{ position: "relative" }}>
190:           {hours.map((hour) => (
...
204:                 {days.map((day, i) => {
205:                   const dayEvents = events.filter((e) => {
206:                     const eventStart = dayjs(e.start);
207:                     return (
208:                       eventStart.isSame(day.fullDate, "day") &&
209:                       eventStart.format("hh A") === hour
210:                     );
211:                   });
```

**Elaboration:**
- **Lines 55-58**: Similar to the Month View, the grid captures a 7-day spectrum beginning precisely with the `startOf("week")`.
- **Lines 189-211**: The nested `map` structure processes rendering logic by generating rows by `hour` and intersecting them with column maps for `day`.
- **Lines 205-210**: The intersection calculation uses `dayjs` formatting to determine if an event falls precisely on both the specified `day` footprint and the `hour` slot format `hh A`. If there is a match, an interactive box element containing that interview record is physically rendered into the cell.

---

### 3. Day View
**File Directory:** `c:\Users\Ep\Desktop\Projects\interview-calendar\components\calendar\DayView.tsx`

The `DayView` displays a comprehensive vertical checklist layout detailing all specific assignments belonging exclusively to a specific active `selectedDate`.

```tsx
// \components\calendar\DayView.tsx
46:         {scheduleData.length > 0 ? (
47:             scheduleData.map((day) => (
48:                 <Group key={`${day.date}-${day.month}`} gap="xl" align="flex-start" wrap="nowrap">
49:                     <Stack align="center" gap={0} w={60}>
50:                         <Text fw={800} size="xl" c="blue.9">{day.date}</Text>
...
61:                                     withBorder={false}
62:                                     onClick={() => onEventClick(event)}
63:                                     style={{ 
64:                                         cursor: "pointer",
65:                                         backgroundColor: event.status === "DONE" ? "var(--mantine-color-teal-0)" : 
66:                                                         event.status === "RESCHEDULED" ? "var(--mantine-color-gray-0)" : "white",
...
100:                 <Stack align="center" gap="md">
101:                     <ThemeIcon size={64} radius="xl" variant="light" color="blue">
```

**Elaboration:**
- Unlike Month and Week view which handle their own pure mapping algorithms natively inside the component, **DayView receives its active data payload pre-processed via props** (`scheduleData`).
- **Line 43-47**: If there are available scheduled blocks matching the active day, it maps directly over `day.events`.
- **Line 62**: Handles direct interactivity forwarding `onClick={() => onEventClick(event)}` which communicates the interaction back into the central state system located in `page.tsx` resolving in the activation of the Review Modal.
- **Lines 65-66**: Integrates visual queue color variations indicating whether the track stands as `DONE` or `RESCHEDULED`.
- **Lines 98-110**: Acts as the `no state` render fallback handler. If no active items were mapped into `events`, it visually produces an aesthetic empty state layout ensuring continuous screen immersion is preserved without layout jank.
