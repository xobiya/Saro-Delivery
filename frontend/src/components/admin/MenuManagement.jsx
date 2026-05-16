import { useState, useEffect } from 'react';
import { HiOutlineQueueList, HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePhoto, HiOutlineTag } from 'react-icons/hi2';
import api from '../../utils/api';
import Modal from './Modal';

const MenuManagement = ({ vendorsList }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: 0,
        category: '',
        vendor: '',
        isEthiopian: false,
        imageUrl: '',
        variants: [],
        addOns: []
    });

    useEffect(() => {
        fetchProducts();
    }, [selectedVendor]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const url = selectedVendor ? `/products?vendorId=${selectedVendor}` : '/products';
            const res = await api.get(url);
            setProducts(res.data);
        } catch (error) {
            console.error('Failed to fetch menu items');
        } finally {
            setLoading(false);
        }
    };

    const handleAddVariant = () => {
        setFormData({ ...formData, variants: [...formData.variants, { name: '', price: 0 }] });
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            basePrice: product.basePrice || product.price || 0,
            category: product.category || '',
            vendor: product.vendor?._id || product.vendor || '',
            isEthiopian: product.isEthiopian || false,
            imageUrl: product.imageUrl || '',
            variants: product.variants || [],
            addOns: product.addOns || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            alert('Failed to save product');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Catalog Management</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Smart pricing & visual moderation</p>
                </div>
                <div className="flex gap-4">
                    <select 
                        className="bg-white border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm shadow-sm focus:ring-2 focus:ring-orange-500"
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                    >
                        <option value="">All Repositories</option>
                        {vendorsList.map(v => (
                            <option key={v._id} value={v._id}>{v.businessName}</option>
                        ))}
                    </select>
                    <button 
                        onClick={() => { setEditingProduct(null); setFormData({name:'', description:'', basePrice:0, category:'', vendor:'', isEthiopian:false, imageUrl:'', variants:[], addOns:[]}); setIsModalOpen(true); }}
                        className="bg-slate-900 text-white px-10 py-4 rounded-3xl font-black text-sm shadow-xl shadow-slate-900/10 flex items-center gap-2 hover:scale-105 transition-all"
                    >
                        <HiOutlinePlus size={20} /> Deploy Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-3 py-40 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8">Fetching Catalog Assets...</p>
                    </div>
                ) : products.map(product => (
                    <div key={product._id} className="bg-white rounded-[4rem] border border-slate-200/60 p-10 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                        <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                            {product.isEthiopian && (
                                <span className="bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Traditional</span>
                            )}
                            <span className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">{product.category}</span>
                        </div>

                        <div className="flex gap-8 mb-8">
                            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-inner flex flex-col items-center justify-center border-4 border-white shadow-xl">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <HiOutlinePhoto size={32} className="text-slate-200" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h4 className="font-black text-2xl text-slate-900 group-hover:text-orange-500 transition-colors leading-tight">{product.name}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <HiOutlineTag className="text-orange-500" size={14} />
                                    <p className="text-2xl font-black text-slate-900">{product.basePrice || product.price} <span className="text-xs font-bold text-slate-400">ETB</span></p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed h-10 mb-6">{product.description || 'Premium selection from our curated catalog.'}</p>

                        <div className="space-y-6 mt-auto">
                            {product.variants?.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Available Configurations</p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v, i) => (
                                            <span key={i} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-2xl text-[10px] font-black border border-slate-100">{v.name}: {v.price} ETB</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex gap-3">
                                    <button onClick={() => openEditModal(product)} className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><HiOutlinePencilSquare size={20} /></button>
                                    <button className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><HiOutlineTrash size={20} /></button>
                                </div>
                                <button className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${product.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {product.isAvailable ? 'Network Active' : 'Suspended'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Update Catalog Asset' : 'Deploy New Asset'}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Asset Visual URL</label>
                            <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" placeholder="Paste image link..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Product Name</label>
                                <input required className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Base Valuation (ETB)</label>
                                <input type="number" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categorization</label>
                                <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration Matrix (Variants)</label>
                                <button type="button" onClick={handleAddVariant} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-orange-500 shadow-sm">+ Add</button>
                            </div>
                            {formData.variants.map((v, i) => (
                                <div key={i} className="flex gap-4">
                                    <input className="flex-1 bg-white border-none rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm" placeholder="Label (e.g. Medium)" value={v.name} onChange={e => {
                                        const v2 = [...formData.variants]; v2[i].name = e.target.value; setFormData({...formData, variants: v2});
                                    }} />
                                    <input type="number" className="w-32 bg-white border-none rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm" placeholder="Price" value={v.price} onChange={e => {
                                        const v2 = [...formData.variants]; v2[i].price = e.target.value; setFormData({...formData, variants: v2});
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-all uppercase tracking-widest text-xs">Commit to Platform</button>
                </form>
            </Modal>
        </div>
    );
};

export default MenuManagement;
