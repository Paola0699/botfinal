import {
  Avatar,
  Box,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";

const ChatLogColumn = ({
  channelFilter,
  setChannelFilter,
  temperatureFilter,
  setTemperatureFilter,
  searchTerm,
  setSearchTerm,
  setSelectedUser,
  getTemperatureIcon,
  getChannelIcon,
  selectedUser,
  TEMPERATURE_INTERNAL_VALUES,
  TEMPERATURE_DISPLAY_MAP,
  filteredUsers,
  conversations,
}) => {
  return (
    <Box width={400} sx={{ borderRight: "1px solid #eee", bgcolor: "#faf7ff" }}>
      <Paper
        sx={{
          height: "100%",
          overflowY: "auto",
          boxShadow: "none",
        }}
      >
        <Typography variant="h6" p={2}>
          Conversaciones
        </Typography>
        <Box px={2} pt={1} pb={1}>
          <FormControl fullWidth size="small">
            <InputLabel id="channel-select-label">Canal</InputLabel>
            <Select
              labelId="channel-select-label"
              value={channelFilter}
              label="Canal"
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box px={2} pt={1} pb={1}>
          <FormControl fullWidth size="small">
            <InputLabel id="temperature-select-label">Temperatura</InputLabel>
            <Select
              labelId="temperature-select-label"
              multiple
              value={temperatureFilter}
              onChange={(event) => {
                const {
                  target: { value },
                } = event;
                if (value.includes("todos")) {
                  setTemperatureFilter([]);
                } else {
                  setTemperatureFilter(value);
                }
              }}
              label="Temperatura"
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return "Todos";
                }
                return selected
                  .map((val) => TEMPERATURE_DISPLAY_MAP[val])

                  .join(", ");
              }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              {TEMPERATURE_INTERNAL_VALUES.filter(
                (val) => val !== "desconocido"
              ).map((tempInternal) => (
                <MenuItem key={tempInternal} value={tempInternal}>
                  {TEMPERATURE_DISPLAY_MAP[tempInternal]}
                </MenuItem>
              ))}
              <MenuItem value="desconocido">Desconocido</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box px={2} pb={1}>
          <TextField
            fullWidth
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mt: 1 }}
          />
        </Box>
        <Divider />
        <List>
          {filteredUsers.map((user) => {
            const userConvo = conversations[user.id];
            const lastMsg =
              userConvo?.messages?.[userConvo.messages.length - 1];
            const canal = userConvo?.canal;

            const isSelected = user.id === selectedUser?.id;

            return (
              <ListItemButton
                key={user.id}
                selected={isSelected}
                onClick={() => setSelectedUser(user)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  minHeight: 72,
                  transition:
                    "background-color 0.3s ease, color 0.3s ease, border-left-color 0.3s ease",
                  borderLeft: "4px solid transparent",
                  paddingLeft: (theme) => theme.spacing(2),

                  bgcolor:
                    user.unreadCount > 0
                      ? "rgba(37, 211, 102, 0.05)"
                      : "inherit",
                  color: "text.primary",

                  "&:hover": {
                    bgcolor:
                      user.unreadCount > 0
                        ? "rgba(37, 211, 102, 0.1)"
                        : "rgba(0, 0, 0, 0.04)",
                    color: "text.primary",
                  },

                  "&.Mui-selected": {
                    bgcolor: "#e7f3ff",
                    color: "text.primary",
                    borderLeft: "4px solid #1976d2",
                    paddingLeft: (theme) => `calc(${theme.spacing(2)} - 4px)`,
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "#d7e3f7",
                    color: "text.primary",
                    borderLeft: "4px solid #1976d2",
                    paddingLeft: (theme) => `calc(${theme.spacing(2)} - 4px)`,
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Typography
                        component="span"
                        variant="body1"
                        sx={{
                          fontWeight: user.unreadCount > 0 ? "700" : "600",
                          color: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        {user.name}
                        {user.isPaused && (
                          <PauseCircleFilledIcon
                            sx={{ fontSize: 16, ml: 0.5, color: "orange" }}
                          />
                        )}
                        {user.unreadCount > 0 && (
                          <Box
                            sx={{
                              bgcolor: "#25D366",
                              color: "white",
                              borderRadius: "12px",
                              px: 1,
                              py: 0.2,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              ml: 1,
                              minWidth: "24px",
                              textAlign: "center",
                              flexShrink: 0,
                            }}
                          >
                            {user.unreadCount}
                          </Box>
                        )}
                      </Typography>
                      {lastMsg && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            color: "inherit",
                            opacity: 0.8,
                            flexShrink: 0,
                          }}
                        >
                          {lastMsg.time}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    lastMsg ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{
                            color: "inherit",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flexGrow: 1,
                            fontWeight: user.unreadCount > 0 ? "600" : "normal",
                          }}
                        >
                          {lastMsg.type === "image"
                            ? "🖼️ Imagen"
                            : lastMsg.type === "audio"
                            ? "🔊 Audio"
                            : lastMsg.text}
                        </Typography>
                        {canal && getChannelIcon(canal, 14)}
                        {user.temperatura &&
                          getTemperatureIcon(user.temperatura, 14)}
                      </Box>
                    ) : (
                      ""
                    )
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default ChatLogColumn;
