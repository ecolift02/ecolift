import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from "@mui/material";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AddRoadIcon from "@mui/icons-material/AddRoad";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../../context/AuthContext"; // Import for logout

const drawerWidth = 260;

// Adding 'mode' prop (defaults to PASSENGER)
const Sidebar = ({ active = "profile", mode = "PASSENGER" }) => {
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        width: drawerWidth,
        minHeight: "100vh",
        borderRight: "1px solid #e0e0e0",
        bgcolor: "#fff",
        position: "fixed",
        left: 0,
        top: 80, // Matched with Navbar height (h-20)
        overflowY: "auto",
        zIndex: 40,
      }}
    >
      <Toolbar />

      <List>
        {/* Only show 'Find a Lift' if the user is in PASSENGER mode */}
        {mode === "PASSENGER" && (
          <ListItemButton
            component={Link}
            to="/profile"
            selected={active === "findLift"}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "#E8F5E9", color: "#2E7D32" },
              "&.Mui-selected .MuiListItemIcon-root": { color: "#2E7D32" },
            }}
          >
            <ListItemIcon>
              <DirectionsCarIcon />
            </ListItemIcon>
            <ListItemText primary="Find a Lift" />
          </ListItemButton>
        )}

        {/* Only show 'Offer a Ride' if the user is in DRIVER mode */}
        {mode === "DRIVER" && (
          <ListItemButton
            component={Link}
            to="/profile"
            selected={active === "offerRide"}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 2,
              "&.Mui-selected": { bgcolor: "#E8F5E9", color: "#2E7D32" },
              "&.Mui-selected .MuiListItemIcon-root": { color: "#2E7D32" },
            }}
          >
            <ListItemIcon>
              <AddRoadIcon />
            </ListItemIcon>
            <ListItemText primary="Offer a Ride" />
          </ListItemButton>
        )}

        {/* Profile is always visible */}
        <ListItemButton
          component={Link}
          to="/profile"
          selected={active === "profile"}
          sx={{
            mx: 2,
            mb: 1,
            borderRadius: 2,
            "&.Mui-selected": { bgcolor: "#E8F5E9", color: "#2E7D32" },
            "&.Mui-selected .MuiListItemIcon-root": { color: "#2E7D32" },
          }}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </List>

      <Divider sx={{ mt: 3, mb: 2 }} />

      <List>
        <ListItemButton sx={{ mx: 2, borderRadius: 2 }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        {/* Clean Logout using Global State */}
        <ListItemButton
          onClick={logout}
          sx={{
            mx: 2,
            borderRadius: 2,
            color: "error.main",
          }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;