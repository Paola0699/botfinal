import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const ContactEditModal = ({ open, setOpen, contact, setContact }) => {
  const TABLE_NAME = "chat_crm";

  const [formValues, setFormValues] = useState({
    nombre: "",
    apellidos: "",
    mail: "",
    telefono: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Inicializar valores cuando abre
  useEffect(() => {
    if (open) {
      setFormValues({
        nombre: contact?.nombre || "",
        apellidos: contact?.apellidos || "",
        mail: contact?.mail || "",
        telefono: contact?.telefono || "",
      });
      setFeedback({ type: "", message: "" }); // solo limpiar al abrir
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" }); // limpiar antes de enviar

    // Validación simple
    if (formValues.mail && !/\S+@\S+\.\S+/.test(formValues.mail)) {
      setFeedback({
        type: "error",
        message: "El correo no tiene un formato válido.",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(formValues)
      .eq("session_id", contact.session_id);

    if (error) {
      setFeedback({
        type: "error",
        message: "Ocurrió un error al actualizar el contacto.",
      });
    } else {
      setContact((prev) => ({ ...prev, ...formValues }));
      setFeedback({
        type: "success",
        message: "Contacto actualizado correctamente.",
      });
    }

    setLoading(false);
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Paper
        elevation={4}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 450,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: "#1da3e9", color: "white", px: 3, py: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Editar contacto
          </Typography>
        </Box>

        {/* Body */}
        <Box sx={{ p: 4 }}>
          {/* Feedback estático */}
          {feedback.message && (
            <Alert severity={feedback.type} sx={{ mb: 4 }}>
              {feedback.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Nombre"
                name="nombre"
                value={formValues.nombre}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Apellidos"
                name="apellidos"
                value={formValues.apellidos}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Correo electrónico"
                name="mail"
                value={formValues.mail}
                onChange={handleChange}
                type="email"
                fullWidth
              />
              <TextField
                label="Teléfono"
                name="telefono"
                value={formValues.telefono}
                onChange={handleChange}
                type="tel"
                fullWidth
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit" // 👈 importante para que funcione el feedback
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: "#1da3e9",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#178cc7" },
                    minWidth: 100,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>

        <Divider />
      </Paper>
    </Modal>
  );
};

export default ContactEditModal;
