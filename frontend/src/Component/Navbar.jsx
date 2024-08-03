import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../Services/authenticate';

const Navbar = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Expense Tracker
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" onClick={() => handleNavigation('/dashboard')}>
                        Dashboard
                    </Button>
                    <Button color="inherit" onClick={() => handleNavigation('/profile')}>
                        Profile
                    </Button>
                    <Button color="inherit" onClick={() => logout()}>
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
