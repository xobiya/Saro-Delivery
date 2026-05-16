import { useState } from 'react';
import { HiOutlineBuildingStorefront, HiMiniStar, HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus, HiOutlinePhoto } from 'react-icons/hi2';
import Modal from './Modal';

const MerchantNetwork = ({ vendorsList, onUpdateVendor, onCreateVendor, onDeleteVendor }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        categories: '',
        status: 'active',
        imageUrl: '',
        rating: 4.5
    });

    const openCreateModal = () => {
        setEditingVendor(null);
        setFormData({ businessName: '', description: '', categories: '', status: 'active', imageUrl: '', rating: 4.5 });
        setIsModalOpen(true);
    };

    const openEditModal = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            businessName: vendor.businessName,
            description: vendor.description,
            categories: vendor.categories?.join(', ') || '',
            status: vendor.status || 'active',
            imageUrl: vendor.imageUrl || '',
            rating: vendor.rating || 4.5
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            categories: formData.categories.split(',').map(s => s.trim())
        };
        
        if (editingVendor) {
            onUpdateVendor(editingVendor._id, data);
        } else {
            onCreateVendor(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Merchant Network</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Monitoring {vendorsList.length} active service points</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all"
                >
                    <HiOutlinePlus size={20} /> Onboard Merchant
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vendorsList.map(vendor => (
                    <div key={vendor._id} className="bg-white rounded-[3.5rem] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all group relative">
                        <div className="aspect-[2/1] relative overflow-hidden bg-slate-100">
                            {vendor.imageUrl ? (
                                <img src={vendor.imageUrl} alt={vendor.businessName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <HiOutlinePhoto size={48} />
                                    <p className="text-[10px] font-black uppercase mt-2">No Profile Image</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                                <div>
                                    <h4 className="font-black text-2xl text-white tracking-tight leading-none">{vendor.businessName}</h4>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="flex text-[10px] text-yellow-400">
                                            {[...Array(5)].map((_, i) => <HiMiniStar key={i} className={i < Math.floor(vendor.rating || 0) ? 'fill-current' : 'text-white/30'} />)}
                                        </div>
                                        <span className="text-white text-xs font-black">{vendor.rating || '4.5'}</span>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    vendor.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                }`}>
                                    {vendor.status || 'Active'}
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{vendor.description || 'Dedicated food service provider in the Saro Network.'}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-6">
                                {vendor.categories?.slice(0, 3).map(c => (
                                    <span key={c} className="bg-slate-50 text-slate-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">{c}</span>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => openEditModal(vendor)}
                                        className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <HiOutlinePencilSquare size={20} />
                                    </button>
                                    <button 
                                        onClick={() => onDeleteVendor(vendor._id)}
                                        className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <HiOutlineTrash size={20} />
                                    </button>
                                </div>
                                <button className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">View Analytics →</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingVendor ? 'Modify Merchant Identity' : 'Onboard New Merchant'}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Merchant Banner URL</label>
                            <input
                                type="text"
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                placeholder="Paste image URL here..."
                                value={formData.imageUrl}
                                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Business Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                    value={formData.businessName}
                                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Rating</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    max="5"
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                    value={formData.rating}
                                    onChange={e => setFormData({...formData, rating: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Portfolio</label>
                            <textarea
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm h-32"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category Tags (Comma separated)</label>
                            <input
                                type="text"
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                placeholder="Traditional, Vegan, Pizza"
                                value={formData.categories}
                                onChange={e => setFormData({...formData, categories: e.target.value})}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl hover:bg-slate-800 transition-all mt-4 uppercase tracking-widest text-xs">
                        {editingVendor ? 'Update Network Profile' : 'Activate Merchant'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default MerchantNetwork;
