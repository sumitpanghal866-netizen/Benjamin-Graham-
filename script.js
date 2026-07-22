document.getElementById('calc-form').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get input values
  const cmp = parseFloat(document.getElementById('cmp').value);
  const eps = parseFloat(document.getElementById('eps').value);
  const bvps = parseFloat(document.getElementById('bvps').value);
  const g = parseFloat(document.getElementById('growth').value);
  const Y = parseFloat(document.getElementById('bondYield').value);

  const resultsDiv = document.getElementById('results');
  const statusDiv = document.getElementById('valuation-status');

  // Handle invalid edge cases (e.g. negative earnings or book value)
  if (eps <= 0 || bvps <= 0) {
    alert("Graham's formula requires positive EPS and Book Value.");
    return;
  }

  // 1. Calculate Graham Number
  const grahamNumber = Math.sqrt(22.5 * eps * bvps);

  // 2. Calculate Revised Intrinsic Value
  // V = (EPS * (8.5 + 2g) * 4.4) / Y
  const intrinsicValue = (eps * (8.5 + 2 * g) * 4.4) / Y;

  // Display results
  document.getElementById('graham-number').textContent = grahamNumber.toFixed(2);
  document.getElementById('intrinsic-value').textContent = intrinsicValue.toFixed(2);

  // Evaluate status against Graham Number
  resultsDiv.classList.remove('hidden');

  if (cmp < grahamNumber) {
    statusDiv.textContent = `Undervalued (Margin of Safety: ${(((grahamNumber - cmp) / grahamNumber) * 100).toFixed(1)}%)`;
    statusDiv.className = 'status undervalued';
  } else {
    statusDiv.textContent = `Overvalued relative to Graham Number`;
    statusDiv.className = 'status overvalued';
  }
});
