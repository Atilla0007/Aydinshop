import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, UtensilsCrossed, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface PackageData {
  type: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  targets: string[];
  audience: string[];
  estimated_time: string;
  supervision_level: string;
}

const iconMap: Record<string, typeof ChefHat> = {
  basic: ChefHat,
  vip: UtensilsCrossed,
  cip: Sparkles,
};

const colorMap: Record<string, string> = {
  basic: "blue",
  vip: "purple",
  cip: "rose",
};

export function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      axios
        .get(`/api/packages/${serviceId}/`)
        .then((res) => {
          setPackageData(res.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [serviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!packageData || !serviceId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white font-iran">
        <div className="text-center">
          <h2 className="text-2xl mb-4">پکیج مورد نظر یافت نشد.</h2>
          <Button asChild>
            <Link to="/services">بازگشت به خدمات</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[serviceId] || ChefHat;
  const color = colorMap[serviceId] || "blue";

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 font-iran">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className={cn(
          "absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-20",
          color === "blue" ? "bg-blue-500" : 
          color === "purple" ? "bg-purple-500" : "bg-rose-500"
        )} />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 bg-white/5 border border-white/10",
              color === "blue" ? "text-blue-500" : 
              color === "purple" ? "text-purple-500" : "text-rose-500"
            )}>
              <Icon size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-divan mb-6 leading-tight">
              {packageData.title}
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
              {packageData.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold font-divan mb-6 text-rose-500">جزئیات پکیج</h2>
              <p className="text-lg text-white/70 leading-[2.4] text-justify">
                {packageData.description}
              </p>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold font-divan mb-6">مخاطبان هدف</h3>
              <div className="grid gap-4">
                {packageData.targets.map((target, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
                    <span className="text-white/80">{target}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold font-divan mb-4">اطلاعات پکیج</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/40 mb-1 font-iran">مدت زمان اجرا</p>
                  <p className="text-lg font-bold font-iran">{packageData.estimated_time}</p>
                </div>
                <div>
                  <p className="text-sm text-white/40 mb-1 font-iran">سطح نظارت</p>
                  <p className="text-lg font-bold font-iran">{packageData.supervision_level}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 h-full">
              <h2 className="text-2xl font-bold font-divan mb-8 border-b border-white/10 pb-4">
                لیست خدمات اجرایی
              </h2>
              <ul className="space-y-6">
                {packageData.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 font-bold text-xs group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <p className="text-white/80 leading-relaxed text-lg">{feature}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-12">
                <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-rose-600 hover:bg-rose-700 font-iran" asChild>
                  <Link to={`/contact?package=${serviceId}`}>
                    درخواست مشاوره و رزرو پکیج
                    <ArrowLeft className="mr-2" size={20} />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation between packages */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/services" className="text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight size={20} />
            مشاهده همه پکیج‌ها
          </Link>
          
          <div className="flex gap-4">
            {["basic", "vip", "cip"].map((id) => (
              <Link 
                key={id} 
                to={`/services/${id}`}
                className={cn(
                  "px-4 py-2 rounded-full border text-sm transition-all font-iran",
                  id === serviceId 
                    ? "bg-white text-black border-white" 
                    : "border-white/10 text-white/60 hover:border-white/30"
                )}
              >
                {id.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
