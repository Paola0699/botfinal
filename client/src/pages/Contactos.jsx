import {
  Box,
  Button,
  TextField,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  InputAdornment,
  CircularProgress,
  TablePagination, // Importar TablePagination
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { useState, useEffect } from "react";

// Importar iconos para la temperatura
import AcUnitIcon from "@mui/icons-material/AcUnit"; // Frío (copo de nieve)
import WbSunnyIcon from "@mui/icons-material/WbSunny"; // Tibio (sol pequeño)
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment"; // Caliente (fuego)
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"; // Desconocido

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_ID = import.meta.env.VITE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_TABLE_NAME;

// --- Lógica para el color dinámico del chip de Tipo de Cliente ---
const getClientTypeColor = (clientType) => {
  switch (
    clientType?.toLowerCase() // Usar toLowerCase para manejar mayúsculas/minúsculas
  ) {
    case "prospecto":
      return {
        bgcolor: "#FFFDE7", // Amarillo muy claro
        color: "#FFC107", // Amarillo vibrante
      };
    case "paciente":
      return {
        bgcolor: "#E8F5E9", // Verde claro
        color: "#2E7D32", // Verde oscuro
      };
    default:
      return {
        bgcolor: "#EEEEEE", // Gris claro por defecto
        color: "#424242", // Gris oscuro por defecto
      };
  }
};

// --- CONSTANTES Y FUNCIONES DE NORMALIZACIÓN DE TEMPERATURA (reutilizadas) ---
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

// Función para obtener el icono de temperatura
const getTemperatureIcon = (temperatureInternal, size = 18) => {
  // Aumentado el tamaño a 18 para mejor visibilidad
  switch (temperatureInternal) {
    case "frio":
      return <AcUnitIcon sx={{ fontSize: size, color: "#00BFFF", mr: 0.5 }} />; // Azul claro para frío
    case "tibio":
      return <WbSunnyIcon sx={{ fontSize: size, color: "#FFD700", mr: 0.5 }} />; // Amarillo para tibio
    case "caliente":
      return (
        <LocalFireDepartmentIcon
          sx={{ fontSize: size, color: "#FF4500", mr: 0.5 }}
        />
      ); // Naranja-rojo para caliente
    default:
      return (
        <HelpOutlineIcon sx={{ fontSize: size, color: "#999", mr: 0.5 }} />
      ); // Gris para desconocido
  }
};

const ContactosView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Función para obtener los registros de Airtable
  const fetchAirtableRecords = async () => {
    setLoading(true);
    setError(null);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error ${response.status}: ${
            errorData.error?.message || "Error desconocido al obtener leads."
          }`
        );
      }

      const data = await response.json();
      const formattedContacts = data.records.map((record) => {
        // Simulación de temperatura si no existe en Airtable para esta vista
        // En un entorno real, `record.fields.temperatura` debería existir
        const simulatedTemperature = [
          "frio",
          "tibio",
          "caliente",
          "desconocido",
        ][Math.floor(Math.random() * 4)];

        return {
          id: record.id,
          nombre: record.fields.nombre || record.fields.username || "",
          apellido: record.fields.apellidos || "",
          telefono: record.fields.telefono || "",
          mail: record.fields.mail || "",
          // Usar el valor real de Airtable, normalizado. Si no existe, usar 'desconocido'.
          tipoCliente: record.fields.tipo_cliente || "desconocido", // Valor por defecto si no está presente
          // Usar el valor real de Airtable para temperatura, normalizado.
          // Si no existe, usar el simulado (o 'desconocido' si no quieres simular)
          temperatura: normalizeTemperatureInternal(
            record.fields.temperatura || simulatedTemperature
          ),
        };
      });
      setContacts(formattedContacts);
    } catch (err) {
      console.error("Error al obtener leads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAirtableRecords();
  }, []);

  // Filtrar contactos basado en el término de búsqueda
  const filteredContacts = contacts.filter((contact) =>
    Object.values(contact).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handlers de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página al cambiar el número de filas
  };

  const handleChatClick = (contact) => {
    alert(`Iniciando chat con ${contact.nombre} ${contact.apellido}`);
    // Aquí iría la lógica para abrir el chat
  };

  // --- Renderizado Condicional del Loader de Pantalla Completa ---
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

  // --- Renderizado Condicional de Error de Pantalla Completa ---
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          zIndex: 9999,
          color: "error.main",
        }}
      >
        <Typography variant="h5" color="error">
          Error al cargar contactos:
        </Typography>
        <Typography
          variant="body1"
          color="error"
          sx={{ mt: 1, textAlign: "center" }}
        >
          {error}
        </Typography>
        <Button
          onClick={fetchAirtableRecords}
          variant="contained"
          color="error"
          sx={{ mt: 3 }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, boxShadow: 1 }}>
        {/* Sección superior: Búsqueda y Botones de Acción */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
        >
          <TextField
            variant="outlined"
            placeholder="Buscar contacto..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, mr: 2, mb: { xs: 2, sm: 0 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 2,
                background: "linear-gradient(45deg, #6A11CB, #2575FC)",
                textTransform: "capitalize",
              }}
            >
              Crear nuevo
            </Button>
            <Button
              variant="outlined"
              color="primary"
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#6A11CB",
                color: "#6A11CB",
              }}
            >
              Enviar cadena
            </Button>
          </Box>
        </Box>

        {/* Título de la tabla */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Lista de Contactos
        </Typography>

        {/* Tabla de Contactos */}
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 0, border: "1px solid #e0e0e0" }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Apellido</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Mail</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Tipo de Cliente
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron contactos.
                  </TableCell>
                </TableRow>
              ) : (
                // Aplicar paginación aquí
                filteredContacts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((contact) => {
                    const clientTypeStyles = getClientTypeColor(
                      contact.tipoCliente
                    );
                    return (
                      <TableRow
                        key={contact.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* Icono de temperatura */}
                            {getTemperatureIcon(contact.temperatura)}
                            {contact.nombre}
                          </Box>
                        </TableCell>
                        <TableCell>{contact.apellido}</TableCell>
                        <TableCell>{contact.telefono}</TableCell>
                        <TableCell>{contact.mail}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              contact.tipoCliente
                                ? contact.tipoCliente.charAt(0).toUpperCase() +
                                  contact.tipoCliente.slice(1).toLowerCase()
                                : "Desconocido"
                            }
                            sx={{
                              ...clientTypeStyles,
                              fontWeight: "bold",
                              borderRadius: "4px",
                              minWidth: "80px",
                              justifyContent: "center",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ChatBubbleOutlineIcon />}
                            onClick={() => handleChatClick(contact)}
                            sx={{ textTransform: "none" }}
                          >
                            Chat
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Componente de Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Opciones de filas por página
          component="div"
          count={filteredContacts.length} // Total de elementos filtrados
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:" // Etiqueta personalizada
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          } // Formato de texto para el rango
        />
      </Box>
    </Box>
  );
};

export default ContactosView;
