import { useState, useEffect } from 'react';
import { HiOutlineChatBubbleLeftRight, HiOutlineCheckBadge, HiOutlineArrowPath } from 'react-icons/hi2';
import api from '../../utils/api';

const SupportCenter = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/tickets');
            setTickets(res.data);
        } catch (error) {
            console.error('Failed to fetch support tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (ticketId, status) => {
        try {
            await api.put(`/admin/tickets/${ticketId}`, { status });
            fetchTickets();
        } catch (error) {
            alert('Failed to update ticket status');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Support Center</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Resolution & Conflict Management</p>
                </div>
                <button onClick={fetchTickets} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50">
                    <HiOutlineArrowPath className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Active Tickets</h4>
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black">{tickets.filter(t => t.status !== 'resolved').length} Outstanding</span>
                    </div>
                    
                    {loading ? (
                        <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                    ) : tickets.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">No active support cases</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {tickets.map(ticket => (
                                <div key={ticket._id} className="p-8 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            <HiOutlineChatBubbleLeftRight size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">#{ticket._id.slice(-6)}</span>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                    ticket.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                                                }`}>{ticket.priority}</span>
                                            </div>
                                            <p className="font-black text-slate-900 text-lg mt-1">{ticket.subject}</p>
                                            <p className="text-sm font-bold text-slate-400">{ticket.user?.name || 'Unknown User'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <select 
                                            value={ticket.status} 
                                            onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-orange-500 cursor-pointer focus:ring-0"
                                        >
                                            <option value="open">Open</option>
                                            <option value="pending">Pending</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                        <button className="text-[10px] font-black text-blue-500 uppercase hover:underline">View Thread</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-20 rounded-bl-[5rem]"></div>
                        <h4 className="font-black text-lg mb-6">SLA Performance</h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Avg. First Response</p>
                                <p className="text-2xl font-black mt-1">14 Mins</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Resolution Rate</p>
                                <p className="text-2xl font-black mt-1">94.2%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <HiOutlineCheckBadge size={32} />
                        </div>
                        <h4 className="font-black text-slate-900 tracking-tight">AI Moderation</h4>
                        <p className="text-xs text-slate-400 font-bold mt-2 leading-relaxed">System is screening incoming tickets for keyword patterns.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportCenter;
