import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState, useCallback } from "react";
import supabase from "../supabaseClient";

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
import SendIcon from "@mui/icons-material/Send";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // Icono para adjuntar archivo
import CloseIcon from "@mui/icons-material/Close"; // Icono para cerrar previsualización
import MicIcon from "@mui/icons-material/Mic"; // Icono para grabar
import StopIcon from "@mui/icons-material/Stop"; // Icono para detener grabación
import CheckIcon from "@mui/icons-material/Check"; // Icono para confirmar envío de audio grabado
import CancelIcon from "@mui/icons-material/Cancel"; // Icono para cancelar/descartar audio grabado
import ChatLogColumn from "./ChatLogColumn";
import ChatUserInfo from "./ChatUserInfo";

const TABLE_NAME = import.meta.env.VITE_TABLE_NAME;
const SUPABASE_STORAGE_BUCKET = "imgs_chats"; // Nombre del bucket para imágenes
const SUPABASE_AUDIO_BUCKET = "audio"; // NUEVO: Nombre del bucket para audios

// --- CONSTANTES Y FUNCIONES DE NORMALIZACIÓN ---
const TEMPERATURE_DISPLAY_MAP = {
  frio: "Frío",
  tibio: "Tibio",
  caliente: "Caliente",
  desconocido: "Desconocido",
};

