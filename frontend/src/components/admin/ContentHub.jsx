import { useState } from 'react';
import { HiOutlineMegaphone, HiOutlinePhoto, HiOutlineChatBubbleBottomCenterText, HiOutlineBolt } from 'react-icons/hi2';

const ContentHub = () => {
    const [activeSubTab, setActiveSubTab] = useState('notifications');

    const banners = [
        { id: 1, title: 'Ramadan Special', image: 'banner1.jpg', status: 'active' },
        { id: 2, title: 'Free Delivery Weekend', image: 'banner2.jpg', status: 'draft' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Growth & Content</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Marketing automation & CMS control</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                        onClick={() => setActiveSubTab('notifications')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'notifications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                    >
                        Notifications
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('banners')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'banners' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                    >
                        Banners & CMS
                    </button>
                </div>
            </div>

            {activeSubTab === 'notifications' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                            <HiOutlineMegaphone className="text-orange-500" /> Dispatch Global Broadcast
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Audience</label>
                                <select className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 font-bold text-sm">
                                    <option>All Platform Users</option>
                                    <option>Active Customers Only</option>
                                    <option>Delivery Fleet</option>
                                    <option>Merchant Partners</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Message Headline</label>
                                <input className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 font-bold text-sm" placeholder="e.g. Lunch deals are live!" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Push Content</label>
                                <textarea className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 font-bold text-sm h-32" placeholder="Write your notification content..."></textarea>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-orange-500" />
                                    <span className="text-xs font-bold text-slate-600">Also send SMS fallback</span>
                                </label>
                            </div>
                            <button className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">
                                <HiOutlineBolt /> Trigger Broadcast
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl space-y-8">
                        <h4 className="font-black uppercase text-xs tracking-widest flex items-center gap-2">
                            <HiOutlineChatBubbleBottomCenterText className="text-orange-500" /> Automated Templates
                        </h4>
                        <div className="space-y-4">
                            {[
                                { event: 'Order Confirmed', channels: 'Push, Email, SMS' },
                                { event: 'Driver Assigned', channels: 'Push' },
                                { event: 'Out for Delivery', channels: 'Push, SMS' },
                                { event: 'Promotional Friday', channels: 'Push, Email' },
                            ].map((tmpl, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                                    <div>
                                        <p className="font-black text-sm">{tmpl.event}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{tmpl.channels}</p>
                                    </div>
                                    <button className="text-[10px] font-black text-orange-500 uppercase">Edit Template</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {banners.map(banner => (
                        <div key={banner.id} className="bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-sm group">
                            <div className="aspect-[2/1] bg-slate-100 flex items-center justify-center relative">
                                <HiOutlinePhoto size={48} className="text-slate-300 group-hover:scale-110 transition-transform" />
                                <span className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                                    banner.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                                }`}>{banner.status}</span>
                            </div>
                            <div className="p-8">
                                <h4 className="font-black text-lg text-slate-900">{banner.title}</h4>
                                <div className="mt-6 flex justify-between items-center">
                                    <button className="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors">Edit Asset</button>
                                    <button className="text-xs font-black text-rose-500 hover:underline uppercase">Deactivate</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="aspect-[2/1] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-orange-500 hover:text-orange-500 transition-all">
                        <HiOutlinePlus size={32} className="mb-2" />
                        <span className="font-black text-xs uppercase tracking-widest">New Banner</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const HiOutlinePlus = ({ size, className }) => <svg className={className} width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

export default ContentHub;
