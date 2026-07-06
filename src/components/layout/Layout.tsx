import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F2ED]">
      <Header />
      <main className="flex-grow pt-16">
        <ErrorBoundary><Outlet /></ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
