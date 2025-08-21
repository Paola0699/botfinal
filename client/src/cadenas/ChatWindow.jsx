import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import supabase from "../supabaseClient";
import SendIcon from "@mui/icons-material/Send";
import PauseIcon from "@mui/icons-material/Pause";

// Importar iconos para los canales
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import LanguageIcon from "@mui/icons-material/Language"; // Para "web" o "website"
import QuestionMarkIcon from "@mui/icons-material/QuestionMark"; // Para canal desconocido

// Importar iconos para la temperatura
import AcUnitIcon from "@mui/icons-material/AcUnit"; // Frío (copo de nieve)
import WbSunnyIcon from "@mui/icons-material/WbSunny"; // Tibio (sol pequeño)
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment"; // Caliente (fuego)
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"; // Desconocido

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_ID = import.meta.env.VITE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_TABLE_NAME;

console.log(API_KEY);

// --- CONSTANTES Y FUNCIONES DE NORMALIZACIÓN ---
const TEMPERATURE_DISPLAY_MAP = {
  frio: "Frío",
  tibio: "Tibio",
  caliente: "Caliente",
  desconocido: "Desconocido",
};

const TEMPERATURE_INTERNAL_VALUES = Object.keys(TEMPERATURE_DISPLAY_MAP);

// Función para normalizar la temperatura a un valor interno (minúsculas, sin acentos)
const normalizeTemperatureInternal = (temp) => {
  if (!temp) return "desconocido"; // Si temp es undefined, null o vacío, es desconocido
  const lowerTemp = String(temp)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (TEMPERATURE_INTERNAL_VALUES.includes(lowerTemp)) {
    return lowerTemp;
  }
  return "desconocido"; // Si no coincide con ningún valor conocido, es desconocido
};

