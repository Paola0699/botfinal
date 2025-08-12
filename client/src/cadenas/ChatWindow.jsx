import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
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

// 🔐 Airtable config
const API_KEY =
  "patEpPGZwM0wqagdm.20e5bf631e702ded9b04d6c2fed3e41002a8afc9127a57cff9bf8c3b3416dd02";
const BASE_ID = "appbT7f58H1PLdY11";
const TABLE_NAME = "chat-crm";

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

  // Obtener perfiles desde Airtable
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
          const senderId = record.fields["sender_id"];
          if (senderId) {
            profiles[senderId] = {
              name: record.fields["nombre"] || senderId,
              email: record.fields["username"] || "Sin correo",
              phone: record.fields["intencion de comprar"] || "Sin teléfono",
              avatar:
                record.fields["profile pic"] ||
                `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`,
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

  const test = async () => {
    if (!selectedUser) return;

    const pauseUntil = new Date(Date.now() + 40 * 60 * 1000); // 40 minutos en el futuro

    const { data, error } = await supabase.from("intervenciones_agente").upsert(
      [
        {
          sender_id: selectedUser.id,
          pause_until: pauseUntil,
        },
      ],
      {
        onConflict: ["sender_id"],
      }
    );

    if (error) {
      console.error("Error al pausar el chat:", error);
    } else {
      console.log("Chat pausado hasta:", pauseUntil);
    }
  };

  useEffect(() => {
    const getChatLog = async () => {
      const { data, error } = await supabase.from("chatlog").select("*");

      if (error) {
        console.error("Error fetching chat log:", error);
        return;
      }

      // Agrupar mensajes por session_id
      const groupedBySession = data.reduce((acc, msg) => {
        const sessionId = msg.session_id;
        if (!acc[sessionId]) {
          acc[sessionId] = [];
          acc[sessionId].canal = msg.canal; // almacenar canal asociado
        }
        const createdAt = new Date(msg.created_at);

        acc[sessionId].push({
          fromMe: msg.role === "assistant",
          text: msg.content,
          time: createdAt.toLocaleString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt, // importante: conservar para ordenamiento posterior
        });

        return acc;
      }, {});

      // Ordenar mensajes por fecha dentro de cada sesión
      Object.keys(groupedBySession).forEach((sessionId) => {
        groupedBySession[sessionId].sort((a, b) => a.createdAt - b.createdAt);
      });

      // Crear lista de usuarios y ordenarla por fecha del último mensaje
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
            lastCreatedAt,
          };
        })
        .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt); // Orden descendente

      // Limpiar el campo lastCreatedAt antes de guardar en estado
      setUsers(uniqueUsers.map(({ lastCreatedAt, ...rest }) => rest));

      // Eliminar campo createdAt en mensajes (para que el estado quede limpio)
      const cleanedConversations = {};
      Object.entries(groupedBySession).forEach(([sessionId, messages]) => {
        const canal = groupedBySession[sessionId].canal || "desconocido";
        cleanedConversations[sessionId] = {
          canal,
          messages: messages.map(({ createdAt, ...rest }) => rest),
        };
      });

      setConversations(cleanedConversations);

      if (uniqueUsers.length > 0) setSelectedUser(uniqueUsers[0]);
    };

    if (Object.keys(userProfiles).length > 0) {
      getChatLog();
    }
  }, [userProfiles]);
  const currentMessages = selectedUser
    ? conversations[selectedUser.id]?.messages || []
    : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${((hours + 11) % 12) + 1}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;

    const updatedMessages = [
      ...currentMessages,
      { fromMe: true, text: newMessage, time: formattedTime },
    ];
    setSendingMessage(true);
    // Enviar mensaje al endpoint de Facebook
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          message: newMessage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error sending message to Facebook:", errorData);
      } else {
        setConversations({
          ...conversations,
          [selectedUser.id]: {
            ...conversations[selectedUser.id],
            messages: updatedMessages,
          },
        });
        const updatedUser = {
          ...selectedUser,
          lastCreatedAt: new Date(), // usamos esto para ordenar
        };

        // Reordenar la lista de usuarios
        const updatedUsers = [
          updatedUser,
          ...users.filter((u) => u.id !== selectedUser.id),
        ];

        setUsers(updatedUsers);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Network error sending message to Facebook:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, selectedUser]);

  const filteredUsers = users.filter((user) => {
    const matchesName = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const canal = conversations[user.id]?.canal || "desconocido";
    const matchesChannel = channelFilter === "todos" || canal === channelFilter;

    return matchesName && matchesChannel;
  });

  return (
    <Box display="flex" height="93dvh">
      {/* Lista de conversaciones */}

      <Box
        width={400}
        height="100%"
        sx={{ borderRight: "1px solid #eee", bgcolor: "#f9f9f9" }}
      >
        <Paper sx={{ height: "100%", overflowY: "auto", boxShadow: "none" }}>
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

              return (
                <ListItem
                  key={user.id}
                  button
                  selected={user.id === selectedUser?.id}
                  onClick={() => setSelectedUser(user)}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#e3f2fd",
                      borderRadius: 2,
                      mx: 1,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      lastMsg
                        ? `${lastMsg.text.slice(0, 60)}... — ${lastMsg.time}`
                        : ""
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Box>

      {/* Ventana de conversación */}
      <Box width={800} display="flex" flexDirection="column" height="100%">
        <Paper
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f4f6f8",
            borderRadius: 0,
            flexGrow: 1,
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
            <Typography variant="h6">{selectedUser?.name}</Typography>
            <Button onClick={test} variant="contained">
              Pausar
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
            <Stack spacing={2}>
              {currentMessages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    alignSelf: msg.fromMe ? "flex-end" : "flex-start",
                    bgcolor: msg.fromMe ? "#2563eb" : "#e3ecee",
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
          <Box sx={{ display: "flex", p: 2, bgcolor: "#fff" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Escribe un mensaje"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              sx={{ borderRadius: 2 }}
            />
            <Button
              onClick={handleSend}
              variant="contained"
              sx={{ ml: 2, borderRadius: 3, backgroundColor: "#ff3200" }}
              size="small"
              disabled={sendingMessage}
            >
              Enviar
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Panel de perfil */}
      <Box
        width={300}
        height="100%"
        sx={{ borderLeft: "1px solid #eee", bgcolor: "#f9f9f9" }}
      >
        <Paper sx={{ height: "100%", p: 3, boxShadow: "none" }}>
          <Box textAlign="center" mb={2}>
            <Avatar
              src={selectedUser?.avatar}
              sx={{ width: 80, height: 80, mx: "auto", mb: 1 }}
            />
            <Typography variant="h6">{selectedUser?.name}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">📧 Correo</Typography>
          <Typography variant="body2" mb={2}>
            {selectedUser?.email}
          </Typography>
          <Typography variant="subtitle2">📞 Teléfono</Typography>
          <Typography variant="body2">{selectedUser?.phone}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatWindow;
