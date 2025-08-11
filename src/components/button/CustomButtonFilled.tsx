"use client";

import { Button } from "@mui/material";
import { SxProps } from "@mui/system";
import { ReactNode } from "react";

interface CustomButtonFilledProps {
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  size?: "small" | "medium" | "large";
  text?: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  sx?: SxProps;
  children?: ReactNode;
}

export default function CustomButtonFilled({
  type = "submit",
  disabled = false,
  variant = "contained",
  color = "primary",
  size = "medium",
  text = "Lanjutkan",
  onClick,
  fullWidth = true,
  sx = {},
  children,
}: CustomButtonFilledProps) {
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      size={size}
      disabled={disabled}
      onClick={onClick}
      fullWidth={fullWidth}
      sx={{
        backgroundColor: disabled ? "#A8A8BD" : "#76B732",
        color: "white",
        textTransform: "none",
        fontSize: "12px",
        "&.Mui-disabled": {
          backgroundColor: "#A8A8BD",
          color: "white",
        },
        ...(variant === "outlined" && {
          border: `1px solid ${disabled ? "#A8A8BD" : "#76B732"}`,
        }),
        "&:hover": {
          backgroundColor: "inherit",
          color: "#76B732",
        },
        ...sx,
      }}
    >
      {children || text}
    </Button>
  );
}
