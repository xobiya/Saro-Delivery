import { HiOutlineArrowPath, HiOutlinePlus, HiOutlineCalendarDays, HiOutlineTicket } from 'react-icons/hi2';

const PromotionsHub = ({ couponsList, newCoupon, setNewCoupon, handleCreateCoupon, isCreatingCoupon }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl overflow-hidden sticky top-28">
                    <div className="p-8 border-b border-slate-100 bg-slate-900 text-white">
                        <h3 className="text-xl font-extrabold tracking-tight">Campaign Creator</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">New Promo Strategy</p>
                    </div>
                    <form onSubmit={handleCreateCoupon} className="p-8 space-y-5">
                        <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Campaign Code</label>
                            <input
                                type="text"
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 uppercase font-black tracking-widest text-lg"
                                placeholder="PROMO2026"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Benefit Type</label>
                                <select
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                                    value={newCoupon.discountType}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                >
                                    <option value="percentage">% Percent</option>
                                    <option value="fixed">ETB Fixed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Value</label>
                                <input
                                    type="number"
                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                                    value={newCoupon.discountValue}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Expiration Protocol</label>
                            <input
                                type="date"
                                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                                value={newCoupon.expiresAt}
                                onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreatingCoupon}
                            className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-4"
                        >
                            {isCreatingCoupon ? <HiOutlineArrowPath className="animate-spin" /> : <><HiOutlinePlus /> Activate Campaign</>}
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-2xl font-extrabold text-slate-900">Active Campaigns</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
                                    <th className="px-8 py-4">Strategy Code</th>
                                    <th className="px-8 py-4">Benefit</th>
                                    <th className="px-8 py-4">Timeline</th>
                                    <th className="px-8 py-4 text-right">Metrics</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {couponsList.length === 0 ? (
                                    <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No active strategies found.</td></tr>
                                ) : couponsList.map(c => (
                                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center font-black uppercase text-xs">
                                                    <HiOutlineTicket />
                                                </div>
                                                <span className="font-black text-slate-900 uppercase tracking-widest">{c.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-extrabold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 text-sm">
                                                {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `${c.discountValue} ETB Off`}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                <HiOutlineCalendarDays className="text-slate-400" /> {new Date(c.expiresAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-slate-900 font-black text-lg">{c.usedCount || 0}</span>
                                            <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-widest">Conversions</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionsHub;
