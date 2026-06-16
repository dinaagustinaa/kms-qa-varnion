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

    // Cek dan tambahkan kolom 'name' dan 'email' di tabel users jika belum ada di database
    db.query('SHOW COLUMNS FROM users', (err, cols) => {
        if (err) {
            console.error('Gagal mengecek struktur tabel users:', err);
            return;
        }
        // Mengambil semua nama kolom yang ada di tabel 'users' saat ini
        const fields = cols.map(c => c.Field);
        
        const queries = [];
        // Jika kolom 'name' belum ada, tambahkan query ALTER TABLE ke antrean
        if (!fields.includes('name')) {
            queries.push("ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT NULL");
        }
        // Jika kolom 'email' belum ada, tambahkan query ALTER TABLE ke antrean
        if (!fields.includes('email')) {
            queries.push("ALTER TABLE users ADD COLUMN email VARCHAR(100) DEFAULT NULL");
        }
        
        // Fungsi rekursif untuk mengeksekusi query ALTER TABLE secara berurutan
        const executeQueries = (index) => {
            // Jika semua query ALTER TABLE selesai dijalankan
            if (index >= queries.length) {
                // Perbarui data nama dan email untuk user default (admin & user_qa) jika masih kosong/NULL
                db.query("UPDATE users SET name = 'Admin Varnion', email = 'admin@varnion.com' WHERE username = 'admin_varnion' AND (name IS NULL OR name = '')");
                db.query("UPDATE users SET name = 'User Varnion', email = 'user@varnion.com' WHERE username = 'user_varnion' AND (name IS NULL OR name = '')");
                console.log('Inisialisasi kolom tabel users selesai');
                return;
            }
            // Jalankan query ALTER TABLE pada indeks saat ini
            db.query(queries[index], (err) => {
                if (err) {
                    console.error(`Gagal menjalankan query: ${queries[index]}`, err);
                } else {
                    console.log(`Berhasil menjalankan query: ${queries[index]}`);
                }
                // Lanjutkan ke query berikutnya
                executeQueries(index + 1);
            });
        };
        
        // Mulai eksekusi query dari indeks 0
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

// API login untuk memproses autentikasi pengguna
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Ambil data user beserta nama dan email dari database berdasarkan username & password
    db.query(
        'SELECT id, username, name, email, role, created_at FROM users WHERE username = ? AND password = ?', 
        [username, password], 
        (err, results) => {
            if (err) return res.status(500).json(err);
            // Jika pencarian mengembalikan data (ditemukan user yang cocok)
            if (results.length > 0) {
                res.json({ success: true, user: results[0] });
            } else {
                res.status(401).json({ success: false, message: 'Username atau password salah.' });
            }
        }
    );
});

// Tambah user baru (Hanya dapat diakses oleh Super Admin / Lead QA)
app.post('/api/users', verifikasiAdmin, (req, res) => {
    const { username, password, role, name, email } = req.body;
    // Masukkan data user baru dengan name & email opsional (default ke NULL jika tidak dikirim)
    db.query('INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)', 
    [username, password, role, name || null, email || null], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, message: 'User baru berhasil didaftarkan.', id: result.insertId });
    });
});

// Update profile user (Khusus untuk mengubah name & email mandiri)
app.put('/api/users/profile/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    // Perbarui kolom nama dan email berdasarkan ID pengguna saat ini
    db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (err, result) => {
        if (err) return res.status(500).json(err);
        
        // Ambil kembali data user terbaru setelah sukses diperbarui untuk memperbarui sesi di frontend
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

// Get all users
app.get('/api/users', (req, res) => {
    db.query('SELECT id, username, name, email, role, created_at FROM users', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Delete user (Hanya Admin, dan hanya boleh menghapus user biasa)
app.delete('/api/users/:id', verifikasiAdmin, (req, res) => {
    const { id } = req.params;
    db.query('SELECT role FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }
        if (results[0].role === 'super_admin') {
            return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun administrator.' });
        }
        db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, message: 'User berhasil dihapus.' });
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

// Server listener
app.listen(5000, () => {
    console.log('Server berjalan di port 5000');
});