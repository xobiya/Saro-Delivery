import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineBolt } from 'react-icons/hi2';

const KitchenPipeline = ({ orders, updateStatus }) => {
    const activeOrders = orders.filter(o => !['delivered', 'cancelled', 'picked_up'].includes(o.status));
    const pendingOrders = activeOrders.filter(o => o.status === 'pending');
    const preparingOrders = activeOrders.filter(o => o.status === 'preparing' || o.status === 'confirmed');
    const readyOrders = activeOrders.filter(o => o.status === 'ready');

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Real-time Status Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-[4rem]"></div>
                    <HiOutlineBolt className="text-orange-500 text-3xl mb-4" />
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Incoming</h5>
                    <p className="text-4xl font-black text-slate-900 mt-2">{pendingOrders.length}</p>
                </div>
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[4rem]"></div>
                    <HiOutlineClock className="text-orange-500 text-3xl mb-4" />
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Preparing</h5>
                    <p className="text-4xl font-black mt-2">{preparingOrders.length}</p>
                </div>
                <div className="bg-emerald-500 p-10 rounded-[3rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-[4rem]"></div>
                    <HiOutlineCheckCircle className="text-white text-3xl mb-4" />
                    <h5 className="text-[10px] font-black text-emerald-100 uppercase tracking-widest leading-none">Ready for Pickup</h5>
                    <p className="text-4xl font-black mt-2">{readyOrders.length}</p>
                </div>
            </div>

            {/* Pipeline Grid */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Pipeline</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Live Stream Active
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {activeOrders.length === 0 ? (
                        <div className="col-span-full py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <HiOutlineExclamationTriangle size={64} className="text-slate-300 mb-6" />
                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Kitchen Idle</h3>
                            <p className="text-slate-400 font-bold mt-2">Waiting for new orders to arrive...</p>
                        </div>
                    ) : (
                        activeOrders.map(order => (
                            <div key={order._id} className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                                        <h4 className="font-black text-slate-900">#{order._id.slice(-6).toUpperCase()}</h4>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        order.status === 'pending' ? 'bg-orange-500 text-white' : 
                                        order.status === 'preparing' ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="p-8 flex-1">
                                    <div className="space-y-4 mb-8">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs text-orange-500">{item.quantity}</span>
                                                    <span className="font-black text-slate-800">{item.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-400">{item.price * item.quantity} ETB</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                            <p className="font-bold text-slate-900">{order.user?.name || 'Guest'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                            <p className="text-xl font-black text-slate-900">{order.totalAmount} ETB</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100">
                                    {order.status === 'pending' && (
                                        <button 
                                            onClick={() => updateStatus(order._id, 'preparing')}
                                            className="w-full bg-orange-500 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-1 transition-all"
                                        >
                                            Accept & Start Cooking
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button 
                                            onClick={() => updateStatus(order._id, 'ready')}
                                            className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 transition-all"
                                        >
                                            Order Ready for Pickup
                                        </button>
                                    )}
                                    {order.status === 'ready' && (
                                        <div className="text-center py-4 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">
                                            Waiting for Dispatcher
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default KitchenPipeline;
