import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100vh', 
                padding: 3, 
                backgroundColor: '#f5f5f5' // Set this according to your app's design
            }}
        >
            <Typography variant='h3' gutterBottom>
                Expense Tracker
            </Typography>
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    marginTop: 2 
                }}
            >
                <Button 
                    sx={{ margin: 1 }} 
                    variant='contained' 
                    onClick={() => navigate('/signup')}
                >
                    Signup
                </Button>
                <Button 
                    sx={{ margin: 1 }} 
                    variant='contained' 
                    onClick={() => navigate('/login')}
                >
                    Login
                </Button>
            </Box>
        </Box>
    );
}

export default Home;
