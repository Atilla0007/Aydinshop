import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "چگونه برای استعلام قیمت اقدام کنم؟",
    a: "از طریق فرم تماس یا تماس مستقیم با ما، محصول یا خدمات مورد نظر را اعلام کنید تا مشاوره و برآورد اولیه ارسال شود."
  },
  {
    q: "آیا امکان بازدید و نیازسنجی حضوری وجود دارد؟",
    a: "بله، تیم فنی استیرا در صورت نیاز بازدید حضوری انجام می‌دهد و گزارش نیازسنجی ارائه می‌کند."
  },
  {
    q: "زمان تحویل تجهیزات به چه عواملی بستگی دارد؟",
    a: "مدت زمان تحویل به موجودی، نوع تجهیزات، برنامه نصب و موقعیت پروژه بستگی دارد و در قرارداد زمان‌بندی مشخص می‌شود."
  },
  {
    q: "آیا خدمات نصب و راه‌اندازی هم ارائه می‌شود؟",
    a: "بله، در تمامی پکیج‌ها خدمات نصب و راه‌اندازی متناسب با سطح پروژه ارائه می‌شود."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-iran">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold font-divan mb-4 text-rose-500">سؤالات متداول</h1>
          <p className="text-white/60 mb-12 text-lg">پاسخ به پرسش‌های رایج درباره خدمات و همکاری با استیرا.</p>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden transition-all hover:bg-white/[0.07]"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-right"
                >
                  <h3 className="text-xl font-bold text-white flex-1">{faq.q}</h3>
                  <ChevronDown
                    size={24}
                    className={`text-white/60 transition-transform shrink-0 mr-4 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-white/60 leading-relaxed text-lg px-6 pb-6">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
