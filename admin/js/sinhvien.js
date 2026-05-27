document.addEventListener("DOMContentLoaded", () => {
  Edu.initCrud({
    page: "sinhvien",
    store: "sinhvien",
    singular: "sinh vien",
    tableTitle: "Danh sach sinh vien",
    idPrefix: "SV",
    searchFields: ["id", "name", "email", "khoa", "lop"],
    stats: [
      { id: "statTotal", label: "TONG SO SINH VIEN", color: "blue", value: (data) => data.length },
      { id: "statActive", label: "DANG HOC", color: "green", value: (data) => data.filter((s) => s.status === "dang hoc").length },
      { id: "statWarn", label: "CANH BAO HOC VU", color: "red", value: (data) => data.filter((s) => Number(s.gpa) < 2.5).length },
    ],
    filters: [
      { id: "filterKhoa", label: "Tat ca khoa", field: "khoa", options: ["CNTT", "KT", "KTO", "NN", "LUAT"] },
      { id: "filterStatus", label: "Tat ca", field: "status", options: ["dang hoc", "bao luu", "tot nghiep"] },
    ],
    columns: [
      { label: "SINH VIEN", render: (row) => Edu.personCell(row) },
      { label: "MSSV", field: "id" },
      { label: "KHOA", render: (row) => Edu.esc(row.khoaName || row.khoa) },
      { label: "LOP", field: "lop" },
      { label: "GPA", render: (row) => `<span class="${Number(row.gpa) < 2.5 ? "text-red" : Number(row.gpa) >= 3.5 ? "text-green" : "text-blue"}">${Number(row.gpa || 0).toFixed(2)}</span>` },
      { label: "TRANG THAI", render: (row) => Edu.badge(row.status) },
    ],
    fields: [
      { name: "id", label: "MSSV *", required: true, lockOnEdit: true },
      { name: "name", label: "Ho va ten *", required: true },
      { name: "email", label: "Email", type: "email", full: true },
      { name: "khoa", label: "Ma khoa", type: "select", source: "khoa" },
      { name: "lop", label: "Lop", type: "select", source: "lop" },
      { name: "status", label: "Trang thai", type: "select", options: ["dang hoc", "bao luu", "tot nghiep"], default: "dang hoc" },
    ],
  });
});
