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
    return value.toFixed(8);
  };

  const getSymbol = (cryptoId) => {
    const crypto = cryptoList.find(c => c.id === cryptoId);
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
    if (active && payload && payload.length) {
      const fromSymbol = getSymbol(fromCrypto);
      const toSymbol = getSymbol(toCrypto);
      
      // Get values from payload
      const fromPrice = payload[0].value;
      const toPrice = payload[1].value;
      const ratio = payload[2].value;
      
      // Calculate profit/loss from start of period
      const startRatio = data[0].ratio;
      const profitInfo = calculateProfit(ratio, startRatio, fromPrice, toPrice, fromSymbol, toSymbol);
      const isProfitable = Number(profitInfo.ratio.profit) >= 0;
      
      return (
        <Paper 
          sx={{ 
            p: 2,
            backgroundColor: 'rgba(19, 47, 76, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Typography variant="body2" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {payload[0].payload.formattedDate}
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ color: '#4dabf5' }}>
            1 {fromSymbol} = {formatCoins(fromPrice)} USD
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ color: '#f73378' }}>
            1 {toSymbol} = {formatCoins(toPrice)} USD
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ color: '#81c784' }}>
            Exchange Rate: 1 {fromSymbol} = {formatCoins(ratio)} {toSymbol}
          </Typography>
          <Box sx={{ 
            mt: 1, 
            pt: 1, 
            borderTop: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isProfitable ? '#4caf50' : '#f44336',
                fontWeight: 'bold',
              }}
            >
              Profit/Loss:
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Rate: {profitInfo.ratio.profit} {toSymbol} ({profitInfo.ratio.percentage}%)
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              USD: ${profitInfo.usd.profit} ({profitInfo.usd.percentage}%)
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {fromSymbol}: {profitInfo.crypto.from.amount}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {toSymbol}: {profitInfo.crypto.to.amount}
            </Typography>
          </Box>
        </Paper>
      );
    }
    return null;
  };

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
      {!data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                  tickFormatter={formatCoins}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  width={isMobile ? 60 : 80}
                />
                <Tooltip 
                  formatter={(value) => [formatCoins(value), 'Price']}
                  contentStyle={{ fontSize: isMobile ? 12 : 14 }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#00BCD4"
                  strokeWidth={2}
                  dot={false}
                  name={`Exchange Rate (${getSymbol(fromCrypto)}/${getSymbol(toCrypto)})`}
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
                borderTop: '1px solid rgba(255, 255, 255, 0.12)'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#4caf50',
                    fontWeight: 'bold',
                  }}
                >
                  Profit/Loss:
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Rate: 
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  USD: 
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {getSymbol(fromCrypto)}: 
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {getSymbol(toCrypto)}: 
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default PriceChart;
