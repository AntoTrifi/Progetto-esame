// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const response = await fetch('/auth/status');
//     const data = await response.json();
    
//     const loginForm = document.getElementById('login-form');
//     const registerForm = document.getElementById('register-form');
//     const logoutButton = document.getElementById('logout-button');

//     alert(data.authenticated)

//     if (data.authenticated) {
//       loginForm.style.display = 'none';
//       registerForm.style.display = 'none';
//       logoutButton.style.display = 'block';
//     } else {
//       loginForm.style.display = 'block';
//       registerForm.style.display = 'block';
//       logoutButton.style.display = 'none';
//     }
//   } catch (error) {
//     console.error('Error fetching authentication status:', error);
//   }
// });


document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    alert(data.message);
    if (data.redirect) {
      window.location.href = data.redirect;
    } else {
      window.location.reload(); // Ricarica la pagina per aggiornare lo stato di autenticazione
    }
  } catch (error) {
    alert(error.message);
  }
});