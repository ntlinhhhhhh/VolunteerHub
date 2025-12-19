import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#34729C] to-[#5FC1D1] rounded-xl rotate-3 group-hover:rotate-6 transition-transform flex items-center justify-center text-white shadow-lg shadow-[#5FC1D1]/30">
            <Heart fill="white" size={20} />
          </div>
          <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-[#2C3E50]' : 'text-[#34729C]'}`}>
            Volunteer<span className="text-[#5FC1D1]">Hub</span>
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="relative text-[#2C3E50] font-medium transition-colors hover:text-[#34729C] group">
            Trang chủ
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5FC1D1] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <button onClick={() => navigate('/events')} className="relative text-[#2C3E50] font-medium transition-colors hover:text-[#34729C] group">
            Sự kiện
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5FC1D1] transition-all duration-300 group-hover:w-full"></span>
          </button>
          <a href="#" className="relative text-[#2C3E50] font-medium transition-colors hover:text-[#34729C] group">
            Cộng đồng
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5FC1D1] transition-all duration-300 group-hover:w-full"></span>
          </a>

          <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-[#34729C] font-semibold hover:bg-[#D1ECFF]/50 rounded-full transition-colors">
            Đăng nhập
          </button>
          <button onClick={() => navigate('/register')} className="relative px-6 py-2.5 bg-[#34729C] text-white font-semibold rounded-full overflow-hidden group shadow-lg shadow-[#34729C]/30 hover:shadow-[#34729C]/50 transition-all">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            <span className="relative">Tham gia ngay</span>
          </button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button onClick={() => setIsOpen(!isOpen)} className="text-[#2C3E50] p-2 hover:bg-gray-100 rounded-lg">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl absolute top-full w-full border-t border-gray-100 animate-fade-in-down">
          <div className="flex flex-col p-4 space-y-4">
            <a href="#" className="text-[#2C3E50] font-medium p-3 hover:bg-[#F5F7FA] rounded-xl">
              Trang chủ
            </a>
            <button onClick={() => { navigate('/events'); setIsOpen(false); }} className="text-[#2C3E50] font-medium p-3 hover:bg-[#F5F7FA] rounded-xl text-left">
              Sự kiện
            </button>
            <a href="#" className="text-[#2C3E50] font-medium p-3 hover:bg-[#F5F7FA] rounded-xl">
              Cộng đồng
            </a>
            <button onClick={() => navigate('/register')} className="w-full py-3 bg-[#34729C] text-white rounded-xl font-bold shadow-lg">
              Tham gia ngay
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};