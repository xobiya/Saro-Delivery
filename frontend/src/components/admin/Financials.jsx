import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { HiOutlineBanknotes, HiOutlineArrowTrendingUp, HiOutlineArrowDownTray } from 'react-icons/hi2';

const Financials = ({ chartData }) => {
    const financialStats = [
        { label: 'Platform Sales (GMV)', value: '1.2M ETB', trend: '+14%', color: 'bg-orange-500' },
        { label: 'Commission Earned', value: '185,000 ETB', trend: '+8%', color: 'bg-slate-900' },
        { label: 'Delivery Fees', value: '64,200 ETB', trend: '+22%', color: 'bg-emerald-500' },
        { label: 'Ad Spending', value: '12,000 ETB', trend: '-5%', color: 'bg-rose-500' },
    ];

    const COLORS = ['#f97316', '#0f172a', '#10b981', '#f43f5e'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Audit trail & profitability analysis</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all">
                    <HiOutlineArrowDownTray size={18} /> Export Tax Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {financialStats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-[0.03] rounded-bl-[4rem] group-hover:scale-110 transition-transform`}></div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{stat.value}</h4>
                        <span className={`text-[10px] font-black mt-4 inline-block px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {stat.trend} vs last month
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight mb-8">Revenue Breakdown</h4>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} fill="rgba(249, 115, 22, 0.05)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight mb-8">Channel Profitability</h4>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Food', val: 4000 },
                                { name: 'Grocery', val: 3000 },
                                { name: 'Pharmacy', val: 2000 },
                                { name: 'Pick-up', val: 2780 },
                            ]}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                                <Bar dataKey="val" radius={[15, 15, 0, 0]} barSize={50}>
                                    {[0,1,2,3].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Financials;
