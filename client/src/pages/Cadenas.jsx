import { Box, CssBaseline, Toolbar } from "@mui/material";
import ChatWindow from "../cadenas/ChatWindow";
const drawerWidth = 290;

const Cadenas = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <ChatWindow />
      </Box>
    </Box>
  );
};

export default Cadenas;
