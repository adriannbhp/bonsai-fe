"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

type Invoice = {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: string;
  amount: number;
  senderAccountName: string;
  senderAccountNumber: string;
  beneficiaryAccountName: string;
  beneficiaryAccountNumber: string;
  valueDate: string;
  referenceNumber: string;
  remark: string;
  customerRefNumber: string;
  transactionId: string;
  transactionType: string;
};

export default function UploadBuktiBayar() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [errorInvoice, setErrorInvoice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResponse(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      setResponse(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setResponse("Tanggal mulai dan tanggal akhir wajib diisi.");
      return;
    }
    if (files.length === 0) {
      setResponse("Minimal 1 file gambar harus dipilih.");
      return;
    }
    setLoading(true);
    setResponse(null);

    const formData = new FormData();
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    files.forEach((file) => {
      formData.append("image", file);
    });

    try {
      const res = await axios.post(
        "/api/upload-bukti-bayar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResponse(res.data); // simpan seluruh response body, bukan hanya message
    } catch (err: any) {
      setResponse(
        err.response?.data || { message: "Terjadi kesalahan saat upload. Pastikan file gambar valid." }
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoice dari API route Next.js
  const fetchInvoices = async () => {
    setLoadingInvoice(true);
    setErrorInvoice(null);
    try {
      const res = await axios.get("/api/list-invoice");
      setInvoices(res.data.data || []);
    } catch (err: any) {
      setErrorInvoice(
        err.response?.data?.message ||
          "Gagal mengambil data invoice dari server."
      );
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleUpdatePaid = async (invoiceNumber: string) => {
    try {
      await axios.post("/api/update-invoice-status", { invoiceNumber });
      fetchInvoices(); // refresh list setelah update
      alert("Status invoice berhasil diupdate menjadi paid.");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Gagal update status invoice. Silakan coba lagi."
      );
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f8fa] p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-0">
        <div className="flex items-center gap-3 px-8 py-5 rounded-t-2xl" style={{ background: "linear-gradient(90deg, #2196f3 70%, #ffb300 100%)" }}>
          <img
            src="https://padiumkm.id/_next/static/media/logo.08a5ef96.svg"
            alt="Logo Padi UMKM"
            className="w-12 h-12"
          />
          <div>
            <div className="text-white font-bold text-2xl leading-tight">Padi UMKM</div>
            <div className="text-white text-xs font-medium tracking-wide">Upload Bukti Bayar</div>
          </div>
        </div>
        <div className="p-8">
          <h1 className="text-xl font-bold mb-4 text-[#2196f3]">Upload Bukti Bayar</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
            </div>
            <div
              className="border-2 border-dashed border-[#2196f3] rounded-xl p-6 text-center cursor-pointer bg-[#f0f6ff] hover:bg-[#e3f0fc] transition"
              onClick={handleBoxClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <div>
                <span className="text-[#2196f3] font-semibold">Klik di sini</span> atau drag & drop file gambar
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {files.length > 0
                  ? `${files.length} file dipilih`
                  : "Maksimal beberapa file gambar"}
              </div>
              <ul className="mt-2 text-xs text-gray-700">
                {files.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>
            <button
              type="submit"
              className="bg-[#2196f3] text-white px-4 py-2 rounded font-semibold hover:bg-[#1976d2] transition"
              disabled={loading}
            >
              {loading ? "Mengupload..." : "Upload"}
            </button>
          </form>
          {response && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-gray-800 text-sm">
              <b>Response:</b>
              <div className="mb-2">
                <span className="font-semibold">Status:</span> {response.success ? "Sukses" : "Gagal"}
                <br />
                <span className="font-semibold">Message:</span> {response.message}
              </div>
              {Array.isArray(response.results) && (
                <table className="w-full text-xs border mt-2">
                  <thead>
                    <tr className="bg-[#e3f0fc]">
                      <th className="border px-2 py-1">File</th>
                      <th className="border px-2 py-1">Remark</th>
                      <th className="border px-2 py-1">Bank</th>
                      <th className="border px-2 py-1">Amount</th>
                      <th className="border px-2 py-1">Invoice</th>
                      <th className="border px-2 py-1">File URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.results.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{item.data?.file_name}</td>
                        <td className="border px-2 py-1">{item.data?.remark}</td>
                        <td className="border px-2 py-1">{item.data?.bank}</td>
                        <td className="border px-2 py-1">{item.data?.amount.toLocaleString()}</td>
                        <td className="border px-2 py-1">{item.data?.remark}</td>
                        <td className="border px-2 py-1">
                          {item.data?.fileUrl ? (
                            <a
                              href={item.data.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline break-all"
                            >
                              Link
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!Array.isArray(response.results) && (
                <pre className="whitespace-pre-wrap break-all mt-2">
                  {JSON.stringify(response, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-2 text-[#2196f3] flex items-center gap-2">
          <img
            src="https://padiumkm.id/_next/static/media/logo.08a5ef96.svg"
            alt="Logo"
            className="w-7 h-7"
          />
          List Invoice
        </h2>
        {loadingInvoice && <div>Loading...</div>}
        {errorInvoice && (
          <div className="text-red-600 mb-4">
            <b>Error:</b> {errorInvoice}
          </div>
        )}
        {!loadingInvoice && !errorInvoice && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border">
              <thead>
                <tr className="bg-[#e3f0fc]">
                  <th className="border px-2 py-1">Invoice Number</th>
                  <th className="border px-2 py-1">Invoice Date</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Amount</th>
                  <th className="border px-2 py-1">Sender</th>
                  <th className="border px-2 py-1">Beneficiary</th>
                  <th className="border px-2 py-1">Value Date</th>
                  <th className="border px-2 py-1">Remark</th>
                  <th className="border px-2 py-1">Reference</th>
                  <th className="border px-2 py-1">Customer Ref</th>
                  <th className="border px-2 py-1">Transaction ID</th>
                  <th className="border px-2 py-1">Type</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  // Ambil semua remark dari hasil upload (jika ada)
                  const uploadedRemarks =
                    Array.isArray(response?.results)
                      ? response.results.map((item: any) => item.data?.remark)
                      : [];
                  // Cek apakah remark invoice ini ada di hasil upload
                  const isHighlighted = uploadedRemarks.includes(inv.remark);

                  return (
                    <tr key={inv._id}>
                      <td
                        className={`border px-2 py-1 ${
                          isHighlighted ? "font-bold bg-green-200" : ""
                        }`}
                      >
                        {inv.invoiceNumber}
                      </td>
                      <td className="border px-2 py-1">{inv.invoiceDate}</td>
                      <td className="border px-2 py-1">{inv.status}</td>
                      <td className="border px-2 py-1">{inv.amount?.toLocaleString()}</td>
                      <td className="border px-2 py-1">
                        {inv.senderAccountName}
                        <br />
                        <span className="text-xs text-gray-500">{inv.senderAccountNumber}</span>
                      </td>
                      <td className="border px-2 py-1">
                        {inv.beneficiaryAccountName}
                        <br />
                        <span className="text-xs text-gray-500">{inv.beneficiaryAccountNumber}</span>
                      </td>
                      <td className="border px-2 py-1">
                        {inv.valueDate ? new Date(inv.valueDate).toLocaleString() : "-"}
                      </td>
                      <td className="border px-2 py-1">{inv.referenceNumber}</td>
                      <td className="border px-2 py-1">{inv.remark}</td>
                      <td className="border px-2 py-1">{inv.customerRefNumber}</td>
                      <td className="border px-2 py-1">{inv.transactionId}</td>
                      <td className="border px-2 py-1">{inv.transactionType}</td>
                      <td className="border px-2 py-1">
                        {inv.status !== "paid" && (
                          <button
                            className="bg-[#2196f3] text-white px-3 py-1 rounded hover:bg-[#1976d2] text-xs"
                            onClick={() => handleUpdatePaid(inv.invoiceNumber)}
                          >
                            Update Paid
                          </button>
                        )}
                        {inv.status === "paid" && (
                          <span className="text-green-600 font-semibold text-xs">Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <div className="text-center text-gray-500 py-8">Tidak ada data invoice.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}