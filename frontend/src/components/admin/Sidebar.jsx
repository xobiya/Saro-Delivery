import { 
    HiOutlineQueueList, 
    HiOutlineUsers, 
    HiOutlineBuildingStorefront, 
    HiOutlineInboxStack, 
    HiOutlineArrowRightOnRectangle, 
    HiOutlineChartBar,
    HiOutlineMap,
    HiOutlineTruck,
    HiOutlineBanknotes,
    HiOutlineMegaphone,
    HiOutlineCog6Tooth,
    HiOutlineClipboardDocumentList,
    HiOutlineChatBubbleLeftRight,
    HiOutlineShieldCheck
} from 'react-icons/hi2';

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, logout }) => {
    const menuGroups = [
        {
            title: 'Control Center',
            items: [
                { id: 'overview', icon: <HiOutlineChartBar />, label: 'Dashboard' },
                { id: 'live-ops', icon: <HiOutlineMap />, label: 'Dispatch Center' },
                { id: 'orders', icon: <HiOutlineInboxStack />, label: 'Order Pipeline' },
            ]
        },
        {
            title: 'Inventory & Network',
            items: [
                { id: 'vendors', icon: <HiOutlineBuildingStorefront />, label: 'Restaurants' },
                { id: 'menu', icon: <HiOutlineClipboardDocumentList />, label: 'Menu Catalog' },
                { id: 'fleet', icon: <HiOutlineTruck />, label: 'Delivery Fleet' },
                { id: 'users', icon: <HiOutlineUsers />, label: 'Customers' },
            ]
        },
        {
            title: 'Business Engine',
            items: [
                { id: 'marketing', icon: <HiOutlineMegaphone />, label: 'Marketing' },
                { id: 'finance', icon: <HiOutlineBanknotes />, label: 'Financials' },
                { id: 'support', icon: <HiOutlineChatBubbleLeftRight />, label: 'Support Center' },
                { id: 'settings', icon: <HiOutlineCog6Tooth />, label: 'Security & RBAC' },
            ]
        }
    ];

    return (
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col fixed h-full z-50 overflow-y-auto no-scrollbar`}>
            <div className="p-6 flex items-center gap-3 border-b border-slate-800 shrink-0">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/40 shrink-0">
                    <HiOutlineQueueList size={20} />
                </div>
                {isSidebarOpen && <span className="font-display font-extrabold text-xl text-white tracking-tight uppercase">Saro <span className="text-orange-500">Pro</span></span>}
            </div>

            <nav className="flex-1 px-4 py-8 space-y-8">
                {menuGroups.map((group, idx) => (
                    <div key={idx} className="space-y-3">
                        {isSidebarOpen && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{group.title}</p>}
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <span className={`text-xl ${activeTab === item.id ? 'text-white' : 'group-hover:text-orange-500'}`}>{item.icon}</span>
                                    {isSidebarOpen && <span className="font-bold tracking-wide text-sm">{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 shrink-0">
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                    <HiOutlineArrowRightOnRectangle className="text-xl" />
                    {isSidebarOpen && <span className="font-bold text-sm">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
