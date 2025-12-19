import { Users, Globe, Heart } from 'lucide-react';
import { Reveal } from '../../../hooks/Reveal';

export const HowItWorks = () => {
  const steps = [
    { num: '01', title: 'Tạo hồ sơ', desc: 'Đăng ký nhanh chóng và tham gia mạng lưới thiện nguyện.', icon: <Users size={32} /> },
    { num: '02', title: 'Tìm hoạt động', desc: 'Lựa chọn sự kiện phù hợp với kỹ năng và thời gian của bạn.', icon: <Globe size={32} /> },
    { num: '03', title: 'Tham gia', desc: 'Đóng góp công sức và lan tỏa giá trị tích cực.', icon: <Heart size={32} /> }
  ];

  return (
    <section className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-[#2C3E50]">Quy trình đơn giản</h2>
            <p className="text-[#6C757D] mt-4 text-lg font-light">Chỉ mất vài phút để bắt đầu hành trình của bạn</p>
          </div>
        </Reveal>

        <div className="relative grid md:grid-cols-3 gap-12">
          {/* Connector Line (Old Ver Style) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-[#E0E0E0] z-0"></div>

          {steps.map((step, idx) => (
            <Reveal key={idx} delay={idx * 200}>
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-[#F0F4F8] flex items-center justify-center mb-8 shadow-lg group-hover:border-[#34729C] transition-colors duration-500">
                  <div className="w-16 h-16 bg-gradient-to-tr from-[#34729C] to-[#5FC1D1] rounded-full flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#2C3E50] text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                    {step.num}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#2C3E50] mb-3 group-hover:text-[#34729C] transition-colors">{step.title}</h3>
                <p className="text-[#6C757D] max-w-xs leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};