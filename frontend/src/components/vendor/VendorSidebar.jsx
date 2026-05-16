import { 
    HiOutlineInboxStack, 
    HiOutlineClipboardDocumentList, 
    HiOutlineChartBar, 
    HiOutlineChatBubbleLeftEllipsis, 
    HiOutlineCog6Tooth,
    HiOutlineArrowRightOnRectangle,
    HiOutlineFire
} from 'react-icons/hi2';

const VendorSidebar = ({ activeTab, setActiveTab, isSidebarOpen, logout, vendorName }) => {
    const menuItems = [
        { id: 'orders', icon: <HiOutlineInboxStack />, label: 'Kitchen Pipeline' },
        { id: 'menu', icon: <HiOutlineClipboardDocumentList />, label: 'Menu Editor' },
        { id: 'analytics', icon: <HiOutlineChartBar />, label: 'Store Insights' },
        { id: 'reviews', icon: <HiOutlineChatBubbleLeftEllipsis />, label: 'Customer Voice' },
        { id: 'settings', icon: <HiOutlineCog6Tooth />, label: 'Store Settings' },
    ];

    return (
        <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col fixed h-full z-50 overflow-y-auto no-scrollbar shadow-2xl`}>
            <div className="p-8 flex items-center gap-4 border-b border-white/5">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 shrink-0">
                    <HiOutlineFire size={24} className="animate-pulse" />
                </div>
                {isSidebarOpen && (
                    <div className="overflow-hidden">
                        <p className="font-black text-white text-lg tracking-tight truncate">{vendorName || 'Saro Partner'}</p>
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Merchant Pro</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-4 py-10 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                            activeTab === item.id 
                            ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <span className={`text-2xl ${activeTab === item.id ? 'text-white' : 'group-hover:text-orange-500'}`}>{item.icon}</span>
                        {isSidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="p-6 border-t border-white/5">
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                >
                    <HiOutlineArrowRightOnRectangle size={24} />
                    {isSidebarOpen && <span className="font-bold text-sm">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default VendorSidebar;
