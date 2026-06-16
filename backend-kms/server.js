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

    // Inisialisasi tabel knowledge_base
    db.query(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            product VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Gagal inisialisasi tabel knowledge_base:', err);
        } else {
            console.log('Tabel knowledge_base aktif');
            // Seeding data awal jika kosong
            db.query('SELECT COUNT(*) AS count FROM knowledge_base', (err, results) => {
                if (!err && results[0].count === 0) {
                    const seedData = [
                        ['Alur Integrasi Paket Internet Megalos', '1. Registrasi pelanggan baru via admin portal.\n2. Verifikasi status OLT dan ONT pada ONT Manager.\n3. Aktivasi paket dan binding profile PPPoE di Mikrotik.\n4. Konfirmasi billing Megalos ter-update dengan flag active.', 'Business Rules', 'Megalos'],
                        ['Skenario Pengujian Invoice Nexbill', 'Test Scenario: Validasi invoice bulanan pelanggan corporate.\nTest Case:\n- Verify nominal PPN 11% terhitung otomatis.\n- Verify invoice terbit H-7 sebelum jatuh tempo.\n- Verify status invoice menjadi Paid setelah webhook payment gateway sukses.', 'QA Documentation', 'Nexbill'],
                        ['Preconditions Pengujian Nextune Player', 'Preconditions:\n1. Browser chrome versi 120+.\n2. Bandwidth minimal 5 Mbps.\n3. Akun penguji memiliki lisensi Nextune Premium.', 'QA Documentation', 'Nextune']
                    ];
                    db.query('INSERT INTO knowledge_base (title, content, category, product) VALUES ?', [seedData], (err) => {
                        if (err) console.error('Gagal seeding data knowledge_base:', err);
                        else console.log('Seeding data awal knowledge_base berhasil');
                    });
                }
            });
        }
    });

    // Cek dan tambahkan kolom 'name' dan 'email' di tabel users jika belum ada
    db.query('SHOW COLUMNS FROM users', (err, cols) => {
        if (err) {
            console.error('Gagal mengecek struktur tabel users:', err);
            return;
        }
        const fields = cols.map(c => c.Field);
        
        const queries = [];
        if (!fields.includes('name')) {
            queries.push("ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT NULL");
        }
        if (!fields.includes('email')) {
            queries.push("ALTER TABLE users ADD COLUMN email VARCHAR(100) DEFAULT NULL");
        }
        
        const executeQueries = (index) => {
            if (index >= queries.length) {
                // Setelah alter, pastikan data awal diisi jika null
                db.query("UPDATE users SET name = 'Admin Varnion', email = 'admin@varnion.com' WHERE username = 'admin_varnion' AND (name IS NULL OR name = '')");
                db.query("UPDATE users SET name = 'User Varnion', email = 'user@varnion.com' WHERE username = 'user_varnion' AND (name IS NULL OR name = '')");
                console.log('Inisialisasi kolom tabel users selesai');
                return;
            }
            db.query(queries[index], (err) => {
                if (err) {
                    console.error(`Gagal menjalankan query: ${queries[index]}`, err);
                } else {
                    console.log(`Berhasil menjalankan query: ${queries[index]}`);
                }
                executeQueries(index + 1);
            });
        };
        
        executeQueries(0);
    });
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
        'SELECT id, username, name, email, role, created_at FROM users WHERE username = ? AND password = ?', 
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
    const { username, password, role, name, email } = req.body;
    db.query('INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)', 
    [username, password, role, name || null, email || null], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'User baru berhasil didaftarkan.', id: result.insertId });
    });
});

// Update profile user (name & email)
app.put('/api/users/profile/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, result) => {
        if (err) return res.status(500).json(err);
        
        // Ambil data user yang diperbarui
        db.query('SELECT id, username, name, email, role, created_at FROM users WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0) {
                res.json({ success: true, message: 'Profil Anda berhasil diperbarui.', user: results[0] });
            } else {
                res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
            }
        });
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

