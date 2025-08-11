"use client";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { RRule } from "rrule";
import dayGridPlugin from "@fullcalendar/daygrid";

import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Grid,
  Box,
  Dialog,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CustomButtonFilled from "@/components/button/CustomButtonFilled";
import CustomTextField from "@/components/CustomTextfield";
import DropdownListTime from "@/components/DropdownListTime";
import operationalTimes from "@/data/operationalTimes";
import DropdownList from "@/components/DropdownList";
import doctor from "@/data/doctor";
import location from "@/data/location";
import scheduleType from "@/data/scheduleType";

interface EventForm {
  title: string;
  doctor: string;
  location: string;
  type: string;
  insurance: string;
  startTime: string;
  endTime: string;
  quota: string;
  backupQuota: string;
  repeatDays: number[]; // 0 = Monday
}

interface RecurringEvent {
  id: string;
  title: string;
  rrule: any;
  extendedProps: any;
}

interface eventDetailDialog {
  id: string;
  title: string;
  doctor: string;
  location: string;
  type: string;
  insurance: string;
  startTime: string;
  endTime: string;
  quota: string;
  backupQuota: string;
}

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [eventDetails, setEventDetails] = useState<eventDetailDialog>({
    id: "",
    title: "",
    doctor: "",
    location: "",
    type: "",
    insurance: "",
    startTime: "",
    endTime: "",
    quota: "",
    backupQuota: "",
  });
  const [openEventDialog, setOpenEventDialog] = useState<boolean>(false);
  const [form, setForm] = useState<EventForm>({
    title: "",
    doctor: "",
    location: "",
    type: "",
    insurance: "",
    startTime: "08:00",
    endTime: "09:00",
    quota: "10",
    backupQuota: "5",
    repeatDays: [],
  });

  const StyledDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiPaper-root": {
      position: "fixed",
      top: 0,
      right: 0,
      margin: 0,
      borderTopLeftRadius: "16px",
      borderBottomLeftRadius: "16px",
      minHeight: "100%",
      width: "40vw",
      maxWidth: "none",
      boxShadow: theme.shadows[5],
      animation: "slideIn 0.5s ease-out",
      "&.slideOut": {
        animation: "slideOut 0.5s ease-in forwards",
      },
    },
  }));

  const [events, setEvents] = useState<RecurringEvent[]>([]);
  const [templateIdSelected, setTemplateIdSelected] = useState<String>("");

  const handleCheckbox = (index: number) => {
    setForm((prev) => {
      const exists = prev.repeatDays.includes(index);
      return {
        ...prev,
        repeatDays: exists
          ? prev.repeatDays.filter((d) => d !== index)
          : [...prev.repeatDays, index],
      };
    });
  };

  const generateRecurringRule = () => {
    const byDay = form.repeatDays.map(
      (d) => ["MO", "TU", "WE", "TH", "FR", "SA", "SU"][d]
    );

    return {
      freq: RRule.WEEKLY,
      interval: 1,
      byweekday: byDay,
      dtstart: new Date(`2025-08-08T${form.startTime}:00`),
      until: new Date("2026-08-08T00:00:00"),
    };
  };

  const handleSubmit = () => {
    const id = crypto.randomUUID();

    const newEvent: RecurringEvent = {
      id,
      title: form.title,
      rrule: generateRecurringRule(),
      extendedProps: {
        doctor: form.doctor,
        location: form.location,
        type: form.type,
        insurance: form.insurance,
        endTime: form.endTime,
        startTime: form.startTime,
        quota: form.quota,
        backupQuota: form.backupQuota,
        templateId: id,
      },
    };
    console.log("data: ", newEvent);
    setEvents((prev) => [...prev, newEvent]);
  };

  useEffect(() => {
    console.log("all data: ", events);
  }, [events]);

  const handleEventClick = (info: any) => {
    console.log("clicked: ", info.event.extendedProps);
    setTemplateIdSelected(info.event.extendedProps.templateId);
    setEventDetails({
      id: info.event.id,
      title: info.event.title,
      doctor: info.event.extendedProps.doctor,
      location: info.event.extendedProps.location,
      type: info.event.extendedProps.type,
      insurance: info.event.extendedProps.insurance,
      startTime: info.event.extendedProps.startTime,
      endTime: info.event.extendedProps.endTime,
      quota: info.event.extendedProps.quota,
      backupQuota: info.event.extendedProps.backupQuota,
    });
    setForm((prev) => ({
      ...prev,
      title: info.event.title,
      doctor: info.event.extendedProps.doctor,
      location: info.event.extendedProps.location,
      insurance: info.event.extendedProps.insurance,
      startTime: info.event.extendedProps.startTime,
      endTime: info.event.extendedProps.endTime,
      quota: info.event.extendedProps.quota,
      backupQuota: info.event.extendedProps.backupQuota,
      type: info.event.extendedProps.type,
    }));

    // setOpenEventDialog(true);
    // const templateId = info.event.extendedProps.templateId;
    // setEvents((prev) =>
    //   prev.filter((e) => e.extendedProps.templateId !== templateId)
    // );
  };
  const handleDeleteEvent = () => {
    const templateId = templateIdSelected;
    setEvents((prev) =>
      prev.filter((e) => e.extendedProps.templateId !== templateId)
    );
    setOpenEventDialog(false);
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        justifyContent: "center",
      }}
    >
      <Grid item xs={3}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: "95%",
            maxHeight: "95%",
            border: "1px solid transparent",
            p: 2,
            borderRadius: "16px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.35)",
            marginLeft: "1%",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography>Nama Dokter</Typography>
            <DropdownList
              loading={false}
              options={doctor}
              onChange={(value) => setForm({ ...form, doctor: value })}
              defaultValue={form.doctor}
              placeholder="Pilih Dokter"
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Typography>Judul Jadwal</Typography>
            <CustomTextField
              name="title"
              value={form.title}
              onChange={(e: { target: { value: any } }) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="Masukkan judul jadwal"
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Typography>Lokasi</Typography>
            <DropdownList
              loading={false}
              options={location}
              onChange={(value) => setForm({ ...form, location: value })}
              placeholder="Pilih Lokasi"
              defaultValue={form.location}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Typography>Tipe Jadwal</Typography>
            <DropdownList
              loading={false}
              options={scheduleType}
              onChange={(value) => setForm({ ...form, type: value })}
              placeholder="Pilih Tipe"
              defaultValue={form.type}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Typography>Tipe Jaminan</Typography>
            <CustomTextField
              name="insurance"
              value={form.insurance}
              onChange={(e: { target: { value: any } }) =>
                setForm({ ...form, insurance: e.target.value })
              }
              placeholder="Masukkan jaminan"
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              gap: 2,
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "50%" }}
            >
              <Typography>Jam Mulai</Typography>
              <DropdownListTime
                loading={false}
                placeholder="Jam mulai"
                options={operationalTimes}
                onChange={(value) => {
                  console.log("Waktu dipilih:", value);
                  setForm({ ...form, startTime: value });
                }}
                defaultValue={form.startTime}
              />
            </Box>
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "50%" }}
            >
              <Typography>Jam Selesai</Typography>
              <DropdownListTime
                loading={false}
                placeholder="Jam selesai"
                options={operationalTimes}
                onChange={(value) => {
                  console.log("Waktu dipilih:", value);
                  setForm({ ...form, endTime: value });
                }}
                defaultValue={form.endTime}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Typography>Quota</Typography>
            <CustomTextField
              name="quota"
              value={form.quota}
              onChange={(e: { target: { value: any } }) =>
                setForm({ ...form, quota: e.target.value })
              }
              placeholder="Masukkan quota"
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <Typography>Backup Quota</Typography>
            <CustomTextField
              name="backupQuota"
              value={form.backupQuota}
              onChange={(e: { target: { value: any } }) =>
                setForm({ ...form, backupQuota: e.target.value })
              }
              placeholder="Masukkan quota cadangan"
            />
          </Box>
          <Box>
            {weekdays.map((day, i) => (
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    checked={form.repeatDays.includes(i)}
                    onChange={() => handleCheckbox(i)}
                  />
                }
                label={day}
              />
            ))}
          </Box>
          <CustomButtonFilled
            text="Tambah Jadwal"
            onClick={handleSubmit}
            variant="outlined"
            type="submit"
          />
        </Box>
        <StyledDialog open={openEventDialog}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              fontSize: "16px",
            }}
          >
            <Typography>id: {eventDetails.id}</Typography>
            <Typography>title: {eventDetails.title}</Typography>
            <Typography>doctor name: {eventDetails.doctor}</Typography>
            <Typography>insurance: {eventDetails.insurance}</Typography>
            <Typography>location: {eventDetails.location}</Typography>
            <Typography>type: {eventDetails.type}</Typography>
            <Typography>quota: {eventDetails.quota}</Typography>
            <Typography>backup quota: {eventDetails.backupQuota}</Typography>
            <Typography>start time: {eventDetails.startTime}</Typography>
            <Typography>end time: {eventDetails.endTime}</Typography>
            <Button onClick={handleDeleteEvent}>Hapus Jadwal</Button>
          </Box>
        </StyledDialog>
      </Grid>

      {/* <Grid item xs={9}> */}
      <FullCalendar
        plugins={[
          timeGridPlugin,
          interactionPlugin,
          rrulePlugin,
          dayGridPlugin,
        ]}
        initialView="timeGridWeek"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="90vh"
        nowIndicator={true}
      />
      {/* </Grid> */}
    </Grid>
  );
}
