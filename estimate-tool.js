// estimate-tool.js
(function() {
  'use strict';

  // Auth guard
  if (sessionStorage.getItem('arpEstimateAuth') !== 'true') {
    window.location.href = 'estimate-login.html';
    return;
  }

  // Set default date to today
  const dateInput = document.getElementById('estimateDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Labor and Materials data
  let laborRows = [];
  let materialRows = [];

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }

  // Parse number (handle empty strings)
  function parseNumber(value) {
    const num = parseFloat(value) || 0;
    return isNaN(num) ? 0 : num;
  }

  // Calculate totals
  function calculateTotals() {
    let laborTotal = 0;
    laborRows.forEach(row => {
      const hours = parseNumber(row.hours);
      const rate = parseNumber(row.rate);
      laborTotal += hours * rate;
    });

    let materialsTotal = 0;
    materialRows.forEach(row => {
      const qty = parseNumber(row.qty);
      const cost = parseNumber(row.cost);
      materialsTotal += qty * cost;
    });

    const grandTotal = laborTotal + materialsTotal;

    // Update display
    const laborSubtotalEl = document.getElementById('laborSubtotal');
    const materialsSubtotalEl = document.getElementById('materialsSubtotal');
    const grandTotalEl = document.getElementById('grandTotal');

    if (laborSubtotalEl) laborSubtotalEl.textContent = formatCurrency(laborTotal);
    if (materialsSubtotalEl) materialsSubtotalEl.textContent = formatCurrency(materialsTotal);
    if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);
  }

  // Create labor row HTML
  function createLaborRowHTML(id) {
    return `
      <div class="estimate-row" data-id="${id}">
        <div class="estimate-row-content">
          <input type="text" class="estimate-input estimate-desc" placeholder="Description" data-field="description" />
          <input type="number" class="estimate-input estimate-number" placeholder="Hours" step="0.1" min="0" data-field="hours" />
          <input type="number" class="estimate-input estimate-number" placeholder="Rate" step="0.01" min="0" data-field="rate" />
          <span class="estimate-total" data-total="${id}">$0.00</span>
        </div>
        <button type="button" class="btn btn-secondary estimate-remove" data-remove="${id}">Remove</button>
      </div>
    `;
  }

  // Create material row HTML
  function createMaterialRowHTML(id) {
    return `
      <div class="estimate-row" data-id="${id}">
        <div class="estimate-row-content">
          <input type="text" class="estimate-input estimate-desc" placeholder="Description" data-field="description" />
          <input type="number" class="estimate-input estimate-number" placeholder="Qty" step="0.01" min="0" data-field="qty" />
          <input type="number" class="estimate-input estimate-number" placeholder="Unit Cost" step="0.01" min="0" data-field="cost" />
          <span class="estimate-total" data-total="${id}">$0.00</span>
        </div>
        <button type="button" class="btn btn-secondary estimate-remove" data-remove="${id}">Remove</button>
      </div>
    `;
  }

  // Add labor row
  function addLaborRow() {
    const id = Date.now() + Math.random();
    laborRows.push({
      id: id,
      description: '',
      hours: 0,
      rate: 0
    });

    const table = document.getElementById('laborTable');
    if (table) {
      table.insertAdjacentHTML('beforeend', createLaborRowHTML(id));
      attachRowListeners(id, 'labor');
    }
  }

  // Add material row
  function addMaterialRow() {
    const id = Date.now() + Math.random();
    materialRows.push({
      id: id,
      description: '',
      qty: 0,
      cost: 0
    });

    const table = document.getElementById('materialsTable');
    if (table) {
      table.insertAdjacentHTML('beforeend', createMaterialRowHTML(id));
      attachRowListeners(id, 'material');
    }
  }

  // Attach event listeners to a row
  function attachRowListeners(id, type) {
    const row = document.querySelector(`[data-id="${id}"]`);
    if (!row) return;

    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const field = input.getAttribute('data-field');
        const value = input.value;

        if (type === 'labor') {
          const rowData = laborRows.find(r => r.id === id);
          if (rowData) {
            if (field === 'description') rowData.description = value;
            else if (field === 'hours') rowData.hours = value;
            else if (field === 'rate') rowData.rate = value;

            // Update line total
            const hours = parseNumber(rowData.hours);
            const rate = parseNumber(rowData.rate);
            const total = hours * rate;
            const totalEl = row.querySelector(`[data-total="${id}"]`);
            if (totalEl) totalEl.textContent = formatCurrency(total);
          }
        } else {
          const rowData = materialRows.find(r => r.id === id);
          if (rowData) {
            if (field === 'description') rowData.description = value;
            else if (field === 'qty') rowData.qty = value;
            else if (field === 'cost') rowData.cost = value;

            // Update line total
            const qty = parseNumber(rowData.qty);
            const cost = parseNumber(rowData.cost);
            const total = qty * cost;
            const totalEl = row.querySelector(`[data-total="${id}"]`);
            if (totalEl) totalEl.textContent = formatCurrency(total);
          }
        }

        calculateTotals();
      });
    });

    // Remove button
    const removeBtn = row.querySelector(`[data-remove="${id}"]`);
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (type === 'labor') {
          laborRows = laborRows.filter(r => r.id !== id);
        } else {
          materialRows = materialRows.filter(r => r.id !== id);
        }
        row.remove();
        calculateTotals();
      });
    }
  }

  // Wire up add buttons
  const addLaborBtn = document.getElementById('addLaborBtn');
  const addMaterialBtn = document.getElementById('addMaterialBtn');

  if (addLaborBtn) {
    addLaborBtn.addEventListener('click', addLaborRow);
  }

  if (addMaterialBtn) {
    addMaterialBtn.addEventListener('click', addMaterialRow);
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('arpEstimateAuth');
      window.location.href = 'estimate-login.html';
    });
  }

  // PDF Generation
  async function generatePDF() {
    try {
      if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF library not loaded');
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      const margin = 0.5;
      let yPos = margin;

      // Load and add logo
      try {
        const logoResponse = await fetch('assets/logonew.png');
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });

        doc.addImage(logoDataUrl, 'PNG', margin, yPos, 1.5, 0.5);
        yPos += 0.7;
      } catch (e) {
        console.warn('Could not load logo:', e);
      }

      // Company info
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('ARP Collision Repair', margin, yPos);
      yPos += 0.25;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('102 Iris Ave, Old Hickory, TN 37138', margin, yPos);
      yPos += 0.15;
      doc.text('(615) 545-6680', margin, yPos);
      yPos += 0.15;
      doc.text('adan@arpcollisionllc.com', margin, yPos);
      yPos += 0.3;

      // Estimate meta
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('REPAIR ESTIMATE', margin, yPos);
      yPos += 0.25;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const estimateDate = document.getElementById('estimateDate')?.value || '';
      const customerName = document.getElementById('customerName')?.value || '';
      const customerPhone = document.getElementById('customerPhone')?.value || '';
      const vehicleInfo = document.getElementById('vehicleInfo')?.value || '';
      const estimateNotes = document.getElementById('estimateNotes')?.value || '';

      if (estimateDate) {
        doc.text(`Date: ${estimateDate}`, margin, yPos);
        yPos += 0.2;
      }
      if (customerName) {
        doc.text(`Customer: ${customerName}`, margin, yPos);
        yPos += 0.2;
      }
      if (customerPhone) {
        doc.text(`Phone: ${customerPhone}`, margin, yPos);
        yPos += 0.2;
      }
      if (vehicleInfo) {
        doc.text(`Vehicle: ${vehicleInfo}`, margin, yPos);
        yPos += 0.2;
      }
      if (estimateNotes) {
        const notesLines = doc.splitTextToSize(`Notes: ${estimateNotes}`, 7);
        doc.text(notesLines, margin, yPos);
        yPos += notesLines.length * 0.2;
      }
      yPos += 0.2;

      // Labor table
      if (laborRows.length > 0) {
        const laborData = laborRows.map(row => {
          const hours = parseNumber(row.hours);
          const rate = parseNumber(row.rate);
          const total = hours * rate;
          return [
            row.description || '',
            hours.toFixed(2),
            formatCurrency(rate),
            formatCurrency(total)
          ];
        });

        doc.autoTable({
          startY: yPos,
          head: [['Description', 'Hours', 'Rate', 'Total']],
          body: laborData,
          theme: 'striped',
          headStyles: { fillColor: [226, 27, 35] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 }
        });

        yPos = doc.lastAutoTable.finalY + 0.2;
      }

      // Materials table
      if (materialRows.length > 0) {
        const materialData = materialRows.map(row => {
          const qty = parseNumber(row.qty);
          const cost = parseNumber(row.cost);
          const total = qty * cost;
          return [
            row.description || '',
            qty.toFixed(2),
            formatCurrency(cost),
            formatCurrency(total)
          ];
        });

        doc.autoTable({
          startY: yPos,
          head: [['Description', 'Qty', 'Unit Cost', 'Total']],
          body: materialData,
          theme: 'striped',
          headStyles: { fillColor: [226, 27, 35] },
          margin: { left: margin, right: margin },
          styles: { fontSize: 9 }
        });

        yPos = doc.lastAutoTable.finalY + 0.2;
      }

      // Totals
      let laborTotal = 0;
      laborRows.forEach(row => {
        laborTotal += parseNumber(row.hours) * parseNumber(row.rate);
      });

      let materialsTotal = 0;
      materialRows.forEach(row => {
        materialsTotal += parseNumber(row.qty) * parseNumber(row.cost);
      });

      const grandTotal = laborTotal + materialsTotal;

      yPos += 0.2;
      doc.setFontSize(10);
      doc.text(`Labor Subtotal: ${formatCurrency(laborTotal)}`, 4.5, yPos, { align: 'right' });
      yPos += 0.2;
      doc.text(`Materials Subtotal: ${formatCurrency(materialsTotal)}`, 4.5, yPos, { align: 'right' });
      yPos += 0.25;
      doc.setFont(undefined, 'bold');
      doc.setFontSize(12);
      doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, 4.5, yPos, { align: 'right' });

      // Save PDF
      const dateStr = estimateDate || new Date().toISOString().split('T')[0];
      doc.save(`ARP-Estimate-${dateStr}.pdf`);

    } catch (error) {
      console.error('PDF generation error:', error);
      const errorEl = document.getElementById('pdfError');
      if (errorEl) {
        errorEl.textContent = 'PDF download unavailable. Use Print / Save as PDF.';
        errorEl.style.display = 'block';
      }
    }
  }

  // Print / Save as PDF fallback
  function printEstimate() {
    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    // Get estimate data
    const estimateDate = document.getElementById('estimateDate')?.value || '';
    const customerName = document.getElementById('customerName')?.value || '';
    const customerPhone = document.getElementById('customerPhone')?.value || '';
    const vehicleInfo = document.getElementById('vehicleInfo')?.value || '';
    const estimateNotes = document.getElementById('estimateNotes')?.value || '';

    let laborTotal = 0;
    laborRows.forEach(row => {
      laborTotal += parseNumber(row.hours) * parseNumber(row.rate);
    });

    let materialsTotal = 0;
    materialRows.forEach(row => {
      materialsTotal += parseNumber(row.qty) * parseNumber(row.cost);
    });

    const grandTotal = laborTotal + materialsTotal;

    // Build print HTML
    let html = `
      <div class="print-header">
        <img src="assets/logonew.png" alt="ARP Collision Repair" class="print-logo" />
        <div class="print-company">
          <h1>ARP Collision Repair</h1>
          <p>102 Iris Ave, Old Hickory, TN 37138</p>
          <p>(615) 545-6680</p>
          <p>adan@arpcollisionllc.com</p>
        </div>
      </div>

      <div class="print-content">
        <h2>REPAIR ESTIMATE</h2>

        <div class="print-meta">
          ${estimateDate ? `<p><strong>Date:</strong> ${estimateDate}</p>` : ''}
          ${customerName ? `<p><strong>Customer:</strong> ${customerName}</p>` : ''}
          ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
          ${vehicleInfo ? `<p><strong>Vehicle:</strong> ${vehicleInfo}</p>` : ''}
          ${estimateNotes ? `<p><strong>Notes:</strong> ${estimateNotes}</p>` : ''}
        </div>
    `;

    // Labor table
    if (laborRows.length > 0) {
      html += '<h3>Labor</h3><table class="print-table"><thead><tr><th>Description</th><th>Hours</th><th>Rate</th><th>Total</th></tr></thead><tbody>';
      laborRows.forEach(row => {
        const hours = parseNumber(row.hours);
        const rate = parseNumber(row.rate);
        const total = hours * rate;
        html += `<tr><td>${row.description || ''}</td><td>${hours.toFixed(2)}</td><td>${formatCurrency(rate)}</td><td>${formatCurrency(total)}</td></tr>`;
      });
      html += '</tbody></table>';
    }

    // Materials table
    if (materialRows.length > 0) {
      html += '<h3>Materials</h3><table class="print-table"><thead><tr><th>Description</th><th>Qty</th><th>Unit Cost</th><th>Total</th></tr></thead><tbody>';
      materialRows.forEach(row => {
        const qty = parseNumber(row.qty);
        const cost = parseNumber(row.cost);
        const total = qty * cost;
        html += `<tr><td>${row.description || ''}</td><td>${qty.toFixed(2)}</td><td>${formatCurrency(cost)}</td><td>${formatCurrency(total)}</td></tr>`;
      });
      html += '</tbody></table>';
    }

    // Totals
    html += `
        <div class="print-totals">
          <p><strong>Labor Subtotal:</strong> ${formatCurrency(laborTotal)}</p>
          <p><strong>Materials Subtotal:</strong> ${formatCurrency(materialsTotal)}</p>
          <p class="print-grand-total"><strong>Grand Total:</strong> ${formatCurrency(grandTotal)}</p>
        </div>
      </div>
    `;

    printArea.innerHTML = html;

    // Trigger print
    window.print();
  }

  // Wire up PDF buttons
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const printPdfBtn = document.getElementById('printPdfBtn');

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', generatePDF);
  }

  if (printPdfBtn) {
    printPdfBtn.addEventListener('click', printEstimate);
  }

  // Initialize with one empty row each
  addLaborRow();
  addMaterialRow();
})();

