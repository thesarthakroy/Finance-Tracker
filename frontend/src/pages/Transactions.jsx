import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
  InputAdornment,
  TablePagination,
  DialogContentText,
  useTheme,
  Grid,
} from '@mui/material';
import {
  DeleteOutline,
  EditOutlined,
  Search,
  Clear,
  FilterList,
  LocalGroceryStore,
  DirectionsCar,
  Home,
  SportsEsports,
  Work,
  Category,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import api from '../services/api';
import PageTransition from '../components/PageTransition';

// Helper to resolve category icons based on string name
const getCategoryIcon = (categoryName, type) => {
  const cat = String(categoryName || '').toLowerCase();
  if (type === 'income') return <Work sx={{ fontSize: 20 }} />;
  if (cat.includes('food') || cat.includes('grocery') || cat.includes('dine') || cat.includes('restaurant') || cat.includes('eat')) {
    return <LocalGroceryStore sx={{ fontSize: 20 }} />;
  }
  if (cat.includes('car') || cat.includes('travel') || cat.includes('transport') || cat.includes('fuel') || cat.includes('cab')) {
    return <DirectionsCar sx={{ fontSize: 20 }} />;
  }
  if (cat.includes('rent') || cat.includes('bill') || cat.includes('utility') || cat.includes('house') || cat.includes('power')) {
    return <Home sx={{ fontSize: 20 }} />;
  }
  if (cat.includes('play') || cat.includes('movie') || cat.includes('game') || cat.includes('entertainment') || cat.includes('show')) {
    return <SportsEsports sx={{ fontSize: 20 }} />;
  }
  return <Category sx={{ fontSize: 20 }} />;
};

const blankForm = {
  amount: '',
  category: '',
  transaction_type: 'expense',
  description: '',
  date: new Date().toISOString().slice(0, 10)
};

export default function Transactions({ onError }) {
  const theme = useTheme();

  // Transactions list and pagination
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // 0-indexed MUI TablePagination
  const [rowsPerPage] = useState(20);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    dateGte: '',
    dateLte: '',
  });

  // Sorting
  const [orderBy, setOrderBy] = useState('date');
  const [orderDirection, setOrderDirection] = useState('desc');

  // Dialog States
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch transactions with pagination and query filters
  const loadTransactions = () => {
    const params = {
      page: page + 1, // backend is 1-indexed
      ordering: `${orderDirection === 'desc' ? '-' : ''}${orderBy}`,
    };

    if (filters.search) params.category__icontains = filters.search;
    if (filters.type) params.transaction_type = filters.type;
    if (filters.dateGte) params.date__gte = filters.dateGte;
    if (filters.dateLte) params.date__lte = filters.dateLte;

    api.get('/transactions/', { params })
      .then(res => {
        setRows(res.data.results || []);
        setTotalCount(res.data.count || 0);
      })
      .catch(() => onError('Unable to retrieve transactions record.'));
  };

  useEffect(() => {
    loadTransactions();
  }, [page, filters, orderBy, orderDirection]);

  // Handle pagination changes
  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  // Sort handler
  const handleSort = (property) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  // Input change handler for dialog
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save transaction handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (parseFloat(form.amount) <= 0) {
      onError('Amount must be greater than zero.');
      return;
    }
    if (!form.category.trim()) {
      onError('Category is required.');
      return;
    }

    try {
      if (editId) {
        await api.put(`/transactions/${editId}/`, form);
      } else {
        await api.post('/transactions/', form);
      }
      setEditorOpen(false);
      setForm(blankForm);
      setEditId(null);
      setPage(0);
      loadTransactions();
    } catch {
      onError('Verify all transaction details are valid.');
    }
  };

  // Delete initiation handler
  const handleDeleteTrigger = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  // Delete confirmation handler
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/transactions/${deleteId}/`);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      if (rows.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        loadTransactions();
      }
    } catch {
      onError('Unable to delete transaction record.');
    }
  };

  const handleClearFilters = () => {
    setFilters({ search: '', type: '', dateGte: '', dateLte: '' });
    setPage(0);
  };

  return (
    <PageTransition>
      <Box sx={{ py: 1 }}>
        
        {/* Header Title Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Transactions Ledger</Typography>
            <Typography color="text.secondary">Record, modify, and review your financial entries.</Typography>
          </Box>
          <Button variant="contained" onClick={() => { setEditId(null); setForm(blankForm); setEditorOpen(true); }} sx={{ alignSelf: 'flex-start' }}>
            Add entry
          </Button>
        </Stack>

        {/* Filters Panel */}
        <Paper sx={{ p: 2.5, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                label="Search Category"
                value={filters.search}
                onChange={e => { setFilters({ ...filters, search: e.target.value }); setPage(0); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <TextField
                fullWidth
                select
                label="Type"
                value={filters.type}
                onChange={e => { setFilters({ ...filters, type: e.target.value }); setPage(0); }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2.5} md={2.5}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                value={filters.dateGte}
                onChange={e => { setFilters({ ...filters, dateGte: e.target.value }); setPage(0); }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2.5} md={2.5}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                value={filters.dateLte}
                onChange={e => { setFilters({ ...filters, dateLte: e.target.value }); setPage(0); }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                startIcon={<Clear />}
                sx={{ height: 40 }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}`, maxHeight: '60vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? orderDirection : 'desc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? orderDirection : 'desc'}
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:nth-of-type(even)': { bgcolor: theme.palette.action.hover },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          p: 0.8,
                          borderRadius: '6px',
                          bgcolor: row.transaction_type === 'income' ? `${theme.palette.success.main}15` : `${theme.palette.text.secondary}15`,
                          color: row.transaction_type === 'income' ? theme.palette.success.main : theme.palette.text.secondary,
                          display: 'flex',
                        }}
                      >
                        {getCategoryIcon(row.category, row.transaction_type)}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.category}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.description || '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      icon={row.transaction_type === 'income' ? <TrendingUp style={{ fontSize: 14 }} /> : <TrendingDown style={{ fontSize: 14 }} />}
                      label={row.transaction_type.toUpperCase()}
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        bgcolor: row.transaction_type === 'income' ? `${theme.palette.success.main}12` : `${theme.palette.error.main}12`,
                        color: row.transaction_type === 'income' ? theme.palette.success.main : theme.palette.error.main,
                        border: `1px solid ${row.transaction_type === 'income' ? theme.palette.success.main : theme.palette.error.main}20`,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    ₹{Number(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modify Record">
                      <IconButton
                        size="small"
                        onClick={() => { setEditId(row.id); setForm(row); setEditorOpen(true); }}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Record">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTrigger(row.id)}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No transaction logs match the current filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[20]}
          sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
        />

        {/* Transaction Editor Dialog */}
        <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="sm" fullWidth>
          <Box component="form" onSubmit={handleSave}>
            <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit' : 'Create'} Transaction Entry</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                Provide transaction value details. Fields marked with an asterisk are required.
              </DialogContentText>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="amount"
                    label="Amount (Rs.)"
                    type="number"
                    value={form.amount}
                    onChange={handleFormChange}
                    sx={{ mb: 2 }}
                    inputProps={{ step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    name="transaction_type"
                    label="Transaction Type"
                    value={form.transaction_type}
                    onChange={handleFormChange}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    name="category"
                    label="Category"
                    value={form.category}
                    onChange={handleFormChange}
                    sx={{ mb: 2 }}
                    placeholder="e.g. Food, Salary, Utilities"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    name="date"
                    label="Transaction Date"
                    value={form.date}
                    onChange={handleFormChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    label="Description (Optional)"
                    value={form.description}
                    onChange={handleFormChange}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setEditorOpen(false)} variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this transaction entry? This action is irreversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined" color="secondary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </PageTransition>
  );
}
