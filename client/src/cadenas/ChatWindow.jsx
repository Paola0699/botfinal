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
import { useEffect, useRef, useState, useCallback } from "react";
import supabase from "../supabaseClient"; // Asegúrate de que esta ruta sea correcta
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

const TABLE_NAME = import.meta.env.VITE_TABLE_NAME; // VITE_TABLE_NAME=chat_crm

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
  const [channelFilter, setChannelFilter] = useState("todos");
  const [temperatureFilter, setTemperatureFilter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // --- FUNCIONES AUXILIARES PARA EL MANEJO DE ESTADO ---

  // Función para actualizar la lista de usuarios (conversaciones)
  const updateUsersList = useCallback((currentConversations, profiles) => {
    const uniqueUsers = Object.keys(currentConversations)
      .map((sessionId) => {
        const profile = profiles[sessionId];
        if (!profile) {
          console.warn(
            `No se encontró perfil en chat_crm para session_id: ${sessionId}. Este usuario podría no mostrarse completamente.`
          );
          return null;
        }

        const messagesForSession = currentConversations[sessionId].messages;
        const lastMessage = messagesForSession[messagesForSession.length - 1];
        const lastCreatedAt = new Date(lastMessage?.createdAt || 0);

        let unreadCount = 0;
        messagesForSession.forEach((msg) => {
          // Contar mensajes del usuario que NO están leídos
          if (msg.fromMe === false && msg.leido === false) {
            unreadCount++;
          }
        });

        return {
          id: sessionId,
          id_supabase: profile.id_supabase,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar,
          temperatura: profile.temperatura,
          isPaused: profile.isPaused,
          lastCreatedAt,
          unreadCount: unreadCount,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt);

    setUsers(uniqueUsers);
    setLoading(false);
  }, []);

  // Función para procesar los datos iniciales del chatlog
  const processChatlogData = useCallback(
    (data, profiles) => {
      const groupedBySession = data.reduce((acc, msg) => {
        const sessionId = msg.session_id;
        if (!acc[sessionId]) {
          acc[sessionId] = [];
          acc[sessionId].canal = msg.canal;
        }
        const createdAt = new Date(msg.created_at);
        acc[sessionId].push({
          id: msg.id,
          fromMe: msg.role === "assistant", // Determina si el mensaje es del asistente
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

      const cleanedConversations = {};
      Object.entries(groupedBySession).forEach(([sessionId, messages]) => {
        const canal = groupedBySession[sessionId].canal || "desconocido";
        cleanedConversations[sessionId] = {
          canal,
          messages: messages.map((msg) => ({
            id: msg.id,
            fromMe: msg.fromMe,
            text: msg.text,
            time: msg.time,
            createdAt: msg.createdAt,
            leido: msg.leido,
          })),
        };
      });
      setConversations(cleanedConversations);
      updateUsersList(cleanedConversations, profiles);
    },
    [updateUsersList]
  );

  // Manejador de cambios en tiempo real para la tabla chat_crm
  const handleRealtimeCrmChange = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (newRecord && newRecord.session_id) {
      const sessionId = newRecord.session_id;
      const updatedProfile = {
        id_supabase: newRecord.session_id,
        name: newRecord.nombre || sessionId,
        email: newRecord.username || "Sin correo",
        phone: newRecord.telefono || "Sin teléfono",
        avatar:
          newRecord.profile_pic ||
          `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`,
        temperatura: normalizeTemperatureInternal(newRecord.temperatura),
        isPaused: newRecord.pause || false,
      };

      setUserProfiles((prevProfiles) => ({
        ...prevProfiles,
        [sessionId]: updatedProfile,
      }));

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === sessionId
            ? {
                ...user,
                name: updatedProfile.name,
                email: updatedProfile.email,
                phone: updatedProfile.phone,
                avatar: updatedProfile.avatar,
                temperatura: updatedProfile.temperatura,
                isPaused: updatedProfile.isPaused,
              }
            : user
        )
      );

      setSelectedUser((prevSelectedUser) => {
        if (prevSelectedUser && prevSelectedUser.id === sessionId) {
          return {
            ...prevSelectedUser,
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            avatar: updatedProfile.avatar,
            temperatura: updatedProfile.temperatura,
            isPaused: updatedProfile.isPaused,
          };
        }
        return prevSelectedUser;
      });
    }
  }, []);

  // Manejador de cambios en tiempo real para la tabla chatlog
  const handleRealtimeChatlogChange = useCallback(
    (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      if (eventType === "INSERT") {
        const sessionId = newRecord.session_id;
        const createdAt = new Date(newRecord.created_at);
        const newMessage = {
          id: newRecord.id,
          fromMe: newRecord.role === "assistant",
          text: newRecord.content,
          time: createdAt.toLocaleString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt,
          leido: newRecord.leido,
        };

        console.log(
          `[RT-INSERT] Nuevo mensaje para sesión ${
            newRecord.session_id
          }. Rol: ${newRecord.role}, Contenido: ${newRecord.content.substring(
            0,
            30
          )}...`
        );

        setConversations((prevConversations) => {
          const updatedConversations = { ...prevConversations };
          if (!updatedConversations[sessionId]) {
            updatedConversations[sessionId] = {
              canal: newRecord.canal || "desconocido",
              messages: [],
            };
          }
          updatedConversations[sessionId].messages = [
            ...updatedConversations[sessionId].messages,
            newMessage,
          ];
          return updatedConversations;
        });

        setUsers((prevUsers) => {
          let userFound = false;
          const updatedUsers = prevUsers.map((user) => {
            if (user.id === sessionId) {
              userFound = true;
              let unreadCount = user.unreadCount;
              // Incrementar no leídos solo si el mensaje es del usuario y NO es el chat actualmente seleccionado
              if (!newMessage.fromMe && sessionId !== selectedUser?.id) {
                unreadCount++;
              }
              return {
                ...user,
                lastCreatedAt: createdAt,
                unreadCount: unreadCount,
              };
            }
            return user;
          });

          if (!userFound && userProfiles[sessionId]) {
            const profile = userProfiles[sessionId];
            // Si el mensaje es del usuario y el chat NO está seleccionado, el unreadCount inicial es 1
            const unreadCount =
              !newMessage.fromMe && sessionId !== selectedUser?.id ? 1 : 0;
            const newUser = {
              id: sessionId,
              id_supabase: profile.id_supabase,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              avatar: profile.avatar,
              temperatura: profile.temperatura,
              isPaused: profile.isPaused,
              lastCreatedAt: createdAt,
              unreadCount: unreadCount,
            };
            return [newUser, ...updatedUsers].sort(
              (a, b) => b.lastCreatedAt - a.lastCreatedAt
            );
          }
          return updatedUsers.sort((a, b) => b.lastCreatedAt - a.lastCreatedAt);
        });
      } else if (eventType === "UPDATE") {
        const sessionId = newRecord.session_id;
        const messageId = newRecord.id;

        console.log(
          `[RT-UPDATE] Mensaje ID ${messageId} para sesión ${sessionId}. Leído anterior: ${oldRecord.leido}, Nuevo leído: ${newRecord.leido}`
        );

        // Actualizar el estado de conversations primero y capturar el array de mensajes actualizado
        let currentSessionMessagesAfterUpdate = [];
        setConversations((prevConversations) => {
          const updatedConversations = { ...prevConversations };
          if (updatedConversations[sessionId]) {
            updatedConversations[sessionId].messages = updatedConversations[
              sessionId
            ].messages.map((msg) => {
              const updatedMsg =
                msg.id === messageId ? { ...msg, leido: newRecord.leido } : msg;
              return updatedMsg;
            });
            // Capturar la referencia al array de mensajes actualizado dentro de esta sesión
            currentSessionMessagesAfterUpdate =
              updatedConversations[sessionId].messages;
          } else {
            console.warn(
              `[RT-UPDATE] Sesión ${sessionId} no encontrada en el estado de conversaciones. No se puede actualizar el mensaje.`
            );
          }
          return updatedConversations;
        });

        // Ahora, usar el array de mensajes capturado para recalcular el conteo de no leídos
        // Esto asegura que estamos contando basándonos en el estado *después* de que la bandera 'leido' del mensaje actual haya sido aplicada.
        let newUnreadCountForSession = 0;
        currentSessionMessagesAfterUpdate.forEach((msg) => {
          // Contar mensajes del usuario que NO están leídos
          if (!msg.fromMe && !msg.leido) {
            newUnreadCountForSession++;
          }
        });

        console.log(
          `[RT-UPDATE] Recalculado el conteo de no leídos para la sesión ${sessionId}: ${newUnreadCountForSession}`
        );

        // Actualizar el estado 'users' con el conteo de no leídos correcto
        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.map((user) =>
            user.id === sessionId
              ? { ...user, unreadCount: newUnreadCountForSession }
              : user
          );
          console.log(
            `[RT-UPDATE] Estado de usuarios actualizado para la sesión ${sessionId}. Nuevo unreadCount: ${newUnreadCountForSession}`
          );
          return updatedUsers;
        });
      }
    },
    [selectedUser, userProfiles]
  );

  // --- EFECTOS DE CARGA Y SUSCRIPCIÓN ---

  // Efecto para cargar y suscribirse a los perfiles de usuario (chat_crm)
  useEffect(() => {
    const fetchAndSubscribeToUserProfiles = async () => {
      console.log("--- fetchAndSubscribeToUserProfiles iniciando ---");
      try {
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select(
            "session_id, nombre, username, telefono, profile_pic, temperatura, pause"
          );

        if (error) {
          console.error("Error al obtener leads de Supabase:", error.message);
          throw new Error(
            `Error al obtener leads de Supabase: ${error.message}`
          );
        }

        console.log("Datos de chat_crm (leads) obtenidos:", data);
        const profiles = {};
        data.forEach((record) => {
          const senderId = record.session_id;
          if (senderId) {
            profiles[senderId] = {
              id_supabase: record.session_id,
              name: record.nombre || senderId,
              email: record.username || "Sin correo",
              phone: record.telefono || "Sin teléfono",
              avatar:
                record.profile_pic ||
                `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png`,
              temperatura: normalizeTemperatureInternal(record.temperatura),
              isPaused: record.pause || false,
            };
          }
        });
        setUserProfiles(profiles);
        console.log("userProfiles generados:", profiles);

        const crmChannel = supabase
          .channel("crm_profile_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: TABLE_NAME },
            (payload) => {
              console.log("Cambio en chat_crm (real-time):", payload);
              handleRealtimeCrmChange(payload);
            }
          )
          .subscribe();

        console.log("--- fetchAndSubscribeToUserProfiles finalizado ---");

        return () => {
          console.log("Desuscribiendo del canal de crm...");
          supabase.removeChannel(crmChannel);
        };
      } catch (error) {
        console.error("Error en fetchAndSubscribeToUserProfiles:", error);
      }
    };
    fetchAndSubscribeToUserProfiles();
  }, [handleRealtimeCrmChange]);

  // Efecto para cargar y suscribirse al chatlog (depende de userProfiles)
  useEffect(() => {
    if (Object.keys(userProfiles).length === 0) {
      console.log("userProfiles está vacío, esperando para cargar chatlog.");
      setLoading(true);
      return;
    }

    setLoading(true);

    const setupRealtimeChatlog = async () => {
      console.log("--- setupRealtimeChatlog iniciando ---");

      const { data, error } = await supabase
        .from("chatlog")
        .select("id, session_id, role, content, created_at, canal, leido");
      if (error) {
        console.error("Error fetching initial chat log:", error);
        setLoading(false);
        return;
      }

      console.log("Datos de chatlog iniciales obtenidos:", data);
      processChatlogData(data, userProfiles);

      const chatlogChannel = supabase
        .channel("chat_log_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "chatlog" },
          (payload) => {
            console.log("Cambio en chatlog (real-time):", payload);
            handleRealtimeChatlogChange(payload);
          }
        )
        .subscribe();

      console.log("--- setupRealtimeChatlog finalizado ---");

      return () => {
        console.log("Desuscribiendo del canal de chatlog...");
        supabase.removeChannel(chatlogChannel);
      };
    };

    setupRealtimeChatlog();
  }, [userProfiles, processChatlogData, handleRealtimeChatlogChange]);

  // Efecto para seleccionar el primer usuario o mantener el seleccionado
  useEffect(() => {
    if (!loading && users.length > 0) {
      if (!selectedUser || !users.some((u) => u.id === selectedUser.id)) {
        setSelectedUser(users[0]);
        console.log("Usuario seleccionado inicialmente:", users[0]);
      } else {
        const currentSelectedUserUpdated = users.find(
          (u) => u.id === selectedUser.id
        );
        if (
          currentSelectedUserUpdated &&
          (currentSelectedUserUpdated.isPaused !== selectedUser.isPaused ||
            currentSelectedUserUpdated.unreadCount !== selectedUser.unreadCount)
        ) {
          setSelectedUser(currentSelectedUserUpdated);
          console.log(
            "Usuario seleccionado actualizado:",
            currentSelectedUserUpdated
          );
        }
      }
    } else if (!loading && users.length === 0) {
      setSelectedUser(null);
      console.log("No hay usuarios, selectedUser establecido a null.");
    }
  }, [loading, users, selectedUser]);

  const handlePauseChat = async () => {
    if (!selectedUser) return;

    try {
      const recordId = selectedUser.id_supabase;

      if (!recordId) {
        console.warn(
          `No se encontró id_supabase (session_id) para el usuario seleccionado: ${selectedUser.id}. No se puede pausar.`
        );
        return;
      }

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({ pause: true })
        .eq("session_id", recordId);

      if (error) {
        throw new Error(
          `Error al actualizar registro en Supabase: ${error.message}`
        );
      }

      console.log(
        "Atributo 'pause' actualizado a true en Supabase para el record (session_id):",
        recordId
      );
    } catch (supabaseError) {
      console.error("Error al interactuar con Supabase:", supabaseError);
    }
  };

  const handleUnpauseChat = async () => {
    if (!selectedUser) return;

    try {
      const recordId = selectedUser.id_supabase;

      if (!recordId) {
        console.warn(
          `No se encontró id_supabase (session_id) para el usuario seleccionado: ${selectedUser.id}. No se puede despausar.`
        );
        return;
      }

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({ pause: false })
        .eq("session_id", recordId);

      if (error) {
        throw new Error(
          `Error al actualizar registro en Supabase: ${error.message}`
        );
      }

      console.log(
        "Atributo 'pause' actualizado a false en Supabase para el record (session_id):",
        recordId
      );
    } catch (supabaseError) {
      console.error("Error al interactuar con Supabase:", supabaseError);
    }
  };

  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!selectedUser || !conversations[selectedUser.id]) {
        console.log(
          "[markMessagesAsRead] No selected user or conversations for selected user."
        );
        return;
      }

      const messagesToMarkRead = conversations[selectedUser.id].messages.filter(
        (msg) => !msg.fromMe && msg.leido === false
      );

      console.log(
        `[markMessagesAsRead] Encontrados ${messagesToMarkRead.length} mensajes para marcar como leídos para la sesión ${selectedUser.id}`
      );

      if (messagesToMarkRead.length === 0) {
        return;
      }

      const messageIdsToUpdate = messagesToMarkRead.map((msg) => msg.id);
      if (messageIdsToUpdate.length === 0) return;

      try {
        console.log(
          `[markMessagesAsRead] Actualizando mensajes con IDs: ${messageIdsToUpdate.join(
            ", "
          )} a leido: true`
        );
        const { error: updateError } = await supabase
          .from("chatlog")
          .update({ leido: true })
          .in("id", messageIdsToUpdate);

        if (updateError) {
          console.error(
            "[markMessagesAsRead] Error al marcar mensajes como leídos en Supabase:",
            updateError
          );
          return;
        }
        console.log(
          `[markMessagesAsRead] Envío exitoso de actualización a Supabase para ${messageIdsToUpdate.length} mensajes para el usuario ${selectedUser.id}`
        );
      } catch (error) {
        console.error(
          "[markMessagesAsRead] Error en markMessagesAsRead:",
          error
        );
      }
    };

    if (selectedUser && selectedUser.unreadCount > 0) {
      console.log(
        `[markMessagesAsRead] El usuario seleccionado ${selectedUser.id} tiene unreadCount > 0 (${selectedUser.unreadCount}). Llamando a markMessagesAsRead.`
      );
      markMessagesAsRead();
    } else if (selectedUser) {
      console.log(
        `[markMessagesAsRead] El usuario seleccionado ${selectedUser.id} tiene unreadCount de 0. No se necesita acción.`
      );
    }
  }, [selectedUser, conversations]);

  const currentMessages = selectedUser
    ? conversations[selectedUser.id]?.messages || []
    : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    if (!isFreeFormMessageAllowedBy24HourRule()) {
      console.warn(
        "No se puede enviar el mensaje: el último mensaje del usuario tiene más de 24 horas."
      );
      return;
    }

    const now = new Date();

    const messageToSend = {
      fromMe: true,
      text: newMessage,
      time: now.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: now,
    };

    setConversations((prevConversations) => {
      const updatedConvo = { ...prevConversations[selectedUser.id] };
      updatedConvo.messages = [...(updatedConvo.messages || []), messageToSend];
      return {
        ...prevConversations,
        [selectedUser.id]: updatedConvo,
      };
    });
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
          setConversations((prevConversations) => {
            const updatedConvo = { ...prevConversations[selectedUser.id] };
            updatedConvo.messages = updatedConvo.messages.filter(
              (msg) => msg !== messageToSend
            );
            return {
              ...prevConversations,
              [selectedUser.id]: updatedConvo,
            };
          });
          setNewMessage(messageToSend.text);
        } else {
          console.log("Mensaje guardado en Supabase:", data);
        }
      } else {
        console.error(
          "Error al enviar mensaje a la API. Revirtiendo UI.",
          res.status,
          await res.text()
        );
        setConversations((prevConversations) => {
          const updatedConvo = { ...prevConversations[selectedUser.id] };
          updatedConvo.messages = updatedConvo.messages.filter(
            (msg) => msg !== messageToSend
          );
          return {
            ...prevConversations,
            [selectedUser.id]: updatedConvo,
          };
        });
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

  console.log("Current users state:", users);

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
  console.log(
    "Usuarios filtrados para renderizar (filteredUsers):",
    filteredUsers
  );

  const isFreeFormMessageAllowedBy24HourRule = () => {
    if (!selectedUser || !conversations[selectedUser.id]) {
      return true;
    }

    const messages = conversations[selectedUser.id].messages;
    const lastUserMsg = messages
      .slice()
      .reverse()
      .find((msg) => !msg.fromMe);

    if (!lastUserMsg) {
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
                              fontWeight:
                                user.unreadCount > 0 ? "600" : "normal",
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
