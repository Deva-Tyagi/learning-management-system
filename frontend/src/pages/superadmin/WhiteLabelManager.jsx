import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "sonner";
import { Loader2, Save, Globe, Plus, Trash2, ChevronDown, ExternalLink } from "lucide-react";

const TABS = ["General", "Home", "About", "Courses", "Contact", "Footer"];

const DEFAULT_CONFIG = (client = {}) => ({
  adminId: client._id || '',
  domainName: client.instituteName?.toLowerCase().replace(/\s+/g, '-') || '',
  instituteName: client.instituteName || '',
  theme: { primaryColor: '#2563eb', logoUrl: '' },
  footer: { tagline: 'Empowering students through world-class education.', phone: '', email: '', address: '', socialLinks: [] },
  homePage: {
    banner: { title: 'Shape Your Future', subtitle: 'Join thousands of students learning with excellence.', ctaText: 'Explore Courses', backgroundImage: '' },
    technologies: { heading: 'Technologies We Teach', items: [{ icon: '💻', name: 'Web Development', description: 'Build modern websites and apps.' }] },
    whyChooseUs: { heading: 'Why Choose Us', items: [{ icon: '🎯', title: 'Expert Faculty', text: 'Learn from industry professionals with years of experience.' }] },
    features: { heading: 'What We Offer', items: [{ title: 'Live Classes', description: 'Interactive sessions with real-time doubt solving.', imageUrl: '' }] },
  },
  aboutPage: {
    banner: { title: 'About Us', subtitle: 'Learn more about our mission, team, and values.', backgroundImage: '' },
    impact: { heading: 'Our Impact in Numbers', stats: [{ number: '1000+', label: 'Students Enrolled' }, { number: '50+', label: 'Courses Available' }] },
    whatSetsUsApart: { heading: 'What Sets Us Apart', points: ['Industry-expert faculty', 'Placement assistance', 'Lifetime course access'] },
    faculty: [{ name: 'Prof. Rajan Sharma', role: 'Lead Instructor', bio: 'Expert with 10+ years of experience.', photoUrl: '' }],
    mission: { heading: 'Our Mission', text: 'To provide accessible, high-quality education to all.', imageUrl: '' },
  },
  coursesPage: { banner: { title: 'Our Courses', subtitle: 'Browse all programs and start learning today.' } },
  contactPage: {
    banner: { title: 'Contact Us', subtitle: "We'd love to hear from you. Reach out anytime." },
    address: { fullAddress: '', phone: '', email: '', mapEmbedUrl: '' },
  },
  isActive: true,
});

