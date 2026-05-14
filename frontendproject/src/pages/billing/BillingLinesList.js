import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import Pagination1 from "../../components/Pagination1";
import {
  getAllBillingLines,
  createBillingLine,
  updateBillingLine,
  deleteBillingLine,
} from "../../api/billingApi";
import "../../styles/Billing.css";

const EMPTY_FORM = { bookingID: "", loadID: "", amount: "", tariffApplied: "", notes: "" };

function validate(form) {
  const errs = {};
  if (!form.bookingID || isNaN(Number(form.bookingID))) errs.bookingID = "Valid Booking ID required.";
  if (!form.amount || Number(form.amount) <= 0) errs.amount = "Amount must be > 0.";
  if (!form.tariffApplied.trim()) errs.tariffApplied = "Tariff applied is required.";
  return errs;
}

function fmtBLId(id) { return "BL" + String(id).padStart(4, "0"); }
function fmtBKId(id) { if (!id) return "-"; return "BK" + String(id).padStart(3, "0"); }
function fmtLDId(id) { if (!id) return "-"; return "LD" + String(id).padStart(3, "0"); }
function getBillingLineId(record) { const bl = record.billing || record; return Number(bl.billingLineID ?? bl.id ?? bl.billingLineId) || 0; }
function fmtAmt(v) { return String.fromCharCode(8377) + (v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }); }

function ViewModal({ record, onClose, onEdit }) {
  if (!record) return null;
  const bl  = record.billing || record;
  const bk  = record.booking || {};
  const bkId = bl.bookingID || bk.bookingID;
  return (
    React.createElement("div", { className: "modal-overlay", onClick: onClose },
      React.createElement("div", { className: "modal", onClick: function(e){ e.stopPropagation(); } },
        React.createElement("div", { className: "modal-header-blue" },
          React.createElement("h2", { className: "modal-title" }, "Billing Line - " + fmtBLId(bl.billingLineID)),
          React.createElement("button", { className: "modal-close", onClick: onClose }, "\u2715")
        ),
        React.createElement("div", { className: "view-detail-grid" },
          React.createElement("div", { className: "view-detail-item" }, React.createElement("span", { className: "view-detail-label" }, "BL ID"), React.createElement("span", { className: "view-detail-value" }, fmtBLId(bl.billingLineID))),
          React.createElement("div", { className: "view-detail-item" }, React.createElement("span", { className: "view-detail-label" }, "Booking ID"), React.createElement("span", { className: "view-detail-value" }, fmtBKId(bkId))),
          React.createElement("div", { className: "view-detail-item" }, React.createElement("span", { className: "view-detail-label" }, "Load ID"), React.createElement("span", { className: "view-detail-value" }, fmtLDId(bl.loadID))),
          React.createElement("div", { className: "view-detail-item" }, React.createElement("span", { className: "view-detail-label" }, "Amount"), React.createElement("span", { className: "view-detail-value" }, fmtAmt(bl.amount))),
          React.createElement("div", { className: "view-detail-item full-width" }, React.createElement("span", { className: "view-detail-label" }, "Tariff Applied"), React.createElement("span", { className: "view-detail-value" }, bl.tariffApplied || "-")),
          React.createElement("div", { className: "view-detail-item" }, React.createElement("span", { className: "view-detail-label" }, "Shipper"), React.createElement("span", { className: "view-detail-value" }, (bk && bk.shipper && bk.shipper.name) || (bk.shipperID ? ("Shipper #" + bk.shipperID) : "-"))),
          React.createElement("div", { className: "view-detail-item" }, React.createElement("span", { className: "view-detail-label" }, "Booking Ref"), React.createElement("span", { className: "view-detail-value" }, bk.referenceNumber || "-")),
          React.createElement("div", { className: "view-detail-item full-width" }, React.createElement("span", { className: "view-detail-label" }, "Notes"), React.createElement("span", { className: "view-detail-value" }, bl.notes || "-"))
        ),
        React.createElement("div", { className: "modal-footer" },
          React.createElement("button", { className: "btn-secondary", onClick: onClose }, "Close"),
          React.createElement("button", { className: "btn-primary", onClick: onEdit }, "Edit")
        )
      )
    )
  );
}

