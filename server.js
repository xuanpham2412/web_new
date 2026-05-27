const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
  },
  waitForConnections: true,
  connectionLimit: 10,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

function ok(res, data = null, message = "Thanh cong") {
  res.json({ success: true, data, message });
}

function fail(res, err, message = "Loi server") {
  console.error(message, err);
  res.status(500).json({ success: false, message: `${message}: ${err.message}` });
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS hoat_dong (
      id INT AUTO_INCREMENT PRIMARY KEY,
      hanh_dong VARCHAR(30) NOT NULL,
      doi_tuong VARCHAR(50) NOT NULL,
      noi_dung VARCHAR(255) NOT NULL,
      tao_luc TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS thong_bao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tieu_de VARCHAR(255) NOT NULL,
      noi_dung TEXT NOT NULL,
      ngay_dang TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  const admins = await query("SELECT COUNT(*) total FROM tai_khoan");
  if (Number(admins[0].total) === 0) {
    await query(
      "INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro) VALUES ('admin', 'admin', 'admin')",
    );
  }
}

async function logActivity(action, entity, entityName) {
  await query(
    "INSERT INTO hoat_dong (hanh_dong, doi_tuong, noi_dung) VALUES (?, ?, ?)",
    [action, entity, `${action} ${entity} ${entityName}`],
  );
}

function parseDiemId(id) {
  const [msv, maMon] = String(id).split("__");
  return { msv, maMon };
}

async function fkOrNull(table, column, value) {
  if (!value) return null;
  const rows = await query(`SELECT ${column} FROM ${table} WHERE ${column} = ? LIMIT 1`, [value]);
  return rows.length ? value : null;
}

function nullIfEmpty(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

app.post("/api/login", async (req, res) => {
  try {
    const { ten_dang_nhap, mat_khau } = req.body;
    if (!ten_dang_nhap || !mat_khau) {
      return res.status(400).json({ success: false, message: "Vui long nhap day du tai khoan va mat khau." });
    }

    const users = await query(
      "SELECT id, ten_dang_nhap, vai_tro FROM tai_khoan WHERE ten_dang_nhap = ? AND mat_khau = ?",
      [ten_dang_nhap, mat_khau],
    );

    if (!users.length) {
      return res.status(401).json({ success: false, message: "Tai khoan hoac mat khau khong chinh xac." });
    }

    ok(res, users[0], "Dang nhap thanh cong");
  } catch (err) {
    fail(res, err, "Loi dang nhap");
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { ten_dang_nhap, lien_he } = req.body;
    if (!ten_dang_nhap || !lien_he) {
      return res.status(400).json({ success: false, message: "Nhap ten dang nhap va email/so dien thoai." });
    }

    const rows = await query(
      `
        SELECT tk.mat_khau
        FROM tai_khoan tk
        LEFT JOIN sinh_vien sv ON sv.tai_khoan_id = tk.id
        LEFT JOIN giang_vien gv ON gv.tai_khoan_id = tk.id
        WHERE tk.ten_dang_nhap = ?
          AND (sv.email = ? OR gv.email = ? OR gv.so_dien_thoai = ?)
        LIMIT 1
      `,
      [ten_dang_nhap, lien_he, lien_he, lien_he],
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Thong tin xac minh khong dung." });
    }

    ok(res, { password: rows[0].mat_khau }, "Lay lai mat khau thanh cong");
  } catch (err) {
    fail(res, err, "Loi quen mat khau");
  }
});

app.get("/api/options", async (req, res) => {
  try {
    const [khoa, lop, giangvien, monhoc, sinhvien] = await Promise.all([
      query("SELECT ma_khoa value, CONCAT(ma_khoa, ' - ', ten_khoa) label FROM khoa ORDER BY ma_khoa"),
      query("SELECT ma_lop value, CONCAT(ma_lop, ' - ', ten_lop) label FROM lop_hoc ORDER BY ma_lop"),
      query("SELECT ma_gv value, CONCAT(ma_gv, ' - ', ten_gv) label FROM giang_vien ORDER BY ma_gv"),
      query("SELECT ma_mon value, CONCAT(ma_mon, ' - ', ten_mon) label FROM mon_hoc ORDER BY ma_mon"),
      query("SELECT msv value, CONCAT(msv, ' - ', ten_sv) label FROM sinh_vien ORDER BY msv"),
    ]);
    ok(res, { khoa, lop, giangvien, monhoc, sinhvien });
  } catch (err) {
    fail(res, err, "Loi lay danh sach lua chon");
  }
});

app.get("/api/sinhvien", async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        sv.msv id,
        sv.ten_sv name,
        sv.email,
        sv.ma_khoa khoa,
        COALESCE(k.ten_khoa, sv.ma_khoa) khoaName,
        sv.ma_lop lop,
        ROUND(COALESCE(AVG(ds.diem_tong), 0) / 10 * 4, 2) gpa,
        sv.trang_thai status
      FROM sinh_vien sv
      LEFT JOIN khoa k ON k.ma_khoa = sv.ma_khoa
      LEFT JOIN diem_so ds ON ds.msv = sv.msv
      GROUP BY sv.msv, sv.ten_sv, sv.email, sv.ma_khoa, k.ten_khoa, sv.ma_lop, sv.trang_thai
      ORDER BY sv.msv
    `);
    ok(res, rows);
  } catch (err) {
    fail(res, err, "Loi lay sinh vien");
  }
});

app.post("/api/sinhvien", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    const maLop = await fkOrNull("lop_hoc", "ma_lop", b.lop);
    await query(
      "INSERT INTO sinh_vien (msv, ten_sv, ma_khoa, ma_lop, email, trang_thai) VALUES (?, ?, ?, ?, ?, ?)",
      [b.id, b.name, maKhoa, maLop, nullIfEmpty(b.email), b.status || "dang hoc"],
    );
    await logActivity("Them", "sinh vien", b.name);
    ok(res, null, "Them sinh vien thanh cong");
  } catch (err) {
    fail(res, err, "Loi them sinh vien");
  }
});

app.put("/api/sinhvien/:id", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    const maLop = await fkOrNull("lop_hoc", "ma_lop", b.lop);
    await query(
      "UPDATE sinh_vien SET ten_sv=?, ma_khoa=?, ma_lop=?, email=?, trang_thai=? WHERE msv=?",
      [b.name, maKhoa, maLop, nullIfEmpty(b.email), b.status || "dang hoc", req.params.id],
    );
    await logActivity("Sua", "sinh vien", b.name);
    ok(res, null, "Sua sinh vien thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua sinh vien");
  }
});

app.delete("/api/sinhvien/:id", async (req, res) => {
  try {
    await query("DELETE FROM diem_so WHERE msv=?", [req.params.id]);
    await query("DELETE FROM sinh_vien WHERE msv=?", [req.params.id]);
    await logActivity("Xoa", "sinh vien", req.params.id);
    ok(res, null, "Xoa sinh vien thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa sinh vien");
  }
});

app.get("/api/giangvien", async (req, res) => {
  try {
    ok(res, await query(`
      SELECT
        gv.ma_gv id,
        gv.ten_gv name,
        gv.email,
        gv.ma_khoa khoa,
        COALESCE(k.ten_khoa, gv.ma_khoa) khoaName,
        gv.mon_day_chinh mainSubject,
        gv.hoc_vi hocvi,
        gv.so_dien_thoai phone,
        'dang giang day' status
      FROM giang_vien gv
      LEFT JOIN khoa k ON k.ma_khoa = gv.ma_khoa
      ORDER BY gv.ma_gv
    `));
  } catch (err) {
    fail(res, err, "Loi lay giang vien");
  }
});

app.post("/api/giangvien", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    await query(
      "INSERT INTO giang_vien (ma_gv, ten_gv, email, ma_khoa, mon_day_chinh, hoc_vi, so_dien_thoai) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [b.id, b.name, nullIfEmpty(b.email), maKhoa, nullIfEmpty(b.mainSubject), nullIfEmpty(b.hocvi), nullIfEmpty(b.phone)],
    );
    await logActivity("Them", "giang vien", b.name);
    ok(res, null, "Them giang vien thanh cong");
  } catch (err) {
    fail(res, err, "Loi them giang vien");
  }
});

app.put("/api/giangvien/:id", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    await query(
      "UPDATE giang_vien SET ten_gv=?, email=?, ma_khoa=?, mon_day_chinh=?, hoc_vi=?, so_dien_thoai=? WHERE ma_gv=?",
      [b.name, nullIfEmpty(b.email), maKhoa, nullIfEmpty(b.mainSubject), nullIfEmpty(b.hocvi), nullIfEmpty(b.phone), req.params.id],
    );
    await logActivity("Sua", "giang vien", b.name);
    ok(res, null, "Sua giang vien thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua giang vien");
  }
});

app.delete("/api/giangvien/:id", async (req, res) => {
  try {
    await query("UPDATE khoa SET truong_khoa=NULL WHERE truong_khoa=?", [req.params.id]);
    await query("UPDATE lop_hoc SET gv_chu_nghiem=NULL WHERE gv_chu_nghiem=?", [req.params.id]);
    await query("UPDATE mon_hoc SET ma_gv=NULL WHERE ma_gv=?", [req.params.id]);
    await query("UPDATE lich_hoc SET ma_gv=NULL WHERE ma_gv=?", [req.params.id]);
    await query("DELETE FROM giang_vien WHERE ma_gv=?", [req.params.id]);
    await logActivity("Xoa", "giang vien", req.params.id);
    ok(res, null, "Xoa giang vien thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa giang vien");
  }
});

app.get("/api/khoa", async (req, res) => {
  try {
    ok(res, await query(`
      SELECT
        k.ma_khoa id,
        k.ten_khoa name,
        k.truong_khoa dean,
        gv.ten_gv deanName,
        k.so_sinh_vien students,
        k.so_giang_vien teachers,
        k.trang_thai status
      FROM khoa k
      LEFT JOIN giang_vien gv ON gv.ma_gv = k.truong_khoa
      ORDER BY k.ma_khoa
    `));
  } catch (err) {
    fail(res, err, "Loi lay khoa");
  }
});

app.post("/api/khoa", async (req, res) => {
  try {
    const b = req.body;
    const truongKhoa = await fkOrNull("giang_vien", "ma_gv", b.dean);
    await query(
      "INSERT INTO khoa (ma_khoa, ten_khoa, truong_khoa, so_sinh_vien, so_giang_vien, trang_thai) VALUES (?, ?, ?, ?, ?, ?)",
      [b.id, b.name, truongKhoa, b.students || 0, b.teachers || 0, b.status || "hoat dong"],
    );
    await logActivity("Them", "khoa", b.name);
    ok(res, null, "Them khoa thanh cong");
  } catch (err) {
    fail(res, err, "Loi them khoa");
  }
});

app.put("/api/khoa/:id", async (req, res) => {
  try {
    const b = req.body;
    const truongKhoa = await fkOrNull("giang_vien", "ma_gv", b.dean);
    await query(
      "UPDATE khoa SET ten_khoa=?, truong_khoa=?, so_sinh_vien=?, so_giang_vien=?, trang_thai=? WHERE ma_khoa=?",
      [b.name, truongKhoa, b.students || 0, b.teachers || 0, b.status || "hoat dong", req.params.id],
    );
    await logActivity("Sua", "khoa", b.name);
    ok(res, null, "Sua khoa thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua khoa");
  }
});

app.delete("/api/khoa/:id", async (req, res) => {
  try {
    await query("UPDATE sinh_vien SET ma_khoa=NULL WHERE ma_khoa=?", [req.params.id]);
    await query("UPDATE giang_vien SET ma_khoa=NULL WHERE ma_khoa=?", [req.params.id]);
    await query("UPDATE lop_hoc SET ma_khoa=NULL WHERE ma_khoa=?", [req.params.id]);
    await query("UPDATE mon_hoc SET ma_khoa=NULL WHERE ma_khoa=?", [req.params.id]);
    await query("DELETE FROM khoa WHERE ma_khoa=?", [req.params.id]);
    await logActivity("Xoa", "khoa", req.params.id);
    ok(res, null, "Xoa khoa thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa khoa");
  }
});

app.get("/api/monhoc", async (req, res) => {
  try {
    ok(res, await query(`
      SELECT
        mh.ma_mon id,
        mh.ten_mon name,
        mh.so_tin_chi credits,
        mh.ma_khoa khoa,
        COALESCE(k.ten_khoa, mh.ma_khoa) khoaName,
        mh.ma_gv teacher,
        gv.ten_gv teacherName,
        mh.trang_thai status
      FROM mon_hoc mh
      LEFT JOIN khoa k ON k.ma_khoa = mh.ma_khoa
      LEFT JOIN giang_vien gv ON gv.ma_gv = mh.ma_gv
      ORDER BY mh.ma_mon
    `));
  } catch (err) {
    fail(res, err, "Loi lay mon hoc");
  }
});

app.post("/api/monhoc", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    const maGv = await fkOrNull("giang_vien", "ma_gv", b.teacher);
    await query(
      "INSERT INTO mon_hoc (ma_mon, ten_mon, so_tin_chi, ma_khoa, ma_gv, trang_thai) VALUES (?, ?, ?, ?, ?, ?)",
      [b.id, b.name, b.credits || 0, maKhoa, maGv, b.status || "dang mo"],
    );
    await logActivity("Them", "mon hoc", b.name);
    ok(res, null, "Them mon hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi them mon hoc");
  }
});

app.put("/api/monhoc/:id", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    const maGv = await fkOrNull("giang_vien", "ma_gv", b.teacher);
    await query(
      "UPDATE mon_hoc SET ten_mon=?, so_tin_chi=?, ma_khoa=?, ma_gv=?, trang_thai=? WHERE ma_mon=?",
      [b.name, b.credits || 0, maKhoa, maGv, b.status || "dang mo", req.params.id],
    );
    await logActivity("Sua", "mon hoc", b.name);
    ok(res, null, "Sua mon hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua mon hoc");
  }
});

app.delete("/api/monhoc/:id", async (req, res) => {
  try {
    await query("DELETE FROM diem_so WHERE ma_mon=?", [req.params.id]);
    await query("DELETE FROM lich_hoc WHERE ma_mon=?", [req.params.id]);
    await query("DELETE FROM mon_hoc WHERE ma_mon=?", [req.params.id]);
    await logActivity("Xoa", "mon hoc", req.params.id);
    ok(res, null, "Xoa mon hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa mon hoc");
  }
});

app.get("/api/lophoc", async (req, res) => {
  try {
    ok(res, await query(`
      SELECT
        lh.ma_lop id,
        lh.ten_lop name,
        lh.ma_khoa khoa,
        COALESCE(k.ten_khoa, lh.ma_khoa) khoaName,
        lh.gv_chu_nghiem advisor,
        gv.ten_gv advisorName,
        lh.si_so size,
        lh.hoc_ki semester,
        lh.trang_thai status
      FROM lop_hoc lh
      LEFT JOIN khoa k ON k.ma_khoa = lh.ma_khoa
      LEFT JOIN giang_vien gv ON gv.ma_gv = lh.gv_chu_nghiem
      ORDER BY lh.ma_lop
    `));
  } catch (err) {
    fail(res, err, "Loi lay lop hoc");
  }
});

app.post("/api/lophoc", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    const gvChuNhiem = await fkOrNull("giang_vien", "ma_gv", b.advisor);
    await query(
      "INSERT INTO lop_hoc (ma_lop, ten_lop, ma_khoa, gv_chu_nghiem, si_so, hoc_ki, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [b.id, b.name, maKhoa, gvChuNhiem, b.size || 0, nullIfEmpty(b.semester), b.status || "hoat dong"],
    );
    await logActivity("Them", "lop hoc", b.name);
    ok(res, null, "Them lop hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi them lop hoc");
  }
});

app.put("/api/lophoc/:id", async (req, res) => {
  try {
    const b = req.body;
    const maKhoa = await fkOrNull("khoa", "ma_khoa", b.khoa);
    const gvChuNhiem = await fkOrNull("giang_vien", "ma_gv", b.advisor);
    await query(
      "UPDATE lop_hoc SET ten_lop=?, ma_khoa=?, gv_chu_nghiem=?, si_so=?, hoc_ki=?, trang_thai=? WHERE ma_lop=?",
      [b.name, maKhoa, gvChuNhiem, b.size || 0, nullIfEmpty(b.semester), b.status || "hoat dong", req.params.id],
    );
    await logActivity("Sua", "lop hoc", b.name);
    ok(res, null, "Sua lop hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua lop hoc");
  }
});

app.delete("/api/lophoc/:id", async (req, res) => {
  try {
    await query("UPDATE sinh_vien SET ma_lop=NULL WHERE ma_lop=?", [req.params.id]);
    await query("DELETE FROM lich_hoc WHERE ma_lop=?", [req.params.id]);
    await query("DELETE FROM lop_hoc WHERE ma_lop=?", [req.params.id]);
    await logActivity("Xoa", "lop hoc", req.params.id);
    ok(res, null, "Xoa lop hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa lop hoc");
  }
});

app.get("/api/diemso", async (req, res) => {
  try {
    ok(res, await query(`
      SELECT
        CONCAT(ds.msv, '__', ds.ma_mon) id,
        ds.msv,
        sv.ten_sv student,
        ds.ma_mon,
        mh.ten_mon subject,
        ds.diem_gk process,
        ds.diem_ck exam,
        ds.diem_tong final,
        ds.xep_loai status
      FROM diem_so ds
      LEFT JOIN sinh_vien sv ON sv.msv = ds.msv
      LEFT JOIN mon_hoc mh ON mh.ma_mon = ds.ma_mon
      ORDER BY ds.msv, ds.ma_mon
    `));
  } catch (err) {
    fail(res, err, "Loi lay diem so");
  }
});

app.post("/api/diemso", async (req, res) => {
  try {
    const b = req.body;
    const msv = await fkOrNull("sinh_vien", "msv", b.msv);
    const maMon = await fkOrNull("mon_hoc", "ma_mon", b.ma_mon);
    if (!msv || !maMon) {
      return res.status(400).json({ success: false, message: "MSSV hoac ma mon khong ton tai trong CSDL." });
    }
    await query(
      "INSERT INTO diem_so (msv, ma_mon, diem_gk, diem_ck, diem_tong, xep_loai) VALUES (?, ?, ?, ?, ?, ?)",
      [msv, maMon, b.process || 0, b.exam || 0, b.final || 0, nullIfEmpty(b.status)],
    );
    await logActivity("Them", "diem so", `${b.msv} - ${b.ma_mon}`);
    ok(res, null, "Them diem so thanh cong");
  } catch (err) {
    fail(res, err, "Loi them diem so");
  }
});

app.put("/api/diemso/:id", async (req, res) => {
  try {
    const old = parseDiemId(req.params.id);
    const b = req.body;
    const msv = await fkOrNull("sinh_vien", "msv", b.msv);
    const maMon = await fkOrNull("mon_hoc", "ma_mon", b.ma_mon);
    if (!msv || !maMon) {
      return res.status(400).json({ success: false, message: "MSSV hoac ma mon khong ton tai trong CSDL." });
    }
    await query(
      "UPDATE diem_so SET msv=?, ma_mon=?, diem_gk=?, diem_ck=?, diem_tong=?, xep_loai=? WHERE msv=? AND ma_mon=?",
      [msv, maMon, b.process || 0, b.exam || 0, b.final || 0, nullIfEmpty(b.status), old.msv, old.maMon],
    );
    await logActivity("Sua", "diem so", `${b.msv} - ${b.ma_mon}`);
    ok(res, null, "Sua diem so thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua diem so");
  }
});

app.delete("/api/diemso/:id", async (req, res) => {
  try {
    const old = parseDiemId(req.params.id);
    await query("DELETE FROM diem_so WHERE msv=? AND ma_mon=?", [old.msv, old.maMon]);
    await logActivity("Xoa", "diem so", `${old.msv} - ${old.maMon}`);
    ok(res, null, "Xoa diem so thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa diem so");
  }
});

app.get("/api/lichhoc", async (req, res) => {
  try {
    ok(res, await query(`
      SELECT
        lh.id,
        lh.thu weekday,
        lh.ca shift,
        lh.ma_mon,
        mh.ten_mon subject,
        lh.ma_gv teacher,
        gv.ten_gv teacherName,
        lh.phong room,
        lh.ma_lop className,
        CONCAT(COALESCE(lh.thu, ''), ' ', COALESCE(lh.ca, '')) time,
        'dang day' status
      FROM lich_hoc lh
      LEFT JOIN mon_hoc mh ON mh.ma_mon = lh.ma_mon
      LEFT JOIN giang_vien gv ON gv.ma_gv = lh.ma_gv
      ORDER BY lh.id
    `));
  } catch (err) {
    fail(res, err, "Loi lay lich hoc");
  }
});

app.post("/api/lichhoc", async (req, res) => {
  try {
    const b = req.body;
    const maMon = await fkOrNull("mon_hoc", "ma_mon", b.ma_mon);
    const maGv = await fkOrNull("giang_vien", "ma_gv", b.teacher);
    const maLop = await fkOrNull("lop_hoc", "ma_lop", b.className);
    await query(
      "INSERT INTO lich_hoc (thu, ca, ma_mon, ma_gv, phong, ma_lop) VALUES (?, ?, ?, ?, ?, ?)",
      [nullIfEmpty(b.weekday), nullIfEmpty(b.shift), maMon, maGv, nullIfEmpty(b.room), maLop],
    );
    await logActivity("Them", "lich hoc", `${b.weekday || ""} ${b.shift || ""}`);
    ok(res, null, "Them lich hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi them lich hoc");
  }
});

app.put("/api/lichhoc/:id", async (req, res) => {
  try {
    const b = req.body;
    const maMon = await fkOrNull("mon_hoc", "ma_mon", b.ma_mon);
    const maGv = await fkOrNull("giang_vien", "ma_gv", b.teacher);
    const maLop = await fkOrNull("lop_hoc", "ma_lop", b.className);
    await query(
      "UPDATE lich_hoc SET thu=?, ca=?, ma_mon=?, ma_gv=?, phong=?, ma_lop=? WHERE id=?",
      [nullIfEmpty(b.weekday), nullIfEmpty(b.shift), maMon, maGv, nullIfEmpty(b.room), maLop, req.params.id],
    );
    await logActivity("Sua", "lich hoc", `${b.weekday || ""} ${b.shift || ""}`);
    ok(res, null, "Sua lich hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua lich hoc");
  }
});

app.delete("/api/lichhoc/:id", async (req, res) => {
  try {
    await query("DELETE FROM lich_hoc WHERE id=?", [req.params.id]);
    await logActivity("Xoa", "lich hoc", req.params.id);
    ok(res, null, "Xoa lich hoc thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa lich hoc");
  }
});

app.get("/api/thongbao", async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        id,
        tieu_de title,
        noi_dung content,
        DATE_FORMAT(ngay_dang, '%d/%m/%Y %H:%i') date,
        ngay_dang postedAt
      FROM thong_bao
      ORDER BY ngay_dang DESC, id DESC
    `);
    ok(res, rows);
  } catch (err) {
    fail(res, err, "Loi lay thong bao");
  }
});

