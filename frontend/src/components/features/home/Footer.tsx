import { Heart, Facebook, Instagram, Youtube, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#1E5470] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1E5470] shadow-lg">
                <Heart fill="#1E5470" size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Volunteer<span className="text-[#5FC1D1]">Hub</span>
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed font-light">
              Kết nối trái tim, lan tỏa yêu thương. Cùng nhau xây dựng một cộng đồng Việt Nam tốt đẹp hơn qua những hành động nhỏ bé nhưng ý nghĩa lớn lao.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5FC1D1] hover:text-[#1E5470] flex items-center justify-center transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5FC1D1] hover:text-[#1E5470] flex items-center justify-center transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5FC1D1] hover:text-[#1E5470] flex items-center justify-center transition-all duration-300">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5FC1D1] hover:text-[#1E5470] flex items-center justify-center transition-all duration-300">
                <Globe size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#5FC1D1]">Khám phá</h4>
            <ul className="space-y-4">
              {['Về chúng tôi', 'Sự kiện sắp tới'].map((item) => (
                <li key={item}><a href="#" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#5FC1D1]">Tổ chức</h4>
            <ul className="space-y-4">
              {['Đăng sự kiện', 'Hướng dẫn', 'Liên hệ hỗ trợ'].map((item) => (
                <li key={item}><a href="#" className="text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#5FC1D1]">Đăng ký nhận tin</h4>
            <p className="text-gray-300 mb-6 text-sm">Nhận thông báo về các sự kiện tình nguyện mới nhất tại khu vực của bạn.</p>
            <form className="flex flex-col gap-3">
              <input type="email" placeholder="Email của bạn" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#5FC1D1] focus:bg-white/10 outline-none transition-all text-white placeholder-gray-400" />
              <button className="w-full py-3 bg-[#5FC1D1] hover:bg-[#4db1c0] text-[#1E5470] font-bold rounded-xl transition-colors shadow-lg shadow-[#5FC1D1]/20">Đăng ký ngay</button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
          <p>© 2024 VolunteerHub Vietnam. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0"><a href="#" className="hover:text-white transition-colors">Điều khoản</a><a href="#" className="hover:text-white transition-colors">Bảo mật</a><a href="#" className="hover:text-white transition-colors">Cookies</a></div>
        </div>
      </div>
    </footer>
  );
};