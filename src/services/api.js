import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: COINGECKO_API,
  timeout: 10000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`API Error: ${error.response.data.error || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up request. Please try again.');
    }
  }
);

export const fetchCryptoData = async () => {
  try {
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        sparkline: false,
        locale: 'en'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
};

export const fetchCryptoHistory = async (fromCryptoId, toCryptoId) => {
  try {
    const [fromResponse, toResponse] = await Promise.all([
      api.get(`/coins/${fromCryptoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: 30,
          interval: 'daily'
        }
      }),
      api.get(`/coins/${toCryptoId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: 30,
          interval: 'daily'
        }
      })
    ]);

    const fromPrices = fromResponse.data.prices;
    const toPrices = toResponse.data.prices;

    // Process the data to get exchange rates
    return fromPrices.map((fromPrice, index) => {
      const date = new Date(fromPrice[0]);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      const fromValue = fromPrice[1];
      const toValue = toPrices[index][1];
      const price = toValue / fromValue;

      return {
        date: formattedDate,
        price,
        timestamp: fromPrice[0],
        fromPrice: fromValue,
        toPrice: toValue
      };
    });
  } catch (error) {
    console.error('Error fetching crypto history:', error);
    throw error;
  }
};

export default api;
