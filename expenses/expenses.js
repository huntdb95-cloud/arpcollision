// expenses.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Get translation helper
function getTranslation(key) {
  const lang = localStorage.getItem('arp_lang') || 'en';
  const dict = window.I18N?.[lang] || window.I18N?.en || {};
  return dict[key] || key;
}

// Show toast message
function showToast(message, type = 'info') {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'error' ? 'var(--accent)' : 'var(--card)'};
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    z-index: 10000;
    box-shadow: var(--shadow);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Initialize form with today's date
function initForm() {
  const dateInput = document.getElementById('expenseDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

// Load expenses from Firestore
async function loadExpenses(uid) {
  try {
    const expensesRef = collection(db, 'users', uid, 'expenses');
    const q = query(expensesRef, orderBy('expenseDate', 'desc'));
    const snapshot = await getDocs(q);
    
    const expenses = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      expenses.push({
        id: docSnap.id,
        ...data,
        expenseDate: data.expenseDate || '',
        createdAt: data.createdAt?.toDate?.() || new Date(),
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Error loading expenses:', error);
    showToast(getTranslation('expenses.loadError') || 'Error loading expenses', 'error');
    return [];
  }
}

// Apply filters and sorting
function filterAndSortExpenses(expenses, filters) {
  let filtered = [...expenses];
  
  // Date range filter
  if (filters.fromDate) {
    filtered = filtered.filter(e => e.expenseDate >= filters.fromDate);
  }
  if (filters.toDate) {
    filtered = filtered.filter(e => e.expenseDate <= filters.toDate);
  }
  
  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(e => e.category === filters.category);
  }
  
  // Sort
  switch (filters.sortBy) {
    case 'oldest':
      filtered.sort((a, b) => a.expenseDate.localeCompare(b.expenseDate));
      break;
    case 'amountHigh':
      filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      break;
    case 'amountLow':
      filtered.sort((a, b) => (a.amount || 0) - (b.amount || 0));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
      break;
  }
  
  return filtered;
}

// Render expenses list
function renderExpenses(expenses, isMobile = false) {
  const listEl = document.getElementById('expensesList');
  if (!listEl) return;
  
  if (expenses.length === 0) {
    listEl.innerHTML = `<p class="muted" data-i18n="expenses.noResults">${getTranslation('expenses.noResults')}</p>`;
    return;
  }
  
  if (isMobile) {
    // Mobile card view
    listEl.innerHTML = expenses.map(exp => `
      <div class="card pad" style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <h3 style="margin: 0 0 4px;">${exp.vendor || ''}</h3>
            <p class="muted" style="margin: 0; font-size: 0.9rem;">${formatDate(exp.expenseDate)}</p>
          </div>
          <strong style="font-size: 1.1rem;">${formatCurrency(exp.amount || 0)}</strong>
        </div>
        <div style="margin-bottom: 8px;">
          <span class="muted">${getTranslation('expenses.category')}:</span> ${exp.category || ''}
          ${exp.paymentMethod ? ` | ${getTranslation('expenses.paymentMethod')}: ${exp.paymentMethod}` : ''}
        </div>
        ${exp.memo ? `<p class="muted" style="margin: 8px 0;">${exp.memo}</p>` : ''}
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
          ${exp.receipt ? `
            <a href="${exp.receipt.downloadURL}" target="_blank" class="btn btn-secondary" style="font-size: 0.9rem;">
              <i class="bx bx-file"></i> ${getTranslation('expenses.viewReceipt')}
            </a>
          ` : ''}
          <button type="button" class="btn btn-secondary" onclick="deleteExpense('${exp.id}', '${exp.receipt?.storagePath || ''}')" style="font-size: 0.9rem;">
            <i class="bx bx-trash"></i> ${getTranslation('expenses.delete')}
          </button>
        </div>
      </div>
    `).join('');
  } else {
    // Desktop table view
    listEl.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border);">
              <th style="padding: 12px; text-align: left; color: var(--muted);">Date</th>
              <th style="padding: 12px; text-align: left; color: var(--muted);">Vendor</th>
              <th style="padding: 12px; text-align: right; color: var(--muted);">Amount</th>
              <th style="padding: 12px; text-align: left; color: var(--muted);">Category</th>
              <th style="padding: 12px; text-align: left; color: var(--muted);">Payment Method</th>
              <th style="padding: 12px; text-align: left; color: var(--muted);">Receipt</th>
              <th style="padding: 12px; text-align: left; color: var(--muted);">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(exp => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 12px;">${formatDate(exp.expenseDate)}</td>
                <td style="padding: 12px;">${exp.vendor || ''}</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">${formatCurrency(exp.amount || 0)}</td>
                <td style="padding: 12px;">${exp.category || ''}</td>
                <td style="padding: 12px;">${exp.paymentMethod || '-'}</td>
                <td style="padding: 12px;">
                  ${exp.receipt ? `
                    <a href="${exp.receipt.downloadURL}" target="_blank" class="btn btn-secondary" style="font-size: 0.85rem; padding: 6px 10px;">
                      <i class="bx bx-file"></i> ${getTranslation('expenses.viewReceipt')}
                    </a>
                  ` : `<span class="muted">${getTranslation('expenses.noReceipt')}</span>`}
                </td>
                <td style="padding: 12px;">
                  <button type="button" class="btn btn-secondary" onclick="deleteExpense('${exp.id}', '${exp.receipt?.storagePath || ''}')" style="font-size: 0.85rem; padding: 6px 10px;">
                    <i class="bx bx-trash"></i> ${getTranslation('expenses.delete')}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Save expense
async function saveExpense(uid, expenseData, receiptFile) {
  try {
    // Add expense to Firestore
    const expenseRef = collection(db, 'users', uid, 'expenses');
    const expenseDoc = {
      expenseDate: expenseData.expenseDate,
      vendor: expenseData.vendor,
      vendorLower: expenseData.vendor.toLowerCase(),
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      paymentMethod: expenseData.paymentMethod || null,
      memo: expenseData.memo || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(expenseRef, expenseDoc);
    
    // Upload receipt if provided
    if (receiptFile) {
      try {
        const safeName = receiptFile.name.replace(/[^\w.\-]+/g, '_');
        const timestamp = Date.now();
        const storagePath = `users/${uid}/expenses/${docRef.id}/receipts/${timestamp}_${safeName}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, receiptFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update expense with receipt info
        await updateDoc(doc(db, 'users', uid, 'expenses', docRef.id), {
          receipt: {
            fileName: receiptFile.name,
            contentType: receiptFile.type,
            size: receiptFile.size,
            storagePath: storagePath,
            downloadURL: downloadURL,
            uploadedAt: Date.now(),
          },
          updatedAt: serverTimestamp(),
        });
      } catch (uploadError) {
        console.error('Receipt upload failed:', uploadError);
        showToast(getTranslation('expenses.uploadFailed'), 'error');
        // Don't fail the whole operation if receipt upload fails
      }
    }
    
    showToast(getTranslation('expenses.saved'));
    return docRef.id;
  } catch (error) {
    console.error('Error saving expense:', error);
    showToast(getTranslation('expenses.saveError') || 'Error saving expense', 'error');
    throw error;
  }
}

// Delete expense
async function deleteExpense(expenseId, receiptStoragePath) {
  if (!confirm(getTranslation('expenses.confirmDelete'))) return;
  
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    // Delete receipt from storage if exists
    if (receiptStoragePath) {
      try {
        const storageRef = ref(storage, receiptStoragePath);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.error('Error deleting receipt:', storageError);
        // Continue with expense deletion even if receipt deletion fails
      }
    }
    
    // Delete expense from Firestore
    const expenseRef = doc(db, 'users', user.uid, 'expenses', expenseId);
    await deleteDoc(expenseRef);
    
    showToast(getTranslation('expenses.deleted'));
    await refreshExpensesList(user.uid);
  } catch (error) {
    console.error('Error deleting expense:', error);
    showToast(getTranslation('expenses.deleteError') || 'Error deleting expense', 'error');
  }
}

// Make deleteExpense available globally for onclick handlers
window.deleteExpense = deleteExpense;

// Refresh expenses list
async function refreshExpensesList(uid) {
  const expenses = await loadExpenses(uid);
  const filters = getFilters();
  const filtered = filterAndSortExpenses(expenses, filters);
  const isMobile = window.innerWidth <= 768;
  renderExpenses(filtered, isMobile);
}

// Get current filters
function getFilters() {
  return {
    fromDate: document.getElementById('filterFromDate')?.value || '',
    toDate: document.getElementById('filterToDate')?.value || '',
    category: document.getElementById('filterCategory')?.value || 'all',
    sortBy: document.getElementById('sortBy')?.value || 'newest',
  };
}

// Export CSV
function exportCsv(expenses) {
  if (expenses.length === 0) {
    showToast(getTranslation('expenses.exportNoRows'), 'error');
    return;
  }
  
  const headers = ['Date', 'Vendor', 'Amount', 'Category', 'Payment Method', 'Memo', 'Receipt', 'Receipt File Name'];
  const rows = expenses.map(exp => [
    exp.expenseDate || '',
    exp.vendor || '',
    (exp.amount || 0).toFixed(2),
    exp.category || '',
    exp.paymentMethod || '',
    exp.memo || '',
    exp.receipt ? 'Yes' : 'No',
    exp.receipt?.fileName || '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  
  const fromDate = document.getElementById('filterFromDate')?.value || 'all';
  const toDate = document.getElementById('filterToDate')?.value || 'all';
  link.download = `expenses_${fromDate}_to_${toDate}.csv`;
  
  link.click();
  URL.revokeObjectURL(url);
}

// Export ZIP
async function exportZip(expenses) {
  if (expenses.length === 0) {
    showToast(getTranslation('expenses.exportNoRows'), 'error');
    return;
  }
  
  if (typeof JSZip === 'undefined') {
    showToast('JSZip library not loaded', 'error');
    return;
  }
  
  try {
    const zip = new JSZip();
    const failedReceipts = [];
    
    // Add CSV
    const headers = ['Date', 'Vendor', 'Amount', 'Category', 'Payment Method', 'Memo', 'Receipt', 'Receipt File Name'];
    const rows = expenses.map(exp => [
      exp.expenseDate || '',
      exp.vendor || '',
      (exp.amount || 0).toFixed(2),
      exp.category || '',
      exp.paymentMethod || '',
      exp.memo || '',
      exp.receipt ? 'Yes' : 'No',
      exp.receipt?.fileName || '',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    zip.file('report.csv', csvContent);
    
    // Add receipts
    const receiptsFolder = zip.folder('receipts');
    for (const exp of expenses) {
      if (exp.receipt?.downloadURL) {
        try {
          const response = await fetch(exp.receipt.downloadURL);
          const blob = await response.blob();
          const safeFileName = exp.receipt.fileName.replace(/[^\w.\-]+/g, '_');
          receiptsFolder.file(safeFileName, blob);
        } catch (error) {
          console.error(`Failed to fetch receipt for ${exp.id}:`, error);
          failedReceipts.push(exp.receipt.fileName || exp.id);
        }
      }
    }
    
    // Add failed receipts list if any
    if (failedReceipts.length > 0) {
      receiptsFolder.file('FAILED_RECEIPTS.txt', `The following receipts could not be included:\n${failedReceipts.join('\n')}`);
    }
    
    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(content);
    link.href = url;
    
    const fromDate = document.getElementById('filterFromDate')?.value || 'all';
    const toDate = document.getElementById('filterToDate')?.value || 'all';
    link.download = `expenses_report_${fromDate}_to_${toDate}.zip`;
    
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating ZIP:', error);
    showToast('Error creating ZIP file', 'error');
  }
}

// Initialize app
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    const mainEl = document.getElementById('main');
    if (mainEl) {
      mainEl.innerHTML = `
        <section class="page-hero">
          <div class="container">
            <h1 data-i18n="expenses.pageTitle">Business Expenses</h1>
            <p class="muted">Please log in to access this tool.</p>
          </div>
        </section>
      `;
    }
    return;
  }
  
  // Initialize form
  initForm();
  
  // Load and render expenses
  await refreshExpensesList(user.uid);
  
  // Form submit handler
  const form = document.getElementById('expenseForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const expenseDate = document.getElementById('expenseDate')?.value;
      const vendor = document.getElementById('vendor')?.value.trim();
      const amount = document.getElementById('amount')?.value;
      const category = document.getElementById('category')?.value;
      const paymentMethod = document.getElementById('paymentMethod')?.value || null;
      const memo = document.getElementById('memo')?.value.trim() || null;
      const receiptFile = document.getElementById('receiptFile')?.files[0] || null;
      
      if (!expenseDate || !vendor || !amount || !category) {
        showToast(getTranslation('expenses.errRequired'), 'error');
        return;
      }
      
      // Validate receipt file if provided
      if (receiptFile) {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(receiptFile.type)) {
          showToast(getTranslation('expenses.errInvalidFile'), 'error');
          return;
        }
        if (receiptFile.size > 10 * 1024 * 1024) {
          showToast(getTranslation('expenses.errFileTooLarge'), 'error');
          return;
        }
      }
      
      try {
        await saveExpense(user.uid, {
          expenseDate,
          vendor,
          amount,
          category,
          paymentMethod,
          memo,
        }, receiptFile);
        
        form.reset();
        initForm();
        await refreshExpensesList(user.uid);
      } catch (error) {
        // Error already shown in saveExpense
      }
    });
  }
  
  // Clear form handler
  const clearBtn = document.getElementById('clearForm');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      form?.reset();
      initForm();
    });
  }
  
  // Filter handlers
  const filterInputs = ['filterFromDate', 'filterToDate', 'filterCategory', 'sortBy'];
  filterInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => refreshExpensesList(user.uid));
    }
  });
  
  // Export handlers
  const exportCsvBtn = document.getElementById('exportCsv');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', async () => {
      const expenses = await loadExpenses(user.uid);
      const filters = getFilters();
      const filtered = filterAndSortExpenses(expenses, filters);
      exportCsv(filtered);
    });
  }
  
  const exportZipBtn = document.getElementById('exportZip');
  if (exportZipBtn) {
    exportZipBtn.addEventListener('click', async () => {
      const expenses = await loadExpenses(user.uid);
      const filters = getFilters();
      const filtered = filterAndSortExpenses(expenses, filters);
      await exportZip(filtered);
    });
  }
  
  // Handle window resize for responsive rendering
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      refreshExpensesList(user.uid);
    }, 250);
  });
});

