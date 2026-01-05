import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const packages = [
  {
    id: "basic",
    title: "راه‌اندازی استاندارد (Basic)",
    description: "این پکیج برای کارآفرینانی طراحی شده که می‌خواهند با بودجه‌ای مدیریت‌شده، آشپزخانه‌ای استاندارد و قابل اخذ مجوز داشته باشند.",
    features: [
      "طراحی پلن دوبعدی (2D) چیدمان تجهیزات",
      "مشاوره خرید تجهیزات اصلی",
      "نظارت بر نصب و تاسیسات پایه",
      "آموزش اولیه کار با دستگاه‌ها"
    ]
  },
  {
    id: "vip",
    title: "مهندسی منو و فرآیند (VIP)",
    description: "در پکیج VIP فراتر از چیدمان حرکت می‌کنیم. تمرکز بر مهندسی منو و طراحی فرآیند است تا تجهیزات بر اساس ظرفیت دقیق پخت انتخاب شوند.",
    features: [
      "تمام خدمات پکیج Basic",
      "تحلیل و آنالیز منو",
      "طراحی جریان کاری (Workflow)",
      "تست عملکردی منو"
    ]
  },
  {
    id: "cip",
    title: "راه‌اندازی جامع و کلید تحویل (CIP)",
    description: "کامل‌ترین سطح خدمات؛ ما به‌عنوان بازوی اجرایی شما عمل می‌کنیم؛ از برندینگ تا آماده‌سازی بهره‌برداری.",
    features: [
      "مدیریت پیمان کامل",
      "استخدام و آموزش حرفه‌ای پرسنل",
      "تامین تجهیزات از برندهای تاپ‌لول جهانی",
      "پشتیبانی ویژه پس از افتتاح"
    ]
  }
];

export function Services() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-white pt-24">
        <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-4 font-divan leading-[1.6]">خدمات تخصصی استیرا</h1>
              <p className="text-xl text-white/40 font-iran leading-[2.6]">راهکارهای هوشمندانه برای آشپزخانه‌های مدرن</p>
            </div>

            <div className="space-y-12">
              {packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="group relative p-12 rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 text-8xl font-bold text-white/[0.02] select-none">
                    0{i + 1}
                  </div>
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="text-3xl font-bold mb-6 font-divan leading-[1.8]">{pkg.title}</h2>
                      <p className="text-lg text-white/60 mb-8 leading-[2.6] font-iran">
                        {pkg.description}
                      </p>
                      <Button size="lg" className="rounded-full font-iran" asChild>
                        <Link to={`/contact?package=${pkg.id}`}>درخواست این پکیج</Link>
                      </Button>
                    </div>
                    
                    <div className="bg-white/[0.03] p-8 rounded-2xl border border-white/5">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-500 mb-6 font-iran">ویژگی‌های کلیدی</h3>
                      <ul className="space-y-4">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-white/80 font-iran leading-[2.2]">

                          <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
    </div>
  );
}
