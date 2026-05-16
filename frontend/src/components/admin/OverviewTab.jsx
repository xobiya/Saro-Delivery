import { 
    AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { HiOutlineBanknotes, HiOutlineUsers, HiOutlineBuildingStorefront, HiOutlineInboxStack, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineFire } from 'react-icons/hi2';

const OverviewTab = ({ stats, chartData }) => {
    const intelligenceCards = [
        { label: 'Intelligence Index', value: '84.2', icon: <HiOutlineFire />, color: 'bg-orange-500', trend: 'High Activity', isUp: true },
        { label: 'Active Sessions', value: stats.users, icon: <HiOutlineUsers />, color: 'bg-blue-500', trend: '+8.2%', isUp: true },
        { label: 'Market Velocity', value: stats.vendors, icon: <HiOutlineBuildingStorefront />, color: 'bg-indigo-500', trend: '-2.1%', isUp: false },
        { label: 'Gross Revenue', value: `${stats.revenue} ETB`, icon: <HiOutlineBanknotes />, color: 'bg-emerald-500', trend: '+18.7%', isUp: true },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {intelligenceCards.map((stat, i) => (
                    <div key={i} className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-10 rounded-bl-[5rem] group-hover:scale-110 transition-transform`}></div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center text-2xl shadow-lg`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">{stat.label}</p>
                        <h3 className="text-3xl font-black mt-2 tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Market Growth & Velocity</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Platform performance vs historical average</p>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-xl">
                            <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-[10px] font-black shadow-sm">7D</button>
                            <button className="px-4 py-2 text-slate-400 rounded-lg text-[10px] font-black">30D</button>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Demand Heatmap</h3>
                    <div className="space-y-6">
                        {[
                            { area: 'Arba Minch Central', load: 85 },
                            { area: 'Sikela District', load: 62 },
                            { area: 'University Zone', load: 45 },
                            { area: 'Industrial Suburb', load: 12 },
                        ].map((zone, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700">{zone.area}</span>
                                    <span className="text-[10px] font-black text-slate-900">{zone.load}% Load</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${zone.load > 80 ? 'bg-orange-500' : 'bg-slate-300'}`} style={{width: `${zone.load}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expansion Tip</p>
                        <p className="text-xs font-bold mt-2 leading-relaxed text-slate-300">University Zone is under-served. Consider onboarding 3-4 more vendors to capture lunch demand.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
