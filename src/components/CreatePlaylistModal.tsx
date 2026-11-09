import React, { useState } from 'react';
import { X } from 'lucide-react';
import { catalogService } from '../services/catalogService';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: (playlistId: string) => void;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onPlaylistCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPl = catalogService.createPlaylist(title.trim(), description.trim(), coverUrl);
    setTitle('');
    setDescription('');
    onClose();
    if (onPlaylistCreated) {
      onPlaylistCreated(newPl.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm p-6 rounded-xl bg-[#181818] border border-[#2b2b2b] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-white rounded-md hover:bg-[#242424] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-semibold text-[#F5F5F5] mb-1">Create Playlist</h3>
        <p className="text-xs text-[#A1A1A1] mb-4">Curate your own mood and collection</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Art Preview & Presets */}
          <div>
            <label className="text-[11px] font-medium text-[#A1A1A1] block mb-2">
              Artwork Cover
            </label>
            <div className="flex items-center gap-2.5">
              <img
                src={coverUrl}
                alt=""
                className="w-14 h-14 rounded-md object-cover border border-[#303030] bg-[#242424] shrink-0"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_COVERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverUrl(preset)}
                    className={`w-8 h-8 rounded overflow-hidden border transition-all ${
                      coverUrl === preset ? 'border-[#B7A0FF] ring-1 ring-[#B7A0FF]' : 'border-[#2b2b2b] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Ambient"
              className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-lg text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#B7A0FF] transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#A1A1A1] block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or mood description..."
              className="w-full px-3 py-2 bg-[#101010] border border-[#2b2b2b] rounded-lg text-xs text-white placeholder-[#525252] focus:outline-none focus:border-[#B7A0FF] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#737373] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#F5F5F5] hover:bg-white text-black font-medium text-xs transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