export default function BillingLinesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [search, setSearch] = useState("");
  const [tariffFilter, setTariffFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getAllBillingLines()
      .then(setLines)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = lines.filter((r) => {
    const q = search.toLowerCase();
    const bl = r.billing || r;
    const matchSearch = !q || (
      fmtBLId(bl.billingLineID).toLowerCase().includes(q) ||
      fmtBKId(bl.bookingID).toLowerCase().includes(q) ||
      (bl.tariffApplied || "").toLowerCase().includes(q) ||
      (bl.notes || "").toLowerCase().includes(q)
    );
    const matchTariff = tariffFilter === "ALL" || (bl.tariffApplied || "") === tariffFilter;
    return matchSearch && matchTariff;
  });

  const tariffOptions = ["ALL", ...Array.from(new Set(lines.map((r) => (r.billing || r).tariffApplied || "").filter(Boolean))).sort()];

  const totalAmount = lines.reduce((s, r) => s + ((r.billing || r).amount || 0), 0);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setShowForm(true); };

  const openEdit = (r) => {
    const bl = r.billing || r;
    setEditTarget(bl.billingLineID);
    setForm({
      bookingID: bl.bookingID != null ? String(bl.bookingID) : "",
      loadID: bl.loadID != null ? String(bl.loadID) : "",
      amount: bl.amount != null ? String(bl.amount) : "",
      tariffApplied: bl.tariffApplied || "",
      notes: bl.notes || "",
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        bookingID: parseInt(form.bookingID, 10),
        loadID: form.loadID ? parseInt(form.loadID, 10) : null,
        amount: parseFloat(form.amount),
        tariffApplied: form.tariffApplied.trim(),
        notes: form.notes.trim() || null,
      };
      if (editTarget) {
        await updateBillingLine(editTarget, payload);
        setSuccess("Billing line updated successfully.");
      } else {
        await createBillingLine(payload);
        setSuccess("Billing line created successfully.");
      }
      setShowForm(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBillingLine(deleteTarget);
      setDeleteTarget(null);
      setSuccess('Billing line deleted successfully.');
      load();
    } catch (e) { setError(e.message); }
    finally { setDeleting(false); }
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleExport = () => {
    const rows = [['BL ID', 'Booking ID', 'Load ID', 'Amount', 'Tariff Applied', 'Notes']];
    filtered.forEach((r) => {
      const bl = r.billing || r;
      rows.push([bl.billingLineID, bl.bookingID, bl.loadID || '', bl.amount, bl.tariffApplied || '', bl.notes || '']);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-lines-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const text = await file.text();
      const [header, ...dataRows] = text.trim().split('\n');
      const cols = header.split(',').map((c) => c.replace(/"/g, '').trim().toLowerCase());
      let created = 0, failed = 0;
      for (const row of dataRows) {
        if (!row.trim()) continue;
        const vals = row.split(',').map((v) => v.replace(/^"|"$/g, '').trim());
        const obj = {};
        cols.forEach((c, i) => { obj[c] = vals[i] || ''; });
        const payload = {
          bookingID: parseInt(obj['booking id'] || obj['bookingid'] || obj['booking_id'], 10),
          loadID: obj['load id'] || obj['loadid'] || obj['load_id'] ? parseInt(obj['load id'] || obj['loadid'] || obj['load_id'], 10) : null,
          amount: parseFloat(obj['amount']),
          tariffApplied: obj['tariff applied'] || obj['tariffapplied'] || obj['tariff_applied'] || '',
          notes: obj['notes'] || null,
        };
        if (!payload.bookingID || isNaN(payload.bookingID) || isNaN(payload.amount)) { failed++; continue; }
        try { await createBillingLine(payload); created++; } catch { failed++; }
      }
      setSuccess(`Import complete: ${created} added${failed > 0 ? `, ${failed} skipped` : ''}.`);
      load();
    } catch (err) {
      setError('Import failed: ' + err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [lines]);

  const sortedBillingLines = [...filtered].sort((a, b) => getBillingLineId(b) - getBillingLineId(a));
  const totalPages = Math.ceil(sortedBillingLines.length / rowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const currentRows = sortedBillingLines.slice(indexOfFirstRow, indexOfFirstRow + rowsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };



  return (
    <Layout>
      <div className="billing-page" onClick={() => setOpenMenuId(null)}>

        <div className="page-header">
          <div>
            <h1 className="page-title">Billing Lines</h1>
            <p className="page-subtitle">Individual charge entries per booking</p>
          </div>
          <button className="btn-add-new" onClick={() => navigate('/billing/billing-lines/create')} title="Add Billing Line">+</button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        <div className="billing-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat-card">
            <div className="stat-label">Total Lines</div>
            <div className="stat-value">{loading ? "-" : lines.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Filtered</div>
            <div className="stat-value">{loading ? "-" : filtered.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Charged</div>
            <div className="stat-value-sm">{loading ? "-" : fmtAmt(totalAmount)}</div>
          </div>
        </div>

        <div className="table-section">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2b45', margin: '0 0 14px' }}>All Billing Lines</h2>
          <div className="table-toolbar">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input className="search-input" placeholder="Search by ID, booking or tariff..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="toolbar-right">
      
              <button className="btn-toolbar-action" onClick={handleExport} title="Export as CSV">↓ Export</button>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportFile} />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading billing lines...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">{search ? "No billing lines match your search." : "No billing lines yet."}</div>
          ) : (
            <div className="table-wrapper">
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Bl id</th>
                    <th>Booking</th>
                    <th>Amount</th>
                    <th>Tariff applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((r) => {
                    const bl = r.billing || r;
                    const bkId = bl.bookingID || ((r.booking || {}).bookingID);
                    return (
                      <tr key={bl.billingLineID}>
                        <td className="billing-id-cell">{fmtBLId(bl.billingLineID)}</td>
                        <td>{fmtBKId(bkId)}</td>
                        <td className="amount-cell">{fmtAmt(bl.amount)}</td>
                        <td><span className="rate-chip">{bl.tariffApplied || "-"}</span></td>
                        <td>
                          <div className="table-actions" style={{position:'relative'}}>
                            <button
                              className="btn-dots-menu"
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === bl.billingLineID ? null : bl.billingLineID); }}
                            >⋯</button>
                            {openMenuId === bl.billingLineID && (
                              <div className="dots-dropdown" onClick={(e) => e.stopPropagation()}>
                                <button className="dots-item" onClick={() => { setOpenMenuId(null); navigate(`/billing/billing-lines/view/${bl.billingLineID}`); }}>👁 View</button>
                                <button className="dots-item" onClick={() => { setOpenMenuId(null); navigate(`/billing/billing-lines/edit/${bl.billingLineID}`); }}>✏️ Edit</button>
                                <button className="dots-item dots-item-danger" onClick={() => { setOpenMenuId(null); setDeleteTarget(bl.billingLineID); }}>🗑 Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Pagination1
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              infoText={`Page ${currentPage} of ${totalPages}`}
            />
          </div>
        )}

        <ViewModal
          record={viewRecord}
          onClose={() => setViewRecord(null)}
          onEdit={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}
        />

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editTarget ? "Edit Billing Line" : "New Billing Line"}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&#x2715;</button>
              </div>
              <div className="modal-body">
                <div className="form-row-2">
                  <div className="form-field">
                    <label>Booking ID <span className="required">*</span></label>
                    <input type="number" name="bookingID" value={form.bookingID} onChange={handleField} placeholder="e.g. 1" min="1" className={formErrors.bookingID ? "input-error" : ""} />
                    {formErrors.bookingID && <span className="field-error">{formErrors.bookingID}</span>}
                  </div>
                  <div className="form-field">
                    <label>Load ID <span style={{ fontSize: 12, color: "#94a3b8" }}>(optional)</span></label>
                    <input type="number" name="loadID" value={form.loadID} onChange={handleField} placeholder="e.g. 5" min="1" />
                  </div>
                </div>
                <div className="form-field">
                  <label>Amount <span className="required">*</span></label>
                  <input type="number" name="amount" value={form.amount} onChange={handleField} min="0.01" step="0.01" placeholder="0.00" className={formErrors.amount ? "input-error" : ""} />
                  {formErrors.amount && <span className="field-error">{formErrors.amount}</span>}
                </div>
                <div className="form-field">
                  <label>Tariff Applied <span className="required">*</span></label>
                  <input name="tariffApplied" value={form.tariffApplied} onChange={handleField} placeholder="e.g. Standard Freight @ 2.5/kg" className={formErrors.tariffApplied ? "input-error" : ""} />
                  {formErrors.tariffApplied && <span className="field-error">{formErrors.tariffApplied}</span>}
                </div>
                <div className="form-field">
                  <label>Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleField} rows={3} placeholder="Any remarks..." />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editTarget ? "Update" : "Create"}</button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <div className="delete-confirm-icon">🗑️</div>
              <p className="delete-confirm-text">Delete billing line <strong>{fmtBLId(deleteTarget)}</strong>? This cannot be undone.</p>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button>
              </div>
            </div>
          </div>
        )}


      </div>
    </Layout>
  );
}
