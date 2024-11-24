import React, { useState } from 'react';
import {
  Paper,
  TextField,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  Box,
  Alert,
  Tooltip,
} from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';

const CryptoConverter = ({ 
  cryptoList, 
  onFromCryptoSelect, 
  onToCryptoSelect,
  fromCrypto,
  toCrypto
}) => {
  const [amount, setAmount] = useState('1');
  const [error, setError] = useState('');

  const handleFromCryptoChange = (event) => {
    onFromCryptoSelect(event.target.value);
  };

  const handleToCryptoChange = (event) => {
    onToCryptoSelect(event.target.value);
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (value === '' || value >= 0) {
      setAmount(value);
      setError('');
    } else {
      setError('Please enter a valid amount');
    }
  };

  const swapCurrencies = () => {
    onFromCryptoSelect(toCrypto);
    onToCryptoSelect(fromCrypto);
  };

  const getSymbol = (cryptoId) => {
    const crypto = cryptoList.find(c => c.id === cryptoId);
    return crypto ? crypto.symbol.toUpperCase() : '';
  };

  const calculateConversion = () => {
    if (!fromCrypto || !toCrypto || !amount) return { coins: '0', rate: '0' };
    const fromRate = cryptoList.find(crypto => crypto.id === fromCrypto)?.current_price || 0;
    const toRate = cryptoList.find(crypto => crypto.id === toCrypto)?.current_price || 0;
    if (toRate === 0) return { coins: '0', rate: '0' };
    
    const rate = fromRate / toRate;
    const coins = amount * rate;
    
    return {
      coins: coins.toFixed(8),
      rate: rate.toFixed(8)
    };
  };

  const result = calculateConversion();

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={5}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              InputProps={{ 
                inputProps: { min: 0, step: 'any' },
                endAdornment: <Typography variant="body2" color="textSecondary">{getSymbol(fromCrypto)}</Typography>
              }}
            />
          </Box>
          <TextField
            select
            fullWidth
            label="From Currency"
            value={fromCrypto || ''}
            onChange={handleFromCryptoChange}
          >
            {cryptoList.map((crypto) => (
              <MenuItem 
                key={crypto.id} 
                value={crypto.id}
                disabled={crypto.id === toCrypto}
              >
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
          <Tooltip title="Swap currencies">
            <IconButton 
              onClick={swapCurrencies} 
              color="primary"
              disabled={!fromCrypto || !toCrypto}
            >
              <SwapHoriz sx={{ fontSize: 40 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            1 {getSymbol(fromCrypto)} = {result.rate} {getSymbol(toCrypto)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              disabled
              value={result.coins}
              InputProps={{
                readOnly: true,
                endAdornment: <Typography variant="body2" color="textSecondary">{getSymbol(toCrypto)}</Typography>
              }}
            />
          </Box>
          <TextField
            select
            fullWidth
            label="To Currency"
            value={toCrypto || ''}
            onChange={handleToCryptoChange}
          >
            {cryptoList.map((crypto) => (
              <MenuItem 
                key={crypto.id} 
                value={crypto.id}
                disabled={crypto.id === fromCrypto}
              >
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CryptoConverter;
