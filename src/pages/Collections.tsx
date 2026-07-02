import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Collections() {
  return (
    <div className="min-h-screen font-sans antialiased flex flex-col bg-[var(--color-brand-cream)]">
      <Header />
      <main className="flex-grow py-12 px-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-brand-dark)]">Collections</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#91a08c] h-80 rounded-2xl flex items-center justify-center text-white text-3xl font-bold tracking-widest">SUMMER '25</div>
          <div className="bg-[var(--color-brand-dark)] h-80 rounded-2xl flex items-center justify-center text-white text-3xl font-bold tracking-widest">PREMIUM</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
