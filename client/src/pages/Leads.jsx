import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import { useEffect, useRef, useState } from "react";
import LeadsColumn from "../leads/LeadsColumn"; // Asegúrate de que la ruta sea correcta
import supabase from "../supabaseClient"; // Importa tu cliente de Supabase

const TABLE_NAME = import.meta.env.VITE_TABLE_NAME; // VITE_TABLE_NAME=chat_crm

const Leads = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchSupabaseRecords = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from(TABLE_NAME).select("*");

        if (error) {
          throw new Error(
            `Error al obtener leads de Supabase: ${error.message}`
          );
        }

        setUsersList(data);
      } catch (error) {
        console.error("Error al obtener leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupabaseRecords();
  }, []);

  // Clasificar leads
  const leadsClasificados = { frio: [], tibio: [], caliente: [] };

  usersList.forEach((record) => {
    const temperatura = record.temperatura || "";
    const nombre =
      record.nombre || record.username || record.session_id || "Sin nombre";
    const telefono = record.telefono || "";

    // --- CAMBIO AQUÍ: Formatear la fecha ---
    let ultimoMensaje = "";
    if (record.created_at) {
      try {
        const date = new Date(record.created_at);
        ultimoMensaje = date.toLocaleString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        console.error(
          "Error al parsear la fecha de ultimoMensaje:",
          record.created_at,
          e
        );
        ultimoMensaje = "Fecha inválida"; // Fallback en caso de error
      }
    }
    // --- FIN DEL CAMBIO ---

    const tag = record.tag || "";
    const profilePic = record.profile_pic || null;
    const canal = record.canal ? record.canal.toLowerCase() : "";

    let flagColor = "#FFC107"; // Default a amarillo

    const normalizedTemperatura = temperatura
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (normalizedTemperatura.includes("frío")) {
      flagColor = "#FF69B4"; // Rosa
    } else if (normalizedTemperatura.includes("tibio")) {
      flagColor = "#4CAF50"; // Verde
    } else if (normalizedTemperatura.includes("caliente")) {
      flagColor = "#F44336"; // Rojo
    }

    const leadData = {
      nombre,
      telefono,
      ultimoMensaje,
      tag,
      flagColor,
      profilePic,
      canal,
    };

    if (normalizedTemperatura.includes("frío")) {
      leadsClasificados.frio.push(leadData);
    } else if (normalizedTemperatura.includes("tibio")) {
      leadsClasificados.tibio.push(leadData);
    } else if (normalizedTemperatura.includes("caliente")) {
      leadsClasificados.caliente.push(leadData);
    } else {
      leadsClasificados.frio.push(leadData);
    }
  });

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
    <Box
      sx={{
        p: 4,
        background: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {usersList.length} Leads
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar leads..."
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "transparent" },
                "&.Mui-focused fieldset": { borderColor: "transparent" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#999" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#fff",
              color: "#555",
              borderColor: "#e0e0e0",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "#d0d0d0",
              },
            }}
            startIcon={
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#2196F3",
                }}
              />
            }
            onClick={handleMenuClick}
          >
            Leads Frios
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Leads Frios</MenuItem>
            <MenuItem onClick={handleMenuClose}>Leads Tibios</MenuItem>
            <MenuItem onClick={handleMenuClose}>Leads Calientes</MenuItem>
            <MenuItem onClick={handleMenuClose}>Todos los Leads</MenuItem>
          </Menu>

          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#fff",
              color: "#555",
              borderColor: "#e0e0e0",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "#d0d0d0",
              },
            }}
            startIcon={<FilterListIcon />}
          >
            Status
          </Button>

          <IconButton
            sx={{
              backgroundColor: "#fff",
              color: "#555",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderColor: "#d0d0d0",
              },
            }}
          >
            <SortIcon />
          </IconButton>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#673AB7",
              color: "#fff",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#5e35b1",
              },
            }}
            startIcon={<AddIcon />}
          >
            Crear Lead
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={4}>
          <LeadsColumn
            title={`Leads Frios (${leadsClasificados.frio.length})`}
            leads={leadsClasificados.frio}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LeadsColumn
            title={`Leads Tibios (${leadsClasificados.tibio.length})`}
            leads={leadsClasificados.tibio}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <LeadsColumn
            title={`Leads Calientes (${leadsClasificados.caliente.length})`}
            leads={leadsClasificados.caliente}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Leads;
