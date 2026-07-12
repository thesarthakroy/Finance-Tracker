import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Skeleton,
  useTheme,
  Chip,
  IconButton,
  Tooltip as MuiTooltip,
  Divider,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWalletOutlined,
  LightbulbOutlined,
  CalendarToday,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  CompareArrows,
} from '@mui/icons-material';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../services/api';
import PageTransition from '../components/PageTransition';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

// Animated Counter component
function AnimatedCounter({ value, prefix = '₹' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 600;
    const intervalTime = 20;
    const steps = Math.ceil(duration / intervalTime);
    const increment = end / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount((prev) => prev + increment);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{Number(count.toFixed(0)).toLocaleString('en-IN')}
    </span>
  );
}

// Single KPI Card
function KPICard({ title, value, type, trend, loading }) {
  const theme = useTheme();

  const getColors = () => {
    switch (type) {
      case 'income':
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.success.main}10 0%, ${theme.palette.success.main}20 100%)`,
          iconBg: theme.palette.success.main + '20',
          iconColor: theme.palette.success.main,
          icon: <TrendingUp />
        };
      case 'expense':
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.error.main}10 0%, ${theme.palette.error.main}20 100%)`,
          iconBg: theme.palette.error.main + '20',
          iconColor: theme.palette.error.main,
          icon: <TrendingDown />
        };
      case 'savings':
      default:
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.primary.main}20 100%)`,
          iconBg: theme.palette.primary.main + '20',
          iconColor: theme.palette.primary.main,
          icon: <AccountBalanceWalletOutlined />
        };
    }
  };

  const styling = getColors();

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
          <Skeleton variant="text" width="40%" height={20} />
        </CardContent>
      </Card>
    );
  }

  const isFavorable = (type === 'income' && trend >= 0) || (type === 'expense' && trend <= 0) || (type === 'savings' && trend >= 0);

  return (
    <Card
      sx={{
        height: '100%',
        background: styling.gradient,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: '8px',
              bgcolor: styling.iconBg,
              color: styling.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {styling.icon}
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: theme.palette.text.primary }}>
          <AnimatedCounter value={value} />
        </Typography>

        {trend !== undefined && trend !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', gap: 0.5 }}>
            <Chip
              size="small"
              icon={trend >= 0 ? <ArrowUpward style={{ fontSize: 12, color: 'inherit' }} /> : <ArrowDownward style={{ fontSize: 12, color: 'inherit' }} />}
              label={`${Math.abs(trend).toFixed(1)}%`}
              color={isFavorable ? 'success' : 'error'}
              variant="soft"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: isFavorable ? `${theme.palette.success.main}15` : `${theme.palette.error.main}15`,
                color: isFavorable ? theme.palette.success.main : theme.palette.error.main
              }}
            />
            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ onError }) {
  const theme = useTheme();
  const barChartRef = useRef(null);

  // States
  const [report, setReport] = useState(null);
  const [prevReport, setPrevReport] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'
  const [timeframeData, setTimeframeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate MoM trend percentages
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      // 1. Fetch current month summary report
      const currentRes = await api.get(`/reports/monthly/?month=${currentMonth}&year=${currentYear}`);
      setReport(currentRes.data);

      // 2. Fetch previous month summary report
      try {
        const prevRes = await api.get(`/reports/monthly/?month=${prevMonth}&year=${prevYear}`);
        setPrevReport(prevRes.data);
      } catch {
        setPrevReport(null); // Silent catch if first month of usage
      }

      // 3. Fetch timeframe data (default to monthly aggregated)
      await fetchTimeframeData('monthly');

    } catch (err) {
      onError('Unable to compile dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeframeData = async (type) => {
    setTimeframe(type);
    // Standard time calculation
    const today = new Date();
    let startDate = new Date();

    if (type === 'weekly') {
      startDate.setDate(today.getDate() - 7);
    } else if (type === 'monthly') {
      startDate.setDate(today.getDate() - 30);
    } else if (type === 'yearly') {
      startDate.setDate(today.getDate() - 365);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    try {
      // Query transactions list with date filter to aggregate on client
      const res = await api.get(`/transactions/?date__gte=${startStr}&date__lte=${endStr}&ordering=date`);
      const list = res.data.results || res.data || [];

      // Accumulate aggregates
      let incomeSum = 0;
      let expenseSum = 0;
      const catsMap = {};
      const timelinePoints = {};

      list.forEach((t) => {
        const amt = parseFloat(t.amount);
        const dateKey = t.date; // YYYY-MM-DD

        if (t.transaction_type === 'income') {
          incomeSum += amt;
        } else {
          expenseSum += amt;
          catsMap[t.category] = (catsMap[t.category] || 0) + amt;
        }

        // Timeline sorting bucket
        let timeBucket = dateKey; // default weekly day-by-day
        if (type === 'yearly') {
          // bucket by Month
          timeBucket = dateKey.slice(0, 7); // YYYY-MM
        }
        
        if (!timelinePoints[timeBucket]) {
          timelinePoints[timeBucket] = { income: 0, expense: 0 };
        }
        if (t.transaction_type === 'income') {
          timelinePoints[timeBucket].income += amt;
        } else {
          timelinePoints[timeBucket].expense += amt;
        }
      });

      // Format category breakdown
      const byCategory = Object.keys(catsMap).map(k => ({ category: k, total: catsMap[k] }));

      // Format timeline
      const sortedKeys = Object.keys(timelinePoints).sort();
      const timelineLabels = sortedKeys.map(k => {
        if (type === 'yearly') {
          const [yr, mn] = k.split('-');
          return new Date(yr, mn - 1).toLocaleString('en-IN', { month: 'short' });
        }
        const [yr, mn, dy] = k.split('-');
        return `${dy}/${mn}`;
      });

      setTimeframeData({
        income: incomeSum,
        expense: expenseSum,
        byCategory,
        labels: timelineLabels,
        timelineIncome: sortedKeys.map(k => timelinePoints[k].income),
        timelineExpense: sortedKeys.map(k => timelinePoints[k].expense),
      });

    } catch (err) {
      console.error('Error fetching timeframe data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const incomeMoM = calculateTrend(report?.income, prevReport?.income);
  const expenseMoM = calculateTrend(report?.expenses, prevReport?.expenses);
  const savingsMoM = calculateTrend(report?.savings, prevReport?.savings);

  // Chart configuration colors
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const errorColor = theme.palette.error.main;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.secondary,
          font: { family: "'Outfit', sans-serif", size: 12, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        titleFont: { family: "'Outfit', sans-serif", weight: 'bold' },
        bodyFont: { family: "'Inter', sans-serif" },
        padding: 10,
        boxPadding: 4,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary, font: { size: 10 } }
      },
      y: {
        grid: { color: theme.palette.divider, drawBorder: false },
        ticks: { color: theme.palette.text.secondary, font: { size: 10 } }
      }
    }
  };

  const timelineChartData = timeframeData ? {
    labels: timeframeData.labels,
    datasets: [
      {
        label: 'Income',
        data: timeframeData.timelineIncome,
        borderColor: secondaryColor,
        backgroundColor: secondaryColor + '20',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: secondaryColor,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: timeframeData.timelineExpense,
        borderColor: errorColor,
        backgroundColor: errorColor + '20',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: errorColor,
        pointHoverRadius: 6,
      }
    ]
  } : null;

  const categoryLabels = report?.by_category.map(x => x.category) || [];
  const categoryValues = report?.by_category.map(x => x.total) || [];

  const donutData = {
    labels: categoryLabels,
    datasets: [{
      data: categoryValues,
      backgroundColor: [
        '#6366f1',
        '#0d9488',
        '#fbbf24',
        '#f43f5e',
        '#a855f7',
        '#ec4899',
        '#3b82f6'
      ],
      borderWidth: theme.palette.mode === 'dark' ? 2 : 1,
      borderColor: theme.palette.background.paper,
    }]
  };

  return (
    <PageTransition>
      <Box sx={{ py: 1 }}>
        {/* Dashboard Title row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Financial Overview</Typography>
            {report ? (
              <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <CalendarToday sx={{ fontSize: 16 }} /> Statement details for {new Date(report.year, report.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
              </Typography>
            ) : (
              <Skeleton width={200} height={20} />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Timeline switcher */}
            <ButtonGroup variant="soft" size="small" sx={{ bgcolor: theme.palette.background.paper, borderRadius: '8px', border: `1px solid ${theme.palette.divider}`, p: 0.5 }}>
              {['weekly', 'monthly', 'yearly'].map((type) => (
                <Button
                  key={type}
                  onClick={() => fetchTimeframeData(type)}
                  sx={{
                    px: 2.5,
                    borderRadius: '6px !important',
                    border: 'none !important',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    bgcolor: timeframe === type ? theme.palette.primary.main : 'transparent',
                    color: timeframe === type ? '#ffffff' : theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: timeframe === type ? theme.palette.primary.main : theme.palette.action.hover,
                    }
                  }}
                >
                  {type}
                </Button>
              ))}
            </ButtonGroup>
            <MuiTooltip title="Reload Records">
              <IconButton onClick={loadDashboardData} color="inherit" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', bgcolor: theme.palette.background.paper }}>
                <Refresh />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>

        {/* KPI Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <KPICard title="Total Income" value={report?.income} type="income" trend={incomeMoM} loading={loading} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KPICard title="Total Expenses" value={report?.expenses} type="expense" trend={expenseMoM} loading={loading} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KPICard title="Net Savings" value={report?.savings} type="savings" trend={savingsMoM} loading={loading} />
          </Grid>
        </Grid>

        {/* Charts & Insights Layout */}
        <Grid container spacing={3}>
          {/* Main Timeframe Line Graph */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', minHeight: 400 }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Cash Flow Timeline</Typography>
                <Box sx={{ flexGrow: 1, minHeight: 300, position: 'relative' }}>
                  {loading ? (
                    <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: '8px' }} />
                  ) : timelineChartData ? (
                    <Line data={timelineChartData} options={chartOptions} />
                  ) : (
                    <Box sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">No analytics records for this period.</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Expense Categories breakdown donut */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', minHeight: 400 }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Expense Category Share</Typography>
                <Box sx={{ flexGrow: 1, minHeight: 280, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loading ? (
                    <Skeleton variant="circular" width={220} height={220} />
                  ) : categoryLabels.length > 0 ? (
                    <Doughnut
                      data={donutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 10,
                              font: { family: "'Inter', sans-serif", size: 11 },
                              color: theme.palette.text.secondary
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', px: 2 }}>
                      <CompareArrows sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 1, opacity: 0.6 }} />
                      <Typography variant="body2" color="text.secondary">
                        Add expense transactions to visualize the breakdown.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Personalized Insights Feed */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbOutlined color="warning" /> Personalized Financial Insights
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {loading ? (
                  <Stack spacing={1}>
                    <Skeleton height={24} />
                    <Skeleton height={24} />
                    <Skeleton height={24} />
                  </Stack>
                ) : (
                  <List sx={{ p: 0 }}>
                    {(report?.insights || []).map((insight, idx) => (
                      <ListItem
                        key={idx}
                        sx={{
                          borderRadius: '8px',
                          mb: 1,
                          bgcolor: theme.palette.action.hover,
                          px: 2,
                          py: 1.5,
                          borderLeft: `3px solid ${theme.palette.secondary.main}`
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: theme.palette.secondary.main }}>
                          <LightbulbOutlined sx={{ fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={insight}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: theme.palette.text.primary
                          }}
                        />
                      </ListItem>
                    ))}
                    {(!report?.insights || report.insights.length === 0) && (
                      <ListItem sx={{ textAlign: 'center', py: 2 }}>
                        <ListItemText primary="Add transactions to receive financial health alerts." primaryTypographyProps={{ color: 'text.secondary', fontSize: '0.9rem' }} />
                      </ListItem>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageTransition>
  );
}
