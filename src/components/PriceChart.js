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

  const calculateProfit = (currentValue, startValue, fromPrice, toPrice, fromSymbol, toSymbol) => {
    // Calculate basic exchange rate change
    const ratioChange = currentValue - startValue;
    const ratioPercentage = ((currentValue - startValue) / startValue) * 100;

    // Calculate value in USD
    const startValueUSD = startValue * toPrice;
    const currentValueUSD = currentValue * toPrice;
    const profitUSD = currentValueUSD - startValueUSD;
    
    // Calculate profit in terms of both cryptocurrencies
    const profitInFromCrypto = profitUSD / fromPrice;
    const profitInToCrypto = profitUSD / toPrice;

    return {
      ratio: {
        profit: ratioChange.toFixed(8),
        percentage: ratioPercentage.toFixed(2)
      },
      usd: {
        profit: profitUSD.toFixed(2),
        percentage: ((profitUSD / startValueUSD) * 100).toFixed(2)
      },
      crypto: {
        from: {
          amount: profitInFromCrypto.toFixed(8),
          symbol: fromSymbol
        },
        to: {
          amount: profitInToCrypto.toFixed(8),
          symbol: toSymbol
        }
      }
    };
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const fromSymbol = getSymbol(fromCrypto);
    const toSymbol = getSymbol(toCrypto);
    
    // Get values from payload
    const fromPrice = payload[0].payload.fromPrice;
    const toPrice = payload[0].payload.toPrice;
    const ratio = payload[0].payload.ratio;
    
    // Calculate profit/loss from start of period
    const startRatio = data[0].ratio;
    const profitInfo = calculateProfit(ratio, startRatio, fromPrice, toPrice, fromSymbol, toSymbol);
    const isProfitable = Number(profitInfo.ratio.profit) >= 0;

    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 3,
          minWidth: isMobile ? 200 : 250,
          fontSize: isMobile ? 12 : 14
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        <Typography variant="body2" color="primary.main" gutterBottom>
          1 {fromSymbol} = {formatCoins(fromPrice)} USD
        </Typography>
        <Typography variant="body2" color="secondary.main" gutterBottom>
          1 {toSymbol} = {formatCoins(toPrice)} USD
        </Typography>
        <Typography variant="body2" color="success.main" gutterBottom>
          Exchange Rate: 1 {fromSymbol} = {formatCoins(ratio)} {toSymbol}
        </Typography>
        
        <Box sx={{ 
          mt: 1.5, 
          pt: 1.5, 
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography 
            variant="body2" 
            color={isProfitable ? 'success.main' : 'error.main'}
            fontWeight="bold"
            gutterBottom
          >
            Profit/Loss:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rate: {profitInfo.ratio.profit} {toSymbol} ({profitInfo.ratio.percentage}%)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            USD: ${profitInfo.usd.profit} ({profitInfo.usd.percentage}%)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fromSymbol}: {profitInfo.crypto.from.amount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {toSymbol}: {profitInfo.crypto.to.amount}
          </Typography>
        </Box>
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
  const ratios = data.map(d => d.ratio);
  const minRatio = Math.min(...ratios);
  const maxRatio = Math.max(...ratios);
  const padding = (maxRatio - minRatio) * 0.1;

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
              top: 20,
              right: isMobile ? 30 : 80,
              left: isMobile ? 10 : 80,
              bottom: 20
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              interval="preserveStartEnd"
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: isMobile ? 10 : 11 }}
              stroke="rgba(255, 255, 255, 0.1)"
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 60 : 30}
              tickMargin={10}
            />
            <YAxis
              yAxisId="price"
              tickFormatter={formatCoins}
              domain={['auto', 'auto']}
              width={75}
              tick={{ 
                fill: 'rgba(255, 255, 255, 0.6)', 
                fontSize: isMobile ? 10 : 11,
                dx: -5
              }}
              stroke="rgba(255, 255, 255, 0.1)"
              tickMargin={5}
              label={{ 
                value: 'Price (USD)',
                angle: -90,
                position: 'insideLeft',
                fill: 'rgba(255, 255, 255, 0.6)',
                offset: -45,
                style: {
                  fontSize: isMobile ? 10 : 12,
                  textAnchor: 'middle'
                }
              }}
            />
            <YAxis
              yAxisId="ratio"
              orientation="right"
              tickFormatter={formatCoins}
              domain={['auto', 'auto']}
              width={75}
              tick={{ 
                fill: 'rgba(255, 255, 255, 0.6)', 
                fontSize: isMobile ? 10 : 11,
                dx: 5
              }}
              stroke="rgba(255, 255, 255, 0.1)"
              tickMargin={5}
              label={{ 
                value: 'Exchange Rate',
                angle: 90,
                position: 'insideRight',
                fill: 'rgba(255, 255, 255, 0.6)',
                offset: 45,
                style: {
                  fontSize: isMobile ? 10 : 12,
                  textAnchor: 'middle'
                }
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ 
                stroke: 'rgba(255, 255, 255, 0.2)',
                strokeWidth: 1,
                strokeDasharray: '5 5',
              }}
              wrapperStyle={{ zIndex: 1000 }}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              wrapperStyle={{ 
                paddingTop: '10px',
                paddingBottom: '5px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: isMobile ? 10 : 12
              }}
              iconSize={12}
              iconType="plainline"
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="fromPrice"
              stroke="#00bcd4"
              name={`${getSymbol(fromCrypto)} Price`}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: '#00bcd4', 
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="toPrice"
              stroke="#ff4081"
              name={`${getSymbol(toCrypto)} Price`}
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: '#ff4081', 
                stroke: '#fff',
                strokeWidth: 2,
              }}
            />
            <Line
              yAxisId="ratio"
              type="monotone"
              dataKey="ratio"
              stroke="#00e676"
              name="Exchange Rate"
              strokeWidth={2}
              dot={false}
              strokeDasharray="3 3"
              activeDot={{ 
                r: 6, 
                fill: '#00e676', 
                stroke: '#fff',
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
                  Starting Rate: {formatCoins(data[0].ratio)} {getSymbol(toCrypto)}/{getSymbol(fromCrypto)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Rate: {formatCoins(data[data.length - 1].ratio)} {getSymbol(toCrypto)}/{getSymbol(fromCrypto)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={data[data.length - 1].ratio > data[0].ratio ? 'success.main' : 'error.main'}
                >
                  Change: {((data[data.length - 1].ratio - data[0].ratio) / data[0].ratio * 100).toFixed(2)}%
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
