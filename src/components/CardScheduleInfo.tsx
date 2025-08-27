import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";
import CustomButtonFilled from "./button/CustomButtonFilled";
import dayjs from "dayjs";

interface CardScheduleInfoProps {
  ev: any;
  setForm: any;
  handleDelete: any;
}

export default function CardScheduleInfo({
  ev,
  setForm,
  handleDelete,
}: CardScheduleInfoProps) {
  return (
    <>
      <Box
        key={ev.id}
        sx={{
          p: 2,
          border: "1px solid #A8A8BD",
          borderRadius: "16px",
          display: "flex",
          gap: 1,
          flexDirection: "column",
        }}
      >
        {ev.extendedProps.type === "unavailable" ? (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body1">{ev.extendedProps.doctor}</Typography>
              <Box
                sx={{
                  bgcolor: ev.backgroundColor,
                  borderRadius: "32px",
                  width: "16px",
                  height: "16px",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography>Tanggal Unavailable</Typography>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Typography
                  sx={{ fontSize: 12, bgcolor: "red", minWidth: "100%" }}
                >
                  {dayjs(ev.start).locale("id").format("DD/MM/YYYY")} -{" "}
                  {dayjs(ev.end).locale("id").format("DD/MM/YYYY")}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body1">{ev.extendedProps.doctor}</Typography>
              <Box
                sx={{
                  bgcolor: ev.backgroundColor,
                  borderRadius: "32px",
                  width: "16px",
                  height: "16px",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography>Jam Operasional</Typography>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Typography variant="body1">
                  {ev.extendedProps.startTime}
                </Typography>
                <Typography variant="body1">
                  {ev.extendedProps.endTime}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Typography>Hari Operasi</Typography>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Typography variant="body1">
                  {ev.extendedProps.byweekdayIndonesia.join(" ")}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <CustomButtonFilled
          type="button"
          variant="outlined"
          text="Ubah"
          onClick={() => {
            console.log("data ", ev.id, ": ", ev.extendedProps);
            setForm((prev: any) => ({
              ...prev,
              title: ev.title,
              doctor: ev.extendedProps.doctor,
              location: ev.extendedProps.location,
              insurance: ev.extendedProps.insurance,
              startTime: ev.extendedProps.startTime,
              endTime: ev.extendedProps.endTime,
              quota: ev.extendedProps.quota,
              backupQuota: ev.extendedProps.backupQuota,
              type: ev.extendedProps.type,
              repeatDays: ev.extendedProps.byweekdayTranslated,
            }));
          }}
        />
        <CustomButtonFilled
          text="Hapus Jadwal"
          type="button"
          variant="outlined"
          onClick={() => handleDelete()}
        />
      </Box>
    </>
  );
}
