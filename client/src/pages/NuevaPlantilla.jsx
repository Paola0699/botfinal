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
  ButtonGroup,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MicIcon from "@mui/icons-material/Mic";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import LinkIcon from "@mui/icons-material/Link";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import NotesIcon from "@mui/icons-material/Notes";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

// Lista de idiomas disponibles con su código y nombre
const AVAILABLE_LANGUAGES = [
  { code: "es_MX", name: "Spanish (Mexico)" },
  { code: "en_US", name: "English (United States)" },
  { code: "pt_BR", name: "Portuguese (Brazil)" },
  { code: "fr_FR", name: "French (France)" },
  { code: "de_DE", name: "German (Germany)" },
  { code: "it_IT", name: "Italian (Italy)" },
  { code: "ja_JP", name: "Japanese (Japan)" },
  { code: "ko_KR", name: "Korean (Korea)" },
  { code: "zh_CN", name: "Chinese (Simplified)" },
  // Puedes añadir más idiomas aquí
];

// Mapeo de categorías del UI a las de la API de Facebook
const CATEGORY_MAP = {
  "Marketing Lite": "MARKETING_LITE",
  Marketing: "MARKETING",
  Utility: "UTILITY",
};

const NuevaPlantilla = () => {
  const [templateName, setTemplateName] = useState("Mi Plantilla");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' | 'error' | 'warning' | 'info'
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Función para inicializar el estado de la plantilla (útil para resetear)
  const getInitialTemplateState = useCallback(() => {
    const initialVersionId = uuidv4();
    return {
      templateVersions: [
        {
          id: initialVersionId,
          languageCode: "es_MX",
          category: "Marketing",
          message:
            "Hola {{first_name}}, aquí tienes los detalles de tu cita del {{date}}.",
          footer: 'Escribe "baja" si ya no quieres recibir estos mensajes',
          buttonText: "Ver detalles",
          buttonUrl: "https://tudominio.com/citas/{{user_id}}",
          headerType: "Image",
          headerText: "Encabezado de prueba",
          imageFile: null,
          imagePreview: null,
          videoFile: null,
          videoPreview: null,
          documentFile: null,
          documentPreview: null,
          variableSamples: {
            first_name: "Rob",
            date: "18 de Septiembre",
            user_id: "12345",
          },
        },
      ],
      activeVersionId: initialVersionId,
    };
  }, []);

  const initialFormState = getInitialTemplateState();

  const [templateVersions, setTemplateVersions] = useState(
    initialFormState.templateVersions
  );
  const [activeVersionId, setActiveVersionId] = useState(
    initialFormState.activeVersionId
  );

  const [showAddLanguageDropdown, setShowAddLanguageDropdown] = useState(false);
  const [newLanguageCodeToAdd, setNewLanguageCodeToAdd] = useState("");

  const activeVersion = templateVersions.find((v) => v.id === activeVersionId);

  const updateActiveVersionField = useCallback(
    (field, value) => {
      setTemplateVersions((prevVersions) =>
        prevVersions.map((v) =>
          v.id === activeVersionId ? { ...v, [field]: value } : v
        )
      );
    },
    [activeVersionId]
  );

  const extractVariables = useCallback((text) => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [...(text || "").matchAll(regex)];
    const variables = matches.map((match) => match[1]);
    return [...new Set(variables)];
  }, []);

  useEffect(() => {
    if (!activeVersion) return;

    const newDetectedVariables = extractVariables(activeVersion.message);
    const updatedSamples = { ...activeVersion.variableSamples };

    newDetectedVariables.forEach((variable) => {
      if (!(variable in updatedSamples)) {
        updatedSamples[variable] = "";
      }
    });
    for (const key in updatedSamples) {
      if (!newDetectedVariables.includes(key)) {
        delete updatedSamples[key];
      }
    }
    if (
      JSON.stringify(updatedSamples) !==
      JSON.stringify(activeVersion.variableSamples)
    ) {
      updateActiveVersionField("variableSamples", updatedSamples);
    }
  }, [
    activeVersion?.message,
    activeVersion?.variableSamples,
    extractVariables,
    updateActiveVersionField,
    activeVersion,
  ]);

  const handleFileUpload = useCallback(
    (type, e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === "Image") {
            updateActiveVersionField("imageFile", file);
            updateActiveVersionField("imagePreview", reader.result);
            updateActiveVersionField("headerType", "Image");
          } else if (type === "Video") {
            updateActiveVersionField("videoFile", file);
            updateActiveVersionField("videoPreview", reader.result);
            updateActiveVersionField("headerType", "Video");
          } else if (type === "File") {
            updateActiveVersionField("documentFile", file);
            updateActiveVersionField("documentPreview", file.name);
            updateActiveVersionField("headerType", "File");
          }
        };
        reader.readAsDataURL(file);
      } else {
        handleRemoveFile(type);
      }
    },
    [updateActiveVersionField]
  );

  const handleRemoveFile = useCallback(
    (type) => {
      if (type === "Image") {
        updateActiveVersionField("imageFile", null);
        updateActiveVersionField("imagePreview", null);
      } else if (type === "Video") {
        updateActiveVersionField("videoFile", null);
        updateActiveVersionField("videoPreview", null);
      } else if (type === "File") {
        updateActiveVersionField("documentFile", null);
        updateActiveVersionField("documentPreview", null);
      }
    },
    [updateActiveVersionField]
  );

  const handleAddNewLanguageVersion = useCallback(() => {
    if (newLanguageCodeToAdd) {
      const selectedLang = AVAILABLE_LANGUAGES.find(
        (lang) => lang.code === newLanguageCodeToAdd
      );
      if (
        selectedLang &&
        !templateVersions.some((v) => v.languageCode === newLanguageCodeToAdd)
      ) {
        const newVersionId = uuidv4();
        const newVersion = {
          id: newVersionId,
          languageCode: newLanguageCodeToAdd,
          category: activeVersion.category,
          message: activeVersion.message,
          footer: activeVersion.footer,
          buttonText: activeVersion.buttonText,
          buttonUrl: activeVersion.buttonUrl,
          headerType: activeVersion.headerType,
          headerText: activeVersion.headerText,
          imageFile: null,
          imagePreview: null,
          videoFile: null,
          videoPreview: null,
          documentFile: null,
          documentPreview: null,
          variableSamples: {},
        };
        setTemplateVersions((prev) => [...prev, newVersion]);
        setActiveVersionId(newVersionId);
        setShowAddLanguageDropdown(false);
        setNewLanguageCodeToAdd("");
      }
    }
  }, [newLanguageCodeToAdd, templateVersions, activeVersion]);

  const handleDeleteTemplateVersion = useCallback(
    (idToDelete) => {
      if (templateVersions.length <= 1) {
        setSnackbarSeverity("warning");
        setSnackbarMessage(
          "No puedes eliminar el único idioma de la plantilla."
        );
        setSnackbarOpen(true);
        return;
      }

      const updatedVersions = templateVersions.filter(
        (v) => v.id !== idToDelete
      );
      setTemplateVersions(updatedVersions);
      if (activeVersionId === idToDelete) {
        setActiveVersionId(updatedVersions[0]?.id || "");
      }
    },
    [templateVersions, activeVersionId]
  );

  const resetForm = useCallback(() => {
    const initialState = getInitialTemplateState();
    setTemplateName("Mi Plantilla");
    setTemplateVersions(initialState.templateVersions);
    setActiveVersionId(initialState.activeVersionId);
    setShowAddLanguageDropdown(false);
    setNewLanguageCodeToAdd("");
  }, [getInitialTemplateState]);

  const buildApiPayload = useCallback(() => {
    if (!activeVersion) return null;

    const components = [];
    const allVariables = new Set();
    const variableMap = {};
    let variableCounter = 1;

    const replaceNamedVariablesWithNumbered = (text) => {
      return (text || "").replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        if (!allVariables.has(varName)) {
          allVariables.add(varName);
          variableMap[varName] = variableCounter++;
        }
        return `{{${variableMap[varName]}}}`;
      });
    };

    if (activeVersion.headerType !== "None") {
      const headerComponent = {
        type: "HEADER",
        format: activeVersion.headerType.toUpperCase(),
      };

      if (activeVersion.headerType === "Text") {
        headerComponent.text = replaceNamedVariablesWithNumbered(
          activeVersion.headerText
        );
      } else if (activeVersion.headerType === "Image") {
        headerComponent.example = {
          header_handle: [
            activeVersion.imagePreview &&
            activeVersion.imagePreview.startsWith("data:")
              ? "https://your-public-image-url.com/placeholder.jpg"
              : activeVersion.imagePreview ||
                "https://your-public-image-url.com/default.jpg",
          ],
        };
      } else if (activeVersion.headerType === "Video") {
        headerComponent.example = {
          header_handle: [
            activeVersion.videoPreview &&
            activeVersion.videoPreview.startsWith("data:")
              ? "https://your-public-video-url.com/placeholder.mp4"
              : activeVersion.videoPreview ||
                "https://your-public-video-url.com/default.mp4",
          ],
        };
      } else if (activeVersion.headerType === "File") {
        headerComponent.example = {
          header_handle: [
            activeVersion.documentFile
              ? "https://your-public-document-url.com/placeholder.pdf"
              : "https://your-public-document-url.com/default.pdf",
          ],
        };
      }
      components.push(headerComponent);
    }

    const bodyTextWithNumberedVars = replaceNamedVariablesWithNumbered(
      activeVersion.message
    );
    const bodyComponent = {
      type: "BODY",
      text: bodyTextWithNumberedVars,
    };

    const bodyVariables = extractVariables(activeVersion.message);
    if (bodyVariables.length > 0) {
      bodyComponent.example = {
        body_text: [
          bodyVariables.map(
            (varName) =>
              activeVersion.variableSamples[varName] ||
              `SAMPLE_${varName.toUpperCase()}`
          ),
        ],
      };
    }
    components.push(bodyComponent);

    if (activeVersion.buttonText) {
      const buttonUrlWithNumberedVars = replaceNamedVariablesWithNumbered(
        activeVersion.buttonUrl
      );
      const buttonsComponent = {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: activeVersion.buttonText,
            url: buttonUrlWithNumberedVars,
          },
        ],
      };
      const urlVariables = extractVariables(activeVersion.buttonUrl);
      if (urlVariables.length > 0) {
        buttonsComponent.buttons[0].example = urlVariables.map(
          (varName) =>
            activeVersion.variableSamples[varName] ||
            `SAMPLE_${varName.toUpperCase()}`
        );
      }
      components.push(buttonsComponent);
    }

    if (activeVersion.footer) {
      components.push({
        type: "FOOTER",
        text: activeVersion.footer,
      });
    }

    return {
      name: templateName.toLowerCase().replace(/[^a-z0-9_]+/g, "_"),
      language: activeVersion.languageCode,
      category: CATEGORY_MAP[activeVersion.category] || "MARKETING",
      allow_category_change: true,
      components: components,
    };
  }, [activeVersion, templateName, extractVariables]);

  const handleSubmitToFacebook = useCallback(async () => {
    setIsSubmitting(true);

    if (!templateName.trim()) {
      setSnackbarSeverity("error");
      setSnackbarMessage("El nombre de la plantilla es obligatorio.");
      setSnackbarOpen(true);
      setIsSubmitting(false);
      return;
    }
    if (!activeVersion.message.trim()) {
      setSnackbarSeverity("error");
      setSnackbarMessage("El mensaje de la plantilla es obligatorio.");
      setSnackbarOpen(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = buildApiPayload();
      if (!payload) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Error al construir el payload de la plantilla.");
        setSnackbarOpen(true);
        setIsSubmitting(false);
        return;
      }

      console.log(
        "Payload enviado al backend:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch("/api/create-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbarSeverity("success");
        setSnackbarMessage("Plantilla enviada a revisión con éxito.");
        setSnackbarOpen(true);
        resetForm();
        console.log("Respuesta del backend (Facebook):", data);
      } else {
        const errorMessage =
          data.error?.error?.error_user_title ||
          data.error?.error?.error_user_msg ||
          data.error?.error?.message ||
          data.error?.message ||
          "Error desconocido al enviar la plantilla.";

        setSnackbarSeverity("error");
        setSnackbarMessage("Error: " + errorMessage);
        setSnackbarOpen(true);
        console.error("Error del backend (Facebook):", data);
      }
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage(
        "Error de red o inesperado al enviar la plantilla: " + error.message
      );
      setSnackbarOpen(true);
      console.error("Error al enviar la plantilla:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [templateName, activeVersion, buildApiPayload, resetForm]);

  const renderHeaderInput = useCallback(() => {
    if (!activeVersion) return null;
    switch (activeVersion.headerType) {
      case "Text":
        return (
          <TextField
            label="Texto del encabezado"
            value={activeVersion.headerText}
            onChange={(e) =>
              updateActiveVersionField("headerText", e.target.value)
            }
            fullWidth
            margin="normal"
            size="small"
            placeholder="Máximo 60 caracteres"
            inputProps={{ maxLength: 60 }}
          />
        );
      case "Image":
        return (
          <>
            {!activeVersion.imageFile ? (
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
                  bgcolor: "#f0f0f0",
                  borderRadius: "4px",
                }}
              >
                Subir imagen
                <input
                  type="file"
                  hidden
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={(e) => handleFileUpload("Image", e)}
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
                <Typography>{activeVersion.imageFile.name}</Typography>
                <IconButton
                  onClick={() => handleRemoveFile("Image")}
                  size="small"
                >
                  {" "}
                  <DeleteIcon fontSize="small" />{" "}
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
          </>
        );
      case "Video":
        return (
          <>
            {!activeVersion.videoFile ? (
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
                  bgcolor: "#f0f0f0",
                  borderRadius: "4px",
                }}
              >
                Subir video
                <input
                  type="file"
                  hidden
                  accept="video/mp4, video/3gp"
                  onChange={(e) => handleFileUpload("Video", e)}
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
                <Typography>{activeVersion.videoFile.name}</Typography>
                <IconButton
                  onClick={() => handleRemoveFile("Video")}
                  size="small"
                >
                  {" "}
                  <DeleteIcon fontSize="small" />{" "}
                </IconButton>
              </Box>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              mt={1}
              display="block"
            >
              Video debe estar en mp4 o 3gp, y no ser mayor de 16 mb.
            </Typography>
          </>
        );
      case "File":
        return (
          <>
            {!activeVersion.documentFile ? (
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
                  bgcolor: "#f0f0f0",
                  borderRadius: "4px",
                }}
              >
                Subir archivo
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleFileUpload("File", e)}
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
                <Typography>{activeVersion.documentFile.name}</Typography>
                <IconButton
                  onClick={() => handleRemoveFile("File")}
                  size="small"
                >
                  {" "}
                  <DeleteIcon fontSize="small" />{" "}
                </IconButton>
              </Box>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              mt={1}
              display="block"
            >
              Cualquier tipo de archivo, no mayor de 100 mb.
            </Typography>
          </>
        );
      default:
        return null;
    }
  }, [
    activeVersion,
    handleFileUpload,
    handleRemoveFile,
    updateActiveVersionField,
  ]);

  const renderMessageWithSamples = useCallback(() => {
    if (!activeVersion) return "";
    let previewMessage = activeVersion.message;
    const detectedVars = extractVariables(activeVersion.message);
    for (const variable of detectedVars) {
      const sample =
        activeVersion.variableSamples[variable] || `{{${variable}}}`;
      previewMessage = previewMessage.replace(
        new RegExp(`\\{\\{${variable}\\}\\}`, "g"),
        sample
      );
    }
    return previewMessage;
  }, [activeVersion, extractVariables]);

  // Obtener el nombre a mostrar para el idioma activo
  const activeLanguageDisplayName =
    AVAILABLE_LANGUAGES.find(
      (lang) => lang.code === activeVersion?.languageCode
    )?.name ||
    activeVersion?.languageCode ||
    "N/A";

  // Obtener idiomas disponibles para añadir (los que no están ya en templateVersions)
  const availableLanguagesForSelection = AVAILABLE_LANGUAGES.filter(
    (lang) => !templateVersions.some((v) => v.languageCode === lang.code)
  );

  if (!activeVersion) return <Typography>Cargando...</Typography>; // Manejar el renderizado inicial

  const staticPreviewImage = "https://i.imgur.com/L1M4r9R.png"; // Imagen de previsualización estática

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
            {templateName} • {activeLanguageDisplayName}
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
            onClick={handleSubmitToFacebook}
            disabled={isSubmitting} // Deshabilitar el botón mientras se envía
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Enviar a Revisión"
            )}
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
          helperText="El nombre de la plantilla debe ser único, en minúsculas y sin espacios (se reemplazarán por guiones bajos)."
          error={
            !templateName.trim() &&
            !isSubmitting &&
            snackbarSeverity === "error" &&
            snackbarMessage.includes("nombre")
          }
        />

        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Categoría de plantillas</InputLabel>
          <Select
            value={activeVersion.category}
            label="Categoría de plantillas"
            onChange={(e) =>
              updateActiveVersionField("category", e.target.value)
            }
          >
            <MenuItem value="Marketing Lite">Marketing Lite</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Utility">Utility</MenuItem>
          </Select>
        </FormControl>

        <Box mt={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Idiomas
          </Typography>
          <Box
            display="flex"
            flexWrap="wrap"
            alignItems="center"
            mt={1}
            gap={1}
          >
            {/* Chips para cada versión de idioma existente */}
            {templateVersions.map((version) => {
              const langDisplayName =
                AVAILABLE_LANGUAGES.find(
                  (lang) => lang.code === version.languageCode
                )?.name || version.languageCode;
              return (
                <Chip
                  key={version.id}
                  label={langDisplayName}
                  sx={{
                    bgcolor:
                      version.id === activeVersionId ? "#e0f2f1" : "#e8f5e9", // Resaltar el idioma activo
                    color:
                      version.id === activeVersionId ? "#00796b" : "#2e7d32",
                    fontWeight: "bold",
                    borderRadius: "4px",
                    "& .MuiChip-deleteIcon": {
                      color:
                        version.id === activeVersionId ? "#00796b" : "#2e7d32",
                    },
                  }}
                  onDelete={
                    templateVersions.length > 1
                      ? () => handleDeleteTemplateVersion(version.id)
                      : undefined
                  } // Solo permitir eliminar si hay más de uno
                  onClick={() => setActiveVersionId(version.id)} // Activar el idioma al hacer clic
                />
              );
            })}
            {/* Botón "+ Nuevo idioma" o desplegable de selección */}
            {!showAddLanguageDropdown ? (
              <Button
                size="small"
                sx={{ textTransform: "none" }}
                onClick={() => setShowAddLanguageDropdown(true)}
              >
                + Nuevo idioma
              </Button>
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Seleccionar idioma</InputLabel>
                  <Select
                    value={newLanguageCodeToAdd}
                    onChange={(e) => setNewLanguageCodeToAdd(e.target.value)}
                    label="Seleccionar idioma"
                    autoFocus
                    onClose={() => {
                      // Si no se seleccionó ningún idioma, ocultar el desplegable
                      if (!newLanguageCodeToAdd)
                        setShowAddLanguageDropdown(false);
                    }}
                  >
                    {availableLanguagesForSelection.length === 0 && (
                      <MenuItem disabled>
                        No hay más idiomas disponibles
                      </MenuItem>
                    )}
                    {availableLanguagesForSelection.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code.split("_")[0].toUpperCase()}){" "}
                        {/* Mostrar nombre y clave */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {newLanguageCodeToAdd && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleAddNewLanguageVersion}
                    sx={{ textTransform: "none" }}
                  >
                    Añadir
                  </Button>
                )}
                {!newLanguageCodeToAdd && (
                  <Button
                    size="small"
                    onClick={() => setShowAddLanguageDropdown(false)}
                  >
                    Cancelar
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Typography variant="subtitle1" mt={3} sx={{ fontWeight: "bold" }}>
          Encabezado{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            (opcional)
          </Typography>
        </Typography>

        {/* Botones de Selección de Tipo de Encabezado */}
        <ButtonGroup
          fullWidth
          aria-label="header type selection"
          sx={{ mt: 1, mb: 2 }}
        >
          <Button
            startIcon={<NotesIcon />}
            onClick={() => updateActiveVersionField("headerType", "Text")}
            variant={
              activeVersion.headerType === "Text" ? "contained" : "outlined"
            }
            sx={
              activeVersion.headerType === "Text"
                ? {}
                : {
                    bgcolor: "#f0f0f0", // Light grey background
                    color: "#555", // Dark grey text
                    borderColor: "#ccc", // Subtle border color
                    "&:hover": {
                      bgcolor: "#e0e0e0", // Slightly darker grey on hover
                      borderColor: "#bbb",
                    },
                  }
            }
          >
            Texto
          </Button>
          <Button
            startIcon={<ImageIcon />}
            onClick={() => updateActiveVersionField("headerType", "Image")}
            variant={
              activeVersion.headerType === "Image" ? "contained" : "outlined"
            }
            sx={
              activeVersion.headerType === "Image"
                ? {}
                : {
                    bgcolor: "#f0f0f0",
                    color: "#555",
                    borderColor: "#ccc",
                    "&:hover": {
                      bgcolor: "#e0e0e0",
                      borderColor: "#bbb",
                    },
                  }
            }
          >
            Imagen
          </Button>
          <Button
            startIcon={<VideoCallIcon />}
            onClick={() => updateActiveVersionField("headerType", "Video")}
            variant={
              activeVersion.headerType === "Video" ? "contained" : "outlined"
            }
            sx={
              activeVersion.headerType === "Video"
                ? {}
                : {
                    bgcolor: "#f0f0f0",
                    color: "#555",
                    borderColor: "#ccc",
                    "&:hover": {
                      bgcolor: "#e0e0e0",
                      borderColor: "#bbb",
                    },
                  }
            }
          >
            Video
          </Button>
          <Button
            startIcon={<InsertDriveFileIcon />}
            onClick={() => updateActiveVersionField("headerType", "File")}
            variant={
              activeVersion.headerType === "File" ? "contained" : "outlined"
            }
            sx={
              activeVersion.headerType === "File"
                ? {}
                : {
                    bgcolor: "#f0f0f0",
                    color: "#555",
                    borderColor: "#ccc",
                    "&:hover": {
                      bgcolor: "#e0e0e0",
                      borderColor: "#bbb",
                    },
                  }
            }
          >
            Archivo
          </Button>
        </ButtonGroup>

        {/* Renderizar la entrada específica del encabezado según el tipo seleccionado */}
        {renderHeaderInput()}

        <TextField
          label="Mensaje"
          value={activeVersion.message}
          onChange={(e) => updateActiveVersionField("message", e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          size="small"
          helperText="Usa {{variable_name}} para insertar variables. Ej: {{first_name}}"
          error={
            !activeVersion.message.trim() &&
            !isSubmitting &&
            snackbarSeverity === "error" &&
            snackbarMessage.includes("mensaje")
          }
        />

        {/* Sección de Muestras de Variables */}
        {Object.keys(activeVersion.variableSamples).length > 0 && (
          <Box mt={2} p={2} sx={{ bgcolor: "#e3f2fd", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Proporciona muestras de tus variables
            </Typography>
            <Typography variant="caption" color="text.secondary" mb={1}>
              Por favor, proporciona muestras para las variables y campos usados
              para que puedan ser verificadas por WhatsApp. Ej., Nombre → John.
            </Typography>
            {Object.keys(activeVersion.variableSamples).map((variable) => (
              <Box key={variable} display="flex" alignItems="center" mt={1}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {variable}
                </Typography>
                <TextField
                  value={activeVersion.variableSamples[variable]}
                  onChange={(e) =>
                    updateActiveVersionField("variableSamples", {
                      ...activeVersion.variableSamples,
                      [variable]: e.target.value,
                    })
                  }
                  size="small"
                  placeholder={`Ej: ${
                    variable === "first_name" ? "Rob" : "Valor de ejemplo"
                  }`}
                  fullWidth
                />
              </Box>
            ))}
          </Box>
        )}

        <TextField
          label="Pie de página"
          value={activeVersion.footer}
          onChange={(e) => updateActiveVersionField("footer", e.target.value)}
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
          value={activeVersion.buttonText}
          onChange={(e) =>
            updateActiveVersionField("buttonText", e.target.value)
          }
          fullWidth
          margin="dense"
          size="small"
        />
        <TextField
          label="URL del botón"
          value={activeVersion.buttonUrl}
          onChange={(e) =>
            updateActiveVersionField("buttonUrl", e.target.value)
          }
          fullWidth
          margin="dense"
          size="small"
        />
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
            backgroundColor: "white",
            height: 600,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Barra superior (Hora, Señal, Batería) - Estática para coincidir con la captura de pantalla */}
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
              {" "}
              12:17 PM{" "}
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="caption" sx={{ mr: 0.5 }}>
                {" "}
                📶{" "}
              </Typography>
              <Typography variant="caption" sx={{ mr: 0.5 }}>
                {" "}
                🔋{" "}
              </Typography>
            </Box>
          </Box>

          {/* Barra superior de WhatsApp */}
          <Box
            sx={{
              height: 60,
              bgcolor: "#075E54",
              display: "flex",
              alignItems: "center",
              px: 2,
              mt: 4,
              position: "relative",
              zIndex: 1,
            }}
          >
            <IconButton size="small" sx={{ color: "white", mr: 1 }}>
              {" "}
              <ArrowBackIcon />{" "}
            </IconButton>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: "#e0e0e0",
                mr: 1,
              }}
            ></Box>
            <Typography color="white" fontWeight="bold" sx={{ flexGrow: 1 }}>
              {" "}
              Señeros{" "}
            </Typography>
            <IconButton size="small" sx={{ color: "white" }}>
              {" "}
              <SearchIcon />{" "}
            </IconButton>
            <IconButton size="small" sx={{ color: "white" }}>
              {" "}
              <MoreVertIcon />{" "}
            </IconButton>
          </Box>

          {/* Contenido del chat */}
          <CardContent
            sx={{
              flex: 1,
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: 1,
              backgroundColor: "#ECE5DD",
              backgroundImage:
                "url(https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b7f34b22c7b50d15de.png)",
              backgroundSize: "cover",
            }}
          >
            {/* Previsualización del Encabezado */}
            {activeVersion.headerType === "Text" &&
              activeVersion.headerText && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    maxWidth: "90%",
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    p: 1,
                    boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-10px",
                      width: 0,
                      height: 0,
                      borderStyle: "solid",
                      borderWidth: "0 10px 10px 0",
                      borderColor:
                        "transparent #FFFFFF transparent transparent",
                    },
                  }}
                >
                  <Typography variant="body2">
                    {activeVersion.headerText}
                  </Typography>
                </Box>
              )}
            {activeVersion.headerType === "Image" &&
              (activeVersion.imagePreview || staticPreviewImage) && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    maxWidth: "90%",
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
                    mb: 1,
                  }}
                >
                  <img
                    src={activeVersion.imagePreview || staticPreviewImage}
                    alt="Preview"
                    style={{
                      width: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}
            {activeVersion.headerType === "Video" &&
              (activeVersion.videoPreview || activeVersion.videoFile) && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    maxWidth: "90%",
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 100,
                  }}
                >
                  <VideocamIcon sx={{ fontSize: 40, color: "#9e9e9e" }} />
                  <Typography variant="caption" color="text.secondary" ml={1}>
                    {activeVersion.videoFile
                      ? activeVersion.videoFile.name
                      : "Video Preview"}
                  </Typography>
                </Box>
              )}
            {activeVersion.headerType === "File" &&
              (activeVersion.documentPreview || activeVersion.documentFile) && (
                <Box
                  sx={{
                    alignSelf: "flex-start",
                    maxWidth: "90%",
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 100,
                  }}
                >
                  <InsertDriveFileIcon
                    sx={{ fontSize: 40, color: "#9e9e9e" }}
                  />
                  <Typography variant="caption" color="text.secondary" ml={1}>
                    {activeVersion.documentFile
                      ? activeVersion.documentFile.name
                      : "Document Preview"}
                  </Typography>
                </Box>
              )}

            {/* Burbuja de Mensaje */}
            <Box
              sx={{
                alignSelf: "flex-start",
                maxWidth: "90%",
                bgcolor: "#FFFFFF",
                borderRadius: "8px",
                p: 1,
                boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
                position: "relative",
                "&::before": {
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
                {" "}
                {renderMessageWithSamples()}{" "}
              </Typography>
              {activeVersion.footer && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    textAlign: "right",
                    fontSize: "0.65rem",
                  }}
                >
                  {activeVersion.footer}
                </Typography>
              )}
            </Box>

            {/* Botón como respuesta rápida */}
            {activeVersion.buttonText && (
              <Button
                variant="contained"
                fullWidth
                startIcon={<LinkIcon />}
                href={`https://${activeVersion.buttonUrl}`}
                target="_blank"
                sx={{
                  textTransform: "none",
                  bgcolor: "#F0F2F5",
                  color: "#005C4B",
                  borderRadius: "20px",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#E0E2E5", boxShadow: "none" },
                  mt: 1,
                  maxWidth: "90%",
                  alignSelf: "flex-start",
                }}
              >
                {activeVersion.buttonText}
              </Button>
            )}
          </CardContent>

          {/* Entrada de mensaje en la parte inferior */}
          <Box
            sx={{
              bgcolor: "#F0F2F5",
              p: 1,
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <IconButton size="small" sx={{ color: "#9e9e9e" }}>
              {" "}
              <InsertEmoticonIcon />{" "}
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
              {" "}
              <AttachFileIcon />{" "}
            </IconButton>
            <IconButton size="small" sx={{ color: "#9e9e9e" }}>
              {" "}
              <CameraAltIcon />{" "}
            </IconButton>
            <IconButton size="small" sx={{ color: "#075E54" }}>
              {" "}
              <MicIcon />{" "}
            </IconButton>
          </Box>
        </Card>
      </Box>

      {/* Snackbar para mensajes de feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NuevaPlantilla;
