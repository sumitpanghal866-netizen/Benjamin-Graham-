const API_KEY = 'Mb6QeTf9ipELxuRgxAfEJtBheOB6PobT';

// Auto-fetch data from API
document.getElementById('fetch-btn').addEventListener('click', async () => {
  const symbol = document.getElementById('ticker').value.trim().toUpperCase();
  if (!symbol) {
    alert('Please enter a stock ticker (e.g., RELIANCE.NS or AAPL)');
    return;
  }

  const fetchBtn = document.getElementById('fetch-btn');
  fetchBtn.textContent = 'Fetching...';

  try {
    // 1. Fetch Real-time Stock Price & EPS
    const quoteRes = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`);
    const quoteData = await quoteRes.json();

    if (!quoteData || quoteData.length === 0) {
      alert('Stock symbol not found. Double check the ticker.');
      fetchBtn.textContent = 'Fetch Data';
      return;
    }

    const price = quoteData[0].price;
    const eps = quoteData[0].eps;

    // 2. Fetch Key Metrics (Book Value per share)
    const metricsRes = await fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${API_KEY}`);
    const metricsData = await metricsRes.json();

    const bvps = metricsData && metricsData.length > 0 ? metricsData[0].bookValuePerShareTTM : 0;

    // Auto-fill form inputs
    document.getElementById('cmp').value = price ? price.toFixed(2) : '';
    document.getElementById('eps').value = eps ? eps.toFixed(2) : '';
    document.getElementById('bvps').value = bvps ? bvps.toFixed(2) : '';

    alert(`Data loaded for ${symbol}!`);
  } catch (err) {
    console.error('API Fetch Error:', err);
    alert('Failed to fetch data. Please check your network or try again.');
  } finally {
    fetchBtn.textContent = 'Fetch Data';
  }
});

// Calculate Graham Valuation
document.getElementById('calc-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const cmp = parseFloat(document.getElementById('cmp').value);
  const eps = parseFloat(document.getElementById('eps').value);
  const bvps = parseFloat(document.getElementById('bvps').value);
  const g = parseFloat(document.getElementById('growth').value);
  const Y = parseFloat(document.getElementById('bondYield').value);

  const resultsDiv = document.getElementById('results');
  const statusDiv = document.getElementById('valuation-status');

  if (eps <= 0 || bvps <= 0) {
    alert("Graham's formula requires positive EPS and Book Value.");
    return;
  }

  // Graham Number Formula: sqrt(22.5 * EPS * BVPS)
  const grahamNumber = Math.sqrt(22.5 * eps * bvps);

  // Intrinsic Value Formula: (EPS * (8.5 + 2g) * 4.4) / Y
  const intrinsicValue = (eps * (8.5 + 2 * g) * 4.4) / Y;

  document.getElementById('graham-number').textContent = '₹' + grahamNumber.toFixed(2);
  document.getElementById('intrinsic-value').textContent = '₹' + intrinsicValue.toFixed(2);

  resultsDiv.classList.remove('hidden');

  if (cmp < grahamNumber) {
    const margin = (((grahamNumber - cmp) / grahamNumber) * 100).toFixed(1);
    statusDiv.textContent = `Undervalued (Margin of Safety: ${margin}%)`;
    statusDiv.className = 'status undervalued';
  } else {
    statusDiv.textContent = `Overvalued relative to Graham Number`;
    statusDiv.className = 'status overvalued';
  }
});
