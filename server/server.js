const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('./database');
const { isAuthenticated, isAdmin } = require('./authMiddleware');
const QRCode = require('qrcode');
const { count } = require('console');

const app = express();
const PORT = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.post('/register', async (req, res) => {
  const {nome, cognome, email, password, role = 'user' } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const stmt = db.prepare("INSERT INTO users (nome, cognome, email, password, role) VALUES (?, ?, ?, ?, ?)");
    stmt.run(nome, cognome, email, hashedPassword, role, function(err) {
      if (err) {
        return res.status(400).send('User already exists or other error');
      }
      res.status(201).send('User registered successfully');
    });
    stmt.finalize();
  } catch (err) {
    res.status(500).send('Internal server error');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) {
      return res.status(500).send('Error occurred');
    }
    if (!row) {
      return res.status(401).send('Invalid credentials');
    }
    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(401).send('Invalid credentials');
    }
    req.session.user = { email: row.email, role: row.role };
    if (row.role === 'admin') {
      res.status(200).send({ message: 'Login successful', redirect: '/admin.html' });
    } else {
      res.status(200).send({ message: 'Login successful', redirect: '/index.html' });
    }
  });
});

// Rotta per il logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error during logout');
    }
    res.redirect('/');
  });
});

// Rotta per verificare lo stato di autenticazione
app.get('/auth/status', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/generate-qr', (req, res) => {
    const { number } = req.body;
    if (!number) {
      return res.status(400).send('Number is required');
    }
  
    QRCode.toDataURL(number.toString(), (err, url) => {
      if (err) {
        return res.status(500).send('Error generating QR code');
      }
      res.send({ qrCodeUrl: url });
    });
  });

//ROTTA PER L'ACQUISTO DEL BIGLIETTO
let lastDate = null;
let counter = 0;

app.post('/buyticket', (req, res) => {
  const { tipo_biglietto } = req.body;
  // Ottieni l'ultimo ticket dal database
  db.get("SELECT id_ticket FROM tickets ORDER BY id_ticket DESC LIMIT 1", (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Errore del server');
    }

    if (row) {
      const lastTicketId = row.id_ticket;
      const lastDateInDb = String(lastTicketId).slice(0, 9);
      const lastCounterInDb = parseInt(String(lastTicketId).slice(-4), 10);

      if (lastDate !== lastDateInDb) {
        lastDate = lastDateInDb;
        counter = lastCounterInDb;
      }
    }

    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // I mesi in JavaScript vanno da 0 a 11
    const year = currentDate.getFullYear();

    const dateString = `${day}${month}-${year}`;

    // Resetta il contatore se il giorno è cambiato
    if (lastDate !== dateString) {
      lastDate = dateString;
      counter = 0;
    }

    // Incrementa il contatore
    counter += 1;
    // Format del contatore a 4 cifre
    const counterString = String(counter).padStart(4, '0');
    // Componi l'ID finale
    const id = `${day}${month}-${year}-${counterString}`;
    let datadb = `${day}-${month}-${year}`

    // console.log(id + " " + tipo_biglietto);

    //Esegui la query per salvare il ticket nel database
    db.get("SELECT id FROM users WHERE email = ?", [req.session.user.email], (err, row) => {
      const insertStmt = db.prepare("INSERT INTO tickets (id_ticket, id_utente , data_acquisto, tipo_biglietto, validità) VALUES (?, ?, ?, ?, TRUE)");
      insertStmt.run(id,row.id,datadb, tipo_biglietto, (insertErr) => {
            if (insertErr) {
              console.error(insertErr.message);
              return res.status(500).send('Errore del server');
            }

            res.status(201).send(`Biglietto acquistato con successo. ID: ${id}`);
          });
          insertStmt.finalize();
    });
  });
});

//ROTTA PER VISUALIZZARE I TICKET COMPRATI
app.get('/yourticket', (req, res) => {
  db.get("SELECT id FROM users WHERE email = ?", [req.session.user.email], (err, rowid) => {
    db.all("SELECT * FROM tickets WHERE id_utente = ? AND validità = 1", [rowid.id], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Errore del server');
      }
      res.send({tickets: row })
    });
  });
});


//ROTTA PER VERIFICARE L'ESISTENZA DEL BIGLIETTO NEL DB
app.post('/verifyticket', (req, res) => {
  db.get("SELECT * FROM tickets,users WHERE id_ticket = ? AND users.id = id_utente", [req.body.result], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Errore del server');
    }
    db.run("UPDATE tickets set validità = FALSE  WHERE id_ticket = ?", [req.body.result], (err, a) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Errore del server');
      }
    })
    res.send({info: row})
  });
})

app.get('/admin.html', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