const ArrayEditor = ({ label, items = [], onChange, renderItem, onAdd, addLabel = '+ Add Item' }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <button onClick={onAdd} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
        <Plus size={12} /> {addLabel}
      </button>
    </div>
    {(items || []).map((item, idx) => (
      <div key={idx} className="relative bg-slate-50 rounded-xl p-4 border border-slate-200">
        <button onClick={() => onChange(items.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
        {renderItem(item, idx, (field, val) => {
          const copy = [...items];
          copy[idx] = { ...copy[idx], [field]: val };
          onChange(copy);
        })}
      </div>
    ))}
  </div>
);

const Field = ({ label, value, onChange, type = 'text', rows, placeholder }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
    {rows ? (
      <textarea rows={rows} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <input type={type} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </div>
);

export default function WhiteLabelManager() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [activeTab, setActiveTab] = useState('General');

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const res = await axios.get("/super-admin/clients", { headers: { Authorization: `Bearer ${token}` } });
      setClients(res.data);
    } catch { toast.error("Failed to load clients"); }
    finally { setLoading(false); }
  };

  const loadClientConfig = async (client) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("superAdminToken");
      const res = await axios.get(`/website/superadmin/${client._id}`, { headers: { Authorization: `Bearer ${token}` } });
      const def = DEFAULT_CONFIG(client);
      
      if (res.data.website) {
        // Deep merge: use server data but fall back to defaults for missing nested arrays/objects
        const srv = res.data.website;
        const merged = {
          ...def,
          ...srv,
          theme: { ...def.theme, ...(srv.theme || {}) },
          footer: { ...def.footer, ...(srv.footer || {}), socialLinks: srv.footer?.socialLinks || [] },
          homePage: {
            ...def.homePage,
            ...(srv.homePage || {}),
            banner: { ...def.homePage.banner, ...(srv.homePage?.banner || {}) },
            technologies: { ...def.homePage.technologies, ...(srv.homePage?.technologies || {}), items: srv.homePage?.technologies?.items || [] },
            whyChooseUs: { ...def.homePage.whyChooseUs, ...(srv.homePage?.whyChooseUs || {}), items: srv.homePage?.whyChooseUs?.items || [] },
            features: { ...def.homePage.features, ...(srv.homePage?.features || {}), items: srv.homePage?.features?.items || [] },
          },
          aboutPage: {
            ...def.aboutPage,
            ...(srv.aboutPage || {}),
            banner: { ...def.aboutPage.banner, ...(srv.aboutPage?.banner || {}) },
            impact: { ...def.aboutPage.impact, ...(srv.aboutPage?.impact || {}), stats: srv.aboutPage?.impact?.stats || [] },
            whatSetsUsApart: { ...def.aboutPage.whatSetsUsApart, ...(srv.aboutPage?.whatSetsUsApart || {}), points: srv.aboutPage?.whatSetsUsApart?.points || [] },
            faculty: srv.aboutPage?.faculty || [],
            mission: { ...def.aboutPage.mission, ...(srv.aboutPage?.mission || {}) },
          },
          coursesPage: { ...def.coursesPage, ...(srv.coursesPage || {}), banner: { ...def.coursesPage.banner, ...(srv.coursesPage?.banner || {}) } },
          contactPage: {
            ...def.contactPage,
            ...(srv.contactPage || {}),
            banner: { ...def.contactPage.banner, ...(srv.contactPage?.banner || {}) },
            address: { ...def.contactPage.address, ...(srv.contactPage?.address || {}) },
          },
        };
        setConfig(merged);
      } else {
        setConfig(def);
      }
    } catch { toast.error("Failed to load website configuration."); }
    finally { setLoading(false); }
  };

  const set = (path, val) => {
    const keys = path.split('.');
    setConfig(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let ref = copy;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = val;
      return copy;
    });
  };

  const handleSave = async () => {
    if (!config.domainName) return toast.error("Domain name is required.");
    setSaving(true);
    try {
      const token = localStorage.getItem("superAdminToken");
      const fd = new FormData();
      fd.append('domainName', config.domainName);
      fd.append('instituteName', config.instituteName);
      fd.append('isActive', config.isActive);
      fd.append('theme', JSON.stringify(config.theme));
      fd.append('footer', JSON.stringify(config.footer));
      fd.append('homePage', JSON.stringify(config.homePage));
      fd.append('aboutPage', JSON.stringify(config.aboutPage));
      fd.append('coursesPage', JSON.stringify(config.coursesPage));
      fd.append('contactPage', JSON.stringify(config.contactPage));
      if (logoFile) fd.append('logoFile', logoFile);
      await axios.post(`/website/superadmin/${config.adminId}`, fd, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Storefront saved!");
      setLogoFile(null);
    } catch (e) { toast.error(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const renderTabContent = () => {
    if (!config) return null;
    switch (activeTab) {

      case 'General': return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Unique Path / Site URL" value={config.domainName} onChange={v => set('domainName', v.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. smart-academy" />
            <Field label="Institute Name" value={config.instituteName} onChange={v => set('instituteName', v)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brand Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" className="h-11 w-14 p-1 border border-slate-200 rounded-lg cursor-pointer" value={config.theme.primaryColor} onChange={e => set('theme.primaryColor', e.target.value)} />
              <input type="text" className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm" value={config.theme.primaryColor} onChange={e => set('theme.primaryColor', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logo Upload or URL</label>
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <input type="url" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm" value={config.theme.logoUrl} onChange={e => set('theme.logoUrl', e.target.value)} placeholder="Paste logo URL here..." />
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors" />
              </div>
              {(logoFile || config.theme.logoUrl) && (
                <div className="w-20 h-20 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={logoFile ? URL.createObjectURL(logoFile) : config.theme.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      );

      case 'Home': return (
        <div className="space-y-8">
          {/* Banner */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Banner Section</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Main Headline" value={config.homePage.banner.title} onChange={v => set('homePage.banner.title', v)} />
              <Field label="CTA Button Text" value={config.homePage.banner.ctaText} onChange={v => set('homePage.banner.ctaText', v)} />
              <div className="col-span-2"><Field label="Subtitle / Tagline" value={config.homePage.banner.subtitle} onChange={v => set('homePage.banner.subtitle', v)} rows={2} /></div>
              <div className="col-span-2"><Field label="Background Image URL (Optional)" value={config.homePage.banner.backgroundImage} onChange={v => set('homePage.banner.backgroundImage', v)} placeholder="https://..." /></div>
            </div>
          </section>
          {/* Technologies */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />Technologies Section</h4>
            <div className="mb-4"><Field label="Section Heading" value={config.homePage.technologies.heading} onChange={v => set('homePage.technologies.heading', v)} /></div>
            <ArrayEditor label="Technology Cards" items={config.homePage.technologies.items} onChange={v => set('homePage.technologies.items', v)}
              onAdd={() => set('homePage.technologies.items', [...config.homePage.technologies.items, { icon: '🖥️', name: '', description: '' }])}
              renderItem={(item, _, update) => (
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Icon (Emoji)" value={item.icon} onChange={v => update('icon', v)} placeholder="💻" />
                  <Field label="Technology Name" value={item.name} onChange={v => update('name', v)} placeholder="e.g. Python" />
                  <Field label="Short Description" value={item.description} onChange={v => update('description', v)} placeholder="e.g. Data analysis..." />
                </div>
              )}
            />
          </section>
          {/* Why Choose Us */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Why Choose Us Section</h4>
            <div className="mb-4"><Field label="Section Heading" value={config.homePage.whyChooseUs.heading} onChange={v => set('homePage.whyChooseUs.heading', v)} /></div>
            <ArrayEditor label="Reason Cards" items={config.homePage.whyChooseUs.items} onChange={v => set('homePage.whyChooseUs.items', v)}
              onAdd={() => set('homePage.whyChooseUs.items', [...config.homePage.whyChooseUs.items, { icon: '⭐', title: '', text: '' }])}
              renderItem={(item, _, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Icon (Emoji)" value={item.icon} onChange={v => update('icon', v)} placeholder="🎓" />
                  <Field label="Card Title" value={item.title} onChange={v => update('title', v)} placeholder="e.g. Expert Faculty" />
                  <div className="col-span-2"><Field label="Description Text" value={item.text} onChange={v => update('text', v)} rows={2} placeholder="Describe this benefit..." /></div>
                </div>
              )}
            />
          </section>
          {/* Features */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Features Section</h4>
            <div className="mb-4"><Field label="Section Heading" value={config.homePage.features.heading} onChange={v => set('homePage.features.heading', v)} /></div>
            <ArrayEditor label="Feature Items" items={config.homePage.features.items} onChange={v => set('homePage.features.items', v)}
              onAdd={() => set('homePage.features.items', [...config.homePage.features.items, { title: '', description: '', imageUrl: '' }])}
              renderItem={(item, _, update) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Feature Title" value={item.title} onChange={v => update('title', v)} />
                    <Field label="Image URL (Optional)" value={item.imageUrl} onChange={v => update('imageUrl', v)} placeholder="https://..." />
                  </div>
                  <Field label="Description" value={item.description} onChange={v => update('description', v)} rows={2} />
                </div>
              )}
            />
          </section>
        </div>
      );

      case 'About': return (
        <div className="space-y-8">
          {/* Banner */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Banner Section</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Page Title" value={config.aboutPage.banner.title} onChange={v => set('aboutPage.banner.title', v)} />
              <Field label="Background Image URL" value={config.aboutPage.banner.backgroundImage} onChange={v => set('aboutPage.banner.backgroundImage', v)} placeholder="https://..." />
              <div className="col-span-2"><Field label="Subtitle" value={config.aboutPage.banner.subtitle} onChange={v => set('aboutPage.banner.subtitle', v)} rows={2} /></div>
            </div>
          </section>
          {/* Impact */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Our Impact Section</h4>
            <div className="mb-4"><Field label="Section Heading" value={config.aboutPage.impact.heading} onChange={v => set('aboutPage.impact.heading', v)} /></div>
            <ArrayEditor label="Stats (e.g. 1000+ Students)" items={config.aboutPage.impact.stats} onChange={v => set('aboutPage.impact.stats', v)}
              onAdd={() => set('aboutPage.impact.stats', [...config.aboutPage.impact.stats, { number: '', label: '' }])}
              renderItem={(item, _, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Number / Value" value={item.number} onChange={v => update('number', v)} placeholder="e.g. 5000+" />
                  <Field label="Label" value={item.label} onChange={v => update('label', v)} placeholder="e.g. Students Enrolled" />
                </div>
              )}
            />
          </section>
          {/* What Sets Us Apart */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />What Sets Us Apart</h4>
            <div className="mb-4"><Field label="Section Heading" value={config.aboutPage.whatSetsUsApart.heading} onChange={v => set('aboutPage.whatSetsUsApart.heading', v)} /></div>
            <ArrayEditor label="Advantage Points" items={config.aboutPage.whatSetsUsApart.points} onChange={v => set('aboutPage.whatSetsUsApart.points', v)}
              onAdd={() => set('aboutPage.whatSetsUsApart.points', [...config.aboutPage.whatSetsUsApart.points, ''])}
              renderItem={(item, idx) => (
                <Field label={`Point ${idx + 1}`} value={item} onChange={v => {
                  const copy = [...config.aboutPage.whatSetsUsApart.points];
                  copy[idx] = v;
                  set('aboutPage.whatSetsUsApart.points', copy);
                }} placeholder="e.g. Placement assistance provided" />
              )}
            />
          </section>
          {/* Faculty */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Faculty Section</h4>
            <ArrayEditor label="Faculty Members" items={config.aboutPage.faculty} onChange={v => set('aboutPage.faculty', v)}
              onAdd={() => set('aboutPage.faculty', [...config.aboutPage.faculty, { name: '', role: '', bio: '', photoUrl: '' }])}
              renderItem={(item, _, update) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name" value={item.name} onChange={v => update('name', v)} placeholder="Prof. Rajan Sharma" />
                    <Field label="Role / Position" value={item.role} onChange={v => update('role', v)} placeholder="Lead Instructor" />
                  </div>
                  <Field label="Photo URL" value={item.photoUrl} onChange={v => update('photoUrl', v)} placeholder="https://..." />
                  <Field label="Short Bio" value={item.bio} onChange={v => update('bio', v)} rows={2} placeholder="Expert with 10+ years experience..." />
                </div>
              )}
            />
          </section>
          {/* Mission */}
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Our Mission</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Section Heading" value={config.aboutPage.mission.heading} onChange={v => set('aboutPage.mission.heading', v)} />
                <Field label="Image URL" value={config.aboutPage.mission.imageUrl} onChange={v => set('aboutPage.mission.imageUrl', v)} placeholder="https://..." />
              </div>
              <Field label="Mission Text" value={config.aboutPage.mission.text} onChange={v => set('aboutPage.mission.text', v)} rows={4} />
            </div>
          </section>
        </div>
      );

      case 'Courses': return (
        <div className="space-y-6">
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Courses Page Banner</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Page Title" value={config.coursesPage.banner.title} onChange={v => set('coursesPage.banner.title', v)} />
              <div className="col-span-2"><Field label="Subtitle" value={config.coursesPage.banner.subtitle} onChange={v => set('coursesPage.banner.subtitle', v)} rows={2} /></div>
            </div>
          </section>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-500">
            <p className="font-bold text-slate-700 mb-1">📚 Course Cards</p>
            Courses are pulled automatically from the Institute's CRM. Add new courses via the Admin Panel → Courses section.
          </div>
        </div>
      );

      case 'Contact': return (
        <div className="space-y-8">
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Banner Section</h4>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Page Title" value={config.contactPage.banner.title} onChange={v => set('contactPage.banner.title', v)} />
              <div className="col-span-2"><Field label="Subtitle" value={config.contactPage.banner.subtitle} onChange={v => set('contactPage.banner.subtitle', v)} rows={2} /></div>
            </div>
          </section>
          <section>
            <h4 className="font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Address & Contact Details</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone Number" value={config.contactPage.address.phone} onChange={v => set('contactPage.address.phone', v)} placeholder="+91 99999 00000" />
                <Field label="Email Address" value={config.contactPage.address.email} onChange={v => set('contactPage.address.email', v)} placeholder="hello@academy.com" />
              </div>
              <Field label="Full Physical Address" value={config.contactPage.address.fullAddress} onChange={v => set('contactPage.address.fullAddress', v)} rows={2} />
              <Field label="Google Maps Embed URL (Optional)" value={config.contactPage.address.mapEmbedUrl} onChange={v => set('contactPage.address.mapEmbedUrl', v)} placeholder="https://maps.google.com/embed?..." />
            </div>
          </section>
        </div>
      );

      case 'Footer': return (
        <div className="space-y-6">
          <Field label="Footer Tagline" value={config.footer.tagline} onChange={v => set('footer.tagline', v)} rows={2} />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Phone" value={config.footer.phone} onChange={v => set('footer.phone', v)} />
            <Field label="Email" value={config.footer.email} onChange={v => set('footer.email', v)} />
            <Field label="Address (short)" value={config.footer.address} onChange={v => set('footer.address', v)} />
          </div>
          <ArrayEditor label="Social Media Links" items={config.footer.socialLinks} onChange={v => set('footer.socialLinks', v)}
            onAdd={() => set('footer.socialLinks', [...(config.footer.socialLinks || []), { platform: '', url: '' }])}
            renderItem={(item, _, update) => (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Platform (e.g. Instagram)" value={item.platform} onChange={v => update('platform', v)} placeholder="Instagram" />
                <Field label="Profile URL" value={item.url} onChange={v => update('url', v)} placeholder="https://instagram.com/..." />
              </div>
            )}
          />
        </div>
      );

      default: return null;
    }
  };

  // Special case for "What Sets Us Apart" points - single string array
  const patchedRenderContent = () => {
    if (!config) return null;
    return renderTabContent();
  };

  if (loading && clients.length === 0) return (
    <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Globe size={22} /></div>
          <div>
            <h2 className="text-lg font-black text-slate-800">White-Label Storefronts</h2>
            <p className="text-xs text-slate-400 font-medium">Manage public website content for each institute</p>
          </div>
        </div>
      </div>

      <div className="flex" style={{ minHeight: 700 }}>
        {/* Client List */}
        <div className="w-72 border-r border-slate-100 bg-slate-50 p-4 flex-shrink-0 overflow-y-auto">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Institute</p>
          <div className="space-y-1.5">
            {clients.map(c => (
              <div key={c._id} onClick={() => { setSelectedClient(c); loadClientConfig(c); setActiveTab('General'); }}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedClient?._id === c._id ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100' : 'border-transparent hover:border-slate-200 hover:bg-white bg-transparent'}`}
              >
                <p className="font-bold text-sm text-slate-800">{c.instituteName}</p>
                <p className="text-xs text-slate-400 truncate">{c.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          {!selectedClient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <Globe size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Select an institute to configure their storefront.</p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : config && (
            <>
              {/* Action Bar */}
              <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100">
                <div>
                  <p className="font-black text-slate-800">{selectedClient.instituteName}</p>
                  <a href={`/site/${config.domainName}`} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                    <ExternalLink size={10} /> Preview: /site/{config.domainName}
                  </a>
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all text-sm shadow-lg shadow-blue-500/20">
                  {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
                  Save Storefront
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100 px-6 bg-white gap-1">
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {patchedRenderContent()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
