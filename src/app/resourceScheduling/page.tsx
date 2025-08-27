"use client";

import React, { useEffect, useRef } from "react";
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import "../../styles/custom-calender.css";
const SchedulerPage: React.FC = () => {
  const calendarRef = useRef<DayPilotCalendar>(null);

  useEffect(() => {
    if (!calendarRef.current) return;

    const dp = calendarRef.current.control;

    

    // Konfigurasi Calendar
    dp.update({
      viewType: "Resources",
      headerHeight: 50,
      startDate: DayPilot.Date.today(),
      cellHeight: 50,
      businessBeginsHour: 8,
      businessEndsHour: 20,
      timeFormat: "Clock24Hours",
      theme: "custom-calender", 
      columns: [
        { name: "Meeting Room A", id: "A" },
        { name: "Meeting Room B", id: "B" },
        { name: "Meeting Room C", id: "C" },
        { name: "Meeting Room D", id: "D" },
        { name: "Meeting Room E", id: "E" },
        { name: "Meeting Room F", id: "F" },
      ],
      onTimeRangeSelected: async (args) => {
        const modal = await DayPilot.Modal.prompt("Nama event:", "Dr. Syahidan");
        if (modal.canceled) return;

        dp.events.add({
          start: args.start,
          end: args.end,
          id: DayPilot.guid(),
          resource: args.resource,
          text: modal.result,
        });

        dp.clearSelection();
      },
      
    });

    // Load event awal
    const events = [
      {
        start: DayPilot.Date.today().addHours(10),
        end: DayPilot.Date.today().addHours(12),
        id: DayPilot.guid(),
        resource: "B",
        text: "Marketing Team",
        barColor: "#674ea7",
      },
      {
        start: DayPilot.Date.today().addHours(13),
        end: DayPilot.Date.today().addHours(15),
        id: DayPilot.guid(),
        resource: "B",
        text: "Development Team",
        barColor: "#a64d79",
      },
    ];

    dp.update({ events });
  }, []);

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Meeting Room Scheduler
          </Typography>
          <Box>
          <DayPilotCalendar
            ref={calendarRef}
            
            // style={{ height: "600px", width: "100%" }}
          />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SchedulerPage;
