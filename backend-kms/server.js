const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kms_varnion'
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi ke MySQL gagal:', err);
        return;
    }
    console.log('Koneksi database MySQL aktif');
});

// Middleware verifikasi role admin
const verifikasiAdmin = (req, res, next) => {
    const { userrole } = req.headers;
    if (userrole !== 'super_admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Role admin diperlukan.' 
        });
    }
    next();
};

// API login
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
                res.status(401).json({ success: false, message: 'Username atau password salah.' });
            }
        }
    );
});

// Tambah user baru
app.post('/api/users', verifikasiAdmin, (req, res) => {
    const { username, password, role } = req.body;
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username, password, role], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'User baru berhasil didaftarkan.', id: result.insertId });
    });
});

// Reset password user
app.put('/api/users/reset-password', verifikasiAdmin, (req, res) => {
    const { targetUsername, newPassword } = req.body;
    db.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, targetUsername], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: `Password akun ${targetUsername} berhasil direset.` });
    });
});

// Get data platform
app.get('/api/platforms', (req, res) => {
    db.query('SELECT * FROM platforms', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Tambah platform baru
app.post('/api/platforms', verifikasiAdmin, (req, res) => {
    const { name, url, status, testing_guide } = req.body;
    db.query(
        'INSERT INTO platforms (name, url, status, testing_guide) VALUES (?, ?, ?, ?)', 
        [name, url, status, testing_guide], 
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Platform baru berhasil disimpan.', id: result.insertId });
        }
    );
});

// Update data platform
app.put('/api/platforms/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    const { name, url, status, testing_guide } = req.body;
    db.query(
        'UPDATE platforms SET name = ?, url = ?, status = ?, testing_guide = ? WHERE id = ?',
        [name, url, status, testing_guide, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Data platform berhasil diperbarui.' });
        }
    );
});

// Hapus platform
app.delete('/api/platforms/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM platforms WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'Platform berhasil dihapus.' });
    });
});

// Update note/panduan
app.put('/api/kanban/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    db.query(
        'UPDATE kanban_notes SET title = ?, content = ? WHERE id = ?',
        [title, content, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Dokumen panduan berhasil diperbarui.' });
        }
    );
});

// Hapus note/panduan
app.delete('/api/kanban/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM kanban_notes WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'Dokumen panduan berhasil dihapus.' });
    });
});

// Get all kanban notes
app.get('/api/kanban', (req, res) => {
    db.query('SELECT * FROM kanban_notes', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Tambah kanban note baru
app.post('/api/kanban', verifikasiAdmin, (req, res) => {
    const { title, content, category } = req.body;
    db.query(
        'INSERT INTO kanban_notes (title, content, category) VALUES (?, ?, ?)', 
        [title, content, category], 
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Catatan baru berhasil ditambahkan.', id: result.insertId });
        }
    );
});

// Update status/kategori kanban note
app.put('/api/kanban/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    const { category } = req.body;
    db.query(
        'UPDATE kanban_notes SET category = ? WHERE id = ?', 
        [category, id], 
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Status catatan berhasil diperbarui.' });
        }
    );
});

// API Chatbot
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
            res.status(404).json({ message: 'Rute panduan tidak ditemukan.' });
        }
    });
});

// Server listener
app.listen(5000, () => {
    console.log('Server berjalan di port 5000');
});