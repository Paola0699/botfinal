import {
  Box,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
  CircularProgress,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AcUnitIcon from "@mui/icons-material/AcUnit";

const TABLE_NAME = import.meta.env.VITE_TABLE_NAME;

const getTemperatureIcon = (temperatureInternal, size = 18) => {
  switch (temperatureInternal) {
    case "frio":
      return <AcUnitIcon sx={{ fontSize: size, color: "#00BFFF", mr: 1 }} />;
    case "tibio":
      return <WbSunnyIcon sx={{ fontSize: size, color: "#FFD700", mr: 1 }} />;
    case "caliente":
      return (
        <LocalFireDepartmentIcon
          sx={{ fontSize: size, color: "#FF4500", mr: 1 }}
        />
      );
    default:
      return <HelpOutlineIcon sx={{ fontSize: size, color: "#999", mr: 1 }} />;
  }
};

const TEMPERATURE_OPTIONS = [
  { value: "", label: "Todas", icon: <HelpOutlineIcon fontSize="small" /> },
  {
    value: "frio",
    label: "Frío",
    icon: <AcUnitIcon fontSize="small" sx={{ color: "#00BFFF" }} />,
  },
  {
    value: "tibio",
    label: "Tibio",
    icon: <WbSunnyIcon fontSize="small" sx={{ color: "#FFD700" }} />,
  },
  {
    value: "caliente",
    label: "Caliente",
    icon: (
      <LocalFireDepartmentIcon fontSize="small" sx={{ color: "#FF4500" }} />
    ),
  },
  {
    value: "desconocido",
    label: "Desconocido",
    icon: <HelpOutlineIcon fontSize="small" sx={{ color: "#9CA3AF" }} />,
  },
];

const getClientTypeColor = (clientType) => {
  switch (clientType?.toLowerCase()) {
    case "prospecto":
      return { bgcolor: "#FFFDE7", color: "#FFC107" };
    case "paciente":
      return { bgcolor: "#E8F5E9", color: "#2E7D32" };
    default:
      return { bgcolor: "#EEEEEE", color: "#424242" };
  }
};

const normalizeTemperatureInternal = (temp) => {
  if (!temp) return "desconocido";
  const lowerTemp = String(temp)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (TEMPERATURE_OPTIONS.map((o) => o.value).includes(lowerTemp))
    return lowerTemp;
  return "desconocido";
};

const ContactosView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [temperatureFilter, setTemperatureFilter] = useState("");
  const navigate = useNavigate();

  // menu del chip dropdown
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleChipClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (value) => {
    if (value !== undefined) setTemperatureFilter(value);
    setAnchorEl(null);
  };

  // paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSupabaseRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from(TABLE_NAME)
        .select("*");
      if (supabaseError) throw new Error(supabaseError.message);

      const formattedContacts = data.map((record) => ({
        id: record.session_id,
        nombre: record.nombre || record.username || "",
        apellido: record.apellidos || "",
        telefono: record.telefono || "",
        mail: record.mail || "",
        tipoCliente: record.tipo_cliente || "desconocido",
        temperatura: normalizeTemperatureInternal(record.temperatura),
      }));
      setContacts(formattedContacts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupabaseRecords();
  }, []);

  const filteredContacts = contacts
    .filter((c) =>
      Object.values(c).some((v) =>
        String(v).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .filter((c) =>
      temperatureFilter ? c.temperatura === temperatureFilter : true
    );

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ bgcolor: "#f9fafb" }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          bgcolor: "white",
        }}
      >
        {/* Encabezado */}
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#111827" }}>
          Mis contactos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Aquí puedes gestionar, filtrar y explorar la lista de todos tus
          contactos.
        </Typography>

        {/* Top bar */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          mb={3}
        >
          {/* Search input minimalista */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              bgcolor: "#f3f4f6",
              borderRadius: "999px",
              px: 2,
            }}
          >
            <SearchIcon sx={{ color: "action.active", mr: 1 }} />
            <input
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                flex: 1,
                fontSize: "0.95rem",
                padding: "10px 0",
                color: "#374151",
              }}
              placeholder="Buscar contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>

          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              sx={{
                borderRadius: "999px",
                px: 3,
                textTransform: "capitalize",
                background: "linear-gradient(45deg, #6A11CB, #2575FC)",
              }}
            >
              Crear nuevo
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderRadius: "999px",
                px: 3,
                textTransform: "capitalize",
                borderColor: "#6A11CB",
                color: "#6A11CB",
              }}
            >
              Enviar cadena
            </Button>
          </Box>
        </Box>

        {/* Filtros */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
          {[
            "Sin respuesta en 24 horas",
            "Sin respuesta en 6 días",
            "No hemos contestado",
            "Número de touchpoints",
          ].map((label, idx) => (
            <Chip
              key={idx}
              label={label}
              variant="outlined"
              clickable
              sx={{ borderRadius: "999px", fontSize: "0.8rem", px: 1.5 }}
            />
          ))}

          {/* Chip con dropdown */}
          <Chip
            label={
              temperatureFilter
                ? TEMPERATURE_OPTIONS.find(
                    (opt) => opt.value === temperatureFilter
                  )?.label
                : "Temperatura"
            }
            onClick={handleChipClick}
            sx={{
              borderRadius: "999px",
              fontSize: "0.8rem",
              px: 1.5,
              bgcolor: temperatureFilter ? "#2575FC" : "transparent",
              color: temperatureFilter ? "white" : "#374151",
              cursor: "pointer",
            }}
          />
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={() => handleMenuClose()}
          >
            {TEMPERATURE_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.value}
                onClick={() => handleMenuClose(opt.value)}
              >
                {opt.icon}
                <Box ml={1}>{opt.label}</Box>
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Tabla de contactos (sin cambios grandes de estilo aquí, sigue moderna) */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& .MuiTableCell-root": {
                    fontWeight: "bold",
                    color: "#374151",
                    bgcolor: "#f9fafb",
                  },
                }}
              >
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Mail</TableCell>
                <TableCell>Tipo de Cliente</TableCell>
                <TableCell align="center">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No se encontraron contactos
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((c) => {
                    const styles = getClientTypeColor(c.tipoCliente);
                    return (
                      <TableRow
                        key={c.id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "#f9f9ff" },
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(`/contacto/${c.id}`)}
                      >
                        {/* Columna Nombre con icono de temperatura */}
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getTemperatureIcon(c.temperatura, 18)}
                            {c.nombre}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ color: "text.secondary" }}>
                          {c.apellido}
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>
                          {c.telefono}
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>
                          {c.mail}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={c.tipoCliente}
                            sx={{
                              ...styles,
                              borderRadius: "999px",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              size="small"
                              sx={{ bgcolor: "#25D366", color: "white" }}
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ bgcolor: "#2575FC", color: "white" }}
                            >
                              <PhoneIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ bgcolor: "#f50057", color: "white" }}
                            >
                              <EventIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredContacts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>
    </Box>
  );
};

export default ContactosView;
