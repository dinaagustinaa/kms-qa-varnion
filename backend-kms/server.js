const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. KONEKSI KE DATABASE XAMPP MYSQL
// ==========================================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Default user XAMPP
    password: '',      // Default password XAMPP (kosong)
    database: 'kms_varnion'
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi ke MySQL XAMPP gagal, cek status control panel:', err);
        return;
    }
    console.log('Success! Koneksi database MySQL XAMPP KMS Varnion aktif');
});

// ==========================================
// 2. MIDDLEWARE PROTEKSI ROLE (RBAC ENGINE)
// ==========================================
// Fungsi pengecekan apakah request dikirim oleh Admin sebelum melakukan manipulasi data
const verifikasiAdmin = (req, res, next) => {
    const { userrole } = req.headers; // Front-end akan mengirimkan role via Headers
    if (userrole !== 'super_admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses Ditolak! Akun QA User dilarang keras melakukan manipulasi data (CRUD)!' 
        });
    }
    next();
};

// ==========================================
// 3. API AUTHENTICATION (LOGIN ONLY)
// ==========================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query(
        'SELECT id, username, role FROM users WHERE username = ? AND password = ?', 
        [username, password], 
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0) {
                res.json({ success: true, user: results[0] });
            } else {
                res.status(401).json({ success: false, message: 'Username atau password salah, Din!' });
            }
        }
    );
});

// Admin bisa menambahkan User QA baru dari halaman admin khusus
app.post('/api/users', verifikasiAdmin, (req, res) => {
    const { username, password, role } = req.body;
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username, password, role], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'Akun penguji QA baru berhasil didaftarkan!', id: result.insertId });
    });
});

// Admin bisa mengganti password akun manapun secara langsung jika ada yang lupa sandi
app.put('/api/users/reset-password', verifikasiAdmin, (req, res) => {
    const { targetUsername, newPassword } = req.body;
    db.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, targetUsername], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: `Password akun ${targetUsername} sukses direset oleh Admin!` });
    });
});

// ==========================================
// 4. API PLATFORM DIRECTORY (CRUD JALUR ADMIN)
// ==========================================

// GET: Semua user (Admin & QA User) bisa melihat list kartu platform
app.get('/api/platforms', (req, res) => {
    db.query('SELECT * FROM platforms', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// POST: Hanya Super Admin yang bisa menambah kartu platform baru
app.post('/api/platforms', verifikasiAdmin, (req, res) => {
    const { name, url, status, testing_guide } = req.body;
    db.query(
        'INSERT INTO platforms (name, url, status, testing_guide) VALUES (?, ?, ?, ?)', 
        [name, url, status, testing_guide], 
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Data platform staging baru berhasil disimpan!', id: result.insertId });
        }
    );
});

// ==========================================
// 5. API KANBAN NOTES (CRUD JALUR ADMIN)
// ==========================================

// GET: Semua user (Admin & QA User) bisa membaca catatan Kanban notes
app.get('/api/kanban', (req, res) => {
    db.query('SELECT * FROM kanban_notes', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// POST: Hanya Super Admin yang bisa menambah note Kanban baru
app.post('/api/kanban', verifikasiAdmin, (req, res) => {
    const { title, content, category } = req.body;
    db.query(
        'INSERT INTO kanban_notes (title, content, category) VALUES (?, ?, ?)', 
        [title, content, category], 
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Catatan kerja Kanban baru berhasil ditempel!', id: result.insertId });
        }
    );
});

// PUT: Hanya Super Admin yang bisa mengubah atau menggeser status note Kanban (todo -> in_progress -> done)
app.put('/api/kanban/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    const { category } = req.body;
    db.query(
        'UPDATE kanban_notes SET category = ? WHERE id = ?', 
        [category, id], 
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Status Kanban notes berhasil diupdate oleh Admin!' });
        }
    );
});

// ==========================================
// 6. API CHATBOT (DECISION TREE INTERAKTIF)
// ==========================================
app.get('/api/chat/:nodeId', (req, res) => {
    const { nodeId } = req.params;
    db.query('SELECT * FROM chat_nodes WHERE node_id = ?', [nodeId], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) {
            res.json({
                text: results[0].bot_text,
                options: JSON.parse(results[0].options_json)
            });
        } else {
            res.status(404).json({ message: 'Rute panduan bot tidak valid.' });
        }
    });
});

// Peladen Berjalan di Port 5000
app.listen(5000, () => {
    console.log('Server KMS Back-End (MySQL XAMPP) menyala di port http://localhost:5000');
});