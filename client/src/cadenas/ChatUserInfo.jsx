import { Avatar, Box, Divider, Paper, Typography } from "@mui/material";

const ChatUserInfo = ({
  selectedUser,
  getTemperatureIcon,
  TEMPERATURE_DISPLAY_MAP,
}) => {
  return (
    <Box width={300} sx={{ borderLeft: "1px solid #eee", bgcolor: "#faf7ff" }}>
      <Paper sx={{ height: "100%", p: 3, boxShadow: "none" }}>
        <Box textAlign="center" mb={2}>
          <Avatar
            src={selectedUser?.avatar}
            sx={{ width: 80, height: 80, mx: "auto", mb: 1 }}
          />
          <Typography style={{ marginTop: "1rem" }} variant="h5">
            {selectedUser?.name}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2">Correo</Typography>
        <Typography variant="body2" mb={2}>
          {selectedUser?.email}
        </Typography>
        <Typography variant="subtitle2">Teléfono</Typography>
        <Typography variant="body2">{selectedUser?.phone}</Typography>
        <Typography
          variant="subtitle2"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          Temperatura{" "}
          {selectedUser?.temperatura &&
            getTemperatureIcon(selectedUser.temperatura, 16)}
        </Typography>
        <Typography variant="body2">
          {selectedUser?.temperatura
            ? TEMPERATURE_DISPLAY_MAP[selectedUser.temperatura]
            : "Desconocido"}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatUserInfo;
