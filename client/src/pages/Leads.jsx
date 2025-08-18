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
import PersonIcon from "@mui/icons-material/Person";
import { useEffect, useRef, useState } from "react";
import LeadsColumn from "../leads/LeadsColumn";

const API_KEY =
  "patEpPGZwM0wqagdm.20e5bf631e702ded9b04d6c2fed3e41002a8afc9127a57cff9bf8c3b3416dd02";
const BASE_ID = "appbT7f58H1PLdY11";
const TABLE_NAME = "chat-crm";

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

    const fetchAirtableRecords = async () => {
      setLoading(true);
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
        setUsersList(data.records);
      } catch (error) {
        console.error("Error al obtener leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirtableRecords();
  }, []);

  // Clasificar leads
  const leadsClasificados = { frio: [], tibio: [], caliente: [] };

  usersList.forEach((record) => {
    const fields = record.fields;
    const temperatura = fields.temperatura || "";
    const nombre =
      fields.nombre || fields.username || record.id || "Sin nombre";
    const telefono = fields.telefono || "";
    const ultimoMensaje = fields["created date"] || record.createdTime || "";
    const tag = fields.tag || "";
    const profilePic = fields["profile pic"] || null;
    // NUEVO: Extraer el campo 'canal'
    const canal = fields.canal ? fields.canal.toLowerCase() : ""; // Convertir a minúsculas para facilitar la comparación

    let flagColor = "#FFC107"; // Default to yellow as seen in mockup for Alexander Patel

    if (temperatura.includes("Frío")) {
      flagColor = "#FF69B4"; // Pink
    } else if (temperatura.includes("Tibio")) {
      flagColor = "#4CAF50"; // Green
    } else if (temperatura.includes("Caliente")) {
      flagColor = "#F44336"; // Red
    }

    // NUEVO: Pasar 'canal' al objeto leadData
    const leadData = {
      nombre,
      telefono,
      ultimoMensaje,
      tag,
      flagColor,
      profilePic,
      canal,
    };

    if (temperatura.includes("Frío")) {
      leadsClasificados.frio.push(leadData);
    } else if (temperatura.includes("Tibio")) {
      leadsClasificados.tibio.push(leadData);
    } else if (temperatura.includes("Caliente")) {
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
          <LeadsColumn title="Leads Frios" leads={leadsClasificados.frio} />
        </Grid>
        <Grid item xs={12} md={4}>
          <LeadsColumn title="Leads Tibios" leads={leadsClasificados.tibio} />
        </Grid>
        <Grid item xs={12} md={4}>
          <LeadsColumn
            title="Leads Calientes"
            leads={leadsClasificados.caliente}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Leads;
