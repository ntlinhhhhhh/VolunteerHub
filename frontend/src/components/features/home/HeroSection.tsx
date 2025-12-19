import { ArrowRight, Sparkles, Users } from 'lucide-react';
import { Reveal } from '../../../hooks/Reveal';
import { useCounter } from '../../../hooks/useCounter';

export const HeroSection = () => {
  const { count, countRef } = useCounter(12504, 2000);

  return (
    <div className="relative pt-32 pb-48 lg:pt-48 lg:pb-64 overflow-hidden bg-[#F8F9FA]">
      {/* --- BACKGROUND ANIMATION (From Old Ver) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-[#D1ECFF] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#C9F1FC] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-[#E0F7FA] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content (Text from Old Ver) */}
          <div className="space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-white/40 rounded-full shadow-sm text-[#34729C] font-semibold text-sm mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5FC1D1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5FC1D1]"></span>
                </span>
                Hơn 500+ sự kiện thiện nguyện
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-[#2C3E50] leading-[1.15] tracking-tight">
                Kết nối <span className="text-[#34729C]">Trái tim</span> <br/>
                Lan tỏa <span className="bg-gradient-to-r from-[#5FC1D1] to-[#34729C] bg-clip-text text-transparent">Yêu thương</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-xl text-[#6C757D] max-w-lg leading-relaxed font-light">
                Nền tảng kết nối tình nguyện viên hàng đầu. Cùng nhau tạo nên những thay đổi tích cực và bền vững cho cộng đồng Việt Nam.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-[#34729C] hover:bg-[#285e82] text-white text-lg font-bold rounded-full shadow-xl shadow-[#34729C]/25 transition-all hover:scale-105 hover:shadow-[#34729C]/40 flex items-center justify-center gap-2 group">
                  Tìm sự kiện
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white/50 border border-white/60 backdrop-blur-sm text-[#34729C] text-lg font-bold rounded-full hover:bg-white transition-all hover:shadow-lg flex items-center justify-center gap-2">
                  <Sparkles size={18} />
                  Tạo chiến dịch
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right Visual - Collage Layout (From New Ver but Soft Style) */}
          <Reveal delay={200} className="relative hidden lg:block">
            <div className="relative w-full h-[600px]">
              {/* Main Large Image */}
              <div className="absolute top-0 right-0 w-[85%] h-[80%] rounded-[2rem] overflow-hidden shadow-2xl shadow-[#34729C]/20 border-4 border-white/80 z-10 transform rotate-2 hover:rotate-0 transition-all duration-700 group">
                <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Volunteers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#34729C]/60 to-transparent"></div>
              </div>

              {/* Floating Element 1 */}
              <div className="absolute top-20 left-0 w-[40%] h-[40%] rounded-3xl overflow-hidden shadow-xl border-4 border-white/80 z-20 transform -rotate-6 hover:-rotate-3 transition-all duration-500">
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Child" className="w-full h-full object-cover" />
              </div>

              {/* Floating UI Card (Glassmorphism Style from Old Ver) */}
              <div className="absolute bottom-32 left-10 bg-white/80 backdrop-blur-xl p-5 rounded-2xl shadow-xl z-30 animate-float border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="bg-[#D1ECFF] p-3 rounded-full text-[#34729C]">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-[#6C757D] text-xs font-bold uppercase">Thành viên</p>
                    <p ref={countRef} className="text-2xl font-extrabold text-[#2C3E50]">{count.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* --- IMPACT BAR (Layout from New Ver, Style from Old Ver) --- */}
      <div className="absolute bottom-0 left-0 w-full z-30 translate-y-1/6 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#34729C] to-[#5FC1D1] rounded-3xl shadow-2xl shadow-[#34729C]/20 p-8 md:p-12 text-white relative overflow-hidden backdrop-blur-sm border border-white/20">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            {[
              { num: '500+', label: 'Sự kiện' },
              { num: '24/7', label: 'Hỗ trợ' },
              { num: '10k+', label: 'Thành viên' },
              { num: '100%', label: 'Minh bạch' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center border-r border-white/10 last:border-0">
                <div className="text-3xl md:text-4xl font-extrabold mb-1 drop-shadow-sm">{stat.num}</div>
                <div className="text-[#D1ECFF] text-sm uppercase tracking-wider font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- WAVE DIVIDER (Layout from New Ver, Color from Old Ver) --- */}
      <div className="absolute bottom-0 left-0 w-full h-48 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
          <path fill="#ffffff" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,165.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};