app.post("/api/thongbao", async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Tieu de va noi dung khong duoc de trong." });
    }
    await query("INSERT INTO thong_bao (tieu_de, noi_dung) VALUES (?, ?)", [title, content]);
    await logActivity("Them", "thong bao", title);
    ok(res, null, "Them thong bao thanh cong");
  } catch (err) {
    fail(res, err, "Loi them thong bao");
  }
});

app.put("/api/thongbao/:id", async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Tieu de va noi dung khong duoc de trong." });
    }
    const result = await query("UPDATE thong_bao SET tieu_de=?, noi_dung=? WHERE id=?", [title, content, req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Khong tim thay thong bao." });
    }
    await logActivity("Sua", "thong bao", title);
    ok(res, null, "Sua thong bao thanh cong");
  } catch (err) {
    fail(res, err, "Loi sua thong bao");
  }
});

app.delete("/api/thongbao/:id", async (req, res) => {
  try {
    const result = await query("DELETE FROM thong_bao WHERE id=?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Khong tim thay thong bao." });
    }
    await logActivity("Xoa", "thong bao", req.params.id);
    ok(res, null, "Xoa thong bao thanh cong");
  } catch (err) {
    fail(res, err, "Loi xoa thong bao");
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const [sv] = await query("SELECT COUNT(*) total, SUM(trang_thai='dang hoc') active FROM sinh_vien");
    const [gv] = await query("SELECT COUNT(*) total, SUM(hoc_vi='Tien si') doctor, SUM(hoc_vi='Thac si') master FROM giang_vien");
    const [km] = await query("SELECT (SELECT COUNT(*) FROM khoa) khoa, (SELECT COUNT(*) FROM mon_hoc) monhoc, (SELECT COUNT(*) FROM lop_hoc) lophoc");
    const [gpa] = await query("SELECT ROUND(COALESCE(AVG(student_gpa), 0), 2) avgGpa FROM (SELECT AVG(diem_tong) / 10 * 4 student_gpa FROM diem_so GROUP BY msv) x");
    const distribution = await query(`
      SELECT COALESCE(k.ten_khoa, sv.ma_khoa, 'Chua phan khoa') name, COUNT(*) students
      FROM sinh_vien sv
      LEFT JOIN khoa k ON k.ma_khoa = sv.ma_khoa
      GROUP BY COALESCE(k.ten_khoa, sv.ma_khoa, 'Chua phan khoa')
      ORDER BY students DESC
    `);
    const [quick] = await query(`
      SELECT
        SUM(sv.trang_thai='tot nghiep' AND COALESCE(x.gpa, 0) >= 3.2) goodGraduates,
        SUM(sv.trang_thai='dang hoc' AND COALESCE(x.gpa, 0) >= 3.6) scholarships,
        SUM(COALESCE(x.gpa, 0) > 0 AND COALESCE(x.gpa, 0) < 2.5) warnings
      FROM sinh_vien sv
      LEFT JOIN (
        SELECT msv, AVG(diem_tong) / 10 * 4 gpa
        FROM diem_so
        GROUP BY msv
      ) x ON x.msv = sv.msv
    `);
    const notifications = await query(`
      SELECT
        id,
        tieu_de title,
        noi_dung content,
        DATE_FORMAT(ngay_dang, '%d/%m/%Y %H:%i') date
      FROM thong_bao
      ORDER BY ngay_dang DESC, id DESC
      LIMIT 6
    `);

    ok(res, {
      totals: {
        students: Number(sv.total || 0),
        activeStudents: Number(sv.active || 0),
        teachers: Number(gv.total || 0),
        activeTeachers: Number(gv.total || 0),
        departments: Number(km.khoa || 0),
        subjects: Number(km.monhoc || 0),
        classes: Number(km.lophoc || 0),
        avgGpa: Number(gpa.avgGpa || 0).toFixed(2),
      },
      distribution,
      quick: {
        goodGraduates: Number(quick.goodGraduates || 0),
        scholarships: Number(quick.scholarships || 0),
        warnings: Number(quick.warnings || 0),
        doctor: Number(gv.doctor || 0),
        master: Number(gv.master || 0),
      },
      notifications,
    });
  } catch (err) {
    fail(res, err, "Loi lay bang thong tin");
  }
});

