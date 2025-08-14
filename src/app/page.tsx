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
//array string untuk define hari dalam 1 minggu
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
    backgroundColor: "#B8E0C9 !important",
    width: "60%",
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
  // state untuk mengatur default value dari form
  const [form, setForm] = useState<ScheduleTypes.EventForm>({
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

  const [events, setEvents] = useState<ScheduleTypes.RecurringEvent[]>([]);
  const [templateIdSelected, setTemplateIdSelected] = useState<String>("");
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
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
    console.log("p: ", index);
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

  //fungsi untuk men-generate pengulangan hari yang dipilih menggunakan rrule dari FullCalendar
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

  //fungsi submit untuk emnyimapn data event yang sudah dibuat user
  const handleSubmit = () => {
    const id = crypto.randomUUID();
    const rule = generateRecurringRule();
    console.log("RULE BASED: ", rule);

    const clicked = rule.byweekday as DayCode[];

    const translatedNum = convertDaysToNumbers(clicked);

    const translatedIndo = clicked.map((day) => daysEnToId[day]);
    console.log(translatedIndo);
    //menyimpan event baru
    const newEvent: ScheduleTypes.RecurringEvent = {
      id,
      title: form.title,
      rrule: rule,
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
    console.log("data: ", newEvent);
    setEvents((prev) => [...prev, newEvent]);
  };

  useEffect(() => {
    console.log("all data: ", events.length);
  }, [events]);

  //untuk read data dari event yang di klik/di pilih
  const handleEventClick = (info: any) => {
    console.log("clicked: ", info.event.extendedProps.byweekday);
    const result = convertDaysToNumbers(info.event.extendedProps.byweekday);
    console.log(result);
    setTemplateIdSelected(info.event.extendedProps.templateId);
    // setEventDetails({
    //   id: info.event.id,
    //   title: info.event.title,
    //   doctor: info.event.extendedProps.doctor,
    //   location: info.event.extendedProps.location,
    //   type: info.event.extendedProps.type,
    //   insurance: info.event.extendedProps.insurance,
    //   startTime: info.event.extendedProps.startTime,
    //   endTime: info.event.extendedProps.endTime,
    //   quota: info.event.extendedProps.quota,
    //   backupQuota: info.event.extendedProps.backupQuota,
    // });

    //menyimpan data event yang ingin di lihat agar muncul di form
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
    // setOpenEventDialog(false);
  };

  return (
    <>
      <GlobalStyles />
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
        <StyledContainer>
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
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                  }}
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
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                  }}
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
          </Grid>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              width: "100%",
            }}
          >
            {/* <Grid item xs={9}> */}
            <Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  slotProps={{
                    day: {
                      sx: {
                        "&.Mui-selected": {
                          borderColor: "#76B732",
                        },
                        "&.Mui-selected:focus": {
                          backgroundColor: "transparent",
                          color: "black",
                          borderColor: "#76B732",
                        },
                      },
                    },
                  }}
                />
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
                {/* Header dengan tombol toggle */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <Typography>Jadwal</Typography>
                  <IconButton size="small">
                    {open ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                {/* Konten yang bisa dibuka/tutup */}
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
                eventOverlap={false}
                eventDisplay="block"
                locale="id"
                timeZone="local"
                nowIndicator={true}
                selectable
                dayMaxEvents
                // headerToolbar={false}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  // right: "dayGridMonth,timeGridWeek,timeGridDay",
                  right: "dayGridMonth,timeGridDay",
                }}
                height="90vh"
                datesSet={handleFullCalendarDatesSet} // detect bulan berubah
              />
            </Box>
          </Box>
          {/* </Grid> */}
        </StyledContainer>
      </Grid>
    </>
  );
}
