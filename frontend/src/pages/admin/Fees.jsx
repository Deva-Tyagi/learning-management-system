import React, { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { 
  Plus, Search, FileDown, RefreshCcw, AlertCircle, 
  Calendar, Loader2, X, TrendingUp, Clock, DollarSign, Activity,
  MessageSquare, History, Edit2, CheckCircle, Smartphone
} from "lucide-react";
import { toast } from "sonner";
import AddPaymentModal from "../../components/AddPaymentModal";

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ── UI Helpers ── */
const th = { padding: "14px 16px", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "left", borderBottom: "1px solid #f1f5f9" };
const td = { padding: "16px", fontSize: 13, fontWeight: 600, color: "#334155", borderBottom: "1px solid #f1f5f9" };
const inpField = { width: "100%", padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#1e293b", outline: "none", boxSizing: "border-box" };
const lbl = { display: "block", fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, marginLeft: 4 };

export default function FeeManagement({ token }) {
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({ collected: 0, pending: 0, overdue: 0, upcoming: 0, totalAllTime: 0 });
  const [settings, setSettings] = useState({ registrationFee: 500, feeTemplates: [] });
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Modals
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTimeline, setShowTimeline] = useState(null);
  const [showRemark, setShowRemark] = useState(null);
  const [showReschedule, setShowReschedule] = useState(null);

  const width = useWindowWidth();
  const isMobile = width < 640;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, statsRes, setRes] = await Promise.all([
        axios.get("/fee/students", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/fee/stats", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/fee/settings", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStudents(stRes.data || []);
      setStats(statsRes.data);
      setSettings(setRes.data || { registrationFee: 500, feeTemplates: [] });
    } catch { 
      toast.error("Error loading dashboard"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = s.studentId?.name?.toLowerCase().includes(search.toLowerCase()) || 
                         s.studentId?.rollNumber?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [students, search]);

  const sendWhatsApp = (student) => {
    const msg = `Hi ${student.studentId.name}, your fee payment is due. Please pay at the earliest. Thanks, Institute Admin.`;
    window.open(`https://wa.me/${student.studentId.phone}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div style={{ padding: isMobile ? 16 : 20, background: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: isMobile ? "flex-start" : "center", 
        gap: 16,
        marginBottom: 24 
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#0f172a" }}>Fee Management</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Financial control, installments, and collection dashboard.</p>
        </div>
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row", 
          gap: 12, 
          width: isMobile ? "100%" : "auto" 
        }}>
          <button 
            onClick={() => setShowSettings(true)} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              background: "#fff", 
              color: "#64748b", 
              border: "1px solid #e2e8f0", 
              padding: "12px 24px", 
              borderRadius: 12, 
              fontSize: 12, 
              fontWeight: 800, 
              cursor: "pointer",
              width: isMobile ? "100%" : "auto"
            }}
          >
            Settings
          </button>
          <button 
            onClick={() => setShowAddPayment(true)} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              background: "#0f172a", 
              color: "#fff", 
              border: "none", 
              padding: "12px 24px", 
              borderRadius: 12, 
              fontSize: 12, 
              fontWeight: 800, 
              cursor: "pointer",
              width: isMobile ? "100%" : "auto"
            }}
          >
            <Plus size={16} /> Collect Fee
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", 
        gap: isMobile ? 16 : 20, 
        marginBottom: 24 
      }}>
        {[
          { key: 'collected', label: 'Collected', icon: CheckCircle, color: '#10b981', bg: '#eff6ff' },
          { key: 'pending', label: 'Pending', icon: Clock, color: '#3b82f6', bg: '#eff6ff' },
          { key: 'overdue', label: 'Overdue', icon: AlertCircle, color: '#ef4444', bg: '#fff1f2' },
          { key: 'upcoming', label: 'Upcoming', icon: Calendar, color: '#f59e0b', bg: '#fffbeb' },
        ].map(card => (
          <div 
            key={card.key} 
            onClick={() => setActiveFilter(card.key)} 
            style={{ 
              cursor: "pointer", 
              background: card.bg, 
              padding: isMobile ? 20 : 24, 
              borderRadius: 20, 
              border: `1px solid ${activeFilter === card.key ? card.color : 'transparent'}` 
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                <card.icon size={20} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: card.color, textTransform: "uppercase" }}>{card.label}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#0f172a" }}>₹{stats[card.key].toLocaleString()}</h2>
          </div>
        ))}
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", 
        gap: 24 
      }}>
        {/* LEFT: STUDENT LIST */}
        <div>
          {/* SEARCH & FILTER BAR */}
          <div style={{ 
            background: "#fff", 
            padding: isMobile ? 16 : 20, 
            borderRadius: 20, 
            border: "1px solid #e2e8f0", 
            marginBottom: 16, 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row", 
            gap: 16, 
            alignItems: "center" 
          }}>
            <div style={{ position: "relative", flex: 1, width: "100%" }}>
              <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search student by name or roll number..." 
                style={{ ...inpField, paddingLeft: 44 }} 
              />
            </div>
            <div style={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row", 
              gap: 8, 
              width: isMobile ? "100%" : "auto" 
            }}>
              <input 
                type="date" 
                style={{ ...inpField, width: isMobile ? "100%" : "auto" }} 
                value={dateRange.start} 
                onChange={e => setDateRange({...dateRange, start: e.target.value})} 
              />
              <input 
                type="date" 
                style={{ ...inpField, width: isMobile ? "100%" : "auto" }} 
                value={dateRange.end} 
                onChange={e => setDateRange({...dateRange, end: e.target.value})} 
              />
              <button style={{ padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, color: "#64748b", flexShrink: 0 }}>
                <FileDown size={18}/>
              </button>
            </div>
          </div>

          {/* STUDENT LIST */}
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {isMobile ? (
              /* Mobile: Card Layout */
              <div style={{ padding: 16 }}>
                {filteredStudents.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No students found</div>
                ) : (
                  filteredStudents.map(s => (
                    <div key={s._id} style={{ 
                      padding: 16, 
                      background: "#f8fafc", 
                      borderRadius: 16, 
                      border: "1px solid #e2e8f0", 
                      marginBottom: 12 
                    }}>
                      <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{s.studentId.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{s.studentId.rollNumber} • {s.course?.name || "N/A"}</div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12 }}>
                        <div>
                          Total: <span style={{ fontWeight: 700 }}>₹{s.enrollment?.totalCourseFee?.toLocaleString()}</span>
                        </div>
                        <div style={{ color: "#10b981" }}>
                          Paid: ₹{s.totalPaid?.toLocaleString() || 0}
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ color: "#ef4444", fontWeight: 700 }}>
                          Balance: ₹{(s.enrollment?.totalCourseFee - (s.totalPaid || 0)).toLocaleString()}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setShowTimeline(s)} style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <History size={16}/>
                          </button>
                          <button onClick={() => sendWhatsApp(s)} style={{ width: 36, height: 36, borderRadius: 8, background: "#dcfce7", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
                            <Smartphone size={16}/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Desktop: Table */
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Student</th>
                    <th style={th}>Course</th>
                    <th style={th}>Total/Paid</th>
                    <th style={th}>Balance</th>
                    <th style={th}>Due Dates</th>
                    <th style={{...th, textAlign: "right"}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s._id}>
                      <td style={td}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>{s.studentId.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.studentId.rollNumber}</div>
                      </td>
                      <td style={td}>{s.course?.name || "N/A"}</td>
                      <td style={td}>
                        <div style={{ fontSize: 11 }}>₹{s.enrollment?.totalCourseFee?.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "#10b981" }}>₹{s.totalPaid?.toLocaleString() || 0}</div>
                      </td>
                      <td style={{ ...td, color: "#ef4444", fontWeight: 700 }}>₹{(s.enrollment?.totalCourseFee - (s.totalPaid || 0)).toLocaleString()}</td>
                      <td style={td}>
                        <span style={{ padding: "4px 8px", background: "#f1f5f9", borderRadius: 6, fontSize: 10 }}>View Schedule</span>
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button onClick={() => setShowTimeline(s)} style={{ width: 32, height: 32, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
                            <History size={14}/>
                          </button>
                          <button onClick={() => sendWhatsApp(s)} style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#10b981" }}>
                            <Smartphone size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT: SIDE PANELS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Late Fees Panel */}
          <div style={{ background: "#fff", padding: isMobile ? 20 : 24, borderRadius: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} color="#ef4444"/> Late Fees Panel
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              {[1,2].map(i => (
                <div key={i} style={{ padding: 12, background: "#fff1f2", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>Student {i}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#ef4444" }}>Overdue by 5 days</p>
                  </div>
                  <button style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 10, fontWeight: 700 }}>Remind</button>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Fees */}
          <div style={{ background: "#fff", padding: isMobile ? 20 : 24, borderRadius: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} color="#3b82f6"/> Upcoming Fees
            </h3>
            <div style={{ display: "grid", gap: 12 }}>
              {[1,2].map(i => (
                <div key={i} style={{ padding: 12, background: "#eff6ff", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>Student {i+2}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#3b82f6" }}>Due in 3 days</p>
                  </div>
                  <DollarSign size={16} color="#3b82f6"/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <FeeSettingsModal 
          settings={settings} 
          token={token} 
          onClose={() => setShowSettings(false)} 
          onUpdated={fetchData} 
        />
      )}

      {showTimeline && (
        <FeeTimeline 
          studentData={showTimeline} 
          token={token} 
          onClose={() => setShowTimeline(null)} 
        />
      )}

      {showAddPayment && (
        <AddPaymentModal 
          onClose={() => setShowAddPayment(false)} 
          onAdded={fetchData} 
        />
      )}
    </div>
  );
}

/* =========================================
   FEE TIMELINE COMPONENT
=========================================== */
function FeeTimeline({ studentData, token, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    try {
      const { data } = await axios.get(`/fee/timeline/${studentData.studentId._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTimeline(data.schedule || []);
    } catch { 
      toast.error("Error loading timeline"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchTimeline(); }, []);

  const addRemark = async (sid) => {
    const remark = window.prompt("Enter Internal Remark:");
    if (!remark) return;
    try {
      await axios.post('/fee/remark', { scheduleId: sid, comment: remark }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Remark added");
      fetchTimeline();
    } catch { 
      toast.error("Failed to add remark"); 
    }
  };

  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      background: "rgba(15,23,42,0.6)", 
      backdropFilter: "blur(4px)", 
      zIndex: 100, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 20 
    }}>
      <div style={{ 
        background: "#fff", 
        width: "100%", 
        maxWidth: 800, 
        borderRadius: 24, 
        overflow: "hidden", 
        maxHeight: "90vh", 
        display: "flex", 
        flexDirection: "column" 
      }}>
        <div style={{ padding: 24, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Fee Timeline: {studentData.studentId.name}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Detailed installment ledger and remarks.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={24}/></button>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {loading ? (
            <Loader2 style={{ margin: "40px auto", display: "block" }} />
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {timeline.map((t) => (
                <div key={t._id} style={{ padding: 20, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{t.label || `Installment ${t.sequence}`}</span>
                    <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, background: t.status === 'PAID' ? "#dcfce7" : t.status === 'OVERDUE' ? "#fee2e2" : "#f1f5f9", color: t.status === 'PAID' ? "#10b981" : t.status === 'OVERDUE' ? "#ef4444" : "#64748b" }}>
                      {t.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>₹{t.amount?.toLocaleString()}</h4>
                      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => addRemark(t._id)} style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        <MessageSquare size={14}/> Remark
                      </button>
                      <button style={{ padding: "8px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        <Edit2 size={14}/> Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeeSettingsModal({ settings, token, onClose, onUpdated }) {
  const [regFee, setRegFee] = useState(settings.registrationFee);
  const [templates, setTemplates] = useState(settings.feeTemplates || []);

  const save = async () => {
    try {
      await axios.put('/fee/settings', { registrationFee: regFee, feeTemplates: templates }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Settings saved");
      onUpdated();
      onClose();
    } catch { 
      toast.error("Failed to save settings"); 
    }
  };

  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      background: "rgba(15,23,42,0.6)", 
      backdropFilter: "blur(4px)", 
      zIndex: 100, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 20 
    }}>
      <div style={{ 
        background: "#fff", 
        width: "100%", 
        maxWidth: 500, 
        borderRadius: 24, 
        overflow: "hidden", 
        display: "flex", 
        flexDirection: "column" 
      }}>
        <div style={{ padding: 24, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Fee Templates & Settings</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={24}/></button>
        </div>
        <div style={{ padding: 24, display: "grid", gap: 20 }}>
          <div>
            <label style={lbl}>Default Registration Fee (₹)</label>
            <input 
              type="number" 
              value={regFee} 
              onChange={e => setRegFee(e.target.value)} 
              style={inpField} 
            />
          </div>
          <div>
            <label style={lbl}>Fee Schemes</label>
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 11, color: "#64748b" }}>
              Core schemes (Monthly, Installment, Lump Sum) are initialized during student enrollment based on Course Fee Type.
            </div>
          </div>
          <button onClick={save} style={{ background: "#0f172a", color: "#fff", border: "none", padding: "14px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}