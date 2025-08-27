import { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  CircularProgress,
  type SelectChangeEvent,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export interface Option {
  value: number | string;
  label: string;
}

interface DropdownListProps {
  options: Option[];
  placeholder: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  loading: boolean;
  value?: string;
  error?: boolean;
}

export default function DropdownListTime({
  options,
  placeholder,
  onChange,
  defaultValue = "",
  loading,
  value,
  error = false,
}: DropdownListProps) {
  const [selectedOption, setSelectedOption] = useState<string>(
    value || defaultValue
  );

  useEffect(() => {
    setSelectedOption(value || defaultValue);
  }, [value, defaultValue]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const val = event.target.value;
    setSelectedOption(val);
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      sx={{ bgcolor: "transparent" }}
    >
      <Select
        value={selectedOption}
        onChange={handleChange}
        displayEmpty
        startAdornment={
          <Box sx={{ display: "flex", alignItems: "center", ml: 0, mr: 1 }}>
            {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
            <AccessTimeIcon fontSize="small" sx={{ color: "#A4D86F" }} />
          </Box>
        }
        sx={{
          width: "100%",
          color: "#555",
          bgcolor: error ? "#FFCCCC" : "#FFF",
          border: "1px solid #A8A8BD",
          borderRadius: "8px",
          height: "40px",
          transition:
            "border-color 0.3s ease-in-out, background-color 0.3s ease-in-out",
          "&:hover": {
            borderColor: "#A4D86F",
          },
          "&.Mui-focused": {
            borderColor: "#A4D86F",
          },
          "& .MuiSelect-select": {
            padding: "0 16px",
          },
          "& fieldset": {
            border: "none",
          },
        }}
        inputProps={{ "aria-label": "select dropdown" }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 240,
              overflowY: "auto",
              animation: "fadeInAndScale 0.3s ease-in-out",
              "@keyframes fadeInAndScale": {
                "0%": {
                  opacity: 0,
                  transform: "scale(0.9)",
                },
                "100%": {
                  opacity: 1,
                  transform: "scale(1)",
                },
              },
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#ccc",
                borderRadius: "4px",
              },
            },
          },
        }}
      >
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>

        {options.map((option, index) => (
          <MenuItem
            key={index}
            value={option.value.toString()}
            sx={{
              color: "#A4D86F",
              "&:hover": {
                backgroundColor: "#C6EAA4",
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
