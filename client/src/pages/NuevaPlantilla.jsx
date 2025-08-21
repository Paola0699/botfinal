import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search"; // For search in header
import AttachFileIcon from "@mui/icons-material/AttachFile"; // For paperclip
import CameraAltIcon from "@mui/icons-material/CameraAlt"; // For camera
import MicIcon from "@mui/icons-material/Mic"; // For microphone
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon"; // For emoji icon
import LinkIcon from "@mui/icons-material/Link"; // For the button link icon

import { useState } from "react";

const NuevaPlantilla = () => {
  const [templateName, setTemplateName] = useState("prueba");
  const [category, setCategory] = useState("Marketing");
  const [message, setMessage] = useState(
    "hola esta es una prueba de la plantilla"
  );
  const [footer, setFooter] = useState(
    'Escribe "baja" si ya no quieres recibir estos mensajes'
  );
  const [buttonText, setButtonText] = useState("Google");
  const [buttonUrl, setButtonUrl] = useState("google.com");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState(""); // For "Variable Opcional"

  // Static placeholder image to match the screenshot's marketing banner
  // In a real application, you'd manage this asset or dynamically fetch it.
  const staticPreviewImage = "https://i.imgur.com/L1M4r9R.png"; // Using the image from your screenshot for better match

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Box
      display="flex"
      gap={4}
      p={4}
      sx={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}
    >
      {/* Columna izquierda (formulario) */}
      <Box
        flex={1}
        sx={{ bgcolor: "white", p: 3, borderRadius: 2, boxShadow: 1 }}
      >
        {/* Header con botón enviar */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {templateName} • Spanish (MEX)
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 2,
              background: "linear-gradient(45deg, #6A11CB, #2575FC)",
            }}
          >
            Enviar a Revisión
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Una nueva plantilla requiere la aprobación de Meta antes de su envío,
          lo que puede tardar desde unos minutos hasta 24 horas.
        </Typography>

        <TextField
          label="Nombre de plantilla"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          fullWidth
          margin="normal"
          size="small"
        />

        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Categoría de plantillas</InputLabel>
          <Select
            value={category}
            label="Categoría de plantillas"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Transaccional">Transaccional</MenuItem>
          </Select>
        </FormControl>

        <Box mt={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Idiomas
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <Chip
              label="Spanish (MEX)"
              sx={{
                bgcolor: "#e8f5e9", // Light green background
                color: "#2e7d32", // Darker green text
                fontWeight: "bold",
                borderRadius: "4px",
                "& .MuiChip-deleteIcon": {
                  color: "#2e7d32",
                },
              }}
              onDelete={() => {
                /* Handle delete language */
              }} // onDelete prop makes the delete icon visible
            />
            <Button size="small" sx={{ ml: 2, textTransform: "none" }}>
              + Nuevo idioma
            </Button>
          </Box>
        </Box>

        <Typography variant="subtitle1" mt={3} sx={{ fontWeight: "bold" }}>
          Encabezado{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            (opcional)
          </Typography>
        </Typography>
        {!imageFile ? (
          <Button
            variant="outlined"
            component="label"
            sx={{
              mt: 1,
              textTransform: "none",
              width: "100%",
              justifyContent: "flex-start",
              p: 1.5,
              borderColor: "#ccc",
              color: "#555",
              bgcolor: "#f0f0f0", // Grey background
              borderRadius: "4px",
            }}
          >
            Subir imagen
            <input
              type="file"
              hidden
              accept="image/jpeg, image/jpg, image/png"
              onChange={handleImageUpload}
            />
          </Button>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="#f0f0f0"
            px={2}
            py={1}
            borderRadius={1}
            mt={1}
            sx={{ border: "1px solid #e0e0e0" }}
          >
            <Typography>{imageFile.name}</Typography>
            <IconButton onClick={handleRemoveImage} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          mt={1}
          display="block"
        >
          Imagen debe estar en jpg, jpeg, png, y no ser mayor de 5 mb.
        </Typography>

        <TextField
          label="Mensaje"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          size="small"
        />

        <TextField
          label="Pie de página"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          fullWidth
          margin="normal"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="body2" color="text.secondary">
                  (opcional)
                </Typography>
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="subtitle1" mt={2} sx={{ fontWeight: "bold" }}>
          Botones{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            (opcional)
          </Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Botón URL
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          mb={2}
          display="block"
        >
          Puedes añadir hasta tres botones normales o un botón URL. Solo puedes
          elegir un tipo de botón, no ambos.
        </Typography>

        <TextField
          label="Texto del botón"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          fullWidth
          margin="dense"
          size="small"
        />
        <TextField
          label="URL del botón"
          value={buttonUrl}
          onChange={(e) => setButtonUrl(e.target.value)}
          fullWidth
          margin="dense"
          size="small"
        />

        <Box display="flex" alignItems="center" mt={2}>
          <FormControl fullWidth margin="normal" size="small" sx={{ mr: 1 }}>
            <InputLabel>Variable Opcional</InputLabel>
            <Select
              value={selectedVariable}
              label="Variable Opcional"
              onChange={(e) => setSelectedVariable(e.target.value)}
            >
              <MenuItem value="">Seleccionar variable</MenuItem>
              <MenuItem value="variable1">Variable 1</MenuItem>
              <MenuItem value="variable2">Variable 2</MenuItem>
            </Select>
          </FormControl>
          <IconButton size="small" sx={{ mt: 1 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Columna derecha (preview móvil) */}
      <Box
        flexShrink={0}
        width={300}
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        pt={4}
      >
        <Card
          sx={{
            borderRadius: "40px",
            boxShadow: 4,
            overflow: "hidden",
            backgroundColor: "white", // Inner phone background
            height: 600,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Top Bar (Time, Signal, Battery) - Static for screenshot match */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
              py: 1,
              zIndex: 1,
              color: "black",
              fontSize: "0.8rem",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              5:12 PM
            </Typography>
            <Box display="flex" alignItems="center">
              {/* Using unicode characters for signal/battery for simplicity */}
              <Typography variant="caption" sx={{ mr: 0.5 }}>
                📶
              </Typography>
              <Typography variant="caption" sx={{ mr: 0.5 }}>
                🔋
              </Typography>
            </Box>
          </Box>

          {/* Barra superior WhatsApp */}
          <Box
            sx={{
              height: 60,
              bgcolor: "#075E54",
              display: "flex",
              alignItems: "center",
              px: 2,
              mt: 4, // Push down to make space for the time bar
              position: "relative",
              zIndex: 1,
            }}
          >
            <IconButton size="small" sx={{ color: "white", mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: "#e0e0e0",
                mr: 1,
              }}
            ></Box>{" "}
            {/* Profile pic placeholder */}
            <Typography color="white" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Elementos Life
            </Typography>
            <IconButton size="small" sx={{ color: "white" }}>
              <SearchIcon /> {/* Changed to Search icon as seen in WhatsApp */}
            </IconButton>
            <IconButton size="small" sx={{ color: "white" }}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Contenido del chat */}
          <CardContent
            sx={{
              flex: 1,
              p: 1.5, // Reduced padding to give more chat-like feel
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start", // Messages start from top
              gap: 1, // Space between messages/elements
              // WhatsApp chat background pattern (simplified with color)
              backgroundColor: "#ECE5DD", // Light beige/green for chat background
              backgroundImage:
                "url(https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b7f34b22c7b50d15de.png)", // Optional: real WhatsApp pattern
              backgroundSize: "cover",
            }}
          >
            {/* Image Header - displayed as a message bubble */}
            <Box
              sx={{
                alignSelf: "flex-start", // Align to left
                maxWidth: "90%", // Limit width for bubble effect
                bgcolor: "#FFFFFF", // White background for the image bubble
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 0.5px rgba(0,0,0,.13)", // Subtle shadow
                mb: 1, // Margin below image bubble
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <img
                  src={staticPreviewImage}
                  alt="Static Preview"
                  style={{
                    width: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              )}
            </Box>

            {/* Message Bubble */}
            <Box
              sx={{
                alignSelf: "flex-start", // Align to left (received message)
                maxWidth: "90%", // Limit width for bubble effect
                bgcolor: "#FFFFFF", // White background for received message
                borderRadius: "8px",
                p: 1,
                boxShadow: "0 1px 0.5px rgba(0,0,0,.13)", // Subtle shadow
                position: "relative",
                "&::before": {
                  // Arrow for the bubble
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-10px",
                  width: 0,
                  height: 0,
                  borderStyle: "solid",
                  borderWidth: "0 10px 10px 0",
                  borderColor: "transparent #FFFFFF transparent transparent",
                },
              }}
            >
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {message}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  textAlign: "right",
                  fontSize: "0.65rem",
                }}
              >
                {footer}
              </Typography>
            </Box>

            {/* Button as a quick reply */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<LinkIcon />} // Changed to LinkIcon for a more generic button look
              href={`https://${buttonUrl}`}
              target="_blank"
              sx={{
                textTransform: "none",
                bgcolor: "#F0F2F5", // Lighter grey for quick reply
                color: "#005C4B", // WhatsApp green text
                borderRadius: "20px",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#E0E2E5",
                  boxShadow: "none",
                },
                mt: 1, // Margin top from message bubble
                maxWidth: "90%", // Match bubble width
                alignSelf: "flex-start", // Align to left
              }}
            >
              {buttonText}
            </Button>
          </CardContent>

          {/* Message input at the bottom */}
          <Box
            sx={{
              bgcolor: "#F0F2F5", // Light grey background for input bar
              p: 1,
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #e0e0e0", // Subtle border
            }}
          >
            <IconButton size="small" sx={{ color: "#9e9e9e" }}>
              <InsertEmoticonIcon /> {/* Emoji icon */}
            </IconButton>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Mensaje..."
              fullWidth
              sx={{
                mx: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  bgcolor: "white",
                  height: 36,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent !important",
                },
              }}
            />
            <IconButton size="small" sx={{ color: "#9e9e9e" }}>
              <AttachFileIcon /> {/* Paperclip icon */}
            </IconButton>
            <IconButton size="small" sx={{ color: "#9e9e9e" }}>
              <CameraAltIcon /> {/* Camera icon */}
            </IconButton>
            <IconButton size="small" sx={{ color: "#075E54" }}>
              <MicIcon /> {/* Microphone icon */}
            </IconButton>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default NuevaPlantilla;
