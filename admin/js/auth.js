/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Admin Authentication Controller (Supabase Auth)
 */

(function () {
  const isLoginPage = window.location.pathname.endsWith('login.html');

  // Helper to get supabase client
  function getClient() {
    if (window.DB && window.DB.getClient) {
      return window.DB.getClient();
    }
    return null;
  }

  // Session verification
  async function checkAuth() {
    const client = getClient();
    const isLocalDemo = sessionStorage.getItem('libin_admin_logged_in') === 'true';

    if (client) {
      const { data: { session } } = await client.auth.getSession();
      if (session) {
        if (isLoginPage) {
          window.location.href = 'dashboard.html';
        }
        return session;
      }
    }

    if (isLocalDemo) {
      if (isLoginPage) {
        window.location.href = 'dashboard.html';
      }
      return { user: { email: 'admin@libincatering.com' } };
    }

    // Unauthenticated user attempting to open admin page
    if (!isLoginPage) {
      window.location.href = 'login.html';
    }
    return null;
  }

  // Sign In Handler
  window.handleAdminLogin = async function (email, password) {
    const client = getClient();

    if (client) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }

    // Local / Offline demo authentication fallback
    if (email && password.length >= 6) {
      sessionStorage.setItem('libin_admin_logged_in', 'true');
      sessionStorage.setItem('libin_admin_email', email);
      return { user: { email } };
    } else {
      throw new Error('Please enter a valid email and password (minimum 6 characters).');
    }
  };

  // Sign Out Handler
  window.handleAdminLogout = async function () {
    const client = getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Signout warning:', e);
      }
    }
    sessionStorage.removeItem('libin_admin_logged_in');
    sessionStorage.removeItem('libin_admin_email');
    window.location.href = 'login.html';
  };

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Attach logout buttons
    document.querySelectorAll('[data-action="admin-logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.handleAdminLogout();
      });
    });

    // Populate user email if element exists
    const userEmailEl = document.getElementById('adminUserEmail');
    if (userEmailEl) {
      const email = sessionStorage.getItem('libin_admin_email') || 'admin@libincatering.com';
      userEmailEl.textContent = email;
    }
  });
})();
