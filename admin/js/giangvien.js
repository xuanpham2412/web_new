document.addEventListener("DOMContentLoaded", () => {
  Edu.initCrud({
    page: "giangvien",
    store: "giangvien",
    singular: "giang vien",
    tableTitle: "Danh sach giang vien",
    idPrefix: "GV",
    searchFields: ["id", "name", "email", "khoa", "hocvi"],
    stats: [
      { id: "statTotal", label: "TONG GIANG VIEN", color: "blue", value: (data) => data.length },
      { id: "statActive", label: "DANG GIANG DAY", color: "green", value: (data) => data.length },
      { id: "statDoctor", label: "TIEN SI", color: "amber", value: (data) => data.filter((g) => g.hocvi === "Tien si").length },
    ],
    filters: [
      { id: "filterKhoa", label: "Tat ca khoa", field: "khoa", options: ["CNTT", "KT", "KTO", "NN", "LUAT"] },
    ],
    columns: [
      { label: "GIANG VIEN", render: (row) => Edu.personCell(row) },
      { label: "MA GV", field: "id" },
      { label: "KHOA", render: (row) => Edu.esc(row.khoaName || row.khoa) },
      { label: "MON CHINH", field: "mainSubject" },
      { label: "HOC VI", field: "hocvi" },
      { label: "DIEN THOAI", field: "phone" },
      { label: "TRANG THAI", render: (row) => Edu.badge(row.status) },
    ],
    fields: [
      { name: "id", label: "Ma giang vien *", required: true, lockOnEdit: true },
      { name: "name", label: "Ho va ten *", required: true },
      { name: "email", label: "Email", type: "email", full: true },
      { name: "khoa", label: "Ma khoa", type: "select", source: "khoa" },
      { name: "mainSubject", label: "Mon day chinh" },
      { name: "hocvi", label: "Hoc vi", type: "select", options: ["Tien si", "Thac si", "Cu nhan"] },
      { name: "phone", label: "So dien thoai", type: "tel" },
    ],
  });
});
