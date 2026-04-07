import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Building2,
  TrendingUp,
  CreditCard,
  Plus,
  ShieldCheck,
  Loader2,
  Calendar,
  CheckCircle2,
  Trophy,
  Users,
  MessageSquare,
  Mail,
  Phone,
  ArrowRight,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import Sidebar from "./Sidebar";
import API_BASE_URL from "../../lib/utils";
import WhiteLabelManager from "./WhiteLabelManager";

/* ─── Hook: real window width ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [demoInquiries, setDemoInquiries] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    instituteName: "",
    field: "",
    email: "",
    mobile: "",
    password: "",
    plan: "Basic",
    planDuration: 30,
  });

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [upgradePlan, setUpgradePlan] = useState("Basic");
  const [upgradeDuration, setUpgradeDuration] = useState(1);

  // New: Payment Filter State
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [paymentCustomDate, setPaymentCustomDate] = useState({
    start: "",
    end: "",
  });

  const width = useWindowWidth();
  const isMobile = width < 640;
  const isDesktop = width >= 1024;

  // Close drawer on resize to desktop
  useEffect(() => {
    if (isDesktop) setShowMobileSidebar(false);
  }, [isDesktop]);

  useEffect(() => {
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("superAdminToken");
    try {
      const [statsRes, clientsRes, activityRes, settingsRes, demoRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/super-admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/super-admin/clients`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/super-admin/activity`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/super-admin/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/super-admin/demo-inquiries`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
      if (statsRes.ok && clientsRes.ok && activityRes.ok && settingsRes.ok) {
        const [statsData, clientsData, activityData, settingsData, demoData] =
          await Promise.all([
            statsRes.json(),
            clientsRes.json(),
            activityRes.json(),
            settingsRes.json(),
            demoRes.ok ? demoRes.json() : [],
          ]);
        setStats(statsData);
        setClients(clientsData);
        setActivities(activityData);
        setPlatformSettings(settingsData);
        setLocalSettings(settingsData);
        setDemoInquiries(demoData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (id, status) => {
    const token = localStorage.getItem("superAdminToken");
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/demo-inquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Inquiry marked as ${status}`);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("superAdminToken");
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Institute registered successfully!");
        setFormData({
          name: "",
          instituteName: "",
          field: "",
          email: "",
          mobile: "",
          password: "",
          plan: "Basic",
          planDuration: 30,
        });
        setActiveSection("clients");
        fetchData();
      } else {
        toast.error(data.msg || "Registration failed");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  const handleUpdateSubscription = async (clientId, update) => {
    const token = localStorage.getItem("superAdminToken");
    try {
      const res = await fetch(
        `${API_BASE_URL}/super-admin/clients/${clientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(update),
        },
      );
      if (res.ok) {
        toast.success("Subscription updated");
        fetchData();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this institute? This action cannot be undone.")) return;
    
    const token = localStorage.getItem("superAdminToken");
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success("Institute deleted successfully");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.msg || "Delete failed");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  const handleUpdateSettings = async (update) => {
    setIsSavingSettings(true);
    const token = localStorage.getItem("superAdminToken");
    try {
      const res = await fetch(`${API_BASE_URL}/super-admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(update),
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformSettings(data.settings);
        setLocalSettings(data.settings);
        toast.success("Platform parameters updated");
      }
    } catch {
      toast.error("Settings sync failed");
    } finally {
      setIsSavingSettings(false);
    }
  };

  /* ── Shared style tokens ── */
  const inp = {
    width: "100%",
    padding: "14px 20px",
    background: "#f8fafc",
    border: "1px solid transparent",
    borderRadius: 16,
    fontSize: 13,
    fontWeight: 600,
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };
  const lbl = {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
    marginLeft: 4,
  };

  const planBadge = (plan) => {
    const map = {
      Enterprise: { bg: "#f3e8ff", color: "#7c3aed" },
      Premium: { bg: "#e0e7ff", color: "#4338ca" },
      Basic: { bg: "#dbeafe", color: "#1d4ed8" },
    };
    return map[plan] || map.Basic;
  };

  /* ─── Upgrade Pricing ─── */
  const PLAN_DETAILS = {
    Basic: {
      id: "Basic",
      name: "Starter",
      price: platformSettings?.prices?.basic || 1000,
      students: platformSettings?.quotas?.basicStudentLimit || 200,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    Premium: {
      id: "Premium",
      name: "Growth",
      price: platformSettings?.prices?.professional || 1500,
      students: platformSettings?.quotas?.professionalStudentLimit || 500,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    Enterprise: {
      id: "Enterprise",
      name: "Elite",
      price: platformSettings?.prices?.enterprise || 2000,
      students: `${platformSettings?.quotas?.enterpriseBranchLimit || 8} Branches`,
      color: "#7c3aed",
      bg: "#faf5ff",
    },
  };

  const calculatePrice = (planId, months) => {
    const base = PLAN_DETAILS[planId]?.price || 0;
    const total = base * months;
    if (months >= 12) return total * 0.8; // 20% off
    if (months >= 6) return total * 0.9; // 10% off
    if (months >= 3) return total * 0.95; // 5% off
    return total;
  };

  const confirmUpgrade = async () => {
    if (!selectedClient) return;
    const update = {
      plan: upgradePlan,
      planDuration: upgradeDuration * 30,
      isActive: true,
    };
    await handleUpdateSubscription(selectedClient._id, update);
    setIsUpgradeModalOpen(false);
  };

  /* ── Sections ── */
  const renderSection = () => {
    switch (activeSection) {
      /* ── DASHBOARD ── */
      case "dashboard":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 20 : 24,
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Platform Insights
            </h1>

            {/* Stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : width < 1024
                    ? "1fr 1fr"
                    : "1fr 1fr 1fr 1fr",
                gap: 20,
              }}
            >
              {[
                {
                  label: "Total Institutes",
                  value: stats?.totalClients,
                  icon: Building2,
                  bg: "#eff6ff",
                  color: "#2563eb",
                },
                {
                  label: "Active Subscriptions",
                  value: stats?.activeClients,
                  icon: CheckCircle2,
                  bg: "#f0fdf4",
                  color: "#16a34a",
                },
                {
                  label: "Premium Users",
                  value: stats?.premiumClients,
                  icon: TrendingUp,
                  bg: "#eef2ff",
                  color: "#4f46e5",
                },
                {
                  label: "Enterprise Partners",
                  value: stats?.enterpriseClients,
                  icon: ShieldCheck,
                  bg: "#faf5ff",
                  color: "#7c3aed",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 24,
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.08)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.04)")
                  }
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      background: stat.bg,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                      marginBottom: 16,
                    }}
                  >
                    <stat.icon size={24} />
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 30,
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {stat.value || 0}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom 2-col */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : width < 1024
                    ? "1fr"
                    : "1fr 1fr",
                gap: 24,
              }}
            >
              {/* Recent Onboarding */}
              <div
                style={{
                  background: "#fff",
                  padding: isMobile ? 20 : 32,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Recent Onboarding
                  </h2>
                  <button
                    onClick={() => setActiveSection("clients")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                    }}
                  >
                    View All
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f8fafc" }}>
                        <th
                          style={{
                            paddingBottom: 14,
                            paddingLeft: 16,
                            paddingRight: 16,
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          Institute
                        </th>
                        <th
                          style={{
                            paddingBottom: 14,
                            paddingLeft: 16,
                            paddingRight: 16,
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          Plan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.slice(0, 5).map((client) => (
                        <tr
                          key={client._id}
                          style={{ borderBottom: "1px solid #f8fafc" }}
                        >
                          <td style={{ padding: "14px 16px" }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              {client.instituteName}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 10,
                                color: "#94a3b8",
                                fontWeight: 500,
                              }}
                            >
                              {client.email}
                            </p>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                ...planBadge(client.plan),
                                padding: "3px 10px",
                                borderRadius: 999,
                                fontSize: 9,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                              }}
                            >
                              {client.plan}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Log */}
              <div
                style={{
                  background: "#fff",
                  padding: isMobile ? 20 : 32,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Recent Client Activity
                  </h2>
                  <TrendingUp size={20} color="#cbd5e1" />
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  {activities.slice(0, 6).map((log, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#3b82f6",
                          marginTop: 4,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: 1,
                          }}
                        >
                          {log.adminId?.instituteName || "Unknown Site"}:{" "}
                          {log.action}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 10,
                            color: "#94a3b8",
                            fontWeight: 500,
                          }}
                        >
                          {new Date(log.createdAt).toLocaleString()} •{" "}
                          {log.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      /* ── STOREFRONTS ── */
      case "storefronts":
        return <WhiteLabelManager />;

      /* ── DEMO INQUIRIES ── */
      case "demo-inquiry":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#0f172a" }}>Demo Inquiries</h1>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Manage and track all demo requests from landing page</p>
              </div>
              <button 
                onClick={fetchData}
                style={{ padding: "10px 16px", borderRadius: 12, background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#475569" }}
              >
                Refresh
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <tr>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>User Details</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Institute & Plan</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Date</th>
                      <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoInquiries.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: 48, textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                            <ClipboardList size={48} color="#cbd5e1" />
                            <p style={{ margin: 0, fontWeight: 600, color: "#94a3b8" }}>No inquiries found yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      demoInquiries.map((inq) => (
                        <tr key={inq._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{inq.name}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {inq.email}</span>
                                <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {inq.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{inq.instituteName || "N/A"}</p>
                              <span style={{ 
                                fontSize: 10, 
                                fontWeight: 800, 
                                textTransform: "uppercase",
                                color: inq.plan === 'enterprise' ? '#7c3aed' : inq.plan === 'professional' ? '#2563eb' : '#16a34a',
                                background: inq.plan === 'enterprise' ? '#f5f3ff' : inq.plan === 'professional' ? '#eff6ff' : '#f0fdf4',
                                padding: "2px 8px",
                                borderRadius: 6,
                                alignSelf: "flex-start"
                              }}>
                                {inq.plan || 'Trial'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "20px 24px", fontSize: 13, color: "#64748b" }}>
                            {new Date(inq.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ padding: "20px 24px" }}>
                            <select 
                              value={inq.status}
                              onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                              style={{ 
                                padding: "6px 12px", 
                                borderRadius: 8, 
                                border: "1px solid #e2e8f0", 
                                fontSize: 12, 
                                fontWeight: 600,
                                background: inq.status === 'Pending' ? '#fffbeb' : inq.status === 'Contacted' ? '#eff6ff' : inq.status === 'Converted' ? '#f0fdf4' : '#f8fafc',
                                color: inq.status === 'Pending' ? '#92400e' : inq.status === 'Contacted' ? '#1e40af' : inq.status === 'Converted' ? '#166534' : '#475569',
                                outline: "none"
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Converted">Converted</option>
                              <option value="Ignored">Ignored</option>
                            </select>
                          </td>
                          <td style={{ padding: "20px 24px", textAlign: "center" }}>
                             <button 
                               onClick={() => {
                                 if (inq.message) alert(`Message from ${inq.name}:\n\n${inq.message}`);
                                 else toast.info("No message provided");
                               }}
                               style={{ background: "none", border: "none", cursor: "pointer", color: "#6366f1" }}
                               title="View Message"
                             >
                               <ArrowRight size={18} />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      /* ── CLIENTS ── */
      case "clients":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Institute Partners
              </h1>
              <button
                onClick={() => setActiveSection("create-client")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                  width: isMobile ? "100%" : "auto",
                  justifyContent: "center",
                }}
              >
                <Plus size={16} /> New Institute
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : width < 1280
                    ? "1fr"
                    : "1fr 1fr",
                gap: 20,
              }}
            >
              {clients.map((client) => (
                <div
                  key={client._id}
                  style={{
                    background: "#fff",
                    padding: isMobile ? 18 : 24,
                    borderRadius: 24,
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = "#bfdbfe")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "#f1f5f9")
                  }
                >
                  {/* Top: logo + name + plan badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          background: "#0f172a",
                          borderRadius: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {client.instituteName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 17,
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.2,
                          }}
                        >
                          {client.instituteName || "Unnamed Institute"}
                        </h3>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {client.field || "General"}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        ...planBadge(client.plan),
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        flexShrink: 0,
                      }}
                    >
                      {client.plan}
                    </span>
                  </div>

                  {/* Owner + Contact */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Owner
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#334155",
                        }}
                      >
                        {client.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Contact
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#334155",
                        }}
                      >
                        {client.mobile || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Footer: expiry + actions */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 14,
                      padding: "12px 16px",
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      alignItems: isMobile ? "flex-start" : "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Calendar size={14} color="#94a3b8" />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 8,
                            fontWeight: 700,
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          Expires On
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            fontWeight: 900,
                            color: "#334155",
                          }}
                        >
                          {new Date(client.planExpiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        width: isMobile ? "100%" : "auto",
                      }}
                    >
                      <button
                        onClick={() =>
                          handleUpdateSubscription(client._id, {
                            isActive: !client.isActive,
                          })
                        }
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          border: "none",
                          cursor: "pointer",
                          flex: isMobile ? 1 : "none",
                          ...(client.isActive
                            ? { background: "#fff1f2", color: "#e11d48" }
                            : { background: "#f0fdf4", color: "#16a34a" }),
                        }}
                      >
                        {client.isActive ? "Suspend" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setUpgradePlan(client.plan || "Basic");
                          setUpgradeDuration(1);
                          setIsUpgradeModalOpen(true);
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          border: "none",
                          cursor: "pointer",
                          background: "#0f172a",
                          color: "#fff",
                          flex: isMobile ? 1 : "none",
                        }}
                      >
                        Upgrade
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client._id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          border: "none",
                          cursor: "pointer",
                          background: "#fff1f2",
                          color: "#e11d48",
                          flex: isMobile ? 1 : "none",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      /* ── CREATE CLIENT ── */
      case "create-client":
        return (
          <div
            style={{
              maxWidth: 896,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            <div>
              <h1
                style={{
                  margin: "0 0 6px",
                  fontSize: isMobile ? 20 : 24,
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                Onboard New Institute
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Configure workspace and subscription for your client.
              </p>
            </div>

            <form
              onSubmit={handleCreateClient}
              style={{
                background: "#fff",
                padding: isMobile ? 20 : 32,
                borderRadius: 24,
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 32,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 20,
                }}
              >
                {[
                  {
                    label: "Owner Name",
                    key: "name",
                    type: "text",
                    placeholder: "Full Name",
                  },
                  {
                    label: "Institute Name",
                    key: "instituteName",
                    type: "text",
                    placeholder: "MICC IT Institute",
                  },
                  {
                    label: "Educational Field",
                    key: "field",
                    type: "text",
                    placeholder: "IT Coaching / Medical / School",
                  },
                  {
                    label: "Work Email",
                    key: "email",
                    type: "email",
                    placeholder: "admin@institute.com",
                  },
                  {
                    label: "Mobile Number",
                    key: "mobile",
                    type: "text",
                    placeholder: "+91 00000 00000",
                  },
                  {
                    label: "Temp Password",
                    key: "password",
                    type: "text",
                    placeholder: "Set initial password",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input
                      required
                      type={f.type}
                      placeholder={f.placeholder}
                      value={formData[f.key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.key]: e.target.value })
                      }
                      style={inp}
                      onFocus={(e) => {
                        e.target.style.background = "#fff";
                        e.target.style.borderColor = "#3b82f6";
                      }}
                      onBlur={(e) => {
                        e.target.style.background = "#f8fafc";
                        e.target.style.borderColor = "transparent";
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label style={lbl}>Subscription Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) =>
                      setFormData({ ...formData, plan: e.target.value })
                    }
                    style={{ ...inp, appearance: "none" }}
                    onFocus={(e) => {
                      e.target.style.background = "#fff";
                      e.target.style.borderColor = "#3b82f6";
                    }}
                    onBlur={(e) => {
                      e.target.style.background = "#f8fafc";
                      e.target.style.borderColor = "transparent";
                    }}
                  >
                    <option value="Basic">Basic Plan</option>
                    <option value="Premium">Premium Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>

                <div>
                  <label style={lbl}>Duration (Days)</label>
                  <input
                    required
                    type="number"
                    value={formData.planDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        planDuration: parseInt(e.target.value),
                      })
                    }
                    style={inp}
                    onFocus={(e) => {
                      e.target.style.background = "#fff";
                      e.target.style.borderColor = "#3b82f6";
                    }}
                    onBlur={(e) => {
                      e.target.style.background = "#f8fafc";
                      e.target.style.borderColor = "transparent";
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingTop: 8,
                }}
              >
                <button
                  type="submit"
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: isMobile ? "14px 24px" : "16px 40px",
                    borderRadius: 16,
                    fontWeight: 900,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
                    transition: "background 0.2s",
                    width: isMobile ? "100%" : "auto",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#1d4ed8")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#2563eb")
                  }
                >
                  Register & Invite Client
                </button>
              </div>
            </form>
          </div>
        );

      /* ── SUBSCRIPTIONS ── */
      case "subscriptions": {
        const activeClients = clients.filter((c) => c.isActive);
        const estimatedMRR = activeClients.reduce(
          (sum, c) => sum + (PLAN_DETAILS[c.plan]?.price || 0),
          0,
        );

        const now = new Date();
        const sevenDaysSoon = new Date();
        sevenDaysSoon.setDate(now.getDate() + 7);

        const renewalAlerts = clients.filter((c) => {
          if (!c.planExpiryDate) return false;
          const expiry = new Date(c.planExpiryDate);
          return expiry > now && expiry <= sevenDaysSoon;
        }).length;

        const planCounts = clients.reduce((acc, c) => {
          acc[c.plan] = (acc[c.plan] || 0) + 1;
          return acc;
        }, {});

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Revenue & Lifecycle
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  Strategic portfolio performance and renewal oversight
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: 20,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <p style={lbl}>Estimated MRR</p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  ₹{estimatedMRR.toLocaleString()}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#10b981",
                  }}
                >
                  +Active Protocol Revenue
                </p>
              </div>
              <div
                style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <p style={lbl}>Renewal Watchlist</p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 900,
                    color: renewalAlerts > 0 ? "#e11d48" : "#0f172a",
                  }}
                >
                  {renewalAlerts}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  Expiring within 7 days
                </p>
              </div>
              <div
                style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <p style={lbl}>Elite Tier Adoption</p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#7c3aed",
                  }}
                >
                  {planCounts["Enterprise"] || 0}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  Active Enterprise Partners
                </p>
              </div>
            </div>

            {/* Lifecycle Table */}
            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                border: "1px solid #f1f5f9",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Renewal Priority Watchlist
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Sorted by urgency
                </span>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th
                      style={{
                        padding: "14px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Institute
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Plan Level
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Timeline
                    </th>
                    <th
                      style={{
                        padding: "14px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "right",
                      }}
                    >
                      Management
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...clients]
                    .sort(
                      (a, b) =>
                        new Date(a.planExpiryDate) - new Date(b.planExpiryDate),
                    )
                    .map((client) => {
                      const expiry = client.planExpiryDate
                        ? new Date(client.planExpiryDate)
                        : null;
                      const daysLeft = expiry
                        ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                        : 0;
                      const isUrgent = daysLeft <= 7 && daysLeft > 0;
                      const isExpired = daysLeft <= 0;

                      return (
                        <tr
                          key={client._id}
                          style={{ borderBottom: "1px solid #f8fafc" }}
                        >
                          <td style={{ padding: "18px 24px" }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#0f172a",
                              }}
                            >
                              {client.instituteName}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#94a3b8",
                                fontWeight: 500,
                              }}
                            >
                              {client.email}
                            </p>
                          </td>
                          <td style={{ padding: "18px 24px" }}>
                            <span
                              style={{
                                ...planBadge(client.plan),
                                padding: "4px 10px",
                                borderRadius: 8,
                                fontSize: 9,
                                fontWeight: 900,
                                textTransform: "uppercase",
                              }}
                            >
                              {client.plan}
                            </span>
                          </td>
                          <td style={{ padding: "18px 24px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 100 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      color: isExpired
                                        ? "#ef4444"
                                        : isUrgent
                                          ? "#f59e0b"
                                          : "#64748b",
                                    }}
                                  >
                                    {isExpired
                                      ? "EXPIRED"
                                      : `${daysLeft} days left`}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    height: 4,
                                    background: "#f1f5f9",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${Math.max(0, Math.min(100, (daysLeft / 30) * 100))}%`,
                                      height: "100%",
                                      background: isExpired
                                        ? "#ef4444"
                                        : isUrgent
                                          ? "#f59e0b"
                                          : "#3b82f6",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            style={{ padding: "18px 24px", textAlign: "right" }}
                          >
                            <button
                              onClick={() => {
                                setSelectedClient(client);
                                setUpgradePlan(client.plan);
                                setIsUpgradeModalOpen(true);
                              }}
                              style={{
                                padding: "8px 16px",
                                borderRadius: 12,
                                background: isUrgent ? "#e11d48" : "#0f172a",
                                color: "#fff",
                                fontSize: 10,
                                fontWeight: 800,
                                border: "none",
                                cursor: "pointer",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {isExpired
                                ? "Reactivate"
                                : isUrgent
                                  ? "Renew Now"
                                  : "Manage"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      /* ── PAYMENTS ── */
      case "payments": {
        let subscriptionLogs = activities.filter(
          (log) =>
            log.action === "Subscription Updated" ||
            log.action?.toLowerCase().includes("plan") ||
            log.action?.toLowerCase().includes("subscribe"),
        );

        // Apply Time Filter
        const now = new Date();
        if (paymentFilter !== "all") {
          subscriptionLogs = subscriptionLogs.filter((log) => {
            const logDate = new Date(log.createdAt);
            if (paymentFilter === "7")
              return logDate >= new Date(new Date().setDate(now.getDate() - 7));
            if (paymentFilter === "15")
              return (
                logDate >= new Date(new Date().setDate(now.getDate() - 15))
              );
            if (paymentFilter === "30")
              return (
                logDate >= new Date(new Date().setDate(now.getDate() - 30))
              );
            if (paymentFilter === "90")
              return (
                logDate >= new Date(new Date().setDate(now.getDate() - 90))
              );

            if (paymentFilter === "thisMonth") {
              const startOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1,
              );
              return logDate >= startOfMonth;
            }
            if (paymentFilter === "lastMonth") {
              const startOfLastMonth = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                1,
              );
              const endOfLastMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                0,
              );
              return logDate >= startOfLastMonth && logDate <= endOfLastMonth;
            }
            if (
              paymentFilter === "custom" &&
              paymentCustomDate.start &&
              paymentCustomDate.end
            ) {
              return (
                logDate >= new Date(paymentCustomDate.start) &&
                logDate <= new Date(paymentCustomDate.end)
              );
            }
            return true;
          });
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 20,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Strategic Audit Log
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  Verified record of all platform subscription transactions
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {/* Time Filter Select */}
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#475569",
                    outline: "none",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <option value="all">All Time History</option>
                  <option value="7">Last 7 Days</option>
                  <option value="15">Last 15 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>

                {paymentFilter === "custom" && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <input
                      type="date"
                      value={paymentCustomDate.start}
                      onChange={(e) =>
                        setPaymentCustomDate({
                          ...paymentCustomDate,
                          start: e.target.value,
                        })
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#94a3b8",
                      }}
                    >
                      -
                    </span>
                    <input
                      type="date"
                      value={paymentCustomDate.end}
                      onChange={(e) =>
                        setPaymentCustomDate({
                          ...paymentCustomDate,
                          end: e.target.value,
                        })
                      }
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    background: "#fff",
                    padding: "10px 20px",
                    borderRadius: 16,
                    border: "1px solid #f1f5f9",
                    textAlign: "right",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <p style={{ ...lbl, margin: 0 }}>Showing</p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {subscriptionLogs.length} Records
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 24,
                border: "1px solid #f1f5f9",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th
                      style={{
                        padding: "16px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Date & Time
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Institute
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Transaction Details
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "16px 24px",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "right",
                      }}
                    >
                      Origin IP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "18px 24px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#1e293b",
                          }}
                        >
                          {new Date(log.createdAt).toLocaleDateString()}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 10,
                            color: "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {log.adminId?.instituteName || "General System"}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#94a3b8",
                            fontWeight: 500,
                          }}
                        >
                          {log.adminId?.email || "Global Event"}
                        </p>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyCenter: "center",
                              color: "#2563eb",
                            }}
                          >
                            <CreditCard
                              size={16}
                              style={{ margin: "0 auto" }}
                            />
                          </div>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#334155",
                              }}
                            >
                              {log.action}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              {log.details}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "18px 24px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            background: "#f0fdf4",
                            color: "#16a34a",
                            fontSize: 9,
                            fontWeight: 900,
                            textTransform: "uppercase",
                          }}
                        >
                          Completed
                        </span>
                      </td>
                      <td style={{ padding: "18px 24px", textAlign: "right" }}>
                        <code
                          style={{
                            fontSize: 10,
                            color: "#94a3b8",
                            fontWeight: 700,
                          }}
                        >
                          {log.ip || "127.0.0.1"}
                        </code>
                      </td>
                    </tr>
                  ))}
                  {subscriptionLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: 60,
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: 14,
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: 700 }}>
                          No transaction records found.
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                          New subscription events will appear here
                          automatically.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      /* ── SETTINGS ── */
      case "settings":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Platform Master Configuration
                </h1>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  Centralized control of global architecture parameters
                </p>
              </div>
              <button
                onClick={() => handleUpdateSettings(localSettings)}
                disabled={isSavingSettings}
                style={{
                  background: isSavingSettings ? "#94a3b8" : "#0f172a",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: "none",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: isSavingSettings ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
                  transition: "all 0.2s ease",
                }}
              >
                {isSavingSettings ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {isSavingSettings
                  ? "Committing Changes..."
                  : "Save Master Changes"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 24,
              }}
            >
              {/* Brand Identity */}
              <div
                style={{
                  background: "#fff",
                  padding: 32,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#faf5ff",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7c3aed",
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Brand Identity & Support
                  </h3>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  <div>
                    <label style={lbl}>Platform Display Name</label>
                    <input
                      type="text"
                      value={localSettings?.platformName || ""}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          platformName: e.target.value,
                        })
                      }
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Primary Theme Color</label>
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <input
                        type="color"
                        value={localSettings?.primaryColor || "#2563eb"}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            primaryColor: e.target.value,
                          })
                        }
                        style={{
                          width: 40,
                          height: 40,
                          border: "none",
                          borderRadius: 8,
                          background: "none",
                          cursor: "pointer",
                        }}
                      />
                      <code
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        {localSettings?.primaryColor || "#2563eb"}
                      </code>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Support Contact Email</label>
                    <input
                      type="email"
                      value={localSettings?.supportEmail || ""}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          supportEmail: e.target.value,
                        })
                      }
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Support Official Phone</label>
                    <input
                      type="text"
                      value={localSettings?.supportPhone || ""}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          supportPhone: e.target.value,
                        })
                      }
                      style={inp}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Architecture */}
              <div
                style={{
                  background: "#fff",
                  padding: 32,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#f0fdf4",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#16a34a",
                    }}
                  >
                    <TrendingUp size={20} />
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Pricing Architecture
                  </h3>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  {[
                    {
                      label: "Starter (Basic) Price",
                      key: "basic",
                      val: localSettings?.prices?.basic,
                    },
                    {
                      label: "Growth (Professional) Price",
                      key: "professional",
                      val: localSettings?.prices?.professional,
                    },
                    {
                      label: "Elite (Enterprise) Price",
                      key: "enterprise",
                      val: localSettings?.prices?.enterprise,
                    },
                  ].map((p, i) => (
                    <div key={i}>
                      <label style={lbl}>{p.label} (₹)</label>
                      <input
                        type="number"
                        value={p.val}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            prices: {
                              ...localSettings.prices,
                              [p.key]: parseInt(e.target.value),
                            },
                          })
                        }
                        style={inp}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrollment Quotas */}
              <div
                style={{
                  background: "#fff",
                  padding: 32,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#eff6ff",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563eb",
                    }}
                  >
                    <Users size={20} />
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Enrollment Quotas
                  </h3>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  {[
                    {
                      label: "Starter Student Limit",
                      key: "basicStudentLimit",
                      val: localSettings?.quotas?.basicStudentLimit,
                    },
                    {
                      label: "Growth Student Limit",
                      key: "professionalStudentLimit",
                      val: localSettings?.quotas?.professionalStudentLimit,
                    },
                    {
                      label: "Elite Branch Limit",
                      key: "enterpriseBranchLimit",
                      val: localSettings?.quotas?.enterpriseBranchLimit,
                    },
                  ].map((q, i) => (
                    <div key={i}>
                      <label style={lbl}>{q.label}</label>
                      <input
                        type="number"
                        value={q.val}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            quotas: {
                              ...localSettings.quotas,
                              [q.key]: parseInt(e.target.value),
                            },
                          })
                        }
                        style={inp}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div
                style={{
                  background: "#fff",
                  padding: 32,
                  borderRadius: 24,
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "#fef2f2",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ef4444",
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        System Integrity Protocol
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocalSettings({
                        ...localSettings,
                        isMaintenanceMode: !localSettings?.isMaintenanceMode,
                      });
                    }}
                    style={{
                      padding: "10px 24px",
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 11,
                      border: "none",
                      cursor: "pointer",
                      background: localSettings?.isMaintenanceMode
                        ? "#ef4444"
                        : "#f1f5f9",
                      color: localSettings?.isMaintenanceMode
                        ? "#fff"
                        : "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {localSettings?.isMaintenanceMode
                      ? "Disable Maintenance"
                      : "Enable Maintenance"}
                  </button>
                </div>
                <div>
                  <label style={lbl}>Global Maintenance Message</label>
                  <textarea
                    value={localSettings?.maintenanceMessage}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        maintenanceMessage: e.target.value,
                      })
                    }
                    style={{ ...inp, height: 100, resize: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            style={{
              padding: 80,
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#94a3b8",
            }}
          >
            Section Coming Soon
          </div>
        );
    }
  };

  /* ── Full-screen loading ── */
  if (loading && !stats)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid #2563eb",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#94a3b8",
          }}
        >
          Synchronizing Management Data...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f8fafc",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* ── DESKTOP: Permanent sidebar (lg+) ── */}
      {isDesktop && (
        <div style={{ width: 288, flexShrink: 0, overflowY: "auto" }}>
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
      )}

      {/* ── MOBILE/TABLET: Drawer overlay (below lg) ── */}
      {!isDesktop && showMobileSidebar && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50 }}
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: isMobile ? 280 : 288,
              background: "#0f172a",
              overflowY: "auto",
              boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              activeSection={activeSection}
              setActiveSection={(s) => {
                setActiveSection(s);
                setShowMobileSidebar(false);
              }}
              mobile={true}
              onClose={() => setShowMobileSidebar(false)}
            />
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "#fff",
            borderBottom: "1px solid #f1f5f9",
            padding: isMobile ? "12px 16px" : "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: isDesktop ? "flex-end" : "space-between",
            flexShrink: 0,
          }}
        >
          {/* Hamburger — only on mobile/tablet */}
          {!isDesktop && (
            <button
              onClick={() => setShowMobileSidebar(true)}
              style={{
                background: "none",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
              }}
            >
              <Menu size={24} />
            </button>
          )}

          {/* Right side: status + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                Platform Control
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#10b981",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Live System
                </p>
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                background: "#0f172a",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 13,
                border: "2px solid #fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              SA
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? 16 : isDesktop ? 40 : 24,
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {renderSection()}
          </div>
        </main>
      </div>

      {/* ── Upgrade Modal ── */}
      {isUpgradeModalOpen && selectedClient && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15,23,42,0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setIsUpgradeModalOpen(false)}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 640,
              background: "#fff",
              borderRadius: 32,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "32px 32px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  Upgrade Protocol
                </h3>
                <p
                  style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}
                >
                  Modifying subscription for{" "}
                  <span style={{ fontWeight: 700, color: "#2563eb" }}>
                    {selectedClient.instituteName}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  padding: 8,
                  borderRadius: 12,
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: 32,
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
              }}
            >
              {/* Plan Selection */}
              <div style={{ marginBottom: 32 }}>
                <label style={lbl}>Select Strategic Plan</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  {Object.values(PLAN_DETAILS).map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setUpgradePlan(plan.id)}
                      style={{
                        padding: 16,
                        borderRadius: 20,
                        border: `2px solid ${upgradePlan === plan.id ? plan.color : "#f1f5f9"}`,
                        background:
                          upgradePlan === plan.id ? `${plan.color}08` : "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          background: plan.bg,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: plan.color,
                          marginBottom: 12,
                        }}
                      >
                        <Trophy size={16} />
                      </div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 900,
                          color: "#0f172a",
                        }}
                      >
                        {plan.name}
                      </h4>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                        }}
                      >
                        {plan.students}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration & Price */}
              <div
                style={{ background: "#f8fafc", borderRadius: 24, padding: 24 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <label style={{ ...lbl, margin: 0 }}>Duration</label>
                  <span
                    style={{ fontSize: 12, fontWeight: 900, color: "#2563eb" }}
                  >
                    {upgradeDuration} Month{upgradeDuration > 1 ? "s" : ""}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {[1, 3, 6, 12].map((m) => (
                    <button
                      key={m}
                      onClick={() => setUpgradeDuration(m)}
                      style={{
                        padding: "10px 0",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 900,
                        border: "none",
                        cursor: "pointer",
                        background: upgradeDuration === m ? "#0f172a" : "#fff",
                        color: upgradeDuration === m ? "#fff" : "#64748b",
                        boxShadow:
                          upgradeDuration === m
                            ? "none"
                            : "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      {m}M {m === 12 && "🔥"}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 20,
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <p style={lbl}>Total Investment</p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 24,
                          fontWeight: 900,
                          color: "#0f172a",
                        }}
                      >
                        ₹
                        {calculatePrice(
                          upgradePlan,
                          upgradeDuration,
                        ).toLocaleString()}
                      </span>
                      {upgradeDuration > 1 && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#10b981",
                            background: "#f0fdf4",
                            padding: "2px 6px",
                            borderRadius: 6,
                          }}
                        >
                          SAVE{" "}
                          {upgradeDuration === 12
                            ? "20%"
                            : upgradeDuration === 6
                              ? "10%"
                              : "5%"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={confirmUpgrade}
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "14px 28px",
                      borderRadius: 16,
                      fontSize: 11,
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      boxShadow: "0 10px 15px -3px rgba(37,99,235,0.3)",
                    }}
                  >
                    Confirm Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
