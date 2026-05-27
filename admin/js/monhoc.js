document.addEventListener("DOMContentLoaded", () => {
  Edu.initCrud({
    page: "monhoc",
    store: "monhoc",
    singular: "mon hoc",
    tableTitle: "Danh sach mon hoc",
    idPrefix: "MH",
    searchFields: ["id", "name", "khoa", "teacher"],
    stats: [
      { id: "statTotal", label: "TONG MON HOC", color: "blue", value: (data) => data.length },
      { id: "statOpen", label: "DANG MO", color: "green", value: (data) => data.filter((m) => m.status === "dang mo").length },
      { id: "statCredits", label: "TONG TIN CHI", color: "amber", value: (data) => data.reduce((sum, m) => sum + Number(m.credits || 0), 0) },
    ],
    filters: [{ id: "filterKhoa", label: "Tat ca khoa", field: "khoa", options: ["CNTT", "KT", "KTO", "NN", "LUAT"] }],
    columns: [
      { label: "MA MON", field: "id" },
      { label: "MON HOC", render: (row) => `<div class="strong">${Edu.esc(row.name)}</div><div class="muted">${Edu.esc(row.teacherName || row.teacher || "Chua phan cong")}</div>` },
      { label: "TIN CHI", field: "credits" },
      { label: "KHOA", render: (row) => Edu.esc(row.khoaName || row.khoa) },
      { label: "TRANG THAI", render: (row) => Edu.badge(row.status) },
    ],
    fields: [
      { name: "id", label: "Ma mon *", required: true, lockOnEdit: true },
      { name: "name", label: "Ten mon *", required: true },
      { name: "credits", label: "Tin chi", type: "number", default: 3 },
      { name: "khoa", label: "Ma khoa", type: "select", source: "khoa" },
      { name: "teacher", label: "Ma giang vien", type: "select", source: "giangvien", full: true },
      { name: "status", label: "Trang thai", type: "select", options: ["dang mo", "tam dong"], default: "dang mo" },
    ],
  });
});
