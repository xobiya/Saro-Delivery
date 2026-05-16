import { useState } from 'react';
import { HiOutlineUserCircle, HiOutlineShieldCheck, HiOutlineEnvelope, HiOutlinePhone, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineArrowDownTray } from 'react-icons/hi2';

const UserHub = ({ usersList, onUpdateUser }) => {
    const customers = usersList.filter(u => u.role === 'customer');
    
    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["Name,Email,Role,Status", ...usersList.map(u => `${u.name},${u.email},${u.role},Active`)].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "saro_users.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Customer Repository</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Managing {customers.length} active platform identities</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all"
                >
                    <HiOutlineArrowDownTray size={20} /> Data Export (CSV)
                </button>
            </div>

            <div className="bg-white rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                            <th className="px-10 py-8">User Identity</th>
                            <th className="px-10 py-8">Engagement</th>
                            <th className="px-10 py-8">Account Status</th>
                            <th className="px-10 py-8 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {customers.map(customer => (
                            <tr key={customer._id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-100 rounded-[2rem] overflow-hidden flex items-center justify-center font-black text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all border-4 border-white shadow-xl">
                                            {customer.avatarUrl ? (
                                                <img src={customer.avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <HiOutlineUserCircle size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg leading-none">{customer.name}</p>
                                            <div className="flex items-center gap-3 mt-2 text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <HiOutlineEnvelope size={12} />
                                                    <span className="text-[10px] font-bold">{customer.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <HiOutlinePhone size={12} />
                                                    <span className="text-[10px] font-bold">{customer.phone || 'No phone'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-900">12 Total Orders</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">LTV: 4,500 ETB</p>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-2 text-emerald-500">
                                        <HiOutlineShieldCheck size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Identity</span>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                            <HiOutlinePencilSquare size={20} />
                                        </button>
                                        <button className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
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
    );
};

export default UserHub;
