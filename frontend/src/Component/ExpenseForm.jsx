import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ExpenseForm = ({ open, onSubmit, onClose }) => {
    const [step, setStep] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [extractedTotal, setExtractedTotal] = useState(null);
    const [formValues, setFormValues] = useState({
        amount: '',
        category: '',
        description: ''
    });

    const handleNextStep = () => {
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setStep(step - 1);
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
                const imageResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/expense/image-upload`, {
                    image: base64Data
                });

                if (imageResponse.status === 200) {
                    const imageUrl = imageResponse.data.imageUrl;

                    const textractResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/test`, {
                        imageUrl: imageUrl
                    });

                    if (textractResponse.status === 200 && textractResponse.data.message.includes('Total amount found')) {
                        const total = parseFloat(textractResponse.data.message.split(': ')[1]);
                        setExtractedTotal(total);
                        setFormValues(prev => ({ ...prev, amount: total, imageData: imageUrl }));
                        toast.success('Total amount extracted from image.');
                        handleNextStep();
                    } else {
                        setFormValues(prev => ({ ...prev, imageData: imageUrl }));
                        toast.error('Total amount not found in the receipt image. Please enter the total amount manually.');
                        handleNextStep();
                    }
                } else {
                    console.error('Error uploading image:', imageResponse.status);
                    toast.error('Error uploading image.');
                }
            } catch (error) {
                console.error('Error extracting total amount from image:', error);
                toast.error('Error extracting total amount from image. Please enter the total amount manually.');
                handleNextStep();
            }
        };

        reader.readAsDataURL(imageFile);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        onSubmit({
            ...formValues,
            imageData: formValues.imageData
        });
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Upload Receipt Image
                        </Typography>
                        <input
                            type="file"
                            hidden
                            id="image-upload"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="image-upload">
                            <Button variant="outlined" component="span">
                                Select Image
                            </Button>
                        </label>
                        {imagePreview && (
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <img src={imagePreview} alt="Receipt" width="100%" />
                            </Box>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUploadImage}
                            disabled={!imageFile}
                        >
                            Extract Total
                        </Button>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Enter Expense Details
                        </Typography>
                        <TextField
                            name="amount"
                            label="Amount"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formValues.amount}
                            onChange={handleChange}
                        />
                        <TextField
                            name="category"
                            label="Category"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formValues.category}
                            onChange={handleChange}
                        />
                        <TextField
                            name="description"
                            label="Description"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={formValues.description}
                            onChange={handleChange}
                        />
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {step === 1 ? 'Upload Receipt Image' : 'Enter Expense Details'}
            </DialogTitle>
            <DialogContent>
                {renderStepContent()}
            </DialogContent>
            <DialogActions>
                {step === 2 && (
                    <Button onClick={handlePrevStep} color="secondary">
                        Back
                    </Button>
                )}
                {step === 2 ? (
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
                ) : (
                    <Button onClick={onClose} color="secondary">
                        Cancel
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ExpenseForm;
