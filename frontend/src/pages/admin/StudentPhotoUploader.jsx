import { useState } from 'react';
import API_BASE_URL from '../../lib/utils';
import { 
    Camera, 
    Upload, 
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentPhotoUploader({ studentId, currentPhoto, onPhotoUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an image file');
    setUploading(true);

    const formData = new FormData();
    formData.append('photo', file);

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE_URL}/students/photo/${studentId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Photo uploaded successfully');
        onPhotoUpdate && onPhotoUpdate(data.photo);
        setFile(null);
        setPreview(null);
      } else {
        toast.error(data.msg || 'Upload failed');
      }
    } catch (error) {
      toast.error('Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const displayPhoto = preview || (currentPhoto ? (currentPhoto.startsWith('http') ? currentPhoto : `${API_BASE_URL.replace('/api', '')}${currentPhoto}`) : null);

  return (
    <div className="space-y-4">
        <div className="relative w-32 h-32 mx-auto">
            <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center">
                {displayPhoto ? (
                    <img src={displayPhoto} alt="Student" className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon size={32} className="text-slate-300" />
                )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-lg shadow-md border-2 border-white">
                <Camera size={14} />
            </div>
        </div>
        
        <form onSubmit={handleUpload} className="space-y-3">
            <div className="relative group">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="p-2 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                    <Upload size={14} className="text-slate-400 group-hover:text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {file ? file.name : 'Change Photo'}
                    </span>
                </div>
            </div>
            <button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
        </form>
    </div>
  );
}
