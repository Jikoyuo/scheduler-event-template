"use client";
import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { RRule } from "rrule";
import dayGridPlugin from "@fullcalendar/daygrid";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

import {
  Checkbox,
  FormControlLabel,
  Grid,
  Box,
  Typography,
  Container,
  styled,
  IconButton,
} from "@mui/material";
import CustomButtonFilled from "@/components/button/CustomButtonFilled";
import CustomTextField from "@/components/CustomTextfield";
import DropdownListTime from "@/components/DropdownListTime";
import operationalTimes from "@/data/operationalTimes";
import DropdownList from "@/components/DropdownList";
import doctor from "@/data/doctor";
import location from "@/data/location";
import scheduleType from "@/data/scheduleType";
import { ScheduleTypes } from "@/types/schedule";
import CardScheduleInfo from "@/components/CardScheduleInfo";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const GlobalStyles = styled("style")`
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

const StyledContainer = styled(Container)(({ theme }) => ({
  borderRadius: "16px",
  minWidth: "100%",
  padding: theme.spacing(4),
  "& .fc-event": {
    border: "none",
    borderRadius: theme.shape.borderRadius,
    color: "#0F0F14",
    display: "flex",
    fontSize: "0.875rem",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    width: "60%",
  },
  "& .fc-event.unavailable-event": {
    //styling khusus untuk event unavailable
    width: "100%",
  },
  "& .fc-daygrid-event.fc-event-end.fc-event.unavailable-event": {
    //styling khusus untuk event unavailable
    marginLeft: 0,
  },
  "& .fc-daygrid-event.fc-event-end": {
    marginLeft: "23.5%",
  },
  "& .fc-timegrid-slot": {
    borderBottom: "1px solid #e0e0e0",
    height: "75px",
  },
  "& .fc-daygrid-day-number": {
    color: "black",
    marginRight: "40%",
    marginTop: "5%",
  },
  "& .fc-col-header-cell": {
    border: "none",
    textAlign: "center",
  },
  "& .fc-now-indicator-line": {
    backgroundColor: "#00FF00 !important",
    height: "2px !important",
    width: "1px !important",
  },
  "& .fc-now-indicator-arrow": {
    borderTopColor: "#00FF00 !important",
  },
  "& .fc-day-today .fc-daygrid-day-number": {
    backgroundColor: "#76B732",
    borderRadius: "60%",
    padding: "4px",
    color: "white",
  },
  "& .fc-day-today": {
    backgroundColor: "inherit !important",
  },
  "& .fc-day-today .fc-daygrid-day-number::before": {
    content: '""',
    display: "block",
    width: "100%",
    height: "100%",
    borderRadius: "60%",
    border: "2px solid #76B732",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  "@media (max-width: 768px)": {
    "& .fc-timegrid-slot-label": {
      fontSize: "0.8rem",
    },
    "& .fc-timegrid-slot-frame": {
      padding: "5px",
    },
  },
}));

export default function CalendarPage() {
  type DayCode = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
  const [open, setOpen] = useState(false);
  const daysEnToId: Record<DayCode, string> = {
    MO: "Sen",
    TU: "Sel",
    WE: "Rab",
    TH: "Kam",
    FR: "Jum",
    SA: "Sab",
    SU: "Ming",
  };

  const [form, setForm] = useState<ScheduleTypes.EventForm>({
    title: "",
    doctor: "",
    location: "",
    type: "available",
    insurance: "",
    startTime: "08:00",
    endTime: "09:00",
    quota: "10",
    backupQuota: "5",
    repeatDays: [],
    reason: "",
    startDate: null as Dayjs | null,
    endDate: null as Dayjs | null,
  });

  const [events, setEvents] = useState<ScheduleTypes.RecurringEvent[]>([]);
  const [templateIdSelected, setTemplateIdSelected] = useState<String>("");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [scheduleOptions, setScheduleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const calendarRef = useRef<any>(null);

  const dayMap = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  } as const;

  type DayCodes = keyof typeof dayMap;

  function convertDaysToNumbers(days: DayCodes[]): number[] {
    return days.map((day) => dayMap[day]);
  }
  const handleFullCalendarDatesSet = (arg: any) => {
    setCurrentDate(dayjs(arg.start));
  };

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
      (d) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][d]
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

    // Jika unavailable → event blok (background event)
    if (form.type === "unavailable") {
      const newEvent = {
        id,
        title: form.title || "Tidak tersedia",
        start: dayjs(form.startDate).format("YYYY-MM-DD"), // bukan toISOString()
        end: dayjs(form.endDate).add(1, "day").format("YYYY-MM-DD"), // exclusive
        allDay: true,
        backgroundColor: "red",
        extendedProps: {
          type: form.type,
          reason: form.reason,
        },
      };
      console.log("start: ", newEvent.start);
      console.log("end: ", newEvent.end);
      setEvents((prev) => [...prev, newEvent]);
      return;
    }

    if (form.type === "available" || form.type === "temporary") {
      // Jika available / temporary
      const rule = generateRecurringRule();
      const clicked = rule.byweekday as DayCode[];
      const translatedNum = convertDaysToNumbers(clicked);
      const translatedIndo = clicked.map((day) => daysEnToId[day]);

      const newEvent: ScheduleTypes.RecurringEvent = {
        id,
        title: form.title,
        rrule: rule,
        backgroundColor: form.type === "temporary" ? "yellow" : "#B8E0C9",
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
          byweekday: rule.byweekday,
          byweekdayTranslated: translatedNum,
          byweekdayIndonesia: translatedIndo,
        },
      };
      setEvents((prev) => [...prev, newEvent]);
      // if (form.type === "temporary") {
      //   console.log("temp: ", newEvent);
      // } else if (form.type === "available") {
      //   console.log("avail: ", newEvent);
      // }
    }
  };
  useEffect(() => {
    console.log("event: ", events);
  }, [events]);
  useEffect(() => {
    console.log("masuk");
    const filtered = events
      .filter((ev) => ev.extendedProps?.type !== "unavailable")
      .map((ev) => ({
        label: ev.title,
        value: ev.title, // atau ev.id biar unik
      }));

    setScheduleOptions(filtered);
    console.log("event filtered: ", filtered);
  }, [events]);
  const handleEventClick = (info: any) => {
    setTemplateIdSelected(info.event.extendedProps.templateId || "");
    if (info.event.extendedProps.type === "unavailable") {
      setForm((prev) => ({
        ...prev,
        title: info.event.title,
        reason: info.event.extendedProps.reason,
        type: "unavailable",
        startDate: info.event.startStr,
        endDate: info.event.endStr,
      }));
    } else {
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
        repeatDays: info.event.extendedProps.byweekdayTranslated,
      }));
    }
  };

  const handleDeleteEvent = () => {
    const templateId = templateIdSelected;
    setEvents((prev) =>
      prev.filter((e) => e.extendedProps.templateId !== templateId)
    );
  };

  return (
    <>
      <GlobalStyles />
      <Grid
        container
        spacing={2}
        sx={{ display: "flex", flexDirection: "column", p: 2 }}
      >
        <StyledContainer>
          <Grid item xs={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: "95%",
                maxHeight: "95%",
                p: 2,
                borderRadius: "16px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.35)",
              }}
            >
              {/* Pilih tipe jadwal */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <Typography>Tipe Jadwal</Typography>
                <DropdownList
                  loading={false}
                  options={[
                    { label: "Available", value: "available" },
                    { label: "Temporary", value: "temporary" },
                    { label: "Unavailable", value: "unavailable" },
                  ]}
                  onChange={(value) => setForm({ ...form, type: value })}
                  placeholder="Pilih Tipe Jadwal"
                  defaultValue={form.type}
                />
              </Box>
              {/* Jika tipe unavailable → form sederhana */}
              {form.type === "unavailable" && (
                <>
                  <CustomTextField
                    name="title"
                    value={form.title}
                    onChange={(e: any) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Judul Libur"
                  />
                  <CustomTextField
                    name="reason"
                    value={form.reason}
                    onChange={(e: any) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    placeholder="Alasan"
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={form.startDate}
                      onChange={(newValue) =>
                        setForm({ ...form, startDate: newValue })
                      }
                    />
                    <DatePicker
                      label="End Date"
                      value={form.endDate}
                      onChange={(newValue) =>
                        setForm({ ...form, endDate: newValue })
                      }
                    />
                  </LocalizationProvider>
                </>
              )}{" "}
              {form.type === "available" && (
                <>
                  {/* Jika available / temporary, form penuh */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography>Nama Dokter</Typography>
                    <DropdownList
                      loading={false}
                      options={doctor}
                      onChange={(value) => setForm({ ...form, doctor: value })}
                      defaultValue={form.doctor}
                      placeholder="Pilih Dokter"
                    />
                  </Box>
                  <CustomTextField
                    name="title"
                    value={form.title}
                    onChange={(e: any) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Masukkan judul jadwal"
                  />
                  <DropdownList
                    loading={false}
                    options={location}
                    onChange={(value) => setForm({ ...form, location: value })}
                    placeholder="Pilih Lokasi"
                    defaultValue={form.location}
                  />
                  <CustomTextField
                    name="insurance"
                    value={form.insurance}
                    onChange={(e: any) =>
                      setForm({ ...form, insurance: e.target.value })
                    }
                    placeholder="Masukkan jaminan"
                  />
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <DropdownListTime
                      loading={false}
                      placeholder="Jam mulai"
                      options={operationalTimes}
                      onChange={(value) =>
                        setForm({ ...form, startTime: value })
                      }
                      defaultValue={form.startTime}
                    />
                    <DropdownListTime
                      loading={false}
                      placeholder="Jam selesai"
                      options={operationalTimes}
                      onChange={(value) => setForm({ ...form, endTime: value })}
                      defaultValue={form.endTime}
                    />
                  </Box>
                  <CustomTextField
                    name="quota"
                    value={form.quota}
                    onChange={(e: any) =>
                      setForm({ ...form, quota: e.target.value })
                    }
                    placeholder="Quota"
                  />
                  <CustomTextField
                    name="backupQuota"
                    value={form.backupQuota}
                    onChange={(e: any) =>
                      setForm({ ...form, backupQuota: e.target.value })
                    }
                    placeholder="Quota cadangan"
                  />
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
                </>
              )}
              {form.type === "temporary" && (
                <>
                  {/* Jika available / temporary, form penuh */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Typography>Nama Dokter</Typography>
                    <DropdownList
                      loading={false}
                      options={scheduleOptions}
                      onChange={(value) => setForm({ ...form, doctor: value })}
                      defaultValue={form.doctor}
                      placeholder="Pilih Dokter"
                    />
                  </Box>
                  <CustomTextField
                    name="title"
                    value={form.title}
                    onChange={(e: any) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Masukkan judul jadwal"
                  />
                  <DropdownList
                    loading={false}
                    options={location}
                    onChange={(value) => setForm({ ...form, location: value })}
                    placeholder="Pilih Lokasi"
                    defaultValue={form.location}
                  />
                  <CustomTextField
                    name="insurance"
                    value={form.insurance}
                    onChange={(e: any) =>
                      setForm({ ...form, insurance: e.target.value })
                    }
                    placeholder="Masukkan jaminan"
                  />
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <DropdownListTime
                      loading={false}
                      placeholder="Jam mulai"
                      options={operationalTimes}
                      onChange={(value) =>
                        setForm({ ...form, startTime: value })
                      }
                      defaultValue={form.startTime}
                    />
                    <DropdownListTime
                      loading={false}
                      placeholder="Jam selesai"
                      options={operationalTimes}
                      onChange={(value) => setForm({ ...form, endTime: value })}
                      defaultValue={form.endTime}
                    />
                  </Box>
                  <CustomTextField
                    name="quota"
                    value={form.quota}
                    onChange={(e: any) =>
                      setForm({ ...form, quota: e.target.value })
                    }
                    placeholder="Quota"
                  />
                  <CustomTextField
                    name="backupQuota"
                    value={form.backupQuota}
                    onChange={(e: any) =>
                      setForm({ ...form, backupQuota: e.target.value })
                    }
                    placeholder="Quota cadangan"
                  />
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
                </>
              )}
              <CustomButtonFilled
                text="Tambah Jadwal"
                onClick={handleSubmit}
                variant="outlined"
                type="submit"
              />
            </Box>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar />
              </LocalizationProvider>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid gray",
                  borderRadius: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <Typography>Jadwal</Typography>
                  <IconButton size="small">
                    {open ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
                {open && (
                  <>
                    {events.length <= 0 ? (
                      <Typography>Belum Ada Jadwal</Typography>
                    ) : (
                      events.map((ev, i) => (
                        <CardScheduleInfo setForm={setForm} key={i} ev={ev} />
                      ))
                    )}
                  </>
                )}
              </Box>
            </Box>
            <Box sx={{ width: "76%" }}>
              <FullCalendar
                ref={calendarRef}
                plugins={[
                  timeGridPlugin,
                  interactionPlugin,
                  rrulePlugin,
                  dayGridPlugin,
                ]}
                views={{
                  timeGridDay: {
                    titleFormat: {
                      month: "long",
                      year: "numeric",
                      day: "numeric",
                    },
                    slotDuration: "01:00:00",
                    slotLabelInterval: "01:00",
                  },
                }}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                eventOverlap={true}
                // eventDisplay="block"
                locale="id"
                timeZone="local"
                nowIndicator={true}
                selectable
                dayMaxEvents
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                eventClassNames={(arg) => {
                  if (arg.event.extendedProps.type === "unavailable") {
                    return ["unavailable-event"];
                  }
                  return [];
                }}
                height="90vh"
                datesSet={handleFullCalendarDatesSet}
              />
            </Box>
          </Box>
        </StyledContainer>
      </Grid>
    </>
  );
}
