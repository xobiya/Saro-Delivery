import { HiOutlineXMark } from 'react-icons/hi2';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <HiOutlineXMark size={24} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
