import React from 'react';
import { Navbar } from '../../components/features/home/Navbar';
import { HeroSection } from '../../components/features/home/HeroSection';
import { Categories } from '../../components/features/home/Categories';
import { FeaturedEvents } from '../../components/features/home/FeaturedEvents';
import { HowItWorks } from '../../components/features/home/HowItWorks';
import { Testimonials } from '../../components/features/home/Testimonials';
import { Footer } from '../../components/features/home/Footer';
import { Heart } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="font-sans text-[#2C3E50] antialiased bg-white selection:bg-[#5FC1D1] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.2); }
          66% { transform: translate(-20px, 20px) scale(0.8); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1); }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .animate-spin-slow { animation: spin 15s linear infinite; }
        .animate-spin-reverse-slow { animation: spin 20s linear infinite reverse; }
        @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        .animate-shimmer { animation: shimmer 2s infinite linear; }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
      `}</style>

      <Navbar />
      <HeroSection />
      <Categories />
      <FeaturedEvents />
      <HowItWorks />
      <Testimonials />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-[#1E5470] to-[#0F2D3E] text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#34729C] rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">Sẵn sàng tạo nên <br/><span className="text-[#5FC1D1]">điều kỳ diệu?</span></h2>
          <p className="text-gray-300 text-xl mb-10 font-light">Tham gia cùng cộng đồng 10,000+ tình nguyện viên và bắt đầu hành trình ý nghĩa của bạn ngay hôm nay.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button className="px-10 py-5 bg-white text-[#1E5470] text-lg font-bold rounded-full shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
               <Heart size={20} fill="#1E5470" />
               Bắt đầu ngay
             </button>
             <button className="px-10 py-5 bg-transparent border border-white/30 text-white text-lg font-bold rounded-full hover:bg-white/10 transition-all">
               Tìm hiểu thêm
             </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;