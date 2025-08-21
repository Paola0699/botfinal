import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Toolbar,
  Divider,
  // Button, // No se usa directamente en este snippet
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
// import TopBar from "./TopBar"; // No se usa directamente en este snippet
// import LogoBlanco from "./logo_blanco.png"; // No se usa directamente en este snippet
// Importar iconos de MUI
import LinkIcon from "@mui/icons-material/Link";
import PeopleIcon from "@mui/icons-material/People";
import HubIcon from "@mui/icons-material/Hub";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ArticleIcon from "@mui/icons-material/Article";
import LogoutIcon from "@mui/icons-material/Logout";
import ContactsIcon from "@mui/icons-material/Contacts";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const drawerWidth = 290;

const NavBar = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const sections = [
    { title: "Cadenas", id: "cadenas", path: "/cadenas", icon: <LinkIcon /> },
    { title: "Leads", id: "leads", path: "/leads", icon: <PeopleIcon /> },
    {
      title: "Contactos",
      id: "contactos",
      path: "/contactos",
      icon: <ContactsIcon />,
    },
    {
      title: "Cadenas Masivas",
      id: "cadenas_masivas",
      path: "/cadenas_masivas",
      icon: <HubIcon />,
    },
    {
      title: "Training",
      id: "training",
      path: "/training",
      icon: <FitnessCenterIcon />,
    },
    {
      title: "Plantillas",
      id: "plantillas",
      path: "/plantillas",
      icon: <ArticleIcon />,
    },
  ];

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };
  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
  const container =
    window !== undefined ? () => window().document.body : undefined;

  const drawer = (
    // Aplicamos flexbox al contenedor principal del drawer
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Aseguramos que ocupe toda la altura del Drawer
      }}
    >
      <Toolbar />
      {/* <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <img
          src={LogoBlanco}
          alt="Logo"
          style={{ width: "120px", objectFit: "contain" }}
        />
      </Box> */}
      {/* Aplicamos flexGrow para que la lista de secciones ocupe el espacio restante */}
      <List sx={{ flexGrow: 1 }}>
        {sections.map((section) => (
          <Link
            key={section.id}
            to={section.path}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon sx={{ color: "white" }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText primary={section.title} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 2 }} />

      {/* El botón de Cerrar Sesión se mantendrá al final */}
      <Box>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: "white" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/*       <TopBar />
       */}{" "}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "linear-gradient(90deg, #6a0dad, #a64aff)",
              color: "white",
            },
          }}
          slotProps={{
            root: {
              keepMounted: true,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "linear-gradient(135deg, #6A11CB, #2575FC)",
              color: "white",
              border: "0px solid red",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default NavBar;
