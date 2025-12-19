import { TreePine, BookOpen, Stethoscope, Users, Baby, Handshake, PawPrint, AlertCircle, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Reveal } from '../../../hooks/Reveal';

export const Categories = () => {
  const categories = [
    { name: 'Môi trường', count: 120, icon: <TreePine size={28} />, color: '#6BCB77' },
    { name: 'Giáo dục', count: 85, icon: <BookOpen size={28} />, color: '#5FC1D1' },
    { name: 'Y tế', count: 64, icon: <Stethoscope size={28} />, color: '#FF6B6B' },
    { name: 'Người cao tuổi', count: 42, icon: <Users size={28} />, color: '#FFD93D' },
    { name: 'Trẻ em', count: 90, icon: <Baby size={28} />, color: '#FF6B6B' },
    { name: 'Cộng đồng', count: 150, icon: <Handshake size={28} />, color: '#34729C' },
    { name: 'Động vật', count: 35, icon: <PawPrint size={28} />, color: '#6CBFDA' },
    { name: 'Cứu trợ', count: 20, icon: <AlertCircle size={28} />, color: '#FF6B6B' },
  ];

  return (
    <section className="pt-24 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-[#2C3E50] mb-3">Lĩnh Vực Hoạt Động</h2>
              <p className="text-[#6C757D] text-lg font-light">Tìm kiếm cơ hội tình nguyện phù hợp với đam mê của bạn</p>
            </div>
            <a href="#" className="text-[#34729C] font-semibold flex items-center gap-2 hover:gap-3 transition-all">
              Xem tất cả <ArrowRight size={20} />
            </a>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Reveal key={idx} delay={idx * 50}>
              <div className="group relative bg-[#F8F9FA] hover:bg-white p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-[#34729C]/10 cursor-pointer overflow-hidden border border-transparent hover:border-gray-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full transition-all duration-500" style={{ background: `linear-gradient(to bottom left, ${cat.color}20, transparent)` }}></div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm" style={{ backgroundColor: 'white', color: cat.color }}>
                  {cat.icon}
                </div>
                <h3 className="font-bold text-lg text-[#2C3E50] mb-1 group-hover:text-[#34729C] transition-colors">{cat.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6C757D] font-medium">{cat.count} sự kiện</span>
                  <ArrowUpRight size={16} className="text-[#6C757D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};