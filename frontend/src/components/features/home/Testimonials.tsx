import { Star } from 'lucide-react';
import { Reveal } from '../../../hooks/Reveal';

export const Testimonials = () => (
  <section className="py-24 bg-[#F0F4F8]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div><h2 className="text-4xl font-bold text-[#2C3E50] mb-6">Cảm hứng từ cộng đồng</h2><p className="text-[#6C757D] text-lg font-light mb-8">Hàng ngàn câu chuyện đẹp được viết nên mỗi ngày.</p><button className="px-6 py-3 border-2 border-[#34729C] text-[#34729C] rounded-full font-bold hover:bg-[#34729C] hover:text-white transition-all">Xem thêm câu chuyện</button></div>
          <div className="relative"><div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative z-10"><div className="flex items-center gap-1 mb-6 text-[#FFD93D]">{[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}</div><p className="text-[#2C3E50] text-xl italic leading-relaxed mb-8 font-light">"VolunteerHub không chỉ là nơi tìm kiếm sự kiện, mà là nơi tôi tìm thấy gia đình thứ hai của mình."</p><div className="flex items-center gap-4 border-t border-gray-100 pt-6"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" className="w-12 h-12 rounded-full ring-2 ring-[#5FC1D1] ring-offset-2" /><div><p className="font-bold text-[#2C3E50]">Nguyễn Thu Hà</p><p className="text-sm text-[#6C757D]">Sinh viên ĐH Y Hà Nội</p></div></div></div></div>
        </div>
      </Reveal>
    </div>
  </section>
);