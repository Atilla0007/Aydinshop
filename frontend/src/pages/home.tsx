import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-white">
      <HeroGeometric 
        badge="Styra Steel" 
        title1="طراحی و تجهیز" 
        title2="آشپزخانه‌های صنعتی" 
      />

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            خدمات ما
          </motion.h2>
          <div className="h-1 w-20 bg-rose-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "راه‌اندازی استاندارد (Basic)",
              desc: "شروعی مطمئن و اقتصادی برای کسب‌وکارهای نوپا با تمرکز بر استانداردهای ضروری.",
              color: "from-blue-500/20 to-blue-600/20",
              link: "/services/basic"
            },
            {
              title: "مهندسی منو و فرآیند (VIP)",
              desc: "بهینه‌سازی دقیق گردش کار برای مجموعه‌هایی که حجم سفارش بالا و حساسیت عملیاتی دارند.",
              color: "from-purple-500/20 to-purple-600/20",
              link: "/services/vip"
            },
            {
              title: "راه‌اندازی جامع و کلید تحویل (CIP)",
              desc: "از ایده تا افتتاحیه؛ مدیریت صفر تا صد پروژه با استانداردهای اجرایی کامل.",
              color: "from-rose-500/20 to-rose-600/20",
              link: "/services/cip"
            }
          ].map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "p-8 rounded-3xl border border-white/10 bg-gradient-to-br transition-all hover:border-white/20 hover:scale-[1.02]",
                service.color
              )}
            >
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                {service.desc}
              </p>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to={service.link}>مشاهده جزئیات</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Button size="lg" className="rounded-full bg-rose-600 hover:bg-rose-700 h-14 px-10 text-lg" asChild>
            <Link to="/contact">درخواست مشاوره رایگان</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

import { cn } from "@/lib/utils";
