import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AddRoadIcon from "@mui/icons-material/AddRoad";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 260;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    key: "dashboard",
  },
  {
    text: "Find a Lift",
    icon: <DirectionsCarIcon />,
    path: "/find-lift",
    key: "findLift",
  },
  {
    text: "Offer a Ride",
    icon: <AddRoadIcon />,
    path: "/offer-ride",
    key: "offerRide",
  },
  {
    text: "Profile",
    icon: <PersonIcon />,
    path: "/profile",
    key: "profile",
  },
];

const Sidebar = ({ active = "dashboard" }) => {
  return (
    <Box
      sx={{
        width: drawerWidth,
        minHeight: "100vh",
        borderRight: "1px solid #e0e0e0",
        bgcolor: "#fff",
        position: "fixed",
        left: 0,
        top: 64, // Navbar height
        overflowY: "auto",
      }}
    >
      <Toolbar />

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={active === item.key}
            sx={{
              mx: 2,
              mb: 1,
              borderRadius: 2,
              "&.Mui-selected": {
                bgcolor: "#E8F5E9",
                color: "#2E7D32",
              },
              "&.Mui-selected .MuiListItemIcon-root": {
                color: "#2E7D32",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ mt: 3, mb: 2 }} />

      <List>
        <ListItemButton sx={{ mx: 2, borderRadius: 2 }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>

          <ListItemText primary="Settings" />
        </ListItemButton>

        <ListItemButton
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
