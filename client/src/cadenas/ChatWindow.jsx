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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";

// Importar iconos para los canales
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import LanguageIcon from "@mui/icons-material/Language";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

// Importar iconos para la temperatura
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
  if (!temp) return "desconocido";
  const lowerTemp = String(temp)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (TEMPERATURE_INTERNAL_VALUES.includes(lowerTemp)) {
    return lowerTemp;
  }
  return "desconocido";
};

// Funciones para obtener iconos de canal (MOVIDAS FUERA DEL COMPONENTE)
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

// Funciones para obtener iconos de temperatura (MOVIDAS FUERA DEL COMPONENTE)
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
              id_airtable: record.id,
              name: record.fields["nombre"] || senderId,
              email: record.fields["username"] || "Sin correo",
              phone: record.fields["telefono"] || "Sin teléfono",
              avatar:
                record.fields["profile_pic"] ||
                `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`,
              temperatura: normalizeTemperatureInternal(
                record.fields["temperatura"]
              ),
              isPaused: record.fields["pause"] || false,
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

    try {
      const recordId = selectedUser.id_airtable;

      if (!recordId) {
        console.warn(
          `No se encontró id_airtable para el usuario seleccionado: ${selectedUser.id}. No se puede pausar.`
        );
        return;
      }

      const updateResponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              pause: true,
            },
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(
          `Error al actualizar registro en Airtable: ${updateResponse.statusText}`
        );
      }

      console.log(
        "Atributo 'pause' actualizado a true en Airtable para el record:",
        recordId
      );

      setUserProfiles((prevProfiles) => ({
        ...prevProfiles,
        [selectedUser.id]: {
          ...prevProfiles[selectedUser.id],
          isPaused: true,
        },
      }));

      setSelectedUser((prevSelectedUser) => {
        if (prevSelectedUser && prevSelectedUser.id === selectedUser.id) {
          return {
            ...prevSelectedUser,
            isPaused: true,
          };
        }
        return prevSelectedUser;
      });
    } catch (airtableError) {
      console.error("Error al interactuar con Airtable:", airtableError);
    }
  };

  const handleUnpauseChat = async () => {
    if (!selectedUser) return;

    try {
      const recordId = selectedUser.id_airtable;

      if (!recordId) {
        console.warn(
          `No se encontró id_airtable para el usuario seleccionado: ${selectedUser.id}. No se puede despausar.`
        );
        return;
      }

      const updateResponse = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              pause: false, // Set pause to false
            },
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(
          `Error al actualizar registro en Airtable: ${updateResponse.statusText}`
        );
      }

      console.log(
        "Atributo 'pause' actualizado a false en Airtable para el record:",
        recordId
      );

      setUserProfiles((prevProfiles) => ({
        ...prevProfiles,
        [selectedUser.id]: {
          ...prevProfiles[selectedUser.id],
          isPaused: false,
        },
      }));

      setSelectedUser((prevSelectedUser) => {
        if (prevSelectedUser && prevSelectedUser.id === selectedUser.id) {
          return {
            ...prevSelectedUser,
            isPaused: false,
          };
        }
        return prevSelectedUser;
      });
    } catch (airtableError) {
      console.error("Error al interactuar con Airtable:", airtableError);
    }
  };

  useEffect(() => {
    const getChatLog = async () => {
      // MODIFIED: Select 'id' and 'leido' explicitly
      const { data, error } = await supabase
        .from("chatlog")
        .select("id, *, leido");
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
          id: msg.id, // ADDED: Include message id
          fromMe: msg.role === "assistant",
          text: msg.content,
          time: createdAt.toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt,
          leido: msg.leido,
        });
        return acc;
      }, {});

      Object.keys(groupedBySession).forEach((sessionId) => {
        groupedBySession[sessionId].sort((a, b) => a.createdAt - b.createdAt);
      });

      const uniqueUsers = Object.keys(groupedBySession)
        .map((sessionId) => {
          const profile = userProfiles[sessionId];
          const messagesForSession = groupedBySession[sessionId];
          const lastMessage = messagesForSession[messagesForSession.length - 1];
          const lastCreatedAt = new Date(lastMessage?.createdAt || 0);

          // MODIFIED: Calculate unreadCount
          let unreadCount = 0;
          messagesForSession.forEach((msg) => {
            if (msg.fromMe === false && msg.leido === false) {
              // Message from the user AND unread
              unreadCount++;
            }
          });

          return {
            id: sessionId,
            id_airtable: profile?.id_airtable,
            name: profile?.name || sessionId,
            email: profile?.email || "Sin correo",
            phone: profile?.phone || "Sin teléfono",
            avatar:
              profile?.avatar ||
              `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`,
            temperatura: normalizeTemperatureInternal(profile?.temperatura),
            isPaused: profile?.isPaused || false,
            lastCreatedAt,
            unreadCount: unreadCount, // MODIFIED: Use unreadCount
          };
        })
        .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt);

      setUsers(uniqueUsers.map(({ lastCreatedAt, ...rest }) => rest));

      const cleanedConversations = {};
      Object.entries(groupedBySession).forEach(([sessionId, messages]) => {
        const canal = groupedBySession[sessionId].canal || "desconocido";
        cleanedConversations[sessionId] = {
          canal,
          messages: messages.map((msg) => ({
            id: msg.id, // Ensure 'id' is passed to conversation messages
            fromMe: msg.fromMe,
            text: msg.text,
            time: msg.time,
            createdAt: msg.createdAt,
            leido: msg.leido,
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
        } else {
          const currentSelectedUserUpdated = uniqueUsers.find(
            (u) => u.id === selectedUser.id
          );
          if (
            currentSelectedUserUpdated &&
            (currentSelectedUserUpdated.isPaused !== selectedUser.isPaused ||
              currentSelectedUserUpdated.unreadCount !==
                selectedUser.unreadCount)
          ) {
            // Check for unread status change too
            setSelectedUser(currentSelectedUserUpdated);
          }
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

  // NEW: Effect to mark messages as read when a chat is selected
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!selectedUser || !conversations[selectedUser.id]) {
        return;
      }

      const messagesToMarkRead = conversations[selectedUser.id].messages.filter(
        (msg) => !msg.fromMe && msg.leido === false
      );

      if (messagesToMarkRead.length === 0) {
        return; // No unread messages from this user
      }

      const messageIdsToUpdate = messagesToMarkRead.map((msg) => msg.id);
      if (messageIdsToUpdate.length === 0) return;

      try {
        const { error: updateError } = await supabase
          .from("chatlog")
          .update({ leido: true })
          .in("id", messageIdsToUpdate);

        if (updateError) {
          console.error(
            "Error marking messages as read in Supabase:",
            updateError
          );
          return;
        }
        console.log(
          `Marked ${messageIdsToUpdate.length} messages as read for user ${selectedUser.id}`
        );

        // Update local state (conversations)
        setConversations((prevConversations) => {
          const newConvo = { ...prevConversations[selectedUser.id] };
          newConvo.messages = newConvo.messages.map((msg) =>
            msg.fromMe === false && msg.leido === false
              ? { ...msg, leido: true }
              : msg
          );
          return {
            ...prevConversations,
            [selectedUser.id]: newConvo,
          };
        });

        // Update local state (users) to clear unread count
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? { ...user, unreadCount: 0 } : user
          )
        );
      } catch (error) {
        console.error("Error in markMessagesAsRead:", error);
      }
    };

    // Only run if a user is selected and has unread messages
    // The condition `selectedUser.unreadCount > 0` ensures we only try to mark as read if there are actual unread messages
    if (selectedUser && selectedUser.unreadCount > 0) {
      markMessagesAsRead();
    }
  }, [selectedUser, conversations]); // Re-run if selectedUser changes or new messages arrive in the current convo

  const currentMessages = selectedUser
    ? conversations[selectedUser.id]?.messages || []
    : [];

  const handleSend = async () => {
    // La validación de newMessage.trim() se mantiene para evitar enviar mensajes vacíos
    if (!newMessage.trim() || !selectedUser) return;

    // La capacidad de enviar mensajes NO está ligada al estado de pausa aquí,
    // solo a la regla de las 24 horas (ver isInputDisabled)
    if (!isFreeFormMessageAllowedBy24HourRule()) {
      console.warn(
        "No se puede enviar el mensaje: el último mensaje del usuario tiene más de 24 horas."
      );
      // Opcional: mostrar un toast o alerta al usuario si intenta enviar
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
    setNewMessage("");
    setSendingMessage(true);

    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          message: messageToSend.text,
        }),
      });

      if (res.ok) {
        const { data, error } = await supabase.from("chatlog").insert([
          {
            session_id: selectedUser.id,
            role: "assistant",
            content: messageToSend.text,
            created_at: now.toISOString(),
            canal: conversations[selectedUser.id]?.canal || "desconocido",
            leido: true,
          },
        ]);

        if (error) {
          console.error("Error al guardar el mensaje en Supabase:", error);
        } else {
          console.log("Mensaje guardado en Supabase:", data);
        }

        setUsers((prevUsers) => {
          const updatedUser = {
            ...selectedUser,
            lastCreatedAt: now,
            unreadCount: 0, // MODIFIED: Clear unread count when agent sends a message
          };
          const otherUsers = prevUsers.filter((u) => u.id !== selectedUser.id);
          return [updatedUser, ...otherUsers].sort(
            (a, b) => b.lastCreatedAt - a.lastCreatedAt
          );
        });
      } else {
        console.error(
          "Error al enviar mensaje a la API. Revirtiendo UI.",
          res.status,
          await res.text()
        );
        setConversations((prevConversations) => ({
          ...prevConversations,
          [selectedUser.id]: {
            ...prevConversations[selectedUser.id],
            messages: prevConversations[selectedUser.id].messages.slice(0, -1),
          },
        }));
        setNewMessage(messageToSend.text);
      }
    } catch (err) {
      console.error("Error en la solicitud de envío. Revirtiendo UI.", err);
      setConversations((prevConversations) => ({
        ...prevConversations,
        [selectedUser.id]: {
          ...prevConversations[selectedUser.id],
          messages: prevConversations[selectedUser.id].messages.slice(0, -1),
        },
      }));
      setNewMessage(messageToSend.text);
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [selectedUser, conversations[selectedUser?.id]?.messages?.length]);

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

  // Nueva función para verificar la regla de las 24 horas (independiente del estado de pausa)
  const isFreeFormMessageAllowedBy24HourRule = () => {
    if (!selectedUser || !conversations[selectedUser.id]) {
      // Si no hay usuario seleccionado o datos de conversación, asumimos que se puede enviar
      return true;
    }

    const messages = conversations[selectedUser.id].messages;
    const lastUserMsg = messages
      .slice()
      .reverse()
      .find((msg) => !msg.fromMe); // Buscar el último mensaje del usuario

    if (!lastUserMsg) {
      // Si no hay mensajes del usuario, asumimos que se puede enviar libremente
      return true;
    }

    if (
      !(lastUserMsg.createdAt instanceof Date) ||
      isNaN(lastUserMsg.createdAt.getTime())
    ) {
      console.warn(
        "Fecha de creación inválida para el último mensaje del usuario. Asumiendo que se permite el mensaje de forma libre."
      );
      return true;
    }

    const timeDifference = Date.now() - lastUserMsg.createdAt.getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    return timeDifference < twentyFourHoursInMs;
  };

  // La entrada está deshabilitada solo si no hay usuario, se está enviando un mensaje,
  // o si la regla de las 24 horas impide el envío de mensajes libres.
  // El estado de pausa NO inhabilita el input.
  const isInputDisabled =
    !selectedUser || sendingMessage || !isFreeFormMessageAllowedBy24HourRule();

  console.log(
    `Render: selectedUser: ${
      selectedUser?.id
    }, isFreeFormMessageAllowedBy24HourRule: ${isFreeFormMessageAllowedBy24HourRule()}, isInputDisabled: ${isInputDisabled}`
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
                    // MODIFIED: Conditional background for unread messages
                    bgcolor: user.unreadCount > 0 ? "#e0f2f1" : "inherit",
                    mx: 1,
                    borderRadius: 2,
                    minHeight: 72,
                    "&.Mui-selected, &.Mui-selected:hover": {
                      background: "linear-gradient(90deg, #6a0dad, #a64aff)",
                      color: "white",
                    },
                    "&:hover": {
                      bgcolor:
                        user.unreadCount > 0
                          ? "#c8e6e3"
                          : "rgba(0, 0, 0, 0.04)",
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
                            fontWeight: user.unreadCount > 0 ? "700" : "600", // Bold for unread
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
                          {/* MODIFIED: Badge for unread count */}
                          {user.unreadCount > 0 && (
                            <Box
                              sx={{
                                bgcolor: "#25D366", // WhatsApp green
                                color: "white",
                                borderRadius: "12px", // Pill shape
                                px: 1,
                                py: 0.2,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                ml: 1,
                                minWidth: "24px", // Ensure it's wide enough for single digit
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
                              fontWeight:
                                user.unreadCount > 0 ? "600" : "normal", // Bold for unread
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
            <IconButton
              onClick={
                selectedUser?.isPaused ? handleUnpauseChat : handlePauseChat
              }
              disabled={!selectedUser}
            >
              {selectedUser?.isPaused ? <PlayArrowIcon /> : <PauseIcon />}
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
            {/* Mensaje cuando la IA está activa (chat NO pausado) */}
            {selectedUser && !selectedUser.isPaused && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ mb: 1, textAlign: "center" }}
              >
                Este chat está siendo atendido por la IA de SYNCRO. Si deseas
                intervenir como agente, utiliza el botón de pausa en la parte
                superior para detener el bot.
              </Typography>
            )}

            {/* Mensaje cuando la regla de las 24 horas aplica (independiente del estado de pausa) */}
            {selectedUser && !isFreeFormMessageAllowedBy24HourRule() && (
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
                disabled={isInputDisabled} // Ahora solo depende de la regla de 24h, sendingMessage y selectedUser
                sx={{ borderRadius: 2 }}
              />
              <IconButton
                onClick={handleSend}
                size="small"
                disabled={isInputDisabled} // Ahora solo depende de la regla de 24h, sendingMessage y selectedUser
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
