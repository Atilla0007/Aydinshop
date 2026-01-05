import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Download, Star, Check, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  images: Array<{ url: string; alt: string }>;
  features: Array<{ name: string; value: string }>;
  brand: string;
  sku: string;
  domain: string;
  tags: string[];
  price: number;
  view_count: number;
  datasheet: string | null;
  created_at: string;
  reviews: {
    count: number;
    average_rating: number;
  };
}

export function ProductDetail() {
  const { category_slug, product_slug } = useParams<{
    category_slug: string;
    product_slug: string;
  }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (category_slug && product_slug) {
      axios
        .get(`/api/products/${category_slug}/${product_slug}/`)
        .then((res) => {
          setProduct(res.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [category_slug, product_slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4 font-iran">محصول یافت نشد</p>
          <Link
            to="/catalog"
            className="text-rose-500 hover:text-rose-400 font-iran"
          >
            بازگشت به کاتالوگ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030303] text-white">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8 text-white/60 text-sm font-iran"
        >
          <Link to="/" className="hover:text-white transition-colors">
            صفحه اصلی
          </Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-white transition-colors">
            محصولات
          </Link>
          <span>/</span>
          <Link
            to={`/catalog?category=${product.category.slug}`}
            className="hover:text-white transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {product.images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-white/5">
                  <img
                    src={product.images[selectedImageIndex]?.url}
                    alt={product.images[selectedImageIndex]?.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`
                          relative w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all
                          ${
                            selectedImageIndex === index
                              ? "border-rose-500 scale-105"
                              : "border-white/10 hover:border-white/20"
                          }
                        `}
                      >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square rounded-[2rem] border border-white/10 bg-white/5 flex items-center justify-center">
                <span className="text-white/20 font-iran">بدون تصویر</span>
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category & Brand */}
            <div className="flex items-center gap-4">
              {product.brand && (
                <span className="px-4 py-2 rounded-full bg-rose-500/20 text-rose-500 text-sm font-iran">
                  {product.brand}
                </span>
              )}
              <Link
                to={`/catalog?category=${product.category.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:text-white text-sm font-iran border border-white/10 hover:border-white/20 transition-all"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold font-divan leading-[1.4]">
              {product.name}
            </h1>

            {/* Summary */}
            {product.summary && (
              <p className="text-xl text-white/60 font-iran leading-[2.6]">
                {product.summary}
              </p>
            )}

            {/* Reviews */}
            {product.reviews.count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.round(product.reviews.average_rating)
                          ? "fill-rose-500 text-rose-500"
                          : "fill-white/10 text-white/10"
                      }
                    />
                  ))}
                </div>
                <span className="text-white/60 font-iran">
                  {product.reviews.average_rating} ({product.reviews.count} نظر)
                </span>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 font-iran leading-[2.8] whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold font-divan">مشخصات فنی</h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <Check className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white font-iran">
                          {feature.name}:
                        </span>{" "}
                        <span className="text-white/70 font-iran">
                          {feature.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm font-iran border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              {product.sku && (
                <div>
                  <p className="text-sm text-white/40 mb-1 font-iran">کد SKU</p>
                  <p className="font-bold font-iran">{product.sku}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-white/40 mb-1 font-iran">دامنه کاربرد</p>
                <p className="font-bold font-iran">{product.domain}</p>
              </div>
              <div>
                <p className="text-sm text-white/40 mb-1 font-iran">تعداد بازدید</p>
                <p className="font-bold font-iran">{product.view_count}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                to="/contact"
                className="flex-1 px-8 py-4 bg-rose-600 hover:bg-rose-700 rounded-2xl text-center font-bold transition-all hover:scale-[1.02] active:scale-[0.98] font-iran flex items-center justify-center gap-2"
              >
                <span>درخواست قیمت و مشاوره</span>
                <ArrowRight size={20} />
              </Link>
              {product.datasheet && (
                <a
                  href={product.datasheet}
                  download
                  className="px-8 py-4 border border-white/20 rounded-2xl hover:border-rose-500/50 transition-all font-iran flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  <span>دانلود کاتالوگ</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-iran"
          >
            <ArrowLeft size={20} />
            <span>بازگشت</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

