import { motion } from "framer-motion";
import { Search, Flame, Snowflake, Coffee, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: "cooking",
    title: "تجهیزات پخت",
    icon: Flame,
    description: "انواع اجاق، فر، گریل و سرخ‌کن‌های صنعتی با بالاترین بازدهی پخت.",
    image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=1000",
    count: "۴۵ محصول"
  },
  {
    id: "cooling",
    title: "تجهیزات سرمایشی",
    icon: Snowflake,
    description: "یخچال‌ها و فریزرهای ایستاده و میزی، تاپینگ و سردخانه‌های زیر صفر و بالای صفر.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000",
    count: "۳۲ محصول"
  },
  {
    id: "prep",
    title: "آماده‌سازی",
    icon: UtensilsCrossed,
    description: "میز کار، سینک، چرخ‌گوشت، اسلایسر و تمامی ملزومات آماده‌سازی مواد اولیه.",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=1000",
    count: "۲۸ محصول"
  },
  {
    id: "coffee",
    title: "کافی‌شاپ",
    icon: Coffee,
    description: "دستگاه‌های اسپرسو، آسیاب قهوه، بلندر و تجهیزات تخصصی بار گرم و سرد.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000",
    count: "۱۹ محصول"
  }
];

export function Catalog() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 font-divan leading-[1.3] md:leading-[1.2]">
              محصولات استیرا
            </h1>
            <p className="text-xl text-white/40 max-w-2xl mx-auto font-iran leading-loose">
              مجموعه‌ای کامل از تجهیزات آشپزخانه صنعتی با استانداردهای جهانی و گارانتی معتبر.
            </p>
          </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[400px] rounded-[2rem] overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all duration-500"
            >
              {/* Background Image */}
              <div className="absolute inset-0 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <category.icon size={24} />
                  </div>
                  <span className="text-rose-500 font-medium font-iran">{category.count}</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 font-divan">{category.title}</h3>
                <p className="text-white/60 mb-8 max-w-sm line-clamp-2 font-iran">{category.description}</p>
                
                <Link 
                  to={`/catalog/${category.id}`}
                  className="flex items-center gap-2 text-white group/link font-iran"
                >
                  <span className="font-bold">مشاهده محصولات</span>
                  <ArrowLeft className="w-5 h-5 group-hover/link:-translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter Section Placeholder */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 text-center"
        >
          <h2 className="text-3xl font-bold mb-8 font-divan">به دنبال محصول خاصی هستید؟</h2>
          <div className="max-w-xl mx-auto relative group">
            <input 
              type="text" 
              placeholder="جستجو در محصولات..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-12 focus:outline-none focus:border-rose-500 transition-all font-iran text-right"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-rose-500 transition-colors" />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
