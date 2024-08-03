import React from 'react';
import { Modal, Box, Typography } from '@mui/material';

const ImageDialog = ({ imageUrl, onClose }) => {
    return (
        <Modal
            open={!!imageUrl}
            onClose={onClose}
            aria-labelledby="image-dialog-title"
            aria-describedby="image-dialog-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography variant="h5" gutterBottom>
                    Expense Image
                </Typography>
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Expense"
                        style={{ width: '100%', maxHeight: 600 }}
                    />
                )}
            </Box>
        </Modal>
    );
};

export default ImageDialog;
