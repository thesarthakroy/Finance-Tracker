import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Paper,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  Box,
  MenuItem,
  Stack,
  useTheme,
  Chip,
} from '@mui/material';
import {
  DeleteOutline,
  EditOutlined,
  Add,
  TrendingDown,
  TrendingUp,
  ErrorOutline,
  CheckCircleOutline,
  LocalGroceryStore,
  DirectionsCar,
  Home,
  SportsEsports,
  Work,
  Category,
} from '@mui/icons-material';
import api from '../services/api';
import PageTransition from '../components/PageTransition';

// Helper to resolve category icons based on string name
const getCategoryIcon = (categoryName) => {
  const cat = String(categoryName || '').toLowerCase();
  if (cat.includes('food') || cat.includes('grocery') || cat.includes('dine') || cat.includes('restaurant') || cat.includes('eat')) {
    return <LocalGroceryStore sx={{ fontSize: 24 }} />;
  }
  if (cat.includes('car') || cat.includes('travel') || cat.includes('transport') || cat.includes('fuel') || cat.includes('cab')) {
    return <DirectionsCar sx={{ fontSize: 24 }} />;
  }
  if (cat.includes('rent') || cat.includes('bill') || cat.includes('utility') || cat.includes('house') || cat.includes('power')) {
    return <Home sx={{ fontSize: 24 }} />;
  }
  if (cat.includes('play') || cat.includes('movie') || cat.includes('game') || cat.includes('entertainment') || cat.includes('show')) {
    return <SportsEsports sx={{ fontSize: 24 }} />;
  }
  return <Category sx={{ fontSize: 24 }} />;
};

const blankForm = {
  category: '',
  monthly_limit: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
};

export default function Budgets({ onError }) {
  const theme = useTheme();

  // Budget records
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadBudgets = () => {
    setLoading(true);
    api.get('/budgets/')
      .then(res => setRows(res.data.results || res.data || []))
      .catch(() => onError('Unable to retrieve budgets record.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (parseFloat(form.monthly_limit) <= 0) {
      onError('Monthly limit must be greater than zero.');
      return;
    }
    if (!form.category.trim()) {
      onError('Category is required.');
      return;
    }

    try {
      if (editId) {
        await api.put(`/budgets/${editId}/`, form);
      } else {
        await api.post('/budgets/', form);
      }
      setEditorOpen(false);
      setForm(blankForm);
      setEditId(null);
      loadBudgets();
    } catch {
      onError('A budget for this category and month may already exist.');
    }
  };

  const handleDeleteTrigger = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/budgets/${deleteId}/`);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      loadBudgets();
    } catch {
      onError('Could not delete the budget threshold.');
    }
  };

  return (
    <PageTransition>
      <Box sx={{ py: 1 }}>
        
        {/* Header Title Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Budget Thresholds</Typography>
            <Typography color="text.secondary">Establish monthly spending limits per expense category.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditId(null); setForm(blankForm); setEditorOpen(true); }} sx={{ alignSelf: 'flex-start' }}>
            Set budget
          </Button>
        </Stack>

        {/* Budgets Card Grid */}
        <Grid container spacing={3}>
          {rows.map((row) => {
            const limit = parseFloat(row.monthly_limit || 0);
            const spent = parseFloat(row.spent || 0);
            const remaining = parseFloat(row.remaining || 0);
            const pct = Math.min(100, limit > 0 ? (spent / limit) * 100 : 0);

            // Dynamic progress bar coloring
            const getProgressColor = () => {
              if (spent > limit) return 'error';
              if (pct >= 80) return 'warning';
              return 'success';
            };

            const isOverBudget = spent > limit;

            return (
              <Grid item xs={12} sm={6} md={4} key={row.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: `1px solid ${isOverBudget ? theme.palette.error.main + '40' : theme.palette.divider}`,
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header info */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '8px',
                            bgcolor: isOverBudget ? `${theme.palette.error.main}15` : `${theme.palette.primary.main}10`,
                            color: isOverBudget ? theme.palette.error.main : theme.palette.primary.main,
                            display: 'flex',
                          }}
                        >
                          {getCategoryIcon(row.category)}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
                            {row.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Period: {row.month}/{row.year}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => { setEditId(row.id); setForm(row); setEditorOpen(true); }}
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTrigger(row.id)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Spent vs Limit summary */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        ₹{spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        of ₹{limit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </Typography>
                    </Box>

                    {/* Progress Bar */}
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color={getProgressColor()}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 2,
                        bgcolor: theme.palette.divider,
                      }}
                    />

                    {/* Bottom Status bar */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color={isOverBudget ? 'error.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>
                        {isOverBudget 
                          ? `Exceeded by ₹${Math.abs(remaining).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` 
                          : `₹${remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })} remaining`
                        }
                      </Typography>

                      <Chip
                        size="small"
                        icon={isOverBudget ? <ErrorOutline sx={{ fontSize: '14px !important' }} /> : <CheckCircleOutline sx={{ fontSize: '14px !important' }} />}
                        label={isOverBudget ? 'Over Limit' : 'On Track'}
                        sx={{
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: isOverBudget ? `${theme.palette.error.main}12` : `${theme.palette.success.main}12`,
                          color: isOverBudget ? theme.palette.error.main : theme.palette.success.main,
                          border: `1px solid ${isOverBudget ? theme.palette.error.main : theme.palette.success.main}20`,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          {rows.length === 0 && !loading && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', border: `1px solid ${theme.palette.divider}` }}>
                <TrendingDown sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>No Budgets Configured</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Create budget targets to monitor category spending thresholds.
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setEditId(null); setForm(blankForm); setEditorOpen(true); }}>
                  Set budget target
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Budget Editor Dialog */}
        <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="xs" fullWidth>
          <Box component="form" onSubmit={handleSave}>
            <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit' : 'Configure'} Budget Limit</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                Set a monthly spending constraint for a particular category.
              </DialogContentText>
              
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  required
                  name="category"
                  label="Category Name"
                  value={form.category}
                  onChange={handleFormChange}
                  placeholder="e.g. Food, Utilities, Travel"
                />
                <TextField
                  fullWidth
                  required
                  name="monthly_limit"
                  label="Monthly Limit (Rs.)"
                  type="number"
                  value={form.monthly_limit}
                  onChange={handleFormChange}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      name="month"
                      label="Month"
                      value={form.month}
                      onChange={handleFormChange}
                      inputProps={{ min: 1, max: 12 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      name="year"
                      label="Year"
                      value={form.year}
                      onChange={handleFormChange}
                    />
                  </Grid>
                </Grid>
              </Stack>
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
          <DialogTitle sx={{ fontWeight: 700 }}>Delete Budget Target</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this budget category target? Spending limits for this period will no longer be tracked.
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
