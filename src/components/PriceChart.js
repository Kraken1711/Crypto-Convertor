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
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const PriceChart = ({ data, fromCrypto, toCrypto, cryptoList }) => {
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

  if (!data || data.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  // Calculate min and max values for better chart scaling
  const fromPrices = data.map(d => d.fromPrice);
  const toPrices = data.map(d => d.toPrice);
  const minPrice = Math.min(...fromPrices, ...toPrices);
  const maxPrice = Math.max(...fromPrices, ...toPrices);
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{
            background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
          }}
        >
          30-Day Price Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compare {getSymbol(fromCrypto)} and {getSymbol(toCrypto)} prices and exchange rate
        </Typography>
      </Box>
      <Box sx={{ width: '100%', height: 500, mt: 4 }}>
        <ResponsiveContainer>
          <LineChart 
            data={data}
            margin={{
              top: 20,
              right: 80,
              left: 80,
              bottom: 20
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="formattedDate"
              interval="preserveStartEnd"
              tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
              stroke="rgba(255, 255, 255, 0.1)"
              angle={-45}
              textAnchor="end"
              height={60}
              tickMargin={10}
            />
            <YAxis
              yAxisId="price"
              tickFormatter={formatCoins}
              domain={[minPrice - padding, maxPrice + padding]}
              width={75}
              tick={{ 
                fill: 'rgba(255, 255, 255, 0.6)', 
                fontSize: 11,
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
                  fontSize: 12,
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
                fontSize: 11,
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
                  fontSize: 12,
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
              offset={20}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              wrapperStyle={{ 
                paddingTop: '10px',
                paddingBottom: '5px',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
              formatter={(value) => {
                return <span style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '12px', 
                  padding: '4px 8px',
                  marginRight: '8px'
                }}>{value}</span>;
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
    </Paper>
  );
};

export default PriceChart;
