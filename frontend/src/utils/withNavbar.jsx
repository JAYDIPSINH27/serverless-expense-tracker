import React from 'react';
import Navbar from '../Component/Navbar';
import { Box } from '@mui/material';

const withNavbar = (WrappedComponent) => {
    return (props) => (
        <Box>
            <Navbar />
            <Box sx={{ padding: 3 }}>
                <WrappedComponent {...props} />
            </Box>
        </Box>
    );
};

export default withNavbar;
