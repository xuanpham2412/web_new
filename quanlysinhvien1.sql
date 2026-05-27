-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 03, 2026 lúc 06:03 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `quanlysinhvien1`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `diem_so`
--

CREATE TABLE `diem_so` (
  `msv` varchar(20) NOT NULL,
  `ma_mon` varchar(20) NOT NULL,
  `diem_gk` float DEFAULT NULL CHECK (`diem_gk` >= 0 and `diem_gk` <= 10),
  `diem_ck` float DEFAULT NULL CHECK (`diem_ck` >= 0 and `diem_ck` <= 10),
  `diem_tong` float DEFAULT NULL,
  `xep_loai` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `diem_so`
--

INSERT INTO `diem_so` (`msv`, `ma_mon`, `diem_gk`, `diem_ck`, `diem_tong`, `xep_loai`) VALUES
('SV001', 'MH02', 7, 8, 7.6, 'Kha'),
('SV002', 'MH01', 9, 9.5, 9.3, 'Xuat sac'),
('SV003', 'MH02', 6, 5, 5.4, 'Trung binh'),
('SV004', 'MH03', 8.5, 8, 8.2, 'Gioi'),
('SV005', 'MH03', 7.5, 7.5, 7.5, 'Kha'),
('SV006', 'MH05', 9, 8.5, 8.7, 'Gioi'),
('SV008', 'MH07', 8, 7, 7.4, 'Kha'),
('SV111', 'MH01', 6, 9, 9, 'gioi');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giang_vien`
--

CREATE TABLE `giang_vien` (
  `ma_gv` varchar(20) NOT NULL,
  `ten_gv` varchar(100) NOT NULL,
  `ma_khoa` varchar(20) DEFAULT NULL,
  `mon_day_chinh` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `so_dien_thoai` varchar(15) DEFAULT NULL,
  `hoc_vi` varchar(50) DEFAULT NULL,
  `tai_khoan_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `giang_vien`
--

INSERT INTO `giang_vien` (`ma_gv`, `ten_gv`, `ma_khoa`, `mon_day_chinh`, `email`, `so_dien_thoai`, `hoc_vi`, `tai_khoan_id`) VALUES
('GV01', 'Nguyen Van An', 'CNTT', 'Co so du lieu', 'an.nv@truong.edu.vn', '0901234567', 'Tien si', 2),
('GV02', 'Tran Thi Binh', 'KT', 'Kinh te vi mo', 'binh.tt@truong.edu.vn', '0902345678', 'Thac si', 3),
('GV03', 'Le Hoang', 'NN', 'Tieng Anh co ban', 'hoang.l@truong.edu.vn', '0903456789', 'Thac si', 4),
('GV04', 'Pham Thi D', 'LUAT', 'Luat dan su', 'd.pt@truong.edu.vn', '0904567890', 'Tien si', 5),
('GV05', 'Hoang Van E', 'KTKT', 'Ke toan tai chinh', 'e.hv@truong.edu.vn', '0905678901', 'Tien si', 6),
('GV111', 'Ly Hai Nam', 'KT', 'Co so du lieu', 'xccv@gmail.com', '13254363457', 'Thac si', NULL),
('GV1111', 'Ly Hai Nams', 'NN', 'Co so du lieu', 'xccav@gmail.com', '13254363457', 'Tien si', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hoat_dong`
--

CREATE TABLE `hoat_dong` (
  `id` int(11) NOT NULL,
  `hanh_dong` varchar(30) NOT NULL,
  `doi_tuong` varchar(50) NOT NULL,
  `noi_dung` varchar(255) NOT NULL,
  `tao_luc` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `hoat_dong`
--

INSERT INTO `hoat_dong` (`id`, `hanh_dong`, `doi_tuong`, `noi_dung`, `tao_luc`) VALUES
(1, 'Xoa', 'diem so', 'Xoa diem so SV001 - MH01', '2026-05-02 20:16:34'),
(2, 'Xoa', 'diem so', 'Xoa diem so SV010 - MH08', '2026-05-02 20:16:38'),
(3, 'Xoa', 'sinh vien', 'Xoa sinh vien SV010', '2026-05-02 20:16:59'),
(4, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Nam', '2026-05-02 20:17:30'),
(5, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Nam', '2026-05-02 20:17:59'),
(6, 'Them', 'mon hoc', 'Them mon hoc Lap tirnh web', '2026-05-02 20:21:48'),
(7, 'Xoa', 'sinh vien', 'Xoa sinh vien SV009', '2026-05-02 20:24:46'),
(8, 'Them', 'sinh vien', 'Them sinh vien Ly Hai Lam', '2026-05-02 20:25:07'),
(9, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Lam', '2026-05-02 20:25:24'),
(10, 'Them', 'sinh vien', 'Them sinh vien Ly Hai Lam', '2026-05-02 20:25:53'),
(11, 'Them', 'giang vien', 'Them giang vien Ly Hai Nam', '2026-05-02 20:26:28'),
(12, 'Them', 'diem so', 'Them diem so SV111 - MH01', '2026-05-02 20:28:35'),
(13, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Lam', '2026-05-03 09:04:36'),
(14, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Lam', '2026-05-03 09:04:52'),
(15, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Lam', '2026-05-03 09:05:01'),
(16, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Lam', '2026-05-03 09:05:06'),
(17, 'Sua', 'sinh vien', 'Sua sinh vien Ly Hai Lam', '2026-05-03 09:05:10'),
(18, 'Them', 'giang vien', 'Them giang vien Ly Hai Nams', '2026-05-03 09:06:05'),
(19, 'Sua', 'giang vien', 'Sua giang vien Ly Hai Nam', '2026-05-03 09:06:24'),
(20, 'Sua', 'giang vien', 'Sua giang vien Ly Hai Nams', '2026-05-03 09:06:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khoa`
--

CREATE TABLE `khoa` (
  `ma_khoa` varchar(20) NOT NULL,
  `ten_khoa` varchar(100) NOT NULL,
  `truong_khoa` varchar(20) DEFAULT NULL,
  `so_sinh_vien` int(11) DEFAULT 0,
  `so_giang_vien` int(11) DEFAULT 0,
  `trang_thai` enum('hoat dong','tam ngung') DEFAULT 'hoat dong'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khoa`
--

INSERT INTO `khoa` (`ma_khoa`, `ten_khoa`, `truong_khoa`, `so_sinh_vien`, `so_giang_vien`, `trang_thai`) VALUES
('CNTT', 'Cong nghe Thong tin', 'GV01', 82, 10, 'hoat dong'),
('KT', 'Kinh te', 'GV02', 65, 8, 'hoat dong'),
('KTKT', 'Ke toan', 'GV05', 48, 6, 'hoat dong'),
('LUAT', 'Luat', 'GV04', 19, 4, 'hoat dong'),
('NN', 'Ngoai ngu', 'GV03', 34, 5, 'hoat dong');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lich_hoc`
--

CREATE TABLE `lich_hoc` (
  `id` int(11) NOT NULL,
  `thu` varchar(15) DEFAULT NULL,
  `ca` varchar(20) DEFAULT NULL,
  `ma_mon` varchar(20) DEFAULT NULL,
  `ma_gv` varchar(20) DEFAULT NULL,
  `phong` varchar(50) DEFAULT NULL,
  `ma_lop` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lich_hoc`
--

INSERT INTO `lich_hoc` (`id`, `thu`, `ca`, `ma_mon`, `ma_gv`, `phong`, `ma_lop`) VALUES
(1, 'Thu 2', 'Ca 1 (7h-9h)', 'MH01', 'GV01', 'Phong A101', 'IT1'),
(2, 'Thu 2', 'Ca 2 (9h-11h)', 'MH02', 'GV01', 'Phong A102', 'IT2'),
(3, 'Thu 3', 'Ca 1 (7h-9h)', 'MH03', 'GV02', 'Phong B201', 'ECO1'),
(4, 'Thu 4', 'Ca 3 (13h-15h)', 'MH05', 'GV03', 'Phong C301', 'ENG1'),
(5, 'Thu 5', 'Ca 4 (15h-17h)', 'MH07', 'GV05', 'Phong D405', 'ACC1'),
(6, 'Thu 6', 'Ca 1 (7h-9h)', 'MH08', 'GV04', 'Phong E102', 'IT1'),
(7, 'Thu 7', 'Ca 2 (9h-11h)', 'MH01', 'GV01', 'Phong A101', 'IT1');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lop_hoc`
--

CREATE TABLE `lop_hoc` (
  `ma_lop` varchar(20) NOT NULL,
  `ten_lop` varchar(100) NOT NULL,
  `si_so` int(11) DEFAULT 0,
  `gv_chu_nghiem` varchar(20) DEFAULT NULL,
  `ma_khoa` varchar(20) DEFAULT NULL,
  `hoc_ki` varchar(20) DEFAULT NULL,
  `trang_thai` varchar(50) DEFAULT 'hoat dong'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lop_hoc`
--

INSERT INTO `lop_hoc` (`ma_lop`, `ten_lop`, `si_so`, `gv_chu_nghiem`, `ma_khoa`, `hoc_ki`, `trang_thai`) VALUES
('ACC1', 'K22 Ke toan 1', 48, 'GV05', 'KTKT', 'HK2-2024', 'hoat dong'),
('ECO1', 'K22 Kinh te 1', 65, 'GV02', 'KT', 'HK2-2024', 'hoat dong'),
('ENG1', 'K22 Ngon ngu Anh 1', 34, 'GV03', 'NN', 'HK2-2024', 'hoat dong'),
('IT1', 'K22 Cong nghe thong tin 1', 40, 'GV01', 'CNTT', 'HK2-2024', 'hoat dong'),
('IT2', 'K22 Cong nghe thong tin 2', 42, 'GV01', 'CNTT', 'HK2-2024', 'hoat dong');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mon_hoc`
--

CREATE TABLE `mon_hoc` (
  `ma_mon` varchar(20) NOT NULL,
  `ten_mon` varchar(100) NOT NULL,
  `ma_khoa` varchar(20) DEFAULT NULL,
  `so_tin_chi` int(11) NOT NULL,
  `ma_gv` varchar(20) DEFAULT NULL,
  `trang_thai` enum('dang mo','tam dong') DEFAULT 'dang mo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `mon_hoc`
--

INSERT INTO `mon_hoc` (`ma_mon`, `ten_mon`, `ma_khoa`, `so_tin_chi`, `ma_gv`, `trang_thai`) VALUES
('MH01', 'Co so du lieu', 'CNTT', 3, 'GV01', 'dang mo'),
('MH02', 'Lap trinh C++', 'CNTT', 3, 'GV01', 'dang mo'),
('MH03', 'Kinh te vi mo', 'KT', 2, 'GV02', 'dang mo'),
('MH04', 'Toan kinh te', 'KT', 2, 'GV02', 'tam dong'),
('MH05', 'Tieng Anh co ban', 'NN', 4, 'GV03', 'dang mo'),
('MH06', 'Tieng Anh giao tiep', 'NN', 3, 'GV03', 'dang mo'),
('MH07', 'Ke toan tai chinh', 'KTKT', 3, 'GV05', 'dang mo'),
('MH08', 'Luat Dai cuong', 'LUAT', 2, 'GV04', 'dang mo'),
('MH09', 'Lap tirnh web', 'CNTT', 3, 'GV02', 'dang mo');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sinh_vien`
--

CREATE TABLE `sinh_vien` (
  `msv` varchar(20) NOT NULL,
  `ten_sv` varchar(100) NOT NULL,
  `gioi_tinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `ma_khoa` varchar(20) DEFAULT NULL,
  `ma_lop` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `trang_thai` enum('dang hoc','bao luu','tot nghiep') DEFAULT 'dang hoc',
  `tai_khoan_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sinh_vien`
--

INSERT INTO `sinh_vien` (`msv`, `ten_sv`, `gioi_tinh`, `ngay_sinh`, `ma_khoa`, `ma_lop`, `email`, `trang_thai`, `tai_khoan_id`) VALUES
('SV001', 'Le Tien Dat', 'Nam', '2004-05-12', 'CNTT', 'IT1', 'dat.lt@sv.edu.vn', 'dang hoc', 7),
('SV002', 'Nguyen Thi Mai', 'Nu', '2004-08-22', 'CNTT', 'IT1', 'mai.nt@sv.edu.vn', 'dang hoc', 8),
('SV003', 'Tran Van Kien', 'Nam', '2004-11-05', 'CNTT', 'IT2', 'kien.tv@sv.edu.vn', 'dang hoc', 9),
('SV004', 'Pham My Linh', 'Nu', '2004-02-18', 'KT', 'ECO1', 'linh.pm@sv.edu.vn', 'dang hoc', 10),
('SV005', 'Hoang Quoc Bao', 'Nam', '2004-09-30', 'KT', 'ECO1', 'bao.hq@sv.edu.vn', 'dang hoc', 11),
('SV006', 'Vuong Thu Ha', 'Nu', '2004-12-10', 'NN', 'ENG1', 'ha.vt@sv.edu.vn', 'dang hoc', 12),
('SV007', 'Ngo Thanh Tung', 'Nam', '2004-04-25', 'NN', 'ENG1', 'tung.nt@sv.edu.vn', 'bao luu', 13),
('SV008', 'Dinh Thi Hoa', 'Nu', '2004-07-07', 'KTKT', 'ACC1', 'hoa.dt@sv.edu.vn', 'dang hoc', 14),
('SV010', 'Ly Hai Lam', NULL, NULL, 'KT', 'IT1', 'nam324.lh@sv.edu.vn', 'dang hoc', NULL),
('SV111', 'Ly Hai Lam', NULL, NULL, 'CNTT', NULL, 'nam3asd24.lh@sv.edu.vn', 'dang hoc', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tai_khoan`
--

CREATE TABLE `tai_khoan` (
  `id` int(11) NOT NULL,
  `ten_dang_nhap` varchar(50) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `vai_tro` enum('admin','sinhvien','giangvien') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `tai_khoan`
--

INSERT INTO `tai_khoan` (`id`, `ten_dang_nhap`, `mat_khau`, `vai_tro`) VALUES
(1, 'admin', 'admin123', 'admin'),
(2, 'gv_nguyenvanan', '123456', 'giangvien'),
(3, 'gv_tranthibinh', '123456', 'giangvien'),
(4, 'gv_lehoang', '123456', 'giangvien'),
(5, 'gv_phamthid', '123456', 'giangvien'),
(6, 'gv_hoangvane', '123456', 'giangvien'),
(7, 'sv_001', '123456', 'sinhvien'),
(8, 'sv_002', '123456', 'sinhvien'),
(9, 'sv_003', '123456', 'sinhvien'),
(10, 'sv_004', '123456', 'sinhvien'),
(11, 'sv_005', '123456', 'sinhvien'),
(12, 'sv_006', '123456', 'sinhvien'),
(13, 'sv_007', '123456', 'sinhvien'),
(14, 'sv_008', '123456', 'sinhvien'),
(15, 'sv_009', '123456', 'sinhvien'),
(16, 'sv_010', '123456', 'sinhvien');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `diem_so`
--
ALTER TABLE `diem_so`
  ADD PRIMARY KEY (`msv`,`ma_mon`),
  ADD KEY `ma_mon` (`ma_mon`);

--
-- Chỉ mục cho bảng `giang_vien`
--
ALTER TABLE `giang_vien`
  ADD PRIMARY KEY (`ma_gv`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `ma_khoa` (`ma_khoa`),
  ADD KEY `tai_khoan_id` (`tai_khoan_id`);

--
-- Chỉ mục cho bảng `hoat_dong`
--
ALTER TABLE `hoat_dong`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `khoa`
--
ALTER TABLE `khoa`
  ADD PRIMARY KEY (`ma_khoa`),
  ADD KEY `fk_khoa_truongkhoa` (`truong_khoa`);

--
-- Chỉ mục cho bảng `lich_hoc`
--
ALTER TABLE `lich_hoc`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ma_mon` (`ma_mon`),
  ADD KEY `ma_gv` (`ma_gv`),
  ADD KEY `ma_lop` (`ma_lop`);

--
-- Chỉ mục cho bảng `lop_hoc`
--
ALTER TABLE `lop_hoc`
  ADD PRIMARY KEY (`ma_lop`),
  ADD KEY `gv_chu_nghiem` (`gv_chu_nghiem`),
  ADD KEY `ma_khoa` (`ma_khoa`);

--
-- Chỉ mục cho bảng `mon_hoc`
--
ALTER TABLE `mon_hoc`
  ADD PRIMARY KEY (`ma_mon`),
  ADD KEY `ma_khoa` (`ma_khoa`),
  ADD KEY `ma_gv` (`ma_gv`);

--
-- Chỉ mục cho bảng `sinh_vien`
--
ALTER TABLE `sinh_vien`
  ADD PRIMARY KEY (`msv`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `ma_khoa` (`ma_khoa`),
  ADD KEY `ma_lop` (`ma_lop`),
  ADD KEY `tai_khoan_id` (`tai_khoan_id`);

--
-- Chỉ mục cho bảng `tai_khoan`
--
ALTER TABLE `tai_khoan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `hoat_dong`
--
ALTER TABLE `hoat_dong`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `lich_hoc`
--
ALTER TABLE `lich_hoc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `tai_khoan`
--
ALTER TABLE `tai_khoan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `diem_so`
--
ALTER TABLE `diem_so`
  ADD CONSTRAINT `diem_so_ibfk_1` FOREIGN KEY (`msv`) REFERENCES `sinh_vien` (`msv`),
  ADD CONSTRAINT `diem_so_ibfk_2` FOREIGN KEY (`ma_mon`) REFERENCES `mon_hoc` (`ma_mon`);

--
-- Các ràng buộc cho bảng `giang_vien`
--
ALTER TABLE `giang_vien`
  ADD CONSTRAINT `giang_vien_ibfk_1` FOREIGN KEY (`ma_khoa`) REFERENCES `khoa` (`ma_khoa`),
  ADD CONSTRAINT `giang_vien_ibfk_2` FOREIGN KEY (`tai_khoan_id`) REFERENCES `tai_khoan` (`id`);

--
-- Các ràng buộc cho bảng `khoa`
--
ALTER TABLE `khoa`
  ADD CONSTRAINT `fk_khoa_truongkhoa` FOREIGN KEY (`truong_khoa`) REFERENCES `giang_vien` (`ma_gv`);

--
-- Các ràng buộc cho bảng `lich_hoc`
--
ALTER TABLE `lich_hoc`
  ADD CONSTRAINT `lich_hoc_ibfk_1` FOREIGN KEY (`ma_mon`) REFERENCES `mon_hoc` (`ma_mon`),
  ADD CONSTRAINT `lich_hoc_ibfk_2` FOREIGN KEY (`ma_gv`) REFERENCES `giang_vien` (`ma_gv`),
  ADD CONSTRAINT `lich_hoc_ibfk_3` FOREIGN KEY (`ma_lop`) REFERENCES `lop_hoc` (`ma_lop`);

--
-- Các ràng buộc cho bảng `lop_hoc`
--
ALTER TABLE `lop_hoc`
  ADD CONSTRAINT `lop_hoc_ibfk_1` FOREIGN KEY (`gv_chu_nghiem`) REFERENCES `giang_vien` (`ma_gv`),
  ADD CONSTRAINT `lop_hoc_ibfk_2` FOREIGN KEY (`ma_khoa`) REFERENCES `khoa` (`ma_khoa`);

--
-- Các ràng buộc cho bảng `mon_hoc`
--
ALTER TABLE `mon_hoc`
  ADD CONSTRAINT `mon_hoc_ibfk_1` FOREIGN KEY (`ma_khoa`) REFERENCES `khoa` (`ma_khoa`),
  ADD CONSTRAINT `mon_hoc_ibfk_2` FOREIGN KEY (`ma_gv`) REFERENCES `giang_vien` (`ma_gv`);

--
-- Các ràng buộc cho bảng `sinh_vien`
--
ALTER TABLE `sinh_vien`
  ADD CONSTRAINT `sinh_vien_ibfk_1` FOREIGN KEY (`ma_khoa`) REFERENCES `khoa` (`ma_khoa`),
  ADD CONSTRAINT `sinh_vien_ibfk_2` FOREIGN KEY (`ma_lop`) REFERENCES `lop_hoc` (`ma_lop`),
  ADD CONSTRAINT `sinh_vien_ibfk_3` FOREIGN KEY (`tai_khoan_id`) REFERENCES `tai_khoan` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
