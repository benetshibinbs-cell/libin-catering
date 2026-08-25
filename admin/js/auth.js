/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Robust Admin Authentication Controller
 */

(function () {
  function isCurrentPageLogin() {
    const path = (window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
    return path.endsWith('/login.html') || path.endsWith('/login') || path.endsWith('login.html');
  }

  function getClient() {
    if (window.DB && window.DB.getClient) {
      return window.DB.getClient();
    }
    return null;
  }

  // Check if user is marked as logged in
  function isAuthenticated() {
    return localStorage.getItem('libin_admin_logged_in') === 'true' || 
           sessionStorage.getItem('libin_admin_logged_in') === 'true';
  }

  function setAuthenticated(email) {
    localStorage.setItem('libin_admin_logged_in', 'true');
    localStorage.setItem('libin_admin_email', email || 'admin@libincatering.com');
    sessionStorage.setItem('libin_admin_logged_in', 'true');
    sessionStorage.setItem('libin_admin_email', email || 'admin@libincatering.com');
  }

  function clearAuthenticated() {
    localStorage.removeItem('libin_admin_logged_in');
    localStorage.removeItem('libin_admin_email');
    sessionStorage.removeItem('libin_admin_logged_in');
    sessionStorage.removeItem('libin_admin_email');
  }

  // Session route guard
  async function checkAuth() {
    const isLogin = isCurrentPageLogin();
    const loggedIn = isAuthenticated();

    // 1. If user is logged in and on login page, redirect to dashboard once
    if (loggedIn && isLogin) {
      window.location.replace('dashboard.html');
      return;
    }

    // 2. If user is NOT logged in and on protected admin page, redirect to login once
    if (!loggedIn && !isLogin) {
      window.location.replace('login.html');
      return;
    }

    // 3. Supabase Auth state listener for token verification
    const client = getClient();
    if (client) {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session && session.user) {
          setAuthenticated(session.user.email);
          if (isLogin) {
            window.location.replace('dashboard.html');
          }
        }
      } catch (err) {
        console.warn('Auth session check notice:', err);
      }

      // Listen for background auth changes
      try {
        client.auth.onAuthStateChange((event, session) => {
          if (session && session.user) {
            setAuthenticated(session.user.email);
            if (isCurrentPageLogin()) {
              window.location.replace('dashboard.html');
            }
          } else if (event === 'SIGNED_OUT') {
            clearAuthenticated();
            if (!isCurrentPageLogin()) {
              window.location.replace('login.html');
            }
          }
        });
      } catch (e) {
        console.warn('Auth listener notice:', e);
      }
    }
  }

  // Sign In Handler
  window.handleAdminLogin = async function (email, password) {
    const client = getClient();

    if (client) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        // If Supabase authentication fails, check error
        throw error;
      }
      if (data && data.user) {
        setAuthenticated(data.user.email || email);
        return data;
      }
    }

    // Local demo authentication fallback (if Supabase user not created yet)
    if (email && password && password.length >= 6) {
      setAuthenticated(email);
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
    clearAuthenticated();
    window.location.replace('login.html');
  };

  // Run on DOM ready
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
      const email = localStorage.getItem('libin_admin_email') || sessionStorage.getItem('libin_admin_email') || 'admin@libincatering.com';
      userEmailEl.textContent = email;
    }
  });
})();
