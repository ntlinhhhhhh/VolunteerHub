import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Reveal } from '../../../hooks/Reveal';

export const FeaturedEvents = () => {
  const events = [
    {
      image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Môi trường",
      title: "Chiến dịch Xanh: Làm sạch bãi biển Đà Nẵng",
      date: "20/12/2024",
      location: "Bãi biển Mỹ Khê, Đà Nẵng",
      joined: 45,
      total: 50,
      color: "#6BCB77"
    },
    {
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Giáo dục",
      title: "Dạy tiếng Anh cho trẻ em vùng cao",
      date: "15/01/2025",
      location: "Mộc Châu, Sơn La",
      joined: 12,
      total: 20,
      color: "#5FC1D1"
    },
    {
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Y tế",
      title: "Hiến máu nhân đạo: Giọt hồng yêu thương",
      date: "05/01/2025",
      location: "Viện Huyết học, Hà Nội",
      joined: 150,
      total: 200,
      color: "#FF6B6B"
    }
  ];

  return (
    <section className="py-24 bg-[#34729C] text-white relative overflow-hidden">
      {/* Background Decor (From Old Ver Tone) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5FC1D1] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-[#D1ECFF] font-bold uppercase tracking-widest mb-2 text-sm">Sự kiện nổi bật</h2>
            <h3 className="text-4xl font-extrabold text-white">Chung tay vì cộng đồng</h3>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 border border-white/20 rounded-full hover:bg-white hover:text-[#34729C] transition-all font-bold">
            Xem tất cả <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((evt, idx) => (
            <Reveal key={idx} delay={idx * 150}>
              <div className="group relative h-[450px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Full-bleed Image (Layout from New Ver) */}
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Gradient Overlay (Soft Pastel Mix) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50] via-[#2C3E50]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex gap-4 mb-4">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 border border-white/20 text-white">
                      <Calendar size={14} className="text-[#5FC1D1]" /> {evt.date}
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 border border-white/20 text-white">
                      <MapPin size={14} className="text-[#5FC1D1]" /> {evt.location}
                    </div>
                  </div>

                  <span className="inline-block px-2 py-1 mb-2 rounded text-xs font-bold uppercase tracking-wider bg-white text-[#34729C]" style={{ color: evt.color }}>
                    {evt.category}
                  </span>

                  <h3 className="text-2xl font-bold mb-4 leading-tight text-white">{evt.title}</h3>
                  <button className="text-[#5FC1D1] font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-4 group-hover:translate-x-0 hover:text-white">
                    Đăng ký ngay <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};