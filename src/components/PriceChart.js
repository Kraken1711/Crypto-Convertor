import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Paper, Typography, Box, CircularProgress, useTheme, useMediaQuery } from '@mui/material';

const PriceChart = ({ data, fromCrypto, toCrypto, cryptoList }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatCoins = (value) => {
    if (!value) return '0';
    return value.toFixed(8);
  };

  const getSymbol = (cryptoId) => {
    const crypto = cryptoList?.find(c => c.id === cryptoId);
    return crypto ? crypto.symbol.toUpperCase() : '';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {formatCoins(entry.value)}
          </Typography>
        ))}
      </Box>
    );
  };

  if (!data || !cryptoList) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mt: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: isMobile ? 300 : 400
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  // Calculate min and max values for better chart scaling
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mt: 3,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <Typography variant="h6" gutterBottom align="center">
        30 Day Price History
      </Typography>
      
      <Box 
        sx={{ 
          width: '100%', 
          height: isMobile ? 300 : 400,
          mt: 2,
          '.recharts-wrapper': {
            maxWidth: '100%'
          }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: isMobile ? 10 : 30,
              left: isMobile ? -20 : 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={formatCoins}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 60 : 80}
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value) => [formatCoins(value), 'Price']}
              contentStyle={{ fontSize: isMobile ? 12 : 14 }}
            />
            <Legend 
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={false}
              name={`Exchange Rate (${getSymbol(fromCrypto)}/${getSymbol(toCrypto)})`}
              activeDot={{ 
                r: 6, 
                fill: theme.palette.primary.main, 
                stroke: theme.palette.background.paper,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {data.length > 0 && (
        <Box sx={{ mt: 3, px: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" gutterBottom align="center">
            Performance Analysis
          </Typography>
          <Box sx={{ 
            mt: 1, 
            pt: 1, 
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            {data.length > 1 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Starting Rate: {formatCoins(data[0].price)} {getSymbol(toCrypto)}/{getSymbol(fromCrypto)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Rate: {formatCoins(data[data.length - 1].price)} {getSymbol(toCrypto)}/{getSymbol(fromCrypto)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={data[data.length - 1].price > data[0].price ? 'success.main' : 'error.main'}
                >
                  Change: {((data[data.length - 1].price - data[0].price) / data[0].price * 100).toFixed(2)}%
                </Typography>
              </>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PriceChart;
