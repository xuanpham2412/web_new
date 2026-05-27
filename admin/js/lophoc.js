document.addEventListener("DOMContentLoaded", () => {
  Edu.initCrud({
    page: "lophoc",
    store: "lophoc",
    singular: "lop hoc",
    tableTitle: "Danh sach lop hoc",
    idPrefix: "LH",
    searchFields: ["id", "name", "khoa", "advisor"],
    stats: [
      { id: "statTotal", label: "TONG LOP HOC", color: "blue", value: (data) => data.length },
      { id: "statStudents", label: "SINH VIEN", color: "green", value: (data) => data.reduce((sum, l) => sum + Number(l.size || 0), 0) },
      { id: "statActive", label: "HOAT DONG", color: "amber", value: (data) => data.filter((l) => l.status === "hoat dong").length },
    ],
    filters: [{ id: "filterKhoa", label: "Tat ca khoa", field: "khoa", options: ["CNTT", "KT", "KTO", "NN", "LUAT"] }],
    columns: [
      { label: "MA LOP", field: "id" },
      { label: "TEN LOP", render: (row) => `<div class="strong">${Edu.esc(row.name)}</div><div class="muted">GVCN: ${Edu.esc(row.advisorName || row.advisor || "Chua co")}</div>` },
      { label: "KHOA", render: (row) => Edu.esc(row.khoaName || row.khoa) },
      { label: "SI SO", field: "size" },
      { label: "HOC KI", field: "semester" },
      { label: "TRANG THAI", render: (row) => Edu.badge(row.status) },
    ],
    fields: [
      { name: "id", label: "Ma lop *", required: true, lockOnEdit: true },
      { name: "name", label: "Ten lop *", required: true },
      { name: "khoa", label: "Ma khoa", type: "select", source: "khoa" },
      { name: "advisor", label: "Ma GV chu nhiem", type: "select", source: "giangvien" },
      { name: "size", label: "Si so", type: "number", default: 0 },
      { name: "semester", label: "Hoc ki" },
      { name: "status", label: "Trang thai", type: "select", options: ["hoat dong", "tam ngung"], default: "hoat dong" },
    ],
  });
});
