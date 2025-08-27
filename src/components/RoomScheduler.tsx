"use client";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg } from "@fullcalendar/core";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const pad = (n: number) => String(n).padStart(2, "0");
const formatLocalDateTime = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;

const RoomScheduler: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    startTime: "07:00",
    endTime: "08:00",
    resourceId: "ruang-anggrek",
    repeatDays: [] as number[], // 0..6 (Sun..Sat)
  });

  const resources = [
    { id: "ruang-anggrek", title: "Ruang Anggrek" },
    { id: "ruang-mawar", title: "Ruang Mawar" },
    { id: "ruang-melati", title: "Ruang Melati" },
    { id: "ruang-teratai", title: "Ruang Teratai" },
    { id: "ruang-dahlia", title: "Ruang Dahlia" },
    { id: "ruang-kenanga", title: "Ruang Kenanga" },
    { id: "ruang-bougenville", title: "Ruang Bougenville" },
  ];

  const daysOfWeek = [
    { label: "Minggu", value: 0 },
    { label: "Senin", value: 1 },
    { label: "Selasa", value: 2 },
    { label: "Rabu", value: 3 },
    { label: "Kamis", value: 4 },
    { label: "Jumat", value: 5 },
    { label: "Sabtu", value: 6 },
  ];

  // generate occurrences for next `daysAhead` days (default ~365)
  const generateOccurrencesForYear = (
    title: string,
    resourceId: string,
    repeatDays: number[],
    startTime: string,
    endTime: string,
    daysAhead = 365
  ): EventInput[] => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) {
      throw new Error("Jam selesai harus lebih besar dari jam mulai.");
    }

    const events: EventInput[] = [];
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ); // midnight today
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysAhead);

    let uidCounter = Date.now();

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const day = d.getDay(); // 0..6
      if (!repeatDays.includes(day)) continue;

      const startDt = new Date(d);
      startDt.setHours(sh, sm, 0, 0);
      const endDt = new Date(d);
      endDt.setHours(eh, em, 0, 0);

      events.push({
        id: `${uidCounter++}`,
        title,
        start: formatLocalDateTime(startDt),
        end: formatLocalDateTime(endDt),
        resourceId,
      });
    }

    return events;
  };

  const handleAddEvent = () => {
    try {
      if (!formData.title) {
        alert("Nama kegiatan/dokter harus diisi!");
        return;
      }
      if (formData.repeatDays.length === 0) {
        alert("Pilih minimal satu hari pengulangan!");
        return;
      }

      const newOccurrences = generateOccurrencesForYear(
        formData.title,
        formData.resourceId,
        formData.repeatDays,
        formData.startTime,
        formData.endTime,
        365
      );

      setEvents((prev) => [...prev, ...newOccurrences]);

      setFormData({
        title: "",
        startTime: "07:00",
        endTime: "08:00",
        resourceId: "ruang-anggrek",
        repeatDays: [],
      });
    } catch (err: any) {
      alert(err.message || "Terjadi error saat membuat jadwal.");
    }
  };

  // delete single occurrence / event by click
  const handleEventClick = (clickInfo: EventClickArg) => {
    if (confirm(`Hapus jadwal "${clickInfo.event.title}"?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== clickInfo.event.id));
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tambah Jadwal Baru (Recurring → di-generate untuk 1 tahun)
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Nama Dokter/Kegiatan"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <TextField
          type="time"
          label="Jam Mulai"
          InputLabelProps={{ shrink: true }}
          value={formData.startTime}
          onChange={(e) =>
            setFormData({ ...formData, startTime: e.target.value })
          }
        />
        <TextField
          type="time"
          label="Jam Selesai"
          InputLabelProps={{ shrink: true }}
          value={formData.endTime}
          onChange={(e) =>
            setFormData({ ...formData, endTime: e.target.value })
          }
        />
        <Select
          value={formData.resourceId}
          onChange={(e) =>
            setFormData({ ...formData, resourceId: e.target.value })
          }
        >
          {resources.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.title}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <FormGroup row sx={{ mb: 2 }}>
        {daysOfWeek.map((d) => (
          <FormControlLabel
            key={d.value}
            control={
              <Checkbox
                checked={formData.repeatDays.includes(d.value)}
                onChange={(e) => {
                  const newDays = e.target.checked
                    ? [...formData.repeatDays, d.value]
                    : formData.repeatDays.filter((day) => day !== d.value);
                  setFormData({ ...formData, repeatDays: newDays });
                }}
              />
            }
            label={d.label}
          />
        ))}
      </FormGroup>

      <Button variant="contained" onClick={handleAddEvent}>
        Tambah Jadwal
      </Button>

      <Box sx={{ mt: 3 }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin, resourceTimeGridPlugin]}
          initialView="resourceTimeGridDay"
          resources={resources}
          events={events}
          eventClick={handleEventClick}
          slotMinTime="07:00:00"
          slotMaxTime="15:00:00"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          height="auto"
        />
      </Box>
    </Box>
  );
};

export default RoomScheduler;
