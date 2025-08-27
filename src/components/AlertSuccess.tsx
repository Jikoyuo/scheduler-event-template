import { Alert } from "@mui/material";

interface Props {
  label: string;
}

const AlertSuccess: React.FC<Props> = ({ label }) => {
  return (
    <Alert
      sx={{
        width: "fit-content",
        height: "34px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: "#77C397",
        padding: "8px 16px",
        color: "#77C397",
        fontSize: "16px",
        lineHeight: "18px",
        position: "fixed",
        top: "10%",
        left: "50%",
        zIndex: 999,
        transform: "translate(-50%, -100%)",
        animation: "slideIn 0.5s ease-out",
        "@keyframes slideIn": {
          "0%": {
            transform: "translate(-50%, -150%)",
            opacity: 0,
          },
          "100%": {
            transform: "translate(-50%, -100%)",
            opacity: 1,
          },
        },
      }}
    >
      {label}
    </Alert>
  );
};

export default AlertSuccess;
