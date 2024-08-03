import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ExpenseTable = ({ expenses, onImageClick, userId }) => {
    // Filter expenses based on the userId
    const filteredExpenses = expenses.filter(expense => expense.userId === userId);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Amount</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Image</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((e) => (
                            <TableRow key={e.expenseId}>
                                <TableCell>{e.amount}</TableCell>
                                <TableCell>{e.category}</TableCell>
                                <TableCell>{e.description}</TableCell>
                                <TableCell>
                                    {e.imageURL && (
                                        <img
                                            src={e.imageURL}
                                            alt="Thumbnail"
                                            style={{ width: 50, height: 50, cursor: 'pointer' }}
                                            onClick={() => onImageClick(e.imageURL)}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center">No Expenses</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ExpenseTable;
