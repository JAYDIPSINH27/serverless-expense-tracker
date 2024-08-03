import { Avatar, Box, Button, Modal, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import withNavbar from '../utils/withNavbar';
import { getCurrentUser } from '../Config/userpool';
import {toast} from 'react-hot-toast';
const Profile = () => {
    const [openModal, setOpenModal] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [userDetails, setUserDetails] = useState({
        name: 'John Doe',
        email: '',
        profilePicture: '',
        bio: '',
        firstName: '',
        lastName: '',
        address: '',
        monthlyBudget: ''
    });
    const [changed, setChanged] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            const currentUser = getCurrentUser();
            if (currentUser) {
                try {
                    const response = await axios.post('https://nsziq2w394.execute-api.us-east-1.amazonaws.com/prod/user-get', {
                        userid: currentUser.username
                    });
                    const userData = response.data;

                    setUserDetails(prevState => ({
                        ...prevState,
                        email: userData.email || '',
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        bio: userData.bio || '',
                        address: userData.address || '',
                        monthlyBudget: userData.monthlyBudget || '',
                        profilePicture: userData.profilePicture || ''
                    }));
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
        };

        fetchUserDetails();
    }, [changed]);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUpdateDetails = () => {
        const data = {
            userId: getCurrentUser().username,
            userDetails: userDetails
        };

        axios.post('https://nsziq2w394.execute-api.us-east-1.amazonaws.com/prod/newtest', data)
            .then(response => {
                console.log('Details updated successfully:', response.data);
                setChanged(!changed);
                toast.success('Details updated successfully');
                handleCloseModal();
            })
            .catch(error => {
               
                toast.error('Error updating details');
                console.error('Error updating details:', error);
            });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleUploadImage = async () => {
        if (!imageFile) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Data = reader.result;
            try {
                const response = await axios.post('https://nsziq2w394.execute-api.us-east-1.amazonaws.com/prod/expense/image-upload', {
                    image: base64Data
                });

                const imageUrl = response.data.imageUrl;

                setUserDetails(prevState => ({
                    ...prevState,
                    profilePicture: imageUrl
                }));

                // Update user details with new profile picture URL
                const data = {
                    userId: getCurrentUser().username,
                    userDetails: { ...userDetails, profilePicture: imageUrl }
                };

                await axios.post('https://nsziq2w394.execute-api.us-east-1.amazonaws.com/prod/newtest', data)
                .then(()=>{
                    toast.success('Details Updated!!')
                })
                .catch(()=>{
                    toast.error('Error updating details');
                });

                console.log('Image uploaded and user details updated successfully:', response.data);
                setChanged(!changed);
                handleCloseModal();
            } catch (error) {
                console.error('Error uploading image and updating user details:', error);
            }
        };

        reader.readAsDataURL(imageFile);
    };

    return (
        <>
            <Paper elevation={3} sx={{ padding: 3, maxWidth: 600, margin: 'auto', mt: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            alt={userDetails.name}
                            src={userDetails.profilePicture || '/default-avatar.png'}
                            sx={{ width: 120, height: 120, marginRight: 2 }}
                        />
                    </Box>
                    <Typography variant="h4" component="div" gutterBottom>
                        {userDetails.name}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                        {userDetails.email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 2 }}>
                        {userDetails.bio}
                    </Typography>
                    <Button onClick={handleOpenModal} variant="contained" color="primary" sx={{ marginTop: 2 }}>
                        Update Details
                    </Button>
                </Box>
            </Paper>

            {/* Add Details Modal */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="add-details-modal"
                aria-describedby="modal-to-add-user-details"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Paper sx={{ position: 'absolute', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Update Details
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            alt={userDetails.name}
                            src={imagePreview || userDetails.profilePicture || '/default-avatar.png'}
                            sx={{ width: 120, height: 120, mb: 2 }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ mb: 2 }}
                        >
                            Select Image
                            <input
                                type="file"
                                hidden
                                onChange={handleImageChange}
                            />
                        </Button>
                        {imageFile && (
                            <Button onClick={handleUploadImage} variant="contained" color="primary" sx={{ mb: 2 }}>
                                Update Image
                            </Button>
                        )}
                    </Box>

                    <TextField
                        name="firstName"
                        label="First Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={userDetails.firstName}
                        onChange={handleChange}
                    />
                    <TextField
                        name="lastName"
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={userDetails.lastName}
                        onChange={handleChange}
                    />
                    <TextField
                        name="bio"
                        label="Bio"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={userDetails.bio}
                        onChange={handleChange}
                    />
                    <TextField
                        name="address"
                        label="Address"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={userDetails.address}
                        onChange={handleChange}
                    />
                    <TextField
                        name="monthlyBudget"
                        label="Monthly Budget"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={userDetails.monthlyBudget}
                        onChange={handleChange}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button onClick={handleCloseModal} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateDetails} variant="contained" color="primary">
                            Update
                        </Button>
                    </Box>
                </Paper>
            </Modal>
        </>
    );
};

export default withNavbar(Profile);
