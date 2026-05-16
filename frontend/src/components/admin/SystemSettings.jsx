import { HiOutlineShieldCheck, HiOutlineReceiptPercent, HiOutlineGlobeAlt, HiOutlineCommandLine } from 'react-icons/hi2';

const SystemSettings = () => {
    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Platform logic & role-based access control</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Commission Config */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                            <HiOutlineReceiptPercent size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">Fee Configurator</h4>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Base Commission (%)</label>
                            <input type="number" defaultValue={15} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Delivery Base (ETB)</label>
                                <input type="number" defaultValue={50} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-900" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Per KM Charge</label>
                                <input type="number" defaultValue={12} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-900" />
                            </div>
                        </div>
                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20">Apply Global Changes</button>
                    </div>
                </div>

                {/* RBAC Config */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                            <HiOutlineShieldCheck size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">Access Control (RBAC)</h4>
                    </div>
                    
                    <div className="space-y-3">
                        {['Super Admin', 'Support Lead', 'Finance Analyst', 'Dispatcher'].map(role => (
                            <div key={role} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                <span className="font-bold text-slate-700 text-sm">{role}</span>
                                <button className="text-[10px] font-black text-blue-500 uppercase">Edit Perms</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operational Zoning */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                            <HiOutlineGlobeAlt size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">Geofencing & Zoning</h4>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Define operational boundaries and set region-specific surge pricing (e.g. Arba Minch Central vs Suburbs).
                    </p>
                    <button className="text-xs font-black text-emerald-600 uppercase tracking-widest">Manage 12 Active Zones</button>
                </div>

                {/* Audit Logs */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                            <HiOutlineCommandLine size={24} />
                        </div>
                        <h4 className="font-black uppercase text-sm tracking-tight">System Audit Trail</h4>
                    </div>
                    <div className="space-y-4 opacity-70">
                        <div className="text-[10px] border-b border-white/10 pb-2">
                            <span className="text-orange-500 font-black">14:02</span> - Admin-01 approved Vendor payout
                        </div>
                        <div className="text-[10px] border-b border-white/10 pb-2">
                            <span className="text-orange-500 font-black">13:45</span> - System changed commission to 15%
                        </div>
                        <div className="text-[10px]">
                            <span className="text-orange-500 font-black">12:10</span> - Admin-02 suspended User ID #482
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
