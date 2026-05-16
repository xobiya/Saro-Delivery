import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { 
    HiOutlineBuildingStorefront, 
    HiOutlineClock, 
    HiOutlineMapPin, 
    HiOutlineCreditCard, 
    HiOutlineTruck, 
    HiOutlinePhoto,
    HiOutlineArrowPath
} from 'react-icons/hi2';

const VendorSettings = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [vendorData, setVendorData] = useState({
        businessName: '',
        description: '',
        categories: [],
        address: '',
        bannerUrl: '',
        isOpen: true,
        deliveryAvailable: true,
        pickupAvailable: true,
        minimumOrder: 0,
        preparationTime: 30,
        operatingHours: {
            monday: { open: '09:00', close: '22:00', closed: false },
            tuesday: { open: '09:00', close: '22:00', closed: false },
            wednesday: { open: '09:00', close: '22:00', closed: false },
            thursday: { open: '09:00', close: '22:00', closed: false },
            friday: { open: '09:00', close: '23:00', closed: false },
            saturday: { open: '10:00', close: '23:00', closed: false },
            sunday: { open: '10:00', close: '21:00', closed: false },
        },
        bankDetails: { accountName: '', accountNumber: '', bankName: '' },
        taxId: ''
    });

    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchVendorProfile();
    }, []);

    const fetchVendorProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/vendors/me');
            if (data) {
                setVendorData(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error fetching vendor profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setVendorData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/vendors/me', vendorData);
            addToast('Merchant profile updated successfully', 'success');
        } catch (error) {
            addToast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-40">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const tabs = [
        { id: 'general', icon: <HiOutlineBuildingStorefront />, label: 'Store Identity' },
        { id: 'operations', icon: <HiOutlineClock />, label: 'Operating Hours' },
        { id: 'delivery', icon: <HiOutlineTruck />, label: 'Logistics' },
        { id: 'finance', icon: <HiOutlineCreditCard />, label: 'Financials' },
    ];

    return (
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in duration-700">
            {/* Nav */}
            <div className="w-full md:w-80 bg-slate-50/50 border-r border-slate-100 p-8">
                <div className="mb-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Configuration</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global merchant settings</p>
                </div>
                <nav className="space-y-3">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-orange-500 shadow-xl shadow-slate-200/50 scale-105' 
                                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100/50'
                            }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Form */}
            <div className="flex-1 p-12">
                <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Merchant Banner Asset</label>
                                <div className="group relative rounded-3xl overflow-hidden bg-slate-100 aspect-[3/1] border-2 border-dashed border-slate-200 hover:border-orange-500 transition-all cursor-pointer">
                                    {vendorData.bannerUrl ? (
                                        <img src={vendorData.bannerUrl} className="w-full h-full object-cover" alt="Banner" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                            <HiOutlinePhoto size={40} />
                                            <span className="text-[10px] font-black uppercase mt-2">Upload Store Banner</span>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="text" 
                                    name="bannerUrl"
                                    value={vendorData.bannerUrl}
                                    onChange={handleChange}
                                    className="w-full mt-4 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" 
                                    placeholder="Paste Image URL..." 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Business Identity</label>
                                    <input name="businessName" value={vendorData.businessName} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" placeholder="Saro Kitchen Arba Minch" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Store Description</label>
                                    <textarea name="description" value={vendorData.description} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm h-32" placeholder="Tell customers about your kitchen..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                                <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-500 mb-6">Service Availability</h4>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="font-bold text-sm">Delivery Service</span>
                                        <input type="checkbox" name="deliveryAvailable" checked={vendorData.deliveryAvailable} onChange={handleChange} className="w-6 h-6 rounded-lg text-orange-500" />
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="font-bold text-sm">Pickup Service</span>
                                        <input type="checkbox" name="pickupAvailable" checked={vendorData.pickupAvailable} onChange={handleChange} className="w-6 h-6 rounded-lg text-orange-500" />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Min Order (ETB)</label>
                                    <input type="number" name="minimumOrder" value={vendorData.minimumOrder} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Avg Prep (Mins)</label>
                                    <input type="number" name="preparationTime" value={vendorData.preparationTime} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-10 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-3"
                        >
                            {saving ? <HiOutlineArrowPath className="animate-spin" /> : null}
                            Save Merchant Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorSettings;
