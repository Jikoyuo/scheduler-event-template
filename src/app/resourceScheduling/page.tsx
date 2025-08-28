"use client";

import React, { useEffect, useRef, useState } from "react";
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Grid,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import "../../styles/custom-event.css";

type DPEvent = {
  id: string;
  text: string;
  start: string; // ISO string
  end: string; // ISO string
  resource: string;
  barColor?: string;
  eventCssClass?: string;
};

const SchedulerPage: React.FC = () => {
  // Form state
  const [title, setTitle] = useState("");
  const [resource, setResource] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]); // Sunday..Saturday (EN)

  // Calendar refs/state
  const calendarRef = useRef<DayPilotCalendar>(null);
  const [currentDate, setCurrentDate] = useState(DayPilot.Date.today());

  // ✅ Events disimpan di React state (source of truth)
  const [events, setEvents] = useState<DPEvent[]>([
    {
      start: DayPilot.Date.today().addHours(10).toString(),
      end: DayPilot.Date.today().addHours(12).toString(),
      id: DayPilot.guid(),
      resource: "B",
      text: "Marketing Team",
      barColor: "transparent",
    },
    {
      start: DayPilot.Date.today().addHours(13).toString(),
      end: DayPilot.Date.today().addHours(15).toString(),
      id: DayPilot.guid(),
      resource: "B",
      text: "Development Team",
      barColor: "transparent",
    },
  ]);

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

  // Map checkbox (ID labels Indonesia → value English)
  const daysMap = [
    { label: "Minggu", value: "Sunday" },
    { label: "Senin", value: "Monday" },
    { label: "Selasa", value: "Tuesday" },
    { label: "Rabu", value: "Wednesday" },
    { label: "Kamis", value: "Thursday" },
    { label: "Jumat", value: "Friday" },
    { label: "Sabtu", value: "Saturday" },
  ];

  // Inisialisasi / update konfigurasi kalender saat ganti tanggal
  useEffect(() => {
    if (!calendarRef.current) return;
    const dp = calendarRef.current.control;

    dp.update({
      viewType: "Resources",
      headerHeight: 50,
      startDate: currentDate, // ← tanggal aktif
      cellHeight: 100,
      businessBeginsHour: 7,
      businessEndsHour: 21,
      durationBarVisible: false,
      cellDuration: 60, // 1 jam per baris
      scale: "Hour", // jam penuh (cast any di bawah)
      timeFormat: "Clock24Hours",
      timeHeaders: [{ groupBy: "Hour", format: "HH:mm" }],
      columns: resources,
      onTimeRangeSelected: async () => dp.clearSelection(),
      eventMoveHandling: "Disabled",
      eventResizeHandling: "Disabled",
      timeRangeSelectedHandling: "Disabled",
      onBeforeTimeHeaderRender: (args) => {
        // Format waktu ke HH:mm
        args.html = args.header.start.toString("HH:mm");
      },
      onEventClick: (args) => {
        console.log("Event clicked:", args.e.data);
      },
    } as any);
  }, [currentDate]);

  // Sinkronkan events state → DayPilot setiap kali events berubah
  useEffect(() => {
    if (!calendarRef.current) return;
    const dp = calendarRef.current.control;
    dp.update({ events });
  }, [events]);

  const handleDaySelection = (value: string) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  };

  const addCustomEvent = () => {
    if (!title || !resource || !startTime || !endTime) {
      alert("Lengkapi semua field!");
      return;
    }

    if (timeOptions.indexOf(endTime) <= timeOptions.indexOf(startTime)) {
      alert("Jam selesai harus lebih besar dari jam mulai!");
      return;
    }

    // Generate recurring 1 tahun ke depan pada hari yang dipilih
    const now = new DayPilot.Date(currentDate); // mulai dari tanggal yang sedang dilihat
    const oneYearLater = now.addDays(365);

    const eventsToAdd: DPEvent[] = [];
    let cursor = now;

    while (cursor < oneYearLater) {
      const jsDate = cursor.toDate();
      const dayName = jsDate.toLocaleDateString("en-US", { weekday: "long" });

      if (selectedDays.length === 0 || selectedDays.includes(dayName)) {
        const dateStr = cursor.toString("yyyy-MM-dd");

        const startIndex = timeOptions.indexOf(startTime);
        const endIndex = timeOptions.indexOf(endTime);

        // Tetap ikuti pola kamu: 1 event per jam-slot (bisa dijadikan single event kalau mau)
        for (let i = startIndex; i < endIndex; i++) {
          const slotStart = timeOptions[i];
          const slotEnd = timeOptions[i + 1];

          eventsToAdd.push({
            start: `${dateStr}T${slotStart}:00`,
            end: `${dateStr}T${slotEnd}:00`,
            text: title,
            resource,
            id: DayPilot.guid(),
            barColor: "transparent",
          });
        }
      }

      cursor = cursor.addDays(1);
    }

    // ✅ Tambahkan ke state (bukan langsung dp.update)
    setEvents((prev) => [...prev, ...eventsToAdd]);

    // Reset form
    setTitle("");
    setResource("");
    setStartTime("07:00");
    setEndTime("08:00");
    setSelectedDays([]);
  };

  const goPrev = () => setCurrentDate((d) => d.addDays(-1));
  const goNext = () => setCurrentDate((d) => d.addDays(1));

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Typography variant="h5">Meeting Room Scheduler</Typography>

          {/* Navigasi Tanggal */}
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button variant="outlined" onClick={goPrev}>
              Prev
            </Button>
            <Typography variant="h6">
              {currentDate.toString("dddd, MMMM d, yyyy")}
            </Typography>
            <Button variant="outlined" onClick={goNext}>
              Next
            </Button>
          </Box>

          {/* Form tambah event */}
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
                  Add Recurring Event
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Checkbox Hari */}
          <Box mb={2}>
            <Typography variant="subtitle1">Pilih Hari:</Typography>
            <Grid container>
              {daysMap.map((day) => (
                <Grid item key={day.value}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedDays.includes(day.value)}
                        onChange={() => handleDaySelection(day.value)}
                      />
                    }
                    label={day.label}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* DayPilot Calendar */}
          <DayPilotCalendar
            ref={calendarRef}
            durationBarVisible={true}
            timeFormat="Clock24Hours"
            onBeforeEventRender={(args) => {
              args.data.backColor = "transparent"; // background event
              args.data.fontColor = "black"; // warna teks
              args.data.borderColor = "transparent"; // border
              args.data.barColor = "transparent"; // bar kiri
              args.data.cssClass = "custom-event"; // custom CSS
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default SchedulerPage;
