import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import ContactEditModal from "../contacto/ContactEditModal";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import dayjs from "dayjs";

const getTouchpointIcon = (tipo) => {
  switch (tipo) {
    case "mail":
      return <MailOutlineIcon />;
    case "whatsapp":
      return <WhatsAppIcon />;
    case "llamada":
      return <PhoneIcon />;
    case "visita":
      return <EventIcon />;
    default:
      return <EventIcon />;
  }
};

const Contacto = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contact, setContact] = useState([]);
  const [touchpoints, setTouchpoints] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const TABLE_NAME = "chat_crm";
  const TABLE_TOUCHPOINTS_NAME = "touchpoints";

  const { id } = useParams();
  const navigate = useNavigate();

  const getContactInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("session_id", id)
        .single();

      if (supabaseError) throw new Error(supabaseError.message);
      setContact(data || {});
    } catch (err) {
      console.error("Error al obtener contactos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleGetContactTouchPoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from(TABLE_TOUCHPOINTS_NAME)
        .select("*")
        .eq("session_id", id);

      if (supabaseError) throw new Error(supabaseError.message);
      console.log("Touchpoints data:", data);
      setTouchpoints(data || {});
    } catch (err) {
      console.error("Error al obtener touchpoints:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContactInfo();
    handleGetContactTouchPoints();
  }, []);

  const eventos = [
    {
      hora: "16:30",
      titulo: "Contacto inicial",
      descripcion: "Vía WhatsApp (10/09/2025)",
      icon: <WhatsAppIcon />,
      color: "#25D366",
    },
    {
      hora: "15:22",
      titulo: "Llamada de seguimiento",
      descripcion: "Cliente interesado (15/09/2025)",
      icon: <PhoneInTalkIcon />,
      color: "#2575FC",
    },
    {
      hora: "14:15",
      titulo: "Visita programada",
      descripcion: "Agendada en calendario (20/09/2025)",
      icon: <EventAvailableIcon />,
      color: "#6A11CB",
    },
  ];
  const statCards = [
    {
      title: "Temperatura",
      value: contact.temperatura || "N/A",
      color: "#6A11CB",
    },
    {
      title: "Ingreso",
      value: `$${contact.ingreso_generado || 0}`,
      color: "#2575FC",
    },
    { title: "Visitas", value: contact.visitas || 0, color: "#1da3e9" },
  ];

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
    <>
      {/* Breadcrumb con botón Editar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 4,
          bgcolor: "white",
          borderBottom: "1px solid #eee",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            onClick={() => navigate(`/contactos`)}
            sx={{
              textTransform: "none",
              color: "#2575FC",
              fontWeight: "bold",
              fontSize: "0.95rem",
            }}
          >
            ← Volver a Contactos
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            / Detalles de {contact?.nombre}
          </Typography>
        </Box>

        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            background: "linear-gradient(45deg, #6A11CB, #2575FC)",
            textTransform: "capitalize",
          }}
          onClick={() => setOpenEditModal(true)}
        >
          Editar Contacto
        </Button>
      </Box>

      <Box
        sx={{
          p: 6,
          display: "flex",
          gap: 4,
          bgcolor: "#f4f6f8",
          minHeight: "100vh",
        }}
      >
        {/* Columna izquierda */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 4,
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "white",
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#1da3e9",
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            {contact?.nombre?.charAt(0)}
            {contact?.apellidos?.charAt(0)}
          </Avatar>

          <Typography
            variant="h6"
            fontWeight="bold"
            color="text.primary"
            sx={{ mt: 2 }}
          >
            {contact?.nombre} {contact?.apellidos}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contact?.mail}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <IconButton sx={{ bgcolor: "#25D366", color: "white" }}>
              <WhatsAppIcon />
            </IconButton>
            <IconButton sx={{ bgcolor: "#2575FC", color: "white" }}>
              <PhoneIcon />
            </IconButton>
            <IconButton sx={{ bgcolor: "#f50057", color: "white" }}>
              <EventIcon />
            </IconButton>
          </Box>

          <Divider sx={{ width: "100%", my: 3 }} />

          {/* Info de contacto */}
          <Typography variant="body2">📞 {contact.telefono}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Tipo de cliente:{" "}
            <Chip
              size="small"
              label={contact.tipo_cliente || "No definido"}
              color="warning"
            />
          </Typography>
          <Typography variant="body2">Origen: {contact.origen}</Typography>
          <Typography variant="body2">
            Producto de interés: {contact.prod_interes}
          </Typography>
          <Typography variant="body2">Visitas: {contact.visitas}</Typography>
          <Typography variant="body2">
            Última visita: {contact.fecha_ult_visita}
          </Typography>
        </Paper>

        {/* Columna derecha */}
        <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Metric cards + botón editar */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "stretch" }}>
            {statCards.map((stat, i) => (
              <Paper
                key={i}
                elevation={3}
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: "16px",
                  color: "white",
                  bgcolor: stat.color,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontWeight: "bold" }}
                >
                  {stat.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
                  {stat.value}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Timeline */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 4,
              borderRadius: "16px",
              bgcolor: "white",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#1a237e" }}
            >
              📌 Historial de touchpoints
            </Typography>
            <Typography>
              Consulta el historial de touchpoints con el cliente
            </Typography>
            {touchpoints.length === 0 && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                <Typography variant="h5" sx={{ mt: 2 }} color="text.secondary">
                  No hay touchpoints registrados.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Una vez que se registren touchpoints, aparecerán aquí. Si
                  quieres registrar un touchpoint manualmente, selecciona
                  "Agregar Touchpoint".
                </Typography>
              </Box>
            )}
            <Timeline position="right">
              {touchpoints.map((tp, idx) => (
                <TimelineItem key={tp.id_touchpoint}>
                  <TimelineOppositeContent
                    sx={{
                      m: "auto 0",
                      color: "text.secondary",
                      fontSize: "0.8rem",
                    }}
                  >
                    {dayjs(tp.fecha_touchpoint).format("HH:mm")}
                  </TimelineOppositeContent>

                  <TimelineSeparator
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <TimelineDot
                      sx={{
                        bgcolor:
                          tp.tipo_touchpoint === "mail"
                            ? "#1976d2"
                            : tp.tipo_touchpoint === "whatsapp"
                            ? "#25D366"
                            : tp.tipo_touchpoint === "llamada"
                            ? "#6A11CB"
                            : "#FF9800",
                        color: "white",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getTouchpointIcon(tp.tipo_touchpoint)}
                    </TimelineDot>
                    {idx < touchpoints.length - 1 && (
                      <TimelineConnector
                        sx={{
                          flex: 1,
                          bgcolor: "#ccc",
                          width: 2,
                          mt: 1,
                        }}
                      />
                    )}
                  </TimelineSeparator>

                  <TimelineContent sx={{ py: 2, px: 3 }}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: "12px" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{
                          color:
                            tp.tipo_touchpoint === "mail"
                              ? "#1976d2"
                              : tp.tipo_touchpoint === "whatsapp"
                              ? "#25D366"
                              : tp.tipo_touchpoint === "llamada"
                              ? "#6A11CB"
                              : "#FF9800",
                        }}
                      >
                        {tp.titulo_touchpoint}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {tp.descripcion_touchpoint}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tp.iniciador_touchpoint
                          ? `Iniciado por ${tp.iniciador_touchpoint}`
                          : "Iniciador desconocido"}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Box>
      </Box>

      <ContactEditModal
        open={openEditModal}
        setOpen={setOpenEditModal}
        contact={contact}
        setContact={setContact}
      />
    </>
  );
};

export default Contacto;
