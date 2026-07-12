import React, { useState, useEffect } from 'react';
import {
  Button,
  Paper,
  Stack,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  MenuItem,
  Divider,
  Box,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  PictureAsPdf,
  GridOn,
  InsertDriveFileOutlined,
  Download,
  CalendarToday,
  InfoOutlined,
  AccountBalanceWalletOutlined
} from '@mui/icons-material';
import api from '../services/api';
import PageTransition from '../components/PageTransition';

export default function Reports({ onError }) {
  const theme = useTheme();

  // Current Date
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  // Report statistics preview
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);

  // Load preview data whenever period changes
  const loadPreviewData = () => {
    setLoadingPreview(true);
    api.get(`/reports/monthly/?month=${month}&year=${year}`)
      .then(res => setPreview(res.data))
      .catch(() => onError('Unable to load report summary preview.'))
      .finally(() => setLoadingPreview(false));
  };

  useEffect(() => {
    loadPreviewData();
  }, [month, year]);

  // Download executor
  const download = async (format) => {
    try {
      const response = await api.get(`/reports/export/${format}/?month=${month}&year=${year}`, {
        responseType: 'blob'
      });
      
      const fileExt = format === 'excel' ? 'xlsx' : format;
      const downloadName = `finance-statement-${year}-${String(month).padStart(2, '0')}.${fileExt}`;
      
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      onError(`Failed to export report as ${format.toUpperCase()}.`);
    }
  };

  const getFormatCard = (format, title, desc, icon, color) => (
    <Card
      sx={{
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme.shadows[6],
          borderColor: color
        }
      }}
    >
      <CardActionArea onClick={() => download(format)} sx={{ height: '100%', p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '8px',
              bgcolor: color + '12',
              color: color,
              alignSelf: 'flex-start',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
            {desc}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: color, mt: 'auto', fontWeight: 600, fontSize: '0.875rem' }}>
            <Download sx={{ fontSize: 18 }} />
            <span>Generate File</span>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );

  return (
    <PageTransition>
      <Box sx={{ py: 1 }}>
        {/* Header Title Row */}
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Financial Reporting</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Generate and download structured financial statements for auditing.</Typography>

        <Grid container spacing={4}>
          {/* Settings Panel & Preview */}
          <Grid item xs={12} md={5}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday color="primary" /> Report Scope
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      select
                      label="Month"
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString('en-IN', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Year"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Quick Preview panel */}
            <Card sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoOutlined color="primary" /> Period Summary Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {loadingPreview ? (
                  <Stack spacing={1.5}>
                    <Skeleton height={20} />
                    <Skeleton height={20} />
                    <Skeleton height={20} />
                  </Stack>
                ) : preview ? (
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Total Inflows:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                        ₹{Number(preview.income).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Total Outflows:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                        ₹{Number(preview.expenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Net Balance:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: preview.savings >= 0 ? theme.palette.primary.main : theme.palette.error.main }}>
                        ₹{Number(preview.savings).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">No preview stats available.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Export card grid */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                {getFormatCard(
                  'pdf',
                  'PDF Statement',
                  'A beautifully styled financial document complete with branded headers, KPI cards, visual progress indicators, and transaction lists.',
                  <PictureAsPdf sx={{ fontSize: 24 }} />,
                  '#f43f5e'
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {getFormatCard(
                  'excel',
                  'Excel Sheet',
                  'Highly structured spreadsheet containing multi-sheet layouts: a Summary Dashboard and a detailed transaction spreadsheet with custom formatting.',
                  <GridOn sx={{ fontSize: 24 }} />,
                  '#10b981'
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {getFormatCard(
                  'csv',
                  'CSV Sheet',
                  'Standard comma-separated value plain text export including basic summary rows. Perfect for importing directly into custom spreadsheet sheets.',
                  <InsertDriveFileOutlined sx={{ fontSize: 24 }} />,
                  '#3b82f6'
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

      </Box>
    </PageTransition>
  );
}
