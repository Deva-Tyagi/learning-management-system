import React, { useState, useRef } from "react";
import axios from "../lib/axios";
import { UploadCloud, FileText, Download, X, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BulkUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDownloadSample = () => {
    const headers = "Franchise,Registration No,Admission Date,Roll Number,Course,Batch,Total Fees,Fees Paid,Fee Status,Full Name,Date of Birth,Gender,Blood Group,Phone,Email,Referral Code,Address,State,District,City,Pincode,Username,Password,Father Name,Mother Name,Guardian Phone,Guardian Address,Student Status\n";
    const sampleRow = "Main Branch,REG-2026-00001,2026-04-04,ROLL-001,Web Development,Morning Batch,5000,2000,partial,John Doe,2000-01-01,Male,O+,9876543210,johndoe@example.com,REF-1234,123 Street Name,State Name,District Name,City Name,123456,johndoe2000,password123,Mr. Smith,Mrs. Smith,9876543211,456 Guardian St,Active\n";
    const blob = new Blob([headers + sampleRow], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Sample_Students_Format.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== "text/csv" && !selected.name.endsWith('.csv')) {
      setError("Please select a valid CSV file");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.post("/students/bulk-upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
      if (onSuccess) onSuccess(); // trigger refetch
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Bulk Upload Students</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {!result ? (
          <div className="p-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-700">Need the format?</p>
                <p className="text-xs text-slate-500">Download the expected CSV headers.</p>
              </div>
              <button 
                onClick={handleDownloadSample}
                className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors border border-violet-100"
              >
                <Download size={14} /> Sample.csv
              </button>
            </div>

            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-violet-300 bg-violet-50/30' : 'border-slate-200 hover:border-violet-400'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-2">
                    <FileText size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud size={36} className="text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700">Click to select CSV file</p>
                  <p className="text-xs text-slate-500">Max file size 5MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-start gap-2 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !file || loading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload & Import Students'
              )}
            </button>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Complete!</h3>
            <p className="text-slate-500 text-sm mb-6">Your student data has been processed.</p>
            
            <div className="w-full flex flex-col gap-3">
              <div className="flex gap-4">
                <div className="flex-1 bg-green-50 p-3 rounded-xl border border-green-100">
                  <p className="text-lg font-black text-green-600">{result.added || 0}</p>
                  <p className="text-[10px] text-green-700 font-bold uppercase">Added</p>
                </div>
                <div className="flex-1 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <p className="text-lg font-black text-amber-600">{result.skipped || 0}</p>
                  <p className="text-[10px] text-amber-700 font-bold uppercase">Duplicates</p>
                </div>
              </div>
              
              {result.invalidCount > 0 && (
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <p className="text-lg font-black text-rose-600">{result.invalidCount}</p>
                  <p className="text-[10px] text-rose-700 font-bold uppercase">Invalid Format (Missing Fields)</p>
                  <p className="text-[9px] text-rose-400 mt-1 italic leading-tight">Rows must have Name, Email, Phone, Course, Batch, and Username.</p>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
