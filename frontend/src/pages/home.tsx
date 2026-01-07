import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  ChefHat, 
  UtensilsCrossed, 
  Flame, 
  IceCream, 
  Coffee, 
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";

export function Home() {
  const services = [
    {
      title: "راه‌اندازی استاندارد (Basic)",
      desc: "شروعی مطمئن و اقتصادی برای کسب‌وکارهای نوپا با تمرکز بر استانداردهای ضروری.",
      color: "from-blue-500/20 to-blue-600/20",
      icon: ChefHat,
      link: "/services/basic"
    },
    {
      title: "مهندسی منو و فرآیند (VIP)",
      desc: "بهینه‌سازی دقیق گردش کار برای مجموعه‌هایی که حجم سفارش بالا و حساسیت عملیاتی دارند.",
      color: "from-purple-500/20 to-purple-600/20",
      icon: UtensilsCrossed,
      link: "/services/vip"
    },
    {
      title: "راه‌اندازی جامع و کلید تحویل (CIP)",
      desc: "از ایده تا افتتاحیه؛ مدیریت صفر تا صد پروژه با استانداردهای اجرایی کامل.",
      color: "from-rose-500/20 to-rose-600/20",
      icon: Sparkles,
      link: "/services/cip"
    }
  ];

  const products = [
    {
      name: "تجهیزات پخت",
      desc: "انواع اجاق، گریل و فرهای صنعتی",
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      name: "تجهیزات برودتی",
      desc: "یخچال‌ها و فریزرهای ایستاده و زیرکانتری",
      icon: IceCream,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      name: "آماده‌سازی",
      desc: "چرخ‌گوشت، خمیرگیر و میکسر صنعتی",
      icon: Layers,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      name: "کافی‌شاپ",
      desc: "دستگاه‌های اسپرسو و تجهیزات بار سرد",
      icon: Coffee,
      color: "text-amber-600",
      bg: "bg-amber-600/10"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#030303] text-white overflow-x-hidden">
      <HeroGeometric 
        badge="Styra Steel" 
        title1="طراحی و تجهیز" 
        title2="آشپزخانه‌های صنعتی" 
      />

      {/* Description Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
                <h2 className="text-4xl md:text-5xl font-divan font-bold mb-6 leading-[1.6] md:leading-[1.5]">
                  تخصص ما، <span className="text-rose-500">تمایز</span> آشپزخانه شماست
                </h2>
                <p className="text-lg text-white/60 leading-[2.6] mb-8 text-justify font-iran">
                استیرا استیل با بهره‌گیری از دانش روز مهندسی و تجربه سال‌ها فعالیت در صنعت تجهیزات آشپزخانه، راهکارهای هوشمندانه‌ای برای بهینه‌سازی فضاهای پخت و پز ارائه می‌دهد. ما فراتر از فروشنده تجهیزات، مشاور و شریک استراتژیک شما در مسیر موفقیت هستیم.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "پروژه موفق", value: "+۱۵۰" },
                  { label: "تجهیزات تخصصی", value: "+۵۰۰" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5">
                    <div className="text-2xl font-bold text-rose-500 mb-1">{stat.value}</div>
                    <div className="text-sm text-white/40">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square rounded-3xl overflow-hidden border border-white/10"
              >
                <img 
                  src="/static/img/hero-shop.jpg" 
                  alt="Kitchen Design"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
              </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-divan font-bold mb-4">دسته‌بندی محصولات</h2>
              <p className="text-white/40 max-w-md">مجموعه‌ای کامل از بهترین تجهیزات صنعتی با استانداردهای جهانی</p>
            </div>
            <Button variant="link" className="text-rose-500 group p-0 h-auto" asChild>
              <Link to="/catalog">
                مشاهده همه محصولات <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", product.bg)}>
                  <product.icon className={cn("w-6 h-6", product.color)} />
                </div>
                <h3 className="text-xl font-bold mb-2 font-divan">{product.name}</h3>
                <p className="text-sm text-white/40 mb-4">{product.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-divan font-bold mb-4"
          >
            پکیج‌های خدماتی
          </motion.h2>
          <div className="h-1 w-20 bg-rose-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "p-8 rounded-3xl border border-white/10 bg-gradient-to-br transition-all hover:border-white/20 hover:scale-[1.02] flex flex-col h-full",
                service.color
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-divan">{service.title}</h3>
              <p className="text-white/60 mb-8 leading-relaxed flex-grow">
                {service.desc}
              </p>
              <Button variant="outline" className="rounded-full w-full" asChild>
                <Link to={service.link}>مشاهده جزئیات پکیج</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Button size="lg" className="rounded-full bg-rose-600 hover:bg-rose-700 h-14 px-10 text-lg group" asChild>
            <Link to="/contact">
              درخواست مشاوره رایگان
              <ArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
