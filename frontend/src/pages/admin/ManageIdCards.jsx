import { useState, useEffect } from 'react';
import API_BASE_URL from '../../lib/utils';
import { 
    CreditCard, 
    Download, 
    Trash2, 
    Search, 
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ManageIdCardsSection({ token }) {
  const [idCards, setIdCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/id-cards/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setIdCards(await res.json());
    } catch (error) {
      toast.error('Failed to fetch ID cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleDownload = async (card) => {
    try {
      const res = await fetch(`${API_BASE_URL}/id-cards/${card._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('PDF download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IDCard-${card.studentId?.name ? card.studentId.name.replace(/\s/g, '') : 'Unknown'}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('ID Card downloaded');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRevoke = async (card) => {
    if (!window.confirm("Revoke/delete this ID Card?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/id-cards/${card._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('ID Card revoked');
        fetchData();
      } else {
        toast.error('Failed to revoke');
      }
    } catch (error) {
      toast.error('Error revoking ID card');
    }
  };

  const filteredCards = idCards.filter(card => 
    (card.studentId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.studentId?.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-card p-8 mt-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Manage Student ID Cards</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search Name / Roll No..." 
                    className="admin-input pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll No</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Valid Through</th>
                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        <tr><td colSpan="6" className="p-10 text-center"><Loader2 size={24} className="animate-spin text-slate-300 mx-auto" /></td></tr>
                    ) : filteredCards.length === 0 ? (
                        <tr><td colSpan="6" className="p-10 text-center text-slate-400">No ID cards found</td></tr>
                    ) : (
                        filteredCards.map(card => (
                            <tr key={card._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-4 text-sm font-medium text-slate-900">{card.studentId?.name || '-'}</td>
                                <td className="px-4 py-4 text-sm text-slate-500">{card.studentId?.rollNumber || '-'}</td>
                                <td className="px-4 py-4 text-sm text-slate-500">{card.studentId?.batch || '-'}</td>
                                <td className="px-4 py-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        card.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {card.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-500">
                                    {card.validThrough ? new Date(card.validThrough).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleDownload(card)} 
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleRevoke(card)} 
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Revoke"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
