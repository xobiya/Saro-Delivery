import { useState } from 'react';
import { HiOutlineTruck, HiOutlineShieldCheck, HiOutlineBanknotes, HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus, HiOutlinePhoto } from 'react-icons/hi2';
import Modal from './Modal';

const FleetHub = ({ usersList, onUpdateUser, onCreateDriver, onDeleteDriver }) => {
    const drivers = usersList.filter(u => u.role === 'driver');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleDetails: 'Motorcycle',
        licensePlate: '',
        avatarUrl: ''
    });

    const openCreateModal = () => {
        setEditingDriver(null);
        setFormData({ name: '', email: '', phone: '', password: '', vehicleDetails: 'Motorcycle', licensePlate: '', avatarUrl: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name,
            email: driver.email,
            phone: driver.phone || '',
            password: '',
            vehicleDetails: driver.vehicleDetails || 'Motorcycle',
            licensePlate: driver.licensePlate || '',
            avatarUrl: driver.avatarUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingDriver) {
            onUpdateUser(editingDriver._id, formData);
        } else {
            onCreateDriver({ ...formData, role: 'driver' });
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Command</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Managing {drivers.length} active operators</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-3xl font-black text-sm shadow-xl hover:scale-105 transition-all"
                >
                    <HiOutlinePlus size={20} /> Deploy Operator
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm group hover:bg-slate-900 transition-all duration-700">
                        <HiOutlineBanknotes className="text-orange-500 text-4xl mb-6 group-hover:scale-110 transition-transform" />
                        <h5 className="text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-slate-500">Fleet Revenue (MTD)</h5>
                        <p className="text-3xl font-black text-slate-900 mt-2 group-hover:text-white">124,500 <span className="text-xs font-bold">ETB</span></p>
                    </div>
                    <div className="bg-orange-500 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                            <HiOutlineShieldCheck size={120} />
                        </div>
                        <h5 className="text-orange-100 text-[10px] font-black uppercase tracking-widest">Platform Trust Score</h5>
                        <p className="text-4xl font-black mt-2">98.2%</p>
                        <p className="text-[10px] font-bold mt-4 uppercase tracking-tighter opacity-80">Safety protocol compliant</p>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <th className="px-10 py-8">Operator Identity</th>
                                <th className="px-10 py-8">Asset & Logistics</th>
                                <th className="px-10 py-8">Performance</th>
                                <th className="px-10 py-8 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {drivers.map(driver => (
                                <tr key={driver._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-100 rounded-[2rem] overflow-hidden flex items-center justify-center font-black text-slate-500 group-hover:shadow-xl transition-all border-4 border-white">
                                                {driver.avatarUrl ? (
                                                    <img src={driver.avatarUrl} alt={driver.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl">{driver.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg leading-none">{driver.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{driver.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <HiOutlineTruck className="text-orange-500" />
                                            <span className="text-sm font-black text-slate-700">{driver.vehicleDetails || 'Motorcycle'}</span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Plate: {driver.licensePlate || 'SARO-482'}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="font-black text-slate-900 text-lg">4,200 ETB</p>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Top Performer</span>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => openEditModal(driver)}
                                                className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            >
                                                <HiOutlinePencilSquare size={20} />
                                            </button>
                                            <button 
                                                onClick={() => onDeleteDriver(driver._id)}
                                                className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <HiOutlineTrash size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDriver ? 'Modify Operator Identity' : 'Register New Fleet Asset'}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avatar Resource URL</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                placeholder="Paste image URL..."
                                value={formData.avatarUrl}
                                onChange={e => setFormData({...formData, avatarUrl: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operator Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Link (Phone)</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vehicle Specification</label>
                                <select 
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                    value={formData.vehicleDetails}
                                    onChange={e => setFormData({...formData, vehicleDetails: e.target.value})}
                                >
                                    <option value="Motorcycle">Motorcycle</option>
                                    <option value="Bicycle">Bicycle</option>
                                    <option value="Car">Car</option>
                                    <option value="Walking">Walking</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">License Identification</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-slate-900 text-sm"
                                    placeholder="AA-2-B12345"
                                    value={formData.licensePlate}
                                    onChange={e => setFormData({...formData, licensePlate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[2.5rem] shadow-2xl hover:bg-slate-800 transition-all mt-4 uppercase tracking-widest text-xs">
                        {editingDriver ? 'Commit Operator Updates' : 'Activate Fleet Asset'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default FleetHub;