const ChatWindow = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [userProfiles, setUserProfiles] = useState({});
  const messagesEndRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [channelFilter, setChannelFilter] = useState("todos");
  const [temperatureFilter, setTemperatureFilter] = useState([
    "tibio",
    "caliente",
  ]);
  const [loading, setLoading] = useState(true);

  // Debugging log for selectedUser changes
  useEffect(() => {
    console.log("Selected User changed:", selectedUser?.id);
    if (selectedUser) {
      console.log(
        "Conversations for selected user:",
        conversations[selectedUser.id]
      );
    }
  }, [selectedUser, conversations]); // Added conversations to dependencies for more context

  useEffect(() => {
    const fetchAirtableRecords = async () => {
      try {
        const response = await fetch(
          `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Error al obtener leads");

        const data = await response.json();
        const profiles = {};
        data.records.forEach((record) => {
          const senderId = record.fields["session_id"];
          if (senderId) {
            profiles[senderId] = {
              name: record.fields["nombre"] || senderId,
              email: record.fields["username"] || "Sin correo",
              phone: record.fields["telefono"] || "Sin teléfono",
              avatar:
                record.fields["profile_pic"] ||
                `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`,
              temperatura: normalizeTemperatureInternal(
                record.fields["temperatura"]
              ),
            };
          }
        });
        setUserProfiles(profiles);
      } catch (error) {
        console.error("Error al obtener leads:", error);
      }
    };
    fetchAirtableRecords();
  }, []);

  const handlePauseChat = async () => {
    if (!selectedUser) return;
    const pauseUntil = new Date(Date.now() + 40 * 60 * 1000);
    await supabase
      .from("intervenciones_agente")
      .upsert([{ sender_id: selectedUser.id, pause_until: pauseUntil }], {
        onConflict: ["sender_id"],
      });
  };

  useEffect(() => {
    const getChatLog = async () => {
      const { data, error } = await supabase.from("chatlog").select("*");
      if (error) {
        console.error("Error fetching chat log:", error);
        setLoading(false);
        return;
      }

      const groupedBySession = data.reduce((acc, msg) => {
        const sessionId = msg.session_id;
        if (!acc[sessionId]) {
          acc[sessionId] = [];
          acc[sessionId].canal = msg.canal;
        }
        const createdAt = new Date(msg.created_at);
        acc[sessionId].push({
          fromMe: msg.role === "assistant",
          text: msg.content,
          time: createdAt.toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt, // Mantener el objeto Date para comparaciones de tiempo
        });
        return acc;
      }, {});

      // Debugging: Log the messages and their createdAt dates
      Object.keys(groupedBySession).forEach((sessionId) => {
        console.log(`Messages for session ${sessionId}:`);
        groupedBySession[sessionId].forEach((msg) => {
          console.log(
            `  - Role: ${msg.fromMe ? "assistant" : "user"}, Content: "${
              msg.text
            }", CreatedAt: ${
              msg.createdAt
            } (Type: ${typeof msg.createdAt}, Valid: ${
              msg.createdAt instanceof Date && !isNaN(msg.createdAt.getTime())
            })`
          );
        });
      });

      Object.keys(groupedBySession).forEach((sessionId) => {
        groupedBySession[sessionId].sort((a, b) => a.createdAt - b.createdAt);
      });

      const uniqueUsers = Object.keys(groupedBySession)
        .map((sessionId) => {
          const profile = userProfiles[sessionId];
          const lastMessage =
            groupedBySession[sessionId][groupedBySession[sessionId].length - 1];
          const lastCreatedAt = new Date(lastMessage?.createdAt || 0);
          return {
            id: sessionId,
            name: profile?.name || sessionId,
            avatar:
              profile?.avatar ||
              `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`,
            email: profile?.email || "Sin correo",
            phone: profile?.phone || "Sin teléfono",
            temperatura: normalizeTemperatureInternal(profile?.temperatura),
            lastCreatedAt,
          };
        })
        .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt);

      setUsers(uniqueUsers.map(({ lastCreatedAt, ...rest }) => rest));

      const cleanedConversations = {};
      Object.entries(groupedBySession).forEach(([sessionId, messages]) => {
        const canal = groupedBySession[sessionId].canal || "desconocido";
        cleanedConversations[sessionId] = {
          canal,
          // ¡CORRECCIÓN APLICADA AQUÍ! Mapeo explícito para asegurar que createdAt se mantenga
          messages: messages.map((msg) => ({
            fromMe: msg.fromMe,
            text: msg.text,
            time: msg.time,
            createdAt: msg.createdAt, // Asegúrate de incluir createdAt (el objeto Date)
          })),
        };
      });
      setConversations(cleanedConversations);

      if (uniqueUsers.length > 0) {
        if (
          !selectedUser ||
          !uniqueUsers.some((u) => u.id === selectedUser.id)
        ) {
          setSelectedUser(uniqueUsers[0]);
        }
      } else {
        setSelectedUser(null);
      }
      setLoading(false);
    };

    if (Object.keys(userProfiles).length > 0 || !loading) {
      getChatLog();
    }
  }, [userProfiles, selectedUser, loading]);

  const currentMessages = selectedUser
    ? conversations[selectedUser.id]?.messages || []
    : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    // Asegurarse de que el envío esté permitido antes de proceder
    if (!canSendMessagesNow) {
      console.warn(
        "No se puede enviar el mensaje: el chat está inactivo o no hay usuario seleccionado."
      );
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageToSend = {
      fromMe: true,
      text: newMessage,
      time: formattedTime,
      createdAt: now,
    };

    // 1. Actualización Optimista del UI
    setConversations((prevConversations) => ({
      ...prevConversations,
      [selectedUser.id]: {
        ...prevConversations[selectedUser.id],
        messages: [
          ...(prevConversations[selectedUser.id]?.messages || []),
          messageToSend,
        ],
      },
    }));
    setNewMessage(""); // Limpiar el input inmediatamente
    setSendingMessage(true); // Indicar que se está enviando

    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          message: messageToSend.text, // Usar el texto del mensaje optimista
        }),
      });

      if (res.ok) {
        // Guardar el mensaje en Supabase después de un envío exitoso a la API
        const { data, error } = await supabase.from("chatlog").insert([
          {
            session_id: selectedUser.id,
            role: "assistant", // Rol del agente
            content: messageToSend.text, // Usar el texto del mensaje optimista
            created_at: now.toISOString(), // Formato ISO para Supabase
            canal: conversations[selectedUser.id]?.canal || "desconocido", // Guardar el canal
          },
        ]);

        if (error) {
          console.error("Error al guardar el mensaje en Supabase:", error);
          // Opcional: Mostrar un error al usuario si falla la inserción en Supabase
        } else {
          console.log("Mensaje guardado en Supabase:", data);
        }

        // Actualizar la última actividad del usuario seleccionado para reordenar la lista
        setUsers((prevUsers) => {
          const updatedUser = {
            ...selectedUser,
            lastCreatedAt: now,
          };
          const otherUsers = prevUsers.filter((u) => u.id !== selectedUser.id);
          // Reordenar la lista para que el usuario con el mensaje más reciente esté arriba
          return [updatedUser, ...otherUsers].sort(
            (a, b) => b.lastCreatedAt - a.lastCreatedAt
          );
        });
      } else {
        // 2. Revertir actualización optimista si la API falla
        console.error(
          "Error al enviar mensaje a la API. Revirtiendo UI.",
          res.status,
          await res.text()
        );
        setConversations((prevConversations) => ({
          ...prevConversations,
          [selectedUser.id]: {
            ...prevConversations[selectedUser.id],
            messages: prevConversations[selectedUser.id].messages.slice(0, -1), // Eliminar el último mensaje
          },
        }));
        setNewMessage(messageToSend.text); // Restaurar el mensaje en el input
      }
    } catch (err) {
      // 2. Revertir actualización optimista si hay un error de red
      console.error("Error en la solicitud de envío. Revirtiendo UI.", err);
      setConversations((prevConversations) => ({
        ...prevConversations,
        [selectedUser.id]: {
          ...prevConversations[selectedUser.id],
          messages: prevConversations[selectedUser.id].messages.slice(0, -1), // Eliminar el último mensaje
        },
      }));
      setNewMessage(messageToSend.text); // Restaurar el mensaje en el input
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // 3. Ajuste de la dependencia del useEffect para el scroll
  useEffect(() => {
    scrollToBottom();
  }, [selectedUser, conversations[selectedUser?.id]?.messages?.length]); // Se dispara cuando cambia la cantidad de mensajes

  const filteredUsers = users.filter((user) => {
    const matchesName = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const canal = conversations[user.id]?.canal || "desconocido";
    const matchesChannel = channelFilter === "todos" || canal === channelFilter;

    const userTemperatureInternal = user.temperatura;
    const matchesTemperature =
      temperatureFilter.length === 0 ||
      temperatureFilter.includes(userTemperatureInternal);

    return matchesName && matchesChannel && matchesTemperature;
  });

  const getChannelIcon = (channel, size = 16) => {
    switch (channel?.toLowerCase()) {
      case "instagram":
        return <InstagramIcon sx={{ fontSize: size, color: "#E4405F" }} />;
      case "whatsapp":
        return <WhatsAppIcon sx={{ fontSize: size, color: "#25D366" }} />;
      case "facebook":
        return <FacebookIcon sx={{ fontSize: size, color: "#1877F2" }} />;
      case "web":
      case "website":
        return <LanguageIcon sx={{ fontSize: size, color: "#333" }} />;
      default:
        return <QuestionMarkIcon sx={{ fontSize: size, color: "#999" }} />;
    }
  };

  const getTemperatureIcon = (temperatureInternal, size = 16) => {
    switch (temperatureInternal) {
      case "frio":
        return <AcUnitIcon sx={{ fontSize: size, color: "#00BFFF" }} />;
      case "tibio":
        return <WbSunnyIcon sx={{ fontSize: size, color: "#FFD700" }} />;
      case "caliente":
        return (
          <LocalFireDepartmentIcon sx={{ fontSize: size, color: "#FF4500" }} />
        );
      default:
        return <HelpOutlineIcon sx={{ fontSize: size, color: "#999" }} />;
    }
  };

  // REVISED LOGIC: Determines if messages can be sent
  const calculateCanSendMessagesNow = () => {
    if (!selectedUser || !conversations[selectedUser.id]) {
      console.log(
        "calculateCanSendMessagesNow: No selected user or conversation data. Returning true (default)."
      );
      return true; // If no user selected or no conversation data, allow sending.
    }

    const messages = conversations[selectedUser.id].messages;
    // Find the last message that was NOT sent by the assistant (i.e., from the user).
    // Use a deep copy to avoid mutating the original array if .reverse() is used without .slice()
    const lastUserMsg = messages
      .slice()
      .reverse()
      .find((msg) => !msg.fromMe);

    console.log(
      "calculateCanSendMessagesNow: All messages for current user:",
      messages
    );
    console.log(
      "calculateCanSendMessagesNow: Found last user message:",
      lastUserMsg
    );

    // If there's no message from the user, it means it's a new conversation
    // or only the assistant has sent messages. In this case, allow sending.
    if (!lastUserMsg) {
      console.log(
        "calculateCanSendMessagesNow: No messages from user found. Returning true."
      );
      return true;
    }

    // Ensure lastUserMsg.createdAt is a valid Date object
    if (
      !(lastUserMsg.createdAt instanceof Date) ||
      isNaN(lastUserMsg.createdAt.getTime())
    ) {
      console.warn(
        "calculateCanSendMessagesNow: Invalid createdAt date found for last user message. Type:",
        typeof lastUserMsg.createdAt,
        "Value:",
        lastUserMsg.createdAt,
        "isNaN(getTime()):",
        isNaN(lastUserMsg.createdAt?.getTime()),
        ". Returning true to avoid blocking."
      );
      return true; // If date is invalid, assume it's an error and allow sending to not block agent.
    }

    const timeDifference = Date.now() - lastUserMsg.createdAt.getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    console.log(
      `calculateCanSendMessagesNow: Last user message time: ${lastUserMsg.createdAt.toISOString()}`
    );
    console.log(
      `calculateCanSendMessagesNow: Current time: ${new Date().toISOString()}`
    );
    console.log(
      `calculateCanSendMessagesNow: Time difference (ms): ${timeDifference}`
    );
    console.log(
      `calculateCanSendMessagesNow: 24 hours (ms): ${twentyFourHoursInMs}`
    );
    console.log(
      `calculateCanSendMessagesNow: Is timeDifference < 24h? ${
        timeDifference < twentyFourHoursInMs
      }`
    );

    return timeDifference < twentyFourHoursInMs;
  };

  const canSendMessagesNow = calculateCanSendMessagesNow();
  const isInputDisabled =
    !selectedUser || sendingMessage || !canSendMessagesNow;

  // Debugging: Log the final state of flags
  console.log(
    `Render: selectedUser: ${selectedUser?.id}, canSendMessagesNow: ${canSendMessagesNow}, isInputDisabled: ${isInputDisabled}`
  );

  if (loading) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box display="flex" height="100dvh" sx={{ bgcolor: "#f0f2f5" }}>
      <Box
        width={400}
        sx={{ borderRight: "1px solid #eee", bgcolor: "#faf7ff" }}
      >
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

              return (
                <ListItem
                  key={user.id}
                  button
                  selected={user.id === selectedUser?.id}
                  onClick={() => setSelectedUser(user)}
                  sx={{
                    "&.Mui-selected": {
                      background: "linear-gradient(90deg, #6a0dad, #a64aff)",
                      borderRadius: 2,
                      mx: 1,
                      color: "white",
                    },
                    minHeight: 72,
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
                          sx={{ fontWeight: "600", color: "inherit" }}
                        >
                          {user.name}
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
                            }}
                          >
                            {lastMsg.text}
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
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Box>
      <Box width={800} display="flex" flexDirection="column">
        <Paper
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #ddd",
              bgcolor: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar src={selectedUser?.avatar} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {selectedUser?.name}
            </Typography>
            {selectedUser &&
              getChannelIcon(conversations[selectedUser.id]?.canal)}
            <IconButton onClick={handlePauseChat}>
              <PauseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              overflowY: "auto",
              minHeight: 0,
            }}
          >
            <Stack spacing={2}>
              {currentMessages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    alignSelf: msg.fromMe ? "flex-end" : "flex-start",
                    bgcolor: msg.fromMe ? "#2575FC" : "#e3ecee",
                    color: msg.fromMe ? "#fff" : "#000",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "70%",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    textAlign="right"
                    mt={0.5}
                  >
                    {msg.time}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <div ref={messagesEndRef} />
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2,
              bgcolor: "#fff",
            }}
          >
            {/* Leyenda de deshabilitado */}
            {!canSendMessagesNow && selectedUser && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mb: 1, textAlign: "center" }}
              >
                No se pueden enviar mensajes. El último mensaje del usuario
                tiene más de 24 horas. Solo se puede compartir una plantilla.
              </Typography>
            )}
            <Box sx={{ display: "flex", width: "100%" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Escribe un mensaje"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isInputDisabled}
                sx={{ borderRadius: 2 }}
              />
              <IconButton
                onClick={handleSend}
                size="small"
                disabled={isInputDisabled}
                style={{ marginLeft: "1rem" }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Box
        width={300}
        sx={{ borderLeft: "1px solid #eee", bgcolor: "#faf7ff" }}
      >
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
    </Box>
  );
};

export default ChatWindow;
