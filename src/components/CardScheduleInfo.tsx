import { Box, Typography } from "@mui/material";
import React from "react";
import CustomButtonFilled from "./button/CustomButtonFilled";

interface CardScheduleInfoProps {
  ev: any;
  setForm: any;
}

export default function CardScheduleInfo({
  ev,
  setForm,
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
        <Typography variant="body1">{ev.extendedProps.doctor}</Typography>
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
            <Typography variant="body1">{ev.extendedProps.endTime}</Typography>
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
      </Box>
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
    </>
  );
}
