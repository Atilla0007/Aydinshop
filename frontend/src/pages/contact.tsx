import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import axios from "axios";

export function Contact() {
  const [searchParams] = useSearchParams();
  const selectedPackage = searchParams.get("package") || "";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    inquiry_type: selectedPackage ? "service" : "general",
    service_package: selectedPackage,
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      // This will hit the Django API we'll create
      await axios.post("/api/contact/", formData);
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
        inquiry_type: "general",
        service_package: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-8">با ما در تماس باشید</h1>
            <p className="text-xl text-white/60 mb-12 leading-relaxed">
              آماده‌اید تا پروژه خود را شروع کنید؟ فرم را پر کنید یا از طریق راه‌های ارتباطی با ما در تماس باشید. تیم ما در کمتر از ۲۴ ساعت با شما تماس خواهد گرفت.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-rose-500 font-bold mb-2">تلفن تماس</h3>
                <p className="text-2xl font-medium">۰۹۱۴۹۹۱۱۳۸۳</p>
              </div>
              <div>
                <h3 className="text-rose-500 font-bold mb-2">ایمیل</h3>
                <p className="text-2xl font-medium">styra.steel@gmail.com</p>
              </div>
              <div>
                <h3 className="text-rose-500 font-bold mb-2">آدرس</h3>
                <p className="text-xl font-medium text-white/80">ایران، تهران، فردوسیه، خیابان شهریار</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="p-8 md:p-12 rounded-3xl border border-white/10 bg-white/[0.02]"
          >
            {status === "success" ? (
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-green-500 mb-4">پیام شما با موفقیت ارسال شد</h2>
                <p className="text-white/60 mb-8">ممنون از اعتماد شما. به‌زودی با شما تماس می‌گیریم.</p>
                <Button onClick={() => setStatus("idle")}>ارسال پیام جدید</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">نام و نام خانوادگی</label>
                    <Input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">ایمیل</label>
                    <Input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">شماره تماس</label>
                    <Input 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">نام مجموعه (اختیاری)</label>
                    <Input 
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-white/5 border-white/10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">پیام شما</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-rose-600 hover:bg-rose-700 rounded-full text-lg"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "در حال ارسال..." : "ارسال پیام"}
                </Button>
                {status === "error" && (
                  <p className="text-rose-500 text-sm text-center">خطایی در ارسال پیام رخ داد. لطفا دوباره تلاش کنید.</p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
