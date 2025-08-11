/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface CustomTextFieldProps {
  name: string;
  formik?: any;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  InputProps?: TextFieldProps["InputProps"];
  disabled?: boolean;
  bgcolors?: string;
  sx?: object;
  value?: any;
  onChange?: any;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  name,
  formik,
  multiline = false,
  rows = 0,
  placeholder = "Masukkan teks",
  InputProps = {},
  disabled = false,
  bgcolors = "inherit",
  value = "",
  sx = {},
  onChange,
  ...props
}) => {
  return (
    <TextField
      disabled={disabled}
      {...props}
      name={name}
      multiline={multiline}
      rows={rows}
      placeholder={
        formik?.touched[name] && formik?.errors[name]
          ? formik.errors[name]
          : placeholder
      }
      value={value ? value : formik?.values[name] || ""}
      onChange={onChange ? onChange : formik?.handleChange}
      onBlur={formik?.handleBlur}
      error={formik?.touched[name] && Boolean(formik?.errors[name])}
      InputProps={InputProps}
      sx={{
        width: "100%",
        marginTop: "10px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          backgroundColor: disabled
            ? "#EEEEF2"
            : formik?.touched[name] && formik?.errors[name]
            ? "#ffcccc"
            : bgcolors,
          "&:focus-within .MuiOutlinedInput-notchedOutline": {
            borderColor: "#A4D86F",
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "1px solid #ccc",
        },
        "& .MuiOutlinedInput-input": {
          padding: "10px",
          fontSize: "16px",
        },
        ...sx,
      }}
    />
  );
};

export default CustomTextField;
