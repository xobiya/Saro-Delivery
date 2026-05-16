import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');

    return (
        <>
            {!isAdminPath && <Navbar />}
            <main style={{ minHeight: '70vh' }}>
                {children}
            </main>
            {!isAdminPath && <Footer />}
        </>
    );
};

export default MainLayout;
