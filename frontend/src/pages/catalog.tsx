import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import axios from "axios";
import { scrollToTop } from "@/utils/scroll";

interface Category {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  summary: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  image: string;
  brand: string;
  domain: string;
  price: number;
  view_count: number;
}

export function Catalog() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Fetch categories
    axios.get("/api/categories/").then((res) => {
      setCategories(res.data.categories);
    });

    // Fetch products
    fetchProducts();
  }, [categoryFilter, page]);

  const fetchProducts = () => {
    setLoading(true);
    const params: any = { page, page_size: 20 };
    if (categoryFilter) params.category = categoryFilter;
    if (searchQuery) params.search = searchQuery;

    axios
      .get("/api/products/", { params })
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setTotalPages(res.data.total_pages);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 font-divan leading-[1.6] md:leading-[1.5]">
            محصولات استیرا
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto font-iran leading-[2.6]">
            مجموعه‌ای کامل از تجهیزات آشپزخانه صنعتی با استانداردهای جهانی و گارانتی معتبر.
          </p>
        </motion.div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/catalog"
              className={cn(
                "px-6 py-3 rounded-full border transition-all font-iran",
                !categoryFilter
                  ? "bg-rose-500/20 border-rose-500/50 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
              )}
            >
              همه محصولات ({total})
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className={cn(
                  "px-6 py-3 rounded-full border transition-all font-iran",
                  categoryFilter === cat.slug
                    ? "bg-rose-500/20 border-rose-500/50 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                )}
              >
                {cat.name} ({cat.product_count})
              </Link>
            ))}
          </motion.div>
        )}

        {/* Search */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در محصولات..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-12 focus:outline-none focus:border-rose-500 transition-all font-iran text-right"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-rose-500 transition-colors"
            >
              <Search size={20} />
            </button>
          </form>
        </motion.section>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-[2rem] overflow-hidden border border-white/10 hover:border-rose-500/50 transition-all duration-500 bg-white/[0.02]"
                >
                  <Link to={`/catalog/${product.category.slug}/${product.slug}`}>
                    {/* Product Image */}
                    <div className="relative h-64 overflow-hidden bg-white/5">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <span className="font-iran">بدون تصویر</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      {product.brand && (
                        <p className="text-sm text-rose-500 mb-2 font-iran">{product.brand}</p>
                      )}
                      <h3 className="text-xl font-bold mb-2 font-divan line-clamp-2 group-hover:text-rose-500 transition-colors">
                        {product.name}
                      </h3>
                      {product.summary && (
                        <p className="text-sm text-white/60 mb-4 line-clamp-2 font-iran">
                          {product.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40 font-iran">
                          {product.domain}
                        </span>
                        <span className="text-xs text-white/40 font-iran">
                          {product.view_count} بازدید
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    scrollToTop();
                  }}
                  disabled={page === 1}
                  className="px-6 py-3 rounded-full border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed hover:border-rose-500/50 transition-all font-iran"
                >
                  قبلی
                </button>
                <span className="text-white/60 font-iran">
                  صفحه {page} از {totalPages}
                </span>
                <button
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    scrollToTop();
                  }}
                  disabled={page === totalPages}
                  className="px-6 py-3 rounded-full border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed hover:border-rose-500/50 transition-all font-iran"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg font-iran">محصولی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
