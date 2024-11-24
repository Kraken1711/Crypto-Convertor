import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Snackbar, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CryptoConverter from './components/CryptoConverter';
import PriceChart from './components/PriceChart';
import { fetchCryptoData, fetchCryptoHistory } from './services/api';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4',
      light: '#33c9dc',
      dark: '#008394',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff669a',
      dark: '#b22c5a',
    },
    background: {
      default: '#000000',
      paper: 'rgba(25, 25, 25, 0.95)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    success: {
      main: '#00e676',
      light: '#33eb91',
      dark: '#00a152',
    },
    error: {
      main: '#ff1744',
      light: '#ff4569',
      dark: '#b2102f',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      background: 'linear-gradient(45deg, #00bcd4 30%, #ff4081 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 2px 10px rgba(0, 188, 212, 0.3)',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '0.5px',
    },
    subtitle1: {
      letterSpacing: '0.15px',
      opacity: 0.9,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(25, 25, 25, 0.95)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'border-color 0.2s ease-in-out',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00bcd4',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
});

function App() {
  const [loading, setLoading] = useState(true);
  const [cryptoList, setCryptoList] = useState([]);
  const [fromCrypto, setFromCrypto] = useState(null);
  const [toCrypto, setToCrypto] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const data = await fetchCryptoData();
        setCryptoList(data);
        if (data.length >= 2) {
          setFromCrypto(data[0].id);
          setToCrypto(data[1].id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setError('Failed to load cryptocurrency data. Please try again later.');
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      if (fromCrypto && toCrypto) {
        try {
          setLoading(true);
          const historyData = await fetchCryptoHistory(fromCrypto, toCrypto);
          setChartData(historyData);
        } catch (error) {
          console.error('Error fetching crypto history:', error);
          setError('Failed to load price history. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchChartData();
  }, [fromCrypto, toCrypto]);

  const handleFromCryptoSelect = (cryptoId) => {
    setFromCrypto(cryptoId);
  };

  const handleToCryptoSelect = (cryptoId) => {
    setToCrypto(cryptoId);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #000000 0%, #121212 100%)',
          py: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'radial-gradient(circle at 50% 0%, rgba(0, 188, 212, 0.15), transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2,
              }}
            >
              Crypto Converter
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                opacity: 0.8,
                maxWidth: 600,
                mx: 'auto',
                mb: 3,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Convert and track cryptocurrency prices in real-time with our advanced comparison tools
            </Typography>
          </Box>

          <CryptoConverter 
            cryptoList={cryptoList}
            onFromCryptoSelect={handleFromCryptoSelect}
            onToCryptoSelect={handleToCryptoSelect}
            fromCrypto={fromCrypto}
            toCrypto={toCrypto}
          />
          
          {fromCrypto && toCrypto && (
            <Box sx={{ mt: 4 }}>
              <PriceChart 
                fromCrypto={fromCrypto}
                toCrypto={toCrypto}
                data={chartData}
                cryptoList={cryptoList}
              />
            </Box>
          )}

          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={handleCloseError}
              severity="error"
              variant="filled"
              sx={{ width: '100%' }}
            >
              {error}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
