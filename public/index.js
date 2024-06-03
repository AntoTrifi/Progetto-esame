document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/auth/status');
    const data = await response.json();
    
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (data.authenticated) {
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      logoutBtn.style.display = 'inline';
    } else {
      loginBtn.style.display = 'inline';
      registerBtn.style.display = 'inline';
      logoutBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching authentication status:', error);
  }
});
  