app.get("/api/sinhvien-portal/:accountId", async (req, res) => {
  try {
    const students = await query(
      `
        SELECT
          sv.msv id,
          sv.ten_sv name,
          sv.email,
          sv.gioi_tinh gender,
          DATE_FORMAT(sv.ngay_sinh, '%d/%m/%Y') dob,
          sv.ma_khoa khoa,
          k.ten_khoa khoaName,
          sv.ma_lop lop,
          lh.ten_lop lopName,
          sv.trang_thai status,
          ROUND(COALESCE(AVG(ds.diem_tong), 0) / 10 * 4, 2) gpa
        FROM sinh_vien sv
        LEFT JOIN khoa k ON k.ma_khoa = sv.ma_khoa
        LEFT JOIN lop_hoc lh ON lh.ma_lop = sv.ma_lop
        LEFT JOIN diem_so ds ON ds.msv = sv.msv
        WHERE sv.tai_khoan_id = ?
        GROUP BY sv.msv, sv.ten_sv, sv.email, sv.gioi_tinh, sv.ngay_sinh, sv.ma_khoa, k.ten_khoa, sv.ma_lop, lh.ten_lop, sv.trang_thai
        LIMIT 1
      `,
      [req.params.accountId],
    );

    if (!students.length) {
      return res.status(404).json({ success: false, message: "Khong tim thay thong tin sinh vien cho tai khoan nay." });
    }

    const student = students[0];
    const scores = await query(
      `
        SELECT
          mh.ma_mon subjectId,
          mh.ten_mon subject,
          ds.diem_gk process,
          ds.diem_ck exam,
          ds.diem_tong final,
          ds.xep_loai rank
        FROM diem_so ds
        LEFT JOIN mon_hoc mh ON mh.ma_mon = ds.ma_mon
        WHERE ds.msv = ?
        ORDER BY mh.ma_mon
      `,
      [student.id],
    );
    const schedule = await query(
      `
        SELECT
          lich.thu weekday,
          lich.ca shift,
          lich.phong room,
          mh.ten_mon subject,
          gv.ten_gv teacher
        FROM lich_hoc lich
        LEFT JOIN mon_hoc mh ON mh.ma_mon = lich.ma_mon
        LEFT JOIN giang_vien gv ON gv.ma_gv = lich.ma_gv
        WHERE lich.ma_lop = ?
        ORDER BY FIELD(lich.thu, 'Thu 2', 'Thu 3', 'Thu 4', 'Thu 5', 'Thu 6', 'Thu 7', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'), lich.ca
      `,
      [student.lop],
    );
    const notifications = await query(`
      SELECT
        id,
        tieu_de title,
        noi_dung content,
        DATE_FORMAT(ngay_dang, '%d/%m/%Y %H:%i') date
      FROM thong_bao
      ORDER BY ngay_dang DESC, id DESC
      LIMIT 8
    `);

    ok(res, { student, scores, schedule, notifications });
  } catch (err) {
    fail(res, err, "Loi lay trang sinh vien");
  }
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server dang chay tai http://localhost:${port}`);
      console.log(`Da ket noi MySQL database ${process.env.DB_NAME} tren Aiven`);
    });
  })
  .catch((err) => {
    console.error("Khong the ket noi MySQL tren Aiven. Hay kiem tra .env, ca.pem va trang thai service tren Aiven.");
    console.error(err.message);
    process.exit(1);
  });
