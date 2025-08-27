"use client";

import dynamic from "next/dynamic";
import dayjs from "dayjs";

// ✅ load scheduler hanya di client
const DayPilotScheduler = dynamic(
  () =>
    import("@daypilot/daypilot-lite-react").then(
      (mod) => mod.DayPilotScheduler
    ),
  { ssr: false }
);

const rooms = [
  { id: "ruang1", name: "Ruang Anggrek" },
  { id: "ruang2", name: "Ruang Mawar" },
  { id: "ruang3", name: "Ruang Melati" },
];

const events = [
  {
    id: "1",
    text: "Dr. Syahidan",
    start: dayjs().hour(7).toISOString(),
    end: dayjs().hour(8).toISOString(),
    resource: "ruang1",
  },
  {
    id: "2",
    text: "Dr. Syahidan",
    start: dayjs().hour(8).toISOString(),
    end: dayjs().hour(9).toISOString(),
    resource: "ruang1",
  },
];

export default function CalendarPage() {
  return (
    <div className="scheduler-glass">
      <DayPilotScheduler
        startDate={dayjs().format("YYYY-MM-DD")}
        days={1}
        scale="Hour"
        cellDuration={60}
        businessBeginsHour={7}
        businessEndsHour={18}
        resources={rooms}
        events={events}
        timeHeaders={[
          { groupBy: "Day", format: "dddd, d MMMM yyyy" },
          { groupBy: "Hour", format: "HH:mm" },
        ]}
        durationBarVisible={false}
      />
    </div>
  );
}
