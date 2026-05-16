import { HiOutlineBars3BottomLeft, HiOutlineBell, HiOutlineArrowUpTray } from 'react-icons/hi2';

const AdminHeader = ({ isSidebarOpen, setIsSidebarOpen, user, activeTab, onImport }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 sticky top-0 z-40 px-8 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                >
                    <HiOutlineBars3BottomLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeTab.replace('-', ' ')} View</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex bg-slate-100 p-1 rounded-xl items-center">
                    <button className="px-3 py-1.5 text-[10px] font-black uppercase bg-white text-slate-900 rounded-lg shadow-sm">EN</button>
                    <button className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400">አማ</button>
                </div>
                <label className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer">
                    <HiOutlineArrowUpTray size={16} /> Bulk Import
                    <input type="file" className="hidden" accept=".csv" onChange={onImport} />
                </label>
                <div className="relative group">
                    <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 relative">
                        <HiOutlineBell size={24} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                        <p className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest mt-1">Super Admin</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 shadow-sm">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
