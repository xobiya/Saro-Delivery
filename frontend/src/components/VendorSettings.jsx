import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import ToastContext from '../context/ToastContext';
import { FaStore, FaClock, FaMapMarkerAlt, FaFileInvoiceDollar, FaTruck, FaSpinner } from 'react-icons/fa';

const VendorSettings = () => {
    const { user } = useContext(AuthContext);
    const { addToast } = useContext(ToastContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Vendor profile data model
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
        preparationTime: 30, // in minutes
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
            // Assume we have an endpoint to get the vendor's own profile
            const { data } = await api.get('/vendors/me');
            if (data) {
                setVendorData(prev => ({
                    ...prev,
                    ...data,
                    // ensure operating hours exist
                    operatingHours: data.operatingHours || prev.operatingHours,
                    bankDetails: data.bankDetails || prev.bankDetails,
                    categories: data.categories || []
                }));
            }
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            // Don't show error toast if it's just a 404 meaning no profile yet
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

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        const categories = value.split(',').map(c => c.trim()).filter(c => c);
        setVendorData(prev => ({ ...prev, categories }));
    };

    const handleHoursChange = (day, field, value) => {
        setVendorData(prev => ({
            ...prev,
            operatingHours: {
                ...prev.operatingHours,
                [day]: {
                    ...prev.operatingHours[day],
                    [field]: field === 'closed' ? value : value
                }
            }
        }));
    };

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setVendorData(prev => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/vendors/me', vendorData);
            addToast('Vendor profile updated successfully', 'success');
        } catch (error) {
            console.error('Error saving vendor profile:', error);
            addToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <FaSpinner className="animate-spin text-orange-500 text-3xl" />
            </div>
        );
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4">
                <nav className="space-y-2">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'general' ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaStore /> General Info
                    </button>
                    <button 
                        onClick={() => setActiveTab('operations')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'operations' ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaClock /> Operating Hours
                    </button>
                    <button 
                        onClick={() => setActiveTab('delivery')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'delivery' ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaTruck /> Delivery & Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('finance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'finance' ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaFileInvoiceDollar /> Financial
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                    
                    {/* General Info Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">General Information</h3>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={vendorData.businessName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="e.g. Saro's Kitchen"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={vendorData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
                                    placeholder="Describe your restaurant..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Categories (comma separated)</label>
                                <input
                                    type="text"
                                    value={vendorData.categories.join(', ')}
                                    onChange={handleCategoryChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Restaurant, Ethiopian, Fast Food"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Business Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={vendorData.address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Full street address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Banner Image URL</label>
                                <input
                                    type="text"
                                    name="bannerUrl"
                                    value={vendorData.bannerUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {vendorData.bannerUrl && (
                                    <div className="mt-4 rounded-xl overflow-hidden h-40 border border-gray-200">
                                        <img src={vendorData.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Operating Hours Tab */}
                    {activeTab === 'operations' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex justify-between items-center">
                                <span>Operating Hours</span>
                                <label className="flex items-center cursor-pointer text-sm">
                                    <span className="mr-3 font-medium text-gray-600">Store is Open Now</span>
                                    <div className="relative">
                                        <input type="checkbox" name="isOpen" checked={vendorData.isOpen} onChange={handleChange} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${vendorData.isOpen ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${vendorData.isOpen ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                            </h3>
                            
                            <div className="space-y-4">
                                {days.map(day => (
                                    <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-28 font-bold capitalize text-gray-700">
                                            {day}
                                        </div>
                                        <div className="flex-1 flex items-center gap-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="mr-2 rounded text-orange-500 focus:ring-orange-500 w-4 h-4"
                                                    checked={vendorData.operatingHours[day].closed}
                                                    onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                                                />
                                                <span className="text-sm font-medium text-gray-600">Closed</span>
                                            </label>
                                            
                                            {!vendorData.operatingHours[day].closed && (
                                                <div className="flex items-center gap-2 ml-auto">
                                                    <input 
                                                        type="time" 
                                                        value={vendorData.operatingHours[day].open}
                                                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                                    />
                                                    <span className="text-gray-400">to</span>
                                                    <input 
                                                        type="time" 
                                                        value={vendorData.operatingHours[day].close}
                                                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Delivery & Orders Tab */}
                    {activeTab === 'delivery' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Delivery & Order Settings</h3>
                            
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
                                <label className="flex items-center cursor-pointer justify-between">
                                    <div>
                                        <span className="font-bold text-gray-800 block">Offer Delivery</span>
                                        <span className="text-sm text-gray-500">Allow customers to order delivery</span>
                                    </div>
                                    <div className="relative">
                                        <input type="checkbox" name="deliveryAvailable" checked={vendorData.deliveryAvailable} onChange={handleChange} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${vendorData.deliveryAvailable ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${vendorData.deliveryAvailable ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                                
                                <div className="border-t border-gray-200 my-4"></div>
                                
                                <label className="flex items-center cursor-pointer justify-between">
                                    <div>
                                        <span className="font-bold text-gray-800 block">Offer Pickup</span>
                                        <span className="text-sm text-gray-500">Allow customers to pick up orders</span>
                                    </div>
                                    <div className="relative">
                                        <input type="checkbox" name="pickupAvailable" checked={vendorData.pickupAvailable} onChange={handleChange} className="sr-only" />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${vendorData.pickupAvailable ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${vendorData.pickupAvailable ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Order Amount (ETB)</label>
                                    <input
                                        type="number"
                                        name="minimumOrder"
                                        value={vendorData.minimumOrder}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Default Prep Time (Mins)</label>
                                    <input
                                        type="number"
                                        name="preparationTime"
                                        value={vendorData.preparationTime}
                                        onChange={handleChange}
                                        min="5"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Tab */}
                    {activeTab === 'finance' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Financial Information</h3>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tax ID / TIN</label>
                                <input
                                    type="text"
                                    name="taxId"
                                    value={vendorData.taxId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Enter your Tax Identification Number"
                                />
                            </div>

                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <FaFileInvoiceDollar /> Bank Account Details
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Bank Name</label>
                                        <input
                                            type="text"
                                            name="bankName"
                                            value={vendorData.bankDetails?.bankName || ''}
                                            onChange={handleBankChange}
                                            className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="e.g. Commercial Bank of Ethiopia"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Account Name</label>
                                            <input
                                                type="text"
                                                name="accountName"
                                                value={vendorData.bankDetails?.accountName || ''}
                                                onChange={handleBankChange}
                                                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Account Number</label>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={vendorData.bankDetails?.accountNumber || ''}
                                                onChange={handleBankChange}
                                                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <FaSpinner className="animate-spin" /> : null}
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorSettings;
