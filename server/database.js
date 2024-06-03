const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, cognome TEXT, email TEXT UNIQUE, password TEXT, role TEXT)");
  // Creiamo un utente admin di default
  const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
  db.run("REPLACE INTO users (id, nome, cognome, email, password, role) VALUES (1, 'admin', 'admin', ?, ?, ?)", ["admin@example.com", defaultAdminPassword, "admin"]);
  db.run("CREATE TABLE IF NOT EXISTS tickets (id_ticket TEXT UNIQUE, num INTEGER PRIMARY KEY AUTOINCREMENT, id_utente INTEGER, data_acquisto date, tipo_biglietto TEXT,validità BOOLEAN)");
});

module.exports = db;
