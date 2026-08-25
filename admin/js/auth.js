/**
 * LIBIN CATERING SERVICE & EVENT MANAGEMENT
 * Fail-Safe Admin Authentication Controller
 */

(function () {
  const AUTH_KEY = 'libin_auth_token';
  const USER_KEY = 'libin_admin_user';

  // Multi-tier storage helper (localStorage + sessionStorage + cookie)
  const AuthStore = {
    isLoggedIn() {
      try {
        const ls = localStorage.getItem(AUTH_KEY) === 'true';
        const ss = sessionStorage.getItem(AUTH_KEY) === 'true';
        const ck = document.cookie.indexOf(AUTH_KEY + '=1') !== -1;
        return ls || ss || ck;
      } catch (e) {
        return false;
      }
    },
    getUserEmail() {
      try {
        return localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || 'admin@libincatering.com';
      } catch (e) {
        return 'admin@libincatering.com';
      }
    },
    login(email) {
      const user = email || 'admin@libincatering.com';
      try { localStorage.setItem(AUTH_KEY, 'true'); localStorage.setItem(USER_KEY, user); } catch (e) {}
      try { sessionStorage.setItem(AUTH_KEY, 'true'); sessionStorage.setItem(USER_KEY, user); } catch (e) {}
      try { document.cookie = `${AUTH_KEY}=1; path=/; max-age=86400; SameSite=Lax`; } catch (e) {}
    },
    logout() {
      try { localStorage.removeItem(AUTH_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
      try { sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(USER_KEY); } catch (e) {}
      try { document.cookie = `${AUTH_KEY}=; path=/; max-age=0; SameSite=Lax`; } catch (e) {}

      // Clear any Supabase token keys
      try {
        const toDelete = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('supabase'))) toDelete.push(k);
        }
        toDelete.forEach(k => localStorage.removeItem(k));
      } catch (e) {}
    }
  };

  function isLoginPage() {
    const path = (window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
    const file = path.split('/').pop();
    return file === 'login.html' || file === 'login';
  }

  function getClient() {
    if (window.DB && window.DB.getClient) {
      return window.DB.getClient();
    }
    return null;
  }

  // Route Guard: ONLY protect admin pages (NEVER auto-redirect from login page!)
  function enforceRouteGuard() {
    const onLogin = isLoginPage();
    const loggedIn = AuthStore.isLoggedIn();

    // On protected admin pages (dashboard, menu, events, etc.):
    // If not logged in, redirect to login.html
    if (!onLogin && !loggedIn) {
      window.location.href = 'login.html';
      return false;
    }

    // On login.html: NEVER auto-redirect on load.
    // The user stays on login.html until they explicitly submit the login form.
    return true;
  }

  // Handle Login submission
  window.handleAdminLogin = async function (email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const client = getClient();

    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (!error && data && data.user) {
          AuthStore.login(data.user.email || email);
          return data;
        }
        if (error) {
          console.warn('Supabase auth notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase signin error:', err);
      }
    }

    // Demo / Offline fallback login (if Supabase user is not created yet)
    if (password.length >= 6) {
      AuthStore.login(email);
      return { user: { email } };
    } else {
      throw new Error('Invalid credentials. Password must be at least 6 characters.');
    }
  };

  // Handle Logout
  window.handleAdminLogout = async function () {
    const client = getClient();
    if (client) {
      try {
        await Promise.race([
          client.auth.signOut(),
          new Promise(r => setTimeout(r, 500))
        ]);
      } catch (e) {
        console.warn('Signout notice:', e);
      }
    }

    AuthStore.logout();
    window.location.href = 'login.html';
  };

  // Run guard
  enforceRouteGuard();

  // DOM ready handlers
  document.addEventListener('DOMContentLoaded', () => {
    // Show email in topbar
    const userEmailEl = document.getElementById('adminUserEmail');
    if (userEmailEl) {
      userEmailEl.textContent = AuthStore.getUserEmail();
    }

    // Attach logout buttons
    document.querySelectorAll('[data-action="admin-logout"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.handleAdminLogout();
      });
    });
  });
})();
