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
  Button,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "./TopBar";
import LogoBlanco from "./logo_blanco.png";
// Importar iconos de MUI
import LinkIcon from "@mui/icons-material/Link";
import PeopleIcon from "@mui/icons-material/People";
import HubIcon from "@mui/icons-material/Hub";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ArticleIcon from "@mui/icons-material/Article";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 290;

const NavBar = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sections = [
    { title: "Cadenas", id: "cadenas", path: "/cadenas", icon: <LinkIcon /> },
    { title: "Leads", id: "leads", path: "/leads", icon: <PeopleIcon /> },
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
    <div>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <img
          src={LogoBlanco}
          alt="Logo"
          style={{ width: "120px", objectFit: "contain" }}
        />
      </Box>
      <List>
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
    </div>
  );

  return (
    <>
      <TopBar />
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
              backgroundColor: "#3c3c3a",
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
              backgroundColor: "#3c3c3a",
              color: "white",
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
