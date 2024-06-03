// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const response = await fetch('/auth/status');
//     const data = await response.json();
    
//     const loginbtn = document.getElementById('login-form');
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

document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const nome = document.getElementById('register-nome').value;
  const cognome = document.getElementById('register-cognome').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const role = /*document.getElementById('register-role').value ||*/ 'user';

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cognome, email, password, role })
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const message = await response.text();
    alert(message);
    window.location.href = '/login.html'; // Ricarica la pagina per aggiornare lo stato di autenticazione
  } catch (error) {
    alert(error.message);
  }
});
  