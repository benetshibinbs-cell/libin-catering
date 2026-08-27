/**
 * Administrative authentication and route guard.
 * Access is granted only to a verified Supabase user listed in public.admin_users.
 */
(function () {
  function isLoginPage() {
    const path = (window.location.pathname || '').toLowerCase().replace(/\\/g, '/');
    const file = path.split('/').pop();
    return file === 'login.html' || file === 'login';
  }

  function getClient() {
    return window.DB && typeof window.DB.getClient === 'function'
      ? window.DB.getClient()
      : null;
  }

  function redirectToLogin() {
    window.location.replace('login.html');
  }

  async function getVerifiedAdmin() {
    const client = getClient();
    if (!client) return null;

    // getUser validates the session with Supabase Auth; do not trust browser storage.
    const { data: userData, error: userError } = await client.auth.getUser();
    const user = userData && userData.user;
    if (userError || !user) return null;

    // RLS exposes an allowlist row only to the corresponding administrator.
    const { data: admin, error: adminError } = await client
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError || !admin) return null;
    return user;
  }

  async function enforceRouteGuard() {
    if (isLoginPage()) return true;

    const user = await getVerifiedAdmin();
    if (!user) {
      redirectToLogin();
      return false;
    }

    const userEmailEl = document.getElementById('adminUserEmail');
    if (userEmailEl) userEmailEl.textContent = user.email || '';
    return true;
  }

  window.handleAdminLogin = async function (email, password) {
    if (!email || !password) throw new Error('Enter your email and password.');

    const client = getClient();
    if (!client) throw new Error('Authentication is temporarily unavailable.');

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      // Keep the response generic to avoid disclosing which part of the credentials failed.
      throw new Error('Invalid email or password.');
    }

    const admin = await getVerifiedAdmin();
    if (!admin) {
      await client.auth.signOut();
      throw new Error('This account is not authorized to access the admin area.');
    }

    return { user: admin };
  };

  window.handleAdminLogout = async function () {
    const client = getClient();
    if (client) await client.auth.signOut();
    redirectToLogin();
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-action="admin-logout"]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        window.handleAdminLogout();
      });
    });
  });

  enforceRouteGuard();
})();