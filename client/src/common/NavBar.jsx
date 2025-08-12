import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "./TopBar";
const drawerWidth = 240;

const NavBar = (props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sections = [
    { title: "🪢 Cadenas", id: "cadenas", path: "/cadenas" },
    { title: "🧲 Leads", id: "leads", path: "/leads" },
    {
      title: "⛓ Cadenas Masivas",
      id: "cadenas_masivas",
      path: "/cadenas_masivas",
    },
    { title: "🏋 Training", id: "training", path: "/training" },
    { title: "🌱 Plantillas", id: "plantillas", path: "/plantillas" },
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
      <Toolbar />
      <List>
        {sections.map((section) => (
          <Link key={section.id} to={section.path}>
            <ListItem disablePadding>
              <ListItemButton>
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
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
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
              backgroundColor: "red",
            },
          }}
          slotProps={{
            root: {
              keepMounted: true, // Better open performance on mobile.
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
