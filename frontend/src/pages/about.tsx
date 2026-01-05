import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function About() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-8">درباره استیرا</h1>
          <p className="text-xl text-white/60 leading-relaxed mb-12">
            استیرا پیشرو در طراحی و تجهیز آشپزخانه‌های صنعتی، با تکیه بر دانش فنی و سال‌ها تجربه در صنعت غذا و نوشیدنی، همراه شما در راه‌اندازی پروژه‌های رستورانی، هتلی و کترینگ است.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-rose-500">ماموریت ما</h2>
            <p className="text-white/60 leading-relaxed">
              ماموریت ما ارائه راهکارهای نوآورانه و مهندسی‌شده برای ارتقای بهره‌وری و کیفیت در آشپزخانه‌های صنعتی است. ما معتقدیم یک آشپزخانه خوب طراحی شده، قلب تپنده هر کسب‌وکار موفق در حوزه غذاست.
            </p>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-rose-500">ارزش‌های ما</h2>
            <ul className="space-y-4 text-white/60">
              <li>• تعهد به کیفیت و استانداردهای بین‌المللی</li>
              <li>• خلاقیت در طراحی و بهینه‌سازی فضا</li>
              <li>• همراهی مستمر با مشتری از ایده تا اجرا</li>
              <li>• استفاده از تکنولوژی‌های روز دنیا</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
