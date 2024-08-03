import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import {userpool} from '../Config/userpool';
import {toast} from 'react-hot-toast';

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');

    const formInputChange = (formField, value) => {
        if (formField === "email") {
            setEmail(value);
        }
        if (formField === "password") {
            setPassword(value);
        }
    };

    const validation = () => {
        return new Promise((resolve) => {
            if (email === '' && password === '') {
                setEmailErr("Email is Required");
                setPasswordErr("Password is required");
                resolve({ email: "Email is Required", password: "Password is required" });
            } else if (email === '') {
                setEmailErr("Email is Required");
                resolve({ email: "Email is Required", password: "" });
            } else if (password === '') {
                setPasswordErr("Password is required");
                resolve({ email: "", password: "Password is required" });
            } else if (password.length < 6) {
                setPasswordErr("Must be at least 6 characters");
                resolve({ email: "", password: "Must be at least 6 characters" });
            } else {
                resolve({ email: "", password: "" });
            }
        });
    };

    const handleClick = () => {
        setEmailErr("");
        setPasswordErr("");
        validation()
            .then((res) => {
                if (res.email === '' && res.password === '') {
                    const attributeList = [
                        new CognitoUserAttribute({
                            Name: 'email',
                            Value: email,
                        })
                    ];
                    let username = email;
                    userpool.signUp(username, password, attributeList, null, (err, data) => {
                        if (err) {
                            console.log(err);
                            toast.error(err.message);
                        } else {
                            console.log(data);
                            toast.success('Registration successfull!')
                            console.log(email);
                            navigate('/verify', { state: { email: data.user.username,userid:data.userSub } });
                        }
                    });
                }
            })
            .catch(err => console.log(err));
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
                    Signup
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        value={email}
                        onChange={(e) => formInputChange("email", e.target.value)}
                        label="Email"
                        helperText={emailErr}
                        error={!!emailErr}
                    />
                    <TextField
                        fullWidth
                        value={password}
                        onChange={(e) => formInputChange("password", e.target.value)}
                        type="password"
                        label="Password"
                        helperText={passwordErr}
                        error={!!passwordErr}
                    />
                    <Button variant='contained' fullWidth onClick={handleClick}>
                        Signup
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Signup;
