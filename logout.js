// logout.js
// Logout functionality

import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

(function() {
  'use strict';

  // Get auth from global or initialize
  const auth = window.auth || getAuth();
  
  // Wire up logout buttons/links
  document.addEventListener('DOMContentLoaded', () => {
    const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn, #logoutBtn');
    
    logoutButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
          await signOut(auth);
          // Redirect to home or login page
          window.location.href = '../index.html';
        } catch (error) {
          console.error('Logout error:', error);
          // Still redirect on error
          window.location.href = '../index.html';
        }
      });
    });
  });
})();

