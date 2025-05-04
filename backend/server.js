const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables if not exist
// Customers table
// EMIs table
// Notifications table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    emi_amount REAL,
    emi_start_date TEXT,
    emi_duration_months INTEGER,
    emi_paid_months INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS emis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    due_date TEXT,
    amount REAL,
    paid INTEGER DEFAULT 0,
    fine REAL DEFAULT 0,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    emi_id INTEGER,
    message TEXT,
    due_date TEXT,
    type TEXT,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(emi_id) REFERENCES emis(id)
  )`);
});

// Helper: Schedule EMI notifications (run every hour)
cron.schedule('0 * * * *', () => {
  scheduleEmiNotifications();
});

function scheduleEmiNotifications() {
  const now = new Date();
  const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  db.all(`SELECT emis.*, customers.name FROM emis 
    JOIN customers ON emis.customer_id = customers.id
    WHERE emis.paid = 0`, [], (err, emis) => {
    if (err) return;
    emis.forEach(emi => {
      const dueDate = new Date(emi.due_date);
      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 5 && daysLeft >= 0) {
        // Check if notification already exists for this emi and day
        db.get(`SELECT * FROM notifications WHERE emi_id = ? AND due_date = ? AND type = 'upcoming'`, [emi.id, emi.due_date], (err, row) => {
          if (!row) {
            db.run(`INSERT INTO notifications (customer_id, emi_id, message, due_date, type) VALUES (?, ?, ?, ?, 'upcoming')`, [emi.customer_id, emi.id, `EMI due for ${emi.name} on ${emi.due_date}`, emi.due_date]);
          }
        });
      } else if (daysLeft < 0) {
        // Overdue notification
        db.get(`SELECT * FROM notifications WHERE emi_id = ? AND due_date = ? AND type = 'overdue'`, [emi.id, emi.due_date], (err, row) => {
          if (!row) {
            db.run(`INSERT INTO notifications (customer_id, emi_id, message, due_date, type) VALUES (?, ?, ?, ?, 'overdue')`, [emi.customer_id, emi.id, `EMI overdue for ${emi.name} (was due on ${emi.due_date})`, emi.due_date]);
          }
        });
      }
    });
  });
}

// Run on server start
scheduleEmiNotifications();

// API: Get notifications
app.get('/api/notifications', (req, res) => {
  db.all(`SELECT notifications.*, customers.name FROM notifications JOIN customers ON notifications.customer_id = customers.id WHERE notifications.read = 0 ORDER BY notifications.created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Mark notification as read
app.post('/api/notifications/read', (req, res) => {
  const { id } = req.body;
  db.run(`UPDATE notifications SET read = 1 WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// API: Add customer (for demo)
app.post('/api/customers', (req, res) => {
  const { name, phone, email, address, emi_amount, emi_start_date, emi_duration_months } = req.body;
  db.run(`INSERT INTO customers (name, phone, email, address, emi_amount, emi_start_date, emi_duration_months) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, phone, email, address, emi_amount, emi_start_date, emi_duration_months], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const customerId = this.lastID;
      // Schedule EMIs
      let start = new Date(emi_start_date);
      for (let i = 0; i < emi_duration_months; i++) {
        let due = new Date(start);
        due.setMonth(due.getMonth() + i);
        db.run(`INSERT INTO emis (customer_id, due_date, amount) VALUES (?, ?, ?)`, [customerId, due.toISOString().slice(0,10), emi_amount]);
      }
      res.json({ id: customerId });
    });
});

// API: Get dashboard stats
app.get('/api/dashboard-stats', (req, res) => {
  db.serialize(() => {
    db.get(`SELECT COUNT(*) as total FROM customers`, (err, totalRow) => {
      db.get(`SELECT COUNT(*) as active FROM customers WHERE emi_paid_months < emi_duration_months`, (err, activeRow) => {
        db.get(`SELECT COUNT(*) as inactive FROM customers WHERE emi_paid_months >= emi_duration_months`, (err, inactiveRow) => {
          db.get(`SELECT COUNT(*) as new_customers FROM customers WHERE emi_start_date >= date('now','start of month')`, (err, newRow) => {
            res.json({
              total: totalRow.total,
              active: activeRow.active,
              inactive: inactiveRow.inactive,
              new_customers: newRow.new_customers
            });
          });
        });
      });
    });
  });
});

// API: Get EMI list
app.get('/api/emi-list', (req, res) => {
  db.all(`SELECT emis.*, customers.name FROM emis JOIN customers ON emis.customer_id = customers.id WHERE emis.paid = 0`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Mark EMI as paid
app.post('/api/emi/:id/pay', (req, res) => {
  const emiId = req.params.id;
  db.get(`SELECT * FROM emis WHERE id = ?`, [emiId], (err, emi) => {
    if (!emi) return res.status(404).json({ error: 'EMI not found' });
    db.run(`UPDATE emis SET paid = 1 WHERE id = ?`, [emiId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      db.run(`UPDATE customers SET emi_paid_months = emi_paid_months + 1 WHERE id = ?`, [emi.customer_id]);
      res.json({ success: true });
    });
  });
});

// API: Mark EMI as unpaid and add fine
app.post('/api/emi/:id/unpaid', (req, res) => {
  const emiId = req.params.id;
  const { fine } = req.body;
  db.run(`UPDATE emis SET fine = fine + ? WHERE id = ?`, [fine, emiId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 