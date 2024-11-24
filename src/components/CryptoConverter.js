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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 3 }} 
        alignItems="center"
        direction={isMobile ? 'column' : 'row'}
      >
        <Grid item xs={12} sm={5}>
          <Box sx={{ width: '100%', mb: { xs: 2, sm: 0 } }}>
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
          <Box sx={{ width: '100%', mt: 2 }}>
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
                >
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Grid>

        <Grid 
          item 
          xs={12} 
          sm={2} 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            my: { xs: 1, sm: 0 }
          }}
        >
          <IconButton onClick={swapCurrencies} color="primary">
            <SwapHoriz sx={{ transform: isMobile ? 'rotate(90deg)' : 'none' }} />
          </IconButton>
        </Grid>

        <Grid item xs={12} sm={5}>
          <Box sx={{ width: '100%', mb: { xs: 2, sm: 0 } }}>
            <TextField
              fullWidth
              label="Converted Amount"
              value={result.coins}
              InputProps={{
                readOnly: true,
                endAdornment: <Typography variant="body2" color="textSecondary">{getSymbol(toCrypto)}</Typography>
              }}
            />
          </Box>
          <Box sx={{ width: '100%', mt: 2 }}>
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
                >
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography 
            variant="body2" 
            color="textSecondary" 
            align="center"
            sx={{ mt: 2 }}
          >
            1 {getSymbol(fromCrypto)} = {result.rate} {getSymbol(toCrypto)}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CryptoConverter;
