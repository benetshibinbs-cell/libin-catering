/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Bulletproof Admin Authentication Controller
 */

(function () {
  let isRedirecting = false;

  function isCurrentPageLogin() {
    const cleanPath = (window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
    const filename = cleanPath.split('/').pop();
    return filename === 'login.html' || filename === 'login';
  }

  function getClient() {
    if (window.DB && window.DB.getClient) {
      return window.DB.getClient();
    }
    return null;
  }

  // Safe single redirect
  function safeRedirect(targetUrl) {
    if (isRedirecting) return;
    const currentFile = (window.location.pathname || '').split('/').pop().toLowerCase();
    if (currentFile === targetUrl.toLowerCase()) return;

    isRedirecting = true;
    window.location.replace(targetUrl);
  }

  // Clean all auth traces
  function purgeAuthStorage() {
    localStorage.removeItem('libin_demo_auth');
    localStorage.removeItem('libin_admin_email');
    sessionStorage.removeItem('libin_demo_auth');
    sessionStorage.removeItem('libin_admin_email');

    // Remove any orphaned Supabase local storage tokens
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
  }

  // Main Route Guard & Session Check
  async function checkAuth() {
    const isLogin = isCurrentPageLogin();
    const client = getClient();
    let session = null;
    let isDemoUser = localStorage.getItem('libin_demo_auth') === 'true';

    if (client) {
      try {
        const { data } = await client.auth.getSession();
        if (data && data.session && data.session.user) {
          session = data.session;
        }
      } catch (err) {
        console.warn('Session verification notice:', err);
      }
    }

    const isLoggedIn = !!(session || isDemoUser);

    if (isLoggedIn) {
      // User is logged in
      const userEmail = (session && session.user && session.user.email) || 
                        localStorage.getItem('libin_admin_email') || 
                        'admin@libincatering.com';
      
      localStorage.setItem('libin_admin_email', userEmail);

      const userEmailEl = document.getElementById('adminUserEmail');
      if (userEmailEl) userEmailEl.textContent = userEmail;

      if (isLogin) {
        safeRedirect('dashboard.html');
      }
    } else {
      // User is NOT logged in
      if (!isLogin) {
        safeRedirect('login.html');
      }
    }
  }

  // Sign In Handler
  window.handleAdminLogin = async function (email, password) {
    const client = getClient();

    if (client) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      if (data && data.user) {
        localStorage.setItem('libin_admin_email', data.user.email || email);
        return data;
      }
    }

    // Local Demo Login fallback (if testing before creating Supabase user)
    if (email && password && password.length >= 6) {
      localStorage.setItem('libin_demo_auth', 'true');
      localStorage.setItem('libin_admin_email', email);
      return { user: { email } };
    } else {
      throw new Error('Please enter a valid email and password (minimum 6 characters).');
    }
  };

  // Sign Out Handler
  window.handleAdminLogout = async function () {
    if (isRedirecting) return;
    isRedirecting = true;

    const client = getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout notice:', e);
      }
    }

    purgeAuthStorage();
    window.location.replace('login.html');
  };

  // Run on page load
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Attach logout buttons
    document.querySelectorAll('[data-action="admin-logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.handleAdminLogout();
      });
    });
  });
})();