// Ganti password mandiri
app.put('/api/users/change-password', (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    db.query('SELECT password FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0 || results[0].password !== oldPassword) {
            return res.json({ success: false, message: 'Password lama salah.' });
        }
        db.query('UPDATE users SET password = ? WHERE username = ?', [newPassword, username], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Password Anda berhasil diperbarui.' });
        });
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

// --- KNOWLEDGE BASE API ---

// Ambil semua dokumen KB
app.get('/api/knowledge', (req, res) => {
    db.query('SELECT * FROM knowledge_base ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Tambah dokumen KB baru
app.post('/api/knowledge', verifikasiAdmin, (req, res) => {
    const { title, content, category, product } = req.body;
    db.query(
        'INSERT INTO knowledge_base (title, content, category, product) VALUES (?, ?, ?, ?)',
        [title, content, category, product],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Dokumen berhasil disimpan.', id: result.insertId });
        }
    );
});

// Update dokumen KB
app.put('/api/knowledge/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    const { title, content, category, product } = req.body;
    db.query(
        'UPDATE knowledge_base SET title = ?, content = ?, category = ?, product = ? WHERE id = ?',
        [title, content, category, product, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'Dokumen berhasil diperbarui.' });
        }
    );
});

// Hapus dokumen KB
app.delete('/api/knowledge/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM knowledge_base WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'Dokumen berhasil dihapus.' });
    });
});

// API Asisten Virtual dengan Integrasi Database Real-time
app.get('/api/chat/:nodeId', (req, res) => {
    const { nodeId } = req.params;
    const { username } = req.query;
    const clientName = username ? username : 'Penguji';

    if (nodeId === 'start') {
        res.json({
            text: `Halo ${clientName}! Selamat datang di KMS QA. Opsi modul panduan mana yang ingin kamu validasi hari ini?`,
            options: [
                { text: 'Cari Platform Staging', next: 'plat_list' },
                { text: 'Cari Panduan QA (Notes)', next: 'notes_list' }
            ]
        });
    } else if (nodeId === 'plat_list') {
        db.query('SELECT id, name FROM platforms', (err, results) => {
            if (err) return res.status(500).json(err);
            const options = results.map(row => ({
                text: row.name,
                next: `plat_detail_${row.id}`
            }));
            options.push({ text: 'Kembali ke Menu Utama', next: 'start' });
            res.json({
                text: 'Berikut adalah daftar platform staging yang terdaftar di database:',
                options: options
            });
        });
    } else if (nodeId.startsWith('plat_detail_')) {
        const platId = nodeId.replace('plat_detail_', '');
        db.query('SELECT name, url, status, testing_guide FROM platforms WHERE id = ?', [platId], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0) {
                const p = results[0];
                res.json({
                    text: `[Platform: ${p.name}]\nStatus: ${p.status}\nURL: ${p.url}\n\nPanduan Testing:\n${p.testing_guide || 'Tidak ada instruksi khusus.'}`,
                    options: [
                        { text: 'Kembali ke List Platform', next: 'plat_list' },
                        { text: 'Kembali ke Menu Utama', next: 'start' }
                    ]
                });
            } else {
                res.status(404).json({ message: 'Platform tidak ditemukan.' });
            }
        });
    } else if (nodeId === 'notes_list') {
        db.query('SELECT id, title FROM kanban_notes', (err, results) => {
            if (err) return res.status(500).json(err);
            const options = results.map(row => ({
                text: row.title,
                next: `notes_detail_${row.id}`
            }));
            options.push({ text: 'Kembali ke Menu Utama', next: 'start' });
            res.json({
                text: 'Berikut adalah daftar dokumen panduan QA (Notes) yang terdaftar di database:',
                options: options
            });
        });
    } else if (nodeId.startsWith('notes_detail_')) {
        const noteId = nodeId.replace('notes_detail_', '');
        db.query('SELECT title, content FROM kanban_notes WHERE id = ?', [noteId], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0) {
                const n = results[0];
                res.json({
                    text: `[Dokumen: ${n.title}]\n\n${n.content}`,
                    options: [
                        { text: 'Kembali ke List Panduan', next: 'notes_list' },
                        { text: 'Kembali ke Menu Utama', next: 'start' }
                    ]
                });
            } else {
                res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
            }
        });
    } else {
        // Fallback ke chat_nodes static
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
    }
});

// Server listener
app.listen(5000, () => {
    console.log('Server berjalan di port 5000');
});