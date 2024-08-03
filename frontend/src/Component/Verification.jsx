import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {userpool} from '../Config/userpool';
import {  CognitoUser, } from 'amazon-cognito-identity-js';
import axios from 'axios'
const Verification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state.email;
    const userid = location.state.userid;
    console.log('userid:', userid);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');

    const handleVerification = () => {
        setVerificationError('');
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userpool
        });
        cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
            if (err) {
                setVerificationError(err.message || JSON.stringify(err));
                console.error('Verification error:', err);
                return;
            }
            console.log('Verification result:', result);

            axios.post(`${process.env.REACT_APP_BASE_URL}/user-store`, {
              email: email,
              userid: userid
          }, {
              headers: {
                  'Content-Type': 'application/json'
              }
          })
          .then(response => {
              if (response.status === 200) {
                  console.log('User stored successfully');
                  navigate('/login'); // Redirect to login page after successful verification and storing
              } else {
                  throw new Error('Failed to store user');
              }
          })
          .catch(error => {
              console.error('Error storing user:', error);
              setVerificationError('Failed to store user');
          });
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f5f5f5', // Set background color according to your app's design
                padding: 3
            }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: 300 }}>
                <Typography variant='h4' gutterBottom align="center">
                    Verify Email
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        label="Verification Code"
                        helperText={verificationError}
                        error={!!verificationError}
                    />
                    <Button variant="contained" fullWidth onClick={handleVerification}>
                        Verify
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Verification;
