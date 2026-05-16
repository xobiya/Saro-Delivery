import { HiOutlineQueueList, HiOutlineArrowDownTray } from 'react-icons/hi2';
import { exportToCSV } from '../../utils/exportUtils';

const OrderPipeline = ({ ordersList, onUpdateOrder }) => {
    const handleExport = () => {
        const exportData = ordersList.map(o => ({
            ID: o._id,
            Date: new Date(o.createdAt).toLocaleString(),
            Customer: o.user?.name || 'Guest',
            Amount: o.totalAmount,
            Status: o.status
        }));
        exportToCSV(exportData, 'Saro_Orders');
    };

    const statusOptions = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                        <HiOutlineQueueList size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-extrabold text-slate-900">Order Pipeline</h3>
                        <p className="text-slate-400 font-medium">Real-time logistics monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                    >
                        <HiOutlineArrowDownTray /> Export History
                    </button>
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-white text-slate-900 shadow-sm">Live</button>
                        <button className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-slate-400">Archive</button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
                            <th className="px-8 py-4">Transaction ID</th>
                            <th className="px-8 py-4">Timeline</th>
                            <th className="px-8 py-4">Client</th>
                            <th className="px-8 py-4">Value</th>
                            <th className="px-8 py-4">Status Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {ordersList.slice(0, 50).map(o => (
                            <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5 font-mono font-bold text-slate-500 text-xs tracking-tighter">
                                    #{o._id.toUpperCase()}
                                </td>
                                <td className="px-8 py-5 text-slate-600 text-sm font-medium">
                                    {new Date(o.createdAt).toLocaleDateString()}<br/>
                                    <span className="text-[10px] text-slate-400 uppercase font-black">{new Date(o.createdAt).toLocaleTimeString()}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <p className="font-extrabold text-slate-900 leading-none">{o.user?.name || 'Guest Identity'}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{o.user?.email || 'N/A'}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="font-black text-slate-900">{o.totalAmount} ETB</span>
                                </td>
                                <td className="px-8 py-5">
                                    <select 
                                        value={o.status}
                                        onChange={(e) => onUpdateOrder(o._id, e.target.value)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                                            o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                            o.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderPipeline;
