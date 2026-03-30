import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Settings,
  LogOut,
  UserCircle,
  Building2,
  TrendingUp,
} from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";

export default function SuperAdminSidebar({
  activeSection,
  setActiveSection,
  mobile = false,
  onClose = () => {},
}) {
  const handleLogout = () => {
    localStorage.removeItem("superAdminToken");
    window.location.href = "/superadmin/login";
  };

  const handleItemClick = (key) => {
    setActiveSection(key);
    if (mobile) onClose();
  };

  const { platformName, primaryColor } = usePlatform();

  /* ── Nav item style ── */
  const navItem = (key) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    ...(activeSection === key
      ? {
          background: primaryColor,
          color: "#fff",
          boxShadow: `0 4px 14px ${primaryColor}55`,
        }
      : { background: "transparent", color: "#94a3b8" }),
  });

  const sectionLabel = {
    padding: "0 16px",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#475569",
    marginTop: 24,
    marginBottom: 8,
    display: "block",
  };

  const NAV = [
    {
      label: "Overview",
      items: [{ key: "dashboard", icon: LayoutDashboard, label: "Analytics" }],
    },
    {
      label: "Client Management",
      items: [
        { key: "clients", icon: Users, label: "All Clients" },
        { key: "create-client", icon: UserPlus, label: "Add New Institute" },
      ],
    },
    {
      label: "Financials",
      items: [
        { key: "subscriptions", icon: TrendingUp, label: "Subscriptions" },
        { key: "payments", icon: CreditCard, label: "Payments" },
      ],
    },
    {
      label: "System",
      items: [{ key: "settings", icon: Settings, label: "Platform Settings" }],
    },
  ];

  return (
    <div
      style={{
        height: "100%",
        background: "#0f172a",
        color: "#cbd5e1",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* ── Brand Header ── */}
      <div style={{ padding: mobile ? 20 : 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: primaryColor,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
              boxShadow: `0 4px 14px ${primaryColor}55`,
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              {platformName} Master
            </h2>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: 10,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Platform Master
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {NAV.map((group) => (
          <div key={group.label}>
            <span style={sectionLabel}>{group.label}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {group.items.map(({ key, icon: Icon, label }) => (
                <div
                  key={key}
                  onClick={() => handleItemClick(key)}
                  style={navItem(key)}
                  onMouseOver={(e) => {
                    if (activeSection !== key)
                      e.currentTarget.style.background = "rgba(30,41,59,0.5)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    if (activeSection !== key) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div
        style={{
          padding: mobile ? 12 : 16,
          borderTop: "1px solid #1e293b",
          background: "rgba(30,41,59,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            borderRadius: 12,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(30,41,59,0.5)")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#60a5fa",
              border: "1px solid #334155",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            <UserCircle size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: "#e2e8f0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Platform Owner
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Full Control
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6,
              borderRadius: 8,
              transition: "color 0.2s, background 0.2s",
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#475569";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
