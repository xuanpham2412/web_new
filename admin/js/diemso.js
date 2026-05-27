document.addEventListener("DOMContentLoaded", () => {
  Edu.initCrud({
    page: "diemso",
    store: "diemso",
    singular: "diem so",
    tableTitle: "Bang diem sinh vien",
    idPrefix: "D",
    searchFields: ["id", "msv", "ma_mon", "student", "subject"],
    stats: [
      { id: "statTotal", label: "SO BANG DIEM", color: "blue", value: (data) => data.length },
      { id: "statPass", label: "DAT", color: "green", value: (data) => data.filter((d) => Number(d.final) >= 5).length },
      { id: "statWarn", label: "CANH BAO", color: "red", value: (data) => data.filter((d) => Number(d.final) < 5).length },
    ],
    columns: [
      { label: "SINH VIEN", render: (row) => `<div class="strong">${Edu.esc(row.student || row.msv)}</div><div class="muted">${Edu.esc(row.msv)}</div>` },
      { label: "MON HOC", render: (row) => `<div class="strong">${Edu.esc(row.subject || row.ma_mon)}</div><div class="muted">${Edu.esc(row.ma_mon)}</div>` },
      { label: "QT", render: (row) => Number(row.process || 0).toFixed(2) },
      { label: "THI", render: (row) => Number(row.exam || 0).toFixed(2) },
      { label: "TB", render: (row) => `<span class="${Number(row.final) < 5 ? "text-red" : "text-green"}">${Number(row.final || 0).toFixed(2)}</span>` },
      { label: "TRANG THAI", render: (row) => Edu.badge(row.status) },
    ],
    fields: [
      { name: "msv", label: "MSSV *", type: "select", source: "sinhvien", required: true, lockOnEdit: true },
      { name: "ma_mon", label: "Ma mon *", type: "select", source: "monhoc", required: true, lockOnEdit: true },
      { name: "process", label: "Diem giua ky", type: "number", default: 0 },
      { name: "exam", label: "Diem cuoi ky", type: "number", default: 0 },
      { name: "final", label: "Diem tong", type: "number", default: 0 },
      { name: "status", label: "Xep loai" },
    ],
  });
});