const TEMPERATURE_INTERNAL_VALUES = Object.keys(TEMPERATURE_DISPLAY_MAP);

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

  // --- Estados para adjuntar imágenes ---
  const [selectedImage, setSelectedImage] = useState(null); // El archivo de imagen
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // URL para la previsualización
  const fileInputRef = useRef(null); // Ref para el input de archivo

  // NUEVO: Estados para adjuntar audios
  const [selectedAudio, setSelectedAudio] = useState(null); // El archivo de audio
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null); // URL para la previsualización del audio
  const audioInputRef = useRef(null); // Ref para el input de archivo de audio

  // NUEVO: Estados para la grabación de audio
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]); // Estado de React, no se usa para recolección directa
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const audioPlayerRef = useRef(null); // Ref para el reproductor de audio de previsualización

  // NUEVO: Refs para acceso estable al stream y chunks de audio
  const mediaStreamRef = useRef(null); // Para el stream del micrófono
  const audioChunksRef = useRef([]); // Para recolectar los chunks de audio de forma síncrona

  // Refs para acceso estable al estado más reciente dentro de los callbacks
  const conversationsRef = useRef(conversations);
  const usersRef = useRef(users);
  const selectedUserRef = useRef(selectedUser);
  const userProfilesRef = useRef(userProfiles);

  // Actualizar refs cada vez que el estado cambia
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    userProfilesRef.current = userProfiles;
  }, [userProfiles]);

  // --- FUNCIONES AUXILIARES PARA EL MANEJO DE ESTADO ---

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
  }, []);

  const processChatlogData = useCallback(
    (data, profilesArg) => {
      const groupedBySession = data.reduce((acc, msg) => {
        const sessionId = msg.session_id;
        if (!acc[sessionId]) {
          acc[sessionId] = [];
          acc[sessionId].canal = msg.canal;
        }
        const createdAt = new Date(msg.created_at);
        acc[sessionId].push({
          id: msg.id,
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
          type: msg.type || "text", // MODIFICADO: Usa 'type' en lugar de 'content_type'
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
            type: msg.type, // MODIFICADO: Usa 'type'
          })),
        };
      });
      setConversations(cleanedConversations);
      updateUsersList(cleanedConversations, profilesArg);
    },
    [updateUsersList]
  );

  const handleRealtimeCrmChange = useCallback((payload) => {
    console.log("[Realtime CRM Change]", payload);

    // ⛔ aseguramos que sólo manipula estado local
    if (!payload.new?.session_id) return;

    const sessionId = String(payload.new.session_id);

    // Actualiza profiles
    setUserProfiles((prevProfiles) => ({
      ...prevProfiles,
      [sessionId]: {
        ...(prevProfiles[sessionId] || {}),
        id_supabase: sessionId,
        name:
          payload.new.nombre ||
          prevProfiles[sessionId]?.name ||
          `Usuario ${sessionId}`,
        email:
          payload.new.username ||
          prevProfiles[sessionId]?.email ||
          "Desconocido",
        phone:
          payload.new.telefono ||
          prevProfiles[sessionId]?.phone ||
          "Desconocido",
        avatar:
          payload.new.profile_pic ||
          prevProfiles[sessionId]?.avatar ||
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        temperatura: normalizeTemperatureInternal(
          payload.new.temperatura ?? prevProfiles[sessionId]?.temperatura
        ),
        isPaused:
          payload.new.pause ?? prevProfiles[sessionId]?.isPaused ?? false,
      },
    }));

    // Actualiza users
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        String(user.id) === sessionId
          ? {
              ...user,
              name: payload.new.nombre || user.name,
              email: payload.new.username || user.email,
              phone: payload.new.telefono || user.phone,
              avatar: payload.new.profile_pic || user.avatar,
              temperatura:
                normalizeTemperatureInternal(payload.new.temperatura) ||
                user.temperatura,
              isPaused: payload.new.pause ?? user.isPaused,
            }
          : user
      )
    );

    // Actualiza selectedUser si es el mismo
    setSelectedUser((prevSelectedUser) => {
      if (prevSelectedUser && String(prevSelectedUser.id) === sessionId) {
        return {
          ...prevSelectedUser,
          name: payload.new.nombre || prevSelectedUser.name,
          email: payload.new.username || prevSelectedUser.email,
          phone: payload.new.telefono || prevSelectedUser.phone,
          avatar: payload.new.profile_pic || prevSelectedUser.avatar,
          temperatura:
            normalizeTemperatureInternal(payload.new.temperatura) ||
            prevSelectedUser.temperatura,
          isPaused: payload.new.pause ?? prevSelectedUser.isPaused,
        };
      }
      return prevSelectedUser;
    });
  }, []);

  const handleRealtimeChatlogChange = useCallback((payload) => {
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
        type: newRecord.type || "text", // MODIFICADO: Usa 'type' en lugar de 'content_type'
      };

      setConversations((prevConversations) => {
        const updatedConversations = { ...prevConversations };
        if (!updatedConversations[sessionId]) {
          updatedConversations[sessionId] = {
            canal: newRecord.canal || "desconocido",
            messages: [],
          };
        }
        const existingMessages = updatedConversations[sessionId].messages;
        const messageAlreadyExists = existingMessages.some(
          (msg) => msg.id === newMessage.id
        );

        if (messageAlreadyExists) {
          console.warn(
            `[RT-INSERT] Mensaje con ID ${newMessage.id} ya existe en la conversación ${sessionId}. Ignorando duplicado.`
          );
          return prevConversations;
        }

        updatedConversations[sessionId].messages = [
          ...existingMessages,
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
            if (
              !newMessage.fromMe &&
              sessionId !== selectedUserRef.current?.id
            ) {
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

        if (!userFound && userProfilesRef.current[sessionId]) {
          const profile = userProfilesRef.current[sessionId];
          const unreadCount =
            !newMessage.fromMe && sessionId !== selectedUserRef.current?.id
              ? 1
              : 0;
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
          currentSessionMessagesAfterUpdate =
            updatedConversations[sessionId].messages;
        } else {
          console.warn(
            `[RT-UPDATE] Sesión ${sessionId} no encontrada en el estado de conversaciones. No se puede actualizar el mensaje.`
          );
        }
        return updatedConversations;
      });

      let newUnreadCountForSession = 0;
      currentSessionMessagesAfterUpdate.forEach((msg) => {
        if (!msg.fromMe && !msg.leido) {
          newUnreadCountForSession++;
        }
      });

      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.id === sessionId
            ? { ...user, unreadCount: newUnreadCountForSession }
            : user
        );
        return updatedUsers;
      });
    }
  }, []);

  const crmChannelRef = useRef(null);
  const chatlogChannelRef = useRef(null);

  useEffect(() => {
    const setupInitialDataAndSubscriptions = async () => {
      setLoading(true);

      try {
        // 1️⃣ Obtener CRM (igual que antes)
        const { data: crmData, error: crmError } = await supabase
          .from(TABLE_NAME)
          .select(
            "session_id, nombre, username, telefono, profile_pic, temperatura, pause"
          );

        if (crmError)
          throw new Error(
            `Error al obtener leads de Supabase: ${crmError.message}`
          );

        const profiles = {};
        crmData.forEach((record) => {
          const senderId = String(record.session_id); // aseguramos que sea string
          if (senderId) {
            profiles[senderId] = {
              id_supabase: senderId,
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

        // 2️⃣ Obtener TODOS los mensajes de chatlog con paginación
        let allChatlogData = [];
        let from = 0;
        const pageSize = 1000;
        let moreData = true;

        while (moreData) {
          const { data, error } = await supabase
            .from("chatlog")
            .select(
              "id, session_id, role, content, created_at, canal, leido, type"
            )
            .order("created_at", { ascending: true })
            .range(from, from + pageSize - 1);

          if (error) throw error;

          if (!data || data.length === 0) {
            moreData = false;
            break;
          }

          allChatlogData = allChatlogData.concat(data);

          if (data.length < pageSize) {
            moreData = false;
          } else {
            from += pageSize;
          }
        }

        console.log("📦 Mensajes cargados (total):", allChatlogData.length);

        // 3️⃣ Crear perfiles faltantes
        for (const msg of allChatlogData) {
          const sid = String(msg.session_id);
          if (!profiles[sid]) {
            profiles[sid] = {
              id_supabase: sid,
              name: `Usuario ${sid}`,
              email: "Desconocido",
              phone: "Desconocido",
              avatar:
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
              temperatura: "desconocido",
              isPaused: false,
            };
          }
        }

        // 4️⃣ Procesar mensajes agrupados
        processChatlogData(allChatlogData, profiles);

        // 5️⃣ Suscripciones realtime (igual que antes)
        if (!crmChannelRef.current) {
          crmChannelRef.current = supabase
            .channel("crm_profile_changes")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: TABLE_NAME },
              handleRealtimeCrmChange
            )
            .subscribe((status) =>
              console.log("[Realtime] CRM channel:", status)
            );
        }

        if (!chatlogChannelRef.current) {
          chatlogChannelRef.current = supabase
            .channel("chat_log_changes")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "chatlog" },
              handleRealtimeChatlogChange
            )
            .subscribe((status) =>
              console.log("[Realtime] Chatlog channel:", status)
            );
        }

        setLoading(false);
      } catch (error) {
        console.error("Error en setupInitialDataAndSubscriptions:", error);
        setLoading(false);
      }
    };

    setupInitialDataAndSubscriptions();

    // 🔚 Cleanup: eliminar canales al desmontar el componente
    return () => {
      if (crmChannelRef.current) {
        supabase.removeChannel(crmChannelRef.current);
        crmChannelRef.current = null;
      }
      if (chatlogChannelRef.current) {
        supabase.removeChannel(chatlogChannelRef.current);
        chatlogChannelRef.current = null;
      }
    };
  }, [
    processChatlogData,
    handleRealtimeCrmChange,
    handleRealtimeChatlogChange,
  ]);

  useEffect(() => {
    if (!loading && users.length > 0) {
      if (!selectedUser || !users.some((u) => u.id === selectedUser.id)) {
        setSelectedUser(users[0]);
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
        }
      }
    } else if (!loading && users.length === 0) {
      setSelectedUser(null);
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
    } catch (supabaseError) {
      console.error("Error al interactuar con Supabase:", supabaseError);
    }
  };

  const markMessagesAsRead = useCallback(async () => {
    const currentSelectedUser = selectedUserRef.current;
    const currentConversations = conversationsRef.current;

    if (!currentSelectedUser || !currentConversations[currentSelectedUser.id]) {
      return;
    }

    const messagesToMarkRead = currentConversations[
      currentSelectedUser.id
    ].messages.filter((msg) => !msg.fromMe && msg.leido === false);

    if (messagesToMarkRead.length === 0) {
      return;
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
          "[markMessagesAsRead] Error al marcar mensajes como leídos en Supabase:",
          updateError
        );
        return;
      }
    } catch (error) {
      console.error("[markMessagesAsRead] Error en markMessagesAsRead:", error);
    }
  }, []);

  useEffect(() => {
    if (selectedUser && selectedUser.unreadCount > 0) {
      markMessagesAsRead();
    } else if (selectedUser) {
    }
  }, [selectedUser, conversations, markMessagesAsRead]);

  const currentMessages = selectedUser
    ? conversations[selectedUser.id]?.messages || []
    : [];

  // --- Funciones para manejar la carga de imágenes y audios ---
  const uploadFileToSupabase = async (file, fileType, bucketName) => {
    if (!selectedUser) {
      throw new Error(
        `No hay usuario seleccionado para adjuntar el ${fileType}.`
      );
    }

    let fileToUpload = file;
    let fileExt = file.name?.split(".").pop() || "bin";
    let contentType = file.type || "application/octet-stream";

    // ✅ Caso especial: forzar audio a OGG
    if (fileType === "audio") {
      fileExt = "ogg";
      contentType = "audio/ogg";

      // Si el archivo no está ya en OGG, lo convertimos a OGG
      if (!file.name.endsWith(".ogg")) {
        fileToUpload = new File([file], `${Date.now()}.ogg`, {
          type: contentType,
        });
      }
    }

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `${selectedUser.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileToUpload, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

    if (error) {
      console.error(`Error al subir ${fileType}:`, error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error(`No se pudo obtener la URL pública del ${fileType}.`);
    }

    return publicUrlData.publicUrl;
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      clearAudioSelection(); // Limpiar audio adjunto
      clearRecordedAudio(); // Limpiar audio grabado
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAudioSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAudio(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      clearImageSelection(); // Limpiar imagen
      clearRecordedAudio(); // Limpiar audio grabado
    }
  };

  const clearAudioSelection = () => {
    setSelectedAudio(null);
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  // --- Funciones para la grabación de audio ---
  const startRecording = async () => {
    try {
      const possibleMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/mp4",
        "audio/wav",
      ];
      let selectedMimeType = "";
      for (const type of possibleMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }
      if (!selectedMimeType) {
        alert(
          "Tu navegador no soporta la grabación de audio en un formato compatible."
        );
        console.error("No hay mimeType compatible para MediaRecorder.");
        return;
      }
      console.log("MimeType seleccionado para grabación:", selectedMimeType);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
        console.log(
          `Pista de audio: ${track.label}, ID: ${track.id}, Estado: ${track.readyState}`
        );
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
      });
      setMediaRecorder(recorder);
      audioChunksRef.current = []; // Inicializar la ref síncrona
      console.log(
        "audioChunksRef.current reset al inicio de startRecording. Stack trace:"
      );
      console.trace();
      setAudioChunks([]); // Limpiar estado de React
      setRecordedAudioBlob(null);
      setRecordedAudioUrl(null);

      recorder.ondataavailable = (event) => {
        console.log(
          "ondataavailable fired! Data size:",
          event.data.size,
          "bytes"
        );
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(
            "audioChunksRef.current.length after push:",
            audioChunksRef.current.length
          );
        }
      };
      recorder.onstop = () => {
        console.log(
          "MediaRecorder stopped. Total chunks collected (from ref):",
          audioChunksRef.current.length
        );
        const finalAudioBlob = new Blob(audioChunksRef.current, {
          type: selectedMimeType,
        });
        if (finalAudioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(finalAudioBlob);
          setRecordedAudioBlob(finalAudioBlob);
          setRecordedAudioUrl(audioUrl);
          console.log(
            "Audio grabado exitosamente. Tamaño:",
            finalAudioBlob.size,
            "bytes"
          );
        } else {
          console.warn("La grabación de audio resultó en un archivo vacío.");
          alert(
            "No se capturó audio. Asegúrate de que tu micrófono esté funcionando."
          );
          clearRecordedAudio();
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        setIsRecording(false);
      };
      recorder.onerror = (event) => {
        console.error("Error en MediaRecorder:", event.error);
        alert(
          `Error durante la grabación: ${event.error.name} - ${event.error.message}.`
        );
        setIsRecording(false);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };
      recorder.start(1000); // Iniciar la grabación, forzando ondataavailable cada 1000ms
      console.log("MediaRecorder started.");
      setIsRecording(true);
      clearImageSelection();
      clearAudioSelection();
    } catch (err) {
      console.error(
        "Error al acceder al micrófono o iniciar la grabación:",
        err
      );
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        alert(
          "Permiso de micrófono denegado. Por favor, permite el acceso al micrófono en la configuración de tu navegador."
        );
      } else if (err.name === "NotFoundError") {
        alert(
          "No se encontró ningún micrófono. Asegúrate de que uno esté conectado y funcionando."
        );
      } else if (err.name === "NotReadableError") {
        alert(
          "El micrófono está en uso por otra aplicación o no está disponible. Cierra otras aplicaciones que usen el micrófono."
        );
      } else {
        alert(`No se pudo iniciar la grabación: ${err.message}.`);
      }
      setIsRecording(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const clearRecordedAudio = () => {
    setRecordedAudioBlob(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    audioChunksRef.current = []; // Limpiar la ref síncrona
    console.log(
      "audioChunksRef.current reset en clearRecordedAudio. Stack trace:"
    );
    console.trace();
    setAudioChunks([]); // Limpiar estado de React
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleSend = async () => {
    if (
      !selectedUser ||
      (!newMessage.trim() &&
        !selectedImage &&
        !selectedAudio &&
        !recordedAudioBlob)
    )
      return;

    if (!isFreeFormMessageAllowedBy24HourRule()) {
      console.warn(
        "No se puede enviar el mensaje: el último mensaje del usuario tiene más de 24 horas."
      );
      return;
    }

    const now = new Date();
    let messageContent = newMessage.trim();
    let fileUrlToSend = null;
    let messageType = "text"; // MODIFICADO: Renombra la variable a 'messageType' para evitar conflicto con la columna 'type'

    setNewMessage("");
    setSendingMessage(true);

    try {
      if (selectedImage) {
        fileUrlToSend = await uploadFileToSupabase(
          selectedImage,
          "image",
          SUPABASE_STORAGE_BUCKET
        );
        messageType = "image"; // MODIFICADO: Usa 'messageType'
        clearImageSelection();
      } else if (selectedAudio) {
        fileUrlToSend = await uploadFileToSupabase(
          selectedAudio,
          "audio",
          SUPABASE_AUDIO_BUCKET
        );
        messageType = "audio"; // MODIFICADO: Usa 'messageType'
        clearAudioSelection();
      } else if (recordedAudioBlob) {
        const recordedAudioFile = new File(
          [recordedAudioBlob],
          `recorded-audio-${Date.now()}.ogg`,
          {
            type: "audio/ogg",
          }
        );

        fileUrlToSend = await uploadFileToSupabase(
          recordedAudioFile,
          "audio",
          SUPABASE_AUDIO_BUCKET
        );
        messageType = "audio";
        clearRecordedAudio();
      }

      if (!messageContent && !fileUrlToSend) {
        setSendingMessage(false);
        return;
      }

      const apiPayload = {
        recipientId: selectedUser.id,
        message: messageContent || null,
        imageUrl: messageType === "image" ? fileUrlToSend : null, // MODIFICADO: Usa 'messageType'
        audioUrl: messageType === "audio" ? fileUrlToSend : null, // MODIFICADO: Usa 'messageType'
      };

      console.log("Payload enviado a la API:", apiPayload);

      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (res.ok) {
        const contentToSave = fileUrlToSend || messageContent;
        const { data, error } = await supabase.from("chatlog").insert([
          {
            session_id: selectedUser.id,
            role: "assistant",
            content: contentToSave,
            created_at: now.toISOString(),
            canal: conversations[selectedUser.id]?.canal || "desconocido",
            leido: true,
            type: messageType, // MODIFICADO: Guarda en la columna 'type'
          },
        ]);

        if (error) {
          console.error("Error al guardar el mensaje en Supabase:", error);
          if (!fileUrlToSend) setNewMessage(messageContent);
        }
      } else {
        console.error(
          "Error al enviar mensaje a la API. Revirtiendo UI.",
          res.status,
          await res.text()
        );
        if (!fileUrlToSend) setNewMessage(messageContent);
      }
    } catch (err) {
      console.error("Error en la solicitud de envío. Revirtiendo UI.", err);
      if (!fileUrlToSend) setNewMessage(messageContent);
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
    const userName = String(user.name || "");
    const matchesName = userName
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
    !selectedUser ||
    sendingMessage ||
    !isFreeFormMessageAllowedBy24HourRule() ||
    !!selectedImage ||
    !!selectedAudio ||
    isRecording ||
    !!recordedAudioUrl;

  const isButtonDisabled =
    !selectedUser ||
    sendingMessage ||
    (!newMessage.trim() &&
      !selectedImage &&
      !selectedAudio &&
      !recordedAudioBlob) ||
    isRecording;

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
      <ChatLogColumn
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        temperatureFilter={temperatureFilter}
        setTemperatureFilter={setTemperatureFilter}
        setSearchTerm={setSearchTerm}
        setSelectedUser={setSelectedUser}
        getTemperatureIcon={getTemperatureIcon}
        getChannelIcon={getChannelIcon}
        selectedUser={selectedUser}
        TEMPERATURE_INTERNAL_VALUES={TEMPERATURE_INTERNAL_VALUES}
        TEMPERATURE_DISPLAY_MAP={TEMPERATURE_DISPLAY_MAP}
        searchTerm={searchTerm}
        filteredUsers={filteredUsers}
        conversations={conversations}
      />
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
                  {msg.type === "image" ? (
                    <img
                      src={msg.text}
                      alt="Imagen adjunta"
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  ) : msg.type === "audio" ? (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <audio controls preload="metadata" src={msg.text}>
                        Tu navegador no soporta el elemento de audio.
                      </audio>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        🔊 audio adjunto
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      dangerouslySetInnerHTML={{
                        __html: (msg.text || "").replace(/\n/g, "<br />"),
                      }}
                    />
                  )}

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

            {/* Previsualización de imagen */}
            {imagePreviewUrl && (
              <Box /* ... */>
                <img /* ... */ />
                <IconButton onClick={clearImageSelection} /* ... */>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* NUEVO: Previsualización de audio adjunto */}
            {audioPreviewUrl && (
              <Box /* ... */>
                <audio controls src={audioPreviewUrl} /* ... */ />
                <Typography variant="caption" /* ... */>
                  Audio adjunto
                </Typography>
                <IconButton onClick={clearAudioSelection} /* ... */>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* NUEVO: Previsualización de audio grabado */}
            {recordedAudioUrl && (
              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  maxWidth: "100%",
                  mx: "auto",
                  gap: 1,
                }}
              >
                <IconButton size="small" onClick={clearRecordedAudio}>
                  <CancelIcon />
                </IconButton>
                <audio
                  controls
                  src={recordedAudioUrl}
                  ref={audioPlayerRef}
                  style={{ flexGrow: 1 }}
                >
                  Tu navegador no soporta el elemento de audio.
                </audio>
                <IconButton
                  onClick={handleSend} // Envía el audio grabado
                  disabled={sendingMessage}
                  color="primary"
                >
                  <CheckIcon />
                </IconButton>
              </Box>
            )}

            <Box sx={{ display: "flex", width: "100%" }}>
              {/* Input de archivo oculto para imágenes */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageSelect}
                disabled={
                  isInputDisabled ||
                  !!selectedAudio ||
                  isRecording ||
                  !!recordedAudioUrl
                }
              />
              {/* Botón para adjuntar imágenes */}
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                size="small"
                disabled={
                  isInputDisabled ||
                  !!selectedAudio ||
                  isRecording ||
                  !!recordedAudioUrl
                }
                style={{ marginRight: "1rem" }}
              >
                <AttachFileIcon />
              </IconButton>

              {/* NUEVO: Input de archivo oculto para audios */}
              <input
                type="file"
                accept="audio/*"
                ref={audioInputRef}
                style={{ display: "none" }}
                onChange={handleAudioSelect}
                disabled={
                  isInputDisabled ||
                  !!selectedImage ||
                  isRecording ||
                  !!recordedAudioUrl
                }
              />

              {/* NUEVO: Botón de grabar/detener audio */}
              {!isRecording &&
                !recordedAudioUrl &&
                !selectedImage &&
                !selectedAudio && (
                  <IconButton
                    onClick={startRecording}
                    size="small"
                    disabled={
                      !selectedUser ||
                      sendingMessage ||
                      !isFreeFormMessageAllowedBy24HourRule()
                    }
                    color="primary"
                    style={{ marginRight: "1rem" }}
                  >
                    <MicIcon />
                  </IconButton>
                )}
              {isRecording && (
                <IconButton
                  onClick={stopRecording}
                  size="small"
                  color="error"
                  style={{ marginRight: "1rem" }}
                >
                  <StopIcon />
                </IconButton>
              )}

              {/* MODIFICADO: TextField se muestra solo si no hay grabación o audio grabado */}
              {!isRecording && !recordedAudioUrl && (
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
              )}

              {/* MODIFICADO: Botón de enviar se muestra solo si no hay grabación ni audio grabado */}
              {!isRecording && !recordedAudioUrl && (
                <IconButton
                  onClick={handleSend}
                  size="small"
                  disabled={isButtonDisabled}
                  style={{ marginLeft: "1rem" }}
                >
                  <SendIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
      <ChatUserInfo
        selectedUser={selectedUser}
        getTemperatureIcon={getTemperatureIcon}
        TEMPERATURE_DISPLAY_MAP={TEMPERATURE_DISPLAY_MAP}
      />
    </Box>
  );
};

export default ChatWindow;
