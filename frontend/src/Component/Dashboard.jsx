import React, { useState, useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { userpool } from '../Config/userpool';
import { logout } from '../Services/authenticate';
import axios from 'axios';
import withNavbar from '../utils/withNavbar';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';
import ImageDialog from './ImageDialog';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [changed, setChanged] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        let user = userpool.getCurrentUser();
        if (!user) {
            navigate('/login');
        } else {
            fetchExpenses();
        }
    }, [navigate, changed]);

    const fetchExpenses = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/expense`);
            setExpenses(response.data.expense);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleAddExpense = async (newExpense) => {
        try {
            const id = generateUUID();
            let imageURL = newExpense.imageData;

            const expenseResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}/expense`, {
                expenseId: id,
                amount: newExpense.amount,
                category: newExpense.category,
                description: newExpense.description,
                imageURL: imageURL,
                userId: userpool.getCurrentUser().username,
                timestamp: new Date().toISOString(),
            });

            if (expenseResponse.status === 200) {
                setChanged(!changed);
                toast.success('Expense added successfully');
                fetchExpenses();
                handleCloseModal();  // Close modal on successful addition
            } else {
                throw new Error('Failed to add expense');
            }
        } catch (error) {
            console.error('Error uploading expense and image:', error);
            toast.error('Failed to add expense');
        }
    };

    const generateUUID = () => {
        let uuid = '';
        const randomValues = new Uint8Array(16);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < randomValues.length; i++) {
            const value = randomValues[i];
            if (i === 3 || i === 5 || i === 7 || i === 9) {
                uuid += '-';
            }
            uuid += value.toString(16).padStart(2, '0');
        }

        return uuid;
    };

    const handleOpenImageDialog = (imageURL) => {
        setSelectedImage(imageURL);
    };

    const handleCloseImageDialog = () => {
        setSelectedImage(null);
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h3" gutterBottom>
                Expense Tracker
            </Typography>

            <Button variant="contained" onClick={handleOpenModal} sx={{ marginBottom: 3 }}>
                Add Expense
            </Button>

            <ExpenseForm open={modalOpen} onSubmit={handleAddExpense} onClose={handleCloseModal} />

            <Typography variant="h5" gutterBottom>
                Expenses
            </Typography>

            <ExpenseTable expenses={expenses} onImageClick={handleOpenImageDialog} userId={userpool.getCurrentUser().username} />

            <ImageDialog imageUrl={selectedImage} onClose={handleCloseImageDialog} />
        </Box>
    );
};

export default withNavbar(Dashboard);
