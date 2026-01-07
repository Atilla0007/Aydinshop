import { motion } from "framer-motion";

export function Rules() {
  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-iran">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold font-divan mb-4 text-rose-500">قوانین و مقررات</h1>
          <p className="text-white/60 mb-12 text-lg">لطفاً پیش از ثبت درخواست، این موارد را مطالعه کنید.</p>
          <div className="space-y-8 text-white/70 leading-loose text-justify">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">ثبت درخواست</h2>
              <p>ارسال فرم‌های تماس به معنای پذیرش قوانین و مقررات است. اطلاعات وارد شده باید دقیق و قابل استناد باشد.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">فرآیند مشاوره</h2>
              <p>پس از ثبت درخواست، کارشناسان استیرا برای بررسی نیازها و ارائه پیشنهاد با شما تماس می‌گیرند.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">قیمت‌گذاری</h2>
              <p>قیمت‌ها پس از نیازسنجی، بررسی موجودی و توافق بر شرایط پروژه اعلام می‌شوند.</p>
            </div>
            
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 font-divan">حق تغییر</h2>
              <p>استیرا حق به‌روزرسانی این قوانین را برای بهبود خدمات محفوظ می‌دارد.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
