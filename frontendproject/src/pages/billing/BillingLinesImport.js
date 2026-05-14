import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createBillingLine } from '../../api/billingApi';
import '../../styles/Billing.css';

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { rows: [], errors: ['CSV has no data rows.'] };
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const required = ['bookingid', 'amount', 'tariffapplied'];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length) return { rows: [], errors: [`Missing columns: ${missing.join(', ')}`] };

  const rows = [];
  const errors = [];
  lines.slice(1).forEach((line, i) => {
    if (!line.trim()) return;
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    if (!row['bookingid'] || isNaN(Number(row['bookingid']))) {
      errors.push(`Row ${i + 2}: invalid bookingID "${row['bookingid']}"`);
      return;
    }
    if (!row['amount'] || isNaN(Number(row['amount'])) || Number(row['amount']) <= 0) {
      errors.push(`Row ${i + 2}: invalid amount "${row['amount']}"`);
      return;
    }
    if (!row['tariffapplied']) {
      errors.push(`Row ${i + 2}: tariffApplied is required`);
      return;
    }
    rows.push({
      bookingID:     parseInt(row['bookingid'], 10),
      loadID:        row['loadid'] ? parseInt(row['loadid'], 10) : null,
      amount:        parseFloat(row['amount']),
      tariffApplied: row['tariffapplied'],
      notes:         row['notes'] || null,
    });
  });
  return { rows, errors };
}

export default function BillingLinesImport() {
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [fileName,   setFileName]   = useState('');
  const [preview,    setPreview]    = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importing,  setImporting]  = useState(false);
  const [results,    setResults]    = useState(null);
  const [fileError,  setFileError]  = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setFileError('Please upload a .csv file.'); return; }
    setFileError('');
    setFileName(file.name);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows, errors } = parseCsv(ev.target.result);
      setPreview(rows);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setImporting(true);
    let success = 0, failed = 0, failedRows = [];
    for (const row of preview) {
      try {
        await createBillingLine(row);
        success++;
      } catch (e) {
        failed++;
        failedRows.push(`BookingID ${row.bookingID}: ${e.message}`);
      }
    }
    setImporting(false);
    setResults({ success, failed, failedRows });
    setPreview([]);
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csv = 'bookingID,loadID,amount,tariffApplied,notes\n1,,500.00,STANDARD,Example note\n2,3,250.50,EXPRESS,\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'billing_lines_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="billing-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">📥 Import Billing Lines</h1>
            <p className="page-subtitle">Upload a CSV file to bulk-create billing entries</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/billing/billing-lines')}>← Back</button>
        </div>

        {/* Template download */}
        <div className="import-tip-card">
          <span>📄 Need a template?</span>
          <button className="btn-link" onClick={downloadTemplate}>Download CSV Template</button>
          <span style={{ color: '#94a3b8', fontSize: 12 }}>Required columns: <strong>bookingID, amount, tariffApplied</strong> &nbsp;|&nbsp; Optional: loadID, notes</span>
        </div>

        {/* File picker */}
        <div className="import-upload-card">
          <label className="import-file-label">
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
            <div className="import-dropzone">
              <div className="import-drop-icon">📂</div>
              <div className="import-drop-text">{fileName || 'Click to choose a CSV file'}</div>
              <div className="import-drop-sub">Only .csv files are accepted</div>
            </div>
          </label>
          {fileError && <div className="error-banner">{fileError}</div>}
        </div>

        {/* Parse errors */}
        {parseErrors.length > 0 && (
          <div className="import-errors-card">
            <div className="import-errors-title">⚠️ {parseErrors.length} row(s) skipped</div>
            <ul className="import-errors-list">
              {parseErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="table-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a2b45', margin: 0 }}>
                Preview — {preview.length} valid row(s)
              </h2>
              <button className="btn-add-new" onClick={handleImport} disabled={importing} style={{ fontSize: 13, padding: '8px 20px' }}>
                {importing ? 'Importing…' : `✅ Import ${preview.length} rows`}
              </button>
            </div>
            <div className="table-wrapper">
              <table className="billing-table">
                <thead>
                  <tr><th>Booking ID</th><th>Load ID</th><th>Amount</th><th>Tariff</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i}>
                      <td>BK{String(r.bookingID).padStart(3, '0')}</td>
                      <td>{r.loadID || '—'}</td>
                      <td>₹{r.amount.toLocaleString()}</td>
                      <td><span className="rate-chip">{r.tariffApplied}</span></td>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className={`import-result-card ${results.failed === 0 ? 'import-result-success' : 'import-result-partial'}`}>
            <div className="import-result-title">
              {results.failed === 0 ? '✅ Import Complete' : '⚠️ Import Partially Complete'}
            </div>
            <div className="import-result-stats">
              <span style={{ color: '#16a34a' }}>✓ {results.success} imported</span>
              {results.failed > 0 && <span style={{ color: '#dc2626' }}>✗ {results.failed} failed</span>}
            </div>
            {results.failedRows.length > 0 && (
              <ul className="import-errors-list">
                {results.failedRows.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
            <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => navigate('/billing/billing-lines')}>
              View Billing Lines
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
