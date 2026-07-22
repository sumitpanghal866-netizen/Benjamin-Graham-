const API_KEY = 'Mb6QeTf9ipELxuRgxAfEJtBheOB6PobT';

// Step 1: Search symbol by company name, then fetch market data
document.getElementById('search-btn').addEventListener('click', async () => {
  const query = document.getElementById('stock-name').value.trim();
  if (!query) {
    alert('Please enter a company name (e.g., Reliance, Tata, Apple)');
    return;
  }

  const searchBtn = document.getElementById('search-btn');
  const symbolText = document.getElementById('selected-symbol-text');
  searchBtn.textContent = 'Searching...';
  symbolText.textContent = '';

  try {
    // 1. Search for ticker symbol by company name
    const searchRes = await fetch(`https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(query)}&limit=5&apikey=${API_KEY}`);
    const searchData = await searchRes.json();

    if (!searchData || searchData.length === 0) {
      alert('No company found matching that name. Try a clearer search term.');
      searchBtn.textContent = 'Search & Auto-Fill';
      return;
    }

    // Pick the most relevant match (prefers NSE/BSE for Indian queries if available)
    let bestMatch = searchData.find(item => item.symbol.endsWith('.NS')) || searchData[0];
    const symbol = bestMatch.symbol;
    const companyName = bestMatch.name;

    symbolText.textContent = `Found: ${companyName} (${symbol})`;

    // 2. Fetch Stock Quote (Price & EPS)
    const quoteRes = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`);
    const quoteData = await quoteRes.json();

    if (quoteData && quoteData.length > 0) {
      const price = quoteData[0].price;
      const eps = quoteData[0].eps;

      document.getElementById('cmp').value = price ? price.toFixed(2) : '';
      document.getElementById('eps').value = eps ? eps.toFixed(2) : '';
    }

    // 3. Fetch Book Value Per Share (BVPS)
    const metricsRes = await fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${symbol}?apikey=${API_KEY}`);
    const metricsData = await metricsRes.json();

    if (metricsData && metricsData.length > 0) {
      const bvps = metricsData[0].bookValuePerShareTTM;
      document.getElementById('bvps').value = bvps ? bvps.toFixed(2) : '';
    }

  } catch (err) {
    console.error('API Search Error:', err);
    alert('Error retrieving data. Check network or search term.');
  } finally {
    searchBtn.textContent = 'Search & Auto-Fill';
  }
});

// Step 2: Calculate Graham Valuation
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

  // Graham Number: sqrt(22.5 * EPS * BVPS)
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
