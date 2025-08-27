"use client";

import React, { useEffect, useRef, useState } from "react";
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
} from "@mui/material";

const SchedulerPage: React.FC = () => {
  const calendarRef = useRef<DayPilotCalendar>(null);

  // State untuk form input
  const [title, setTitle] = useState("");
  const [resource, setResource] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");

  // Data resource dan jam
  const resources = [
    { name: "Meeting Room A", id: "A" },
    { name: "Meeting Room B", id: "B" },
    { name: "Meeting Room C", id: "C" },
    { name: "Meeting Room D", id: "D" },
    { name: "Meeting Room E", id: "E" },
    { name: "Meeting Room F", id: "F" },
  ];

  const timeOptions = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  useEffect(() => {
    if (!calendarRef.current) return;

    const dp = calendarRef.current.control;

    dp.update({
      viewType: "Resources",
      headerHeight: 50,
      startDate: DayPilot.Date.today(),
      columns: resources,
      onTimeRangeSelected: async () => {
        dp.clearSelection(); // Nonaktifkan modal default
      },
      eventMoveHandling: "Disabled", // Tidak bisa drag event
      eventResizeHandling: "Disabled", // Tidak bisa resize event
      timeRangeSelectedHandling: "Disabled",
      // Event click
      onEventClick: (args) => {
        console.log("Event clicked:", args.e.data);
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

  // Fungsi untuk tambah event
  const addCustomEvent = () => {
    if (!title || !resource || !startTime || !endTime) {
      alert("Lengkapi semua field!");
      return;
    }

    // Validasi jam
    if (timeOptions.indexOf(endTime) <= timeOptions.indexOf(startTime)) {
      alert("Jam selesai harus lebih besar dari jam mulai!");
      return;
    }

    const dp = calendarRef.current?.control;
    if (!dp) return;

    const date = DayPilot.Date.today().toString("yyyy-MM-dd");

    dp.events.add({
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      text: title,
      resource: resource,
      id: DayPilot.guid(),
      barColor: "#3f51b5",
    });

    // Reset form
    setTitle("");
    setResource("");
    setStartTime("07:00");
    setEndTime("08:00");
  };

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Meeting Room Scheduler
          </Typography>

          {/* Form untuk tambah event */}
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Event Title"
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  label="Resource"
                  variant="outlined"
                  fullWidth
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                >
                  {resources.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  label="Start Time"
                  variant="outlined"
                  fullWidth
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {timeOptions.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  label="End Time"
                  variant="outlined"
                  fullWidth
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {timeOptions.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={addCustomEvent}
                  sx={{ height: "100%" }}
                >
                  Add Event
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* DayPilot Calendar */}
          <DayPilotCalendar ref={calendarRef} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default SchedulerPage;
