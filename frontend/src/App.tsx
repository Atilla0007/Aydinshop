import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Home } from "@/pages/home";
import { About } from "@/pages/about";
import { Services } from "@/pages/services";
import { Contact } from "@/pages/contact";
import { Catalog } from "@/pages/catalog";
import { Error404 } from "@/pages/404";

function App() {
  // Use /static basename only when running via Vite dev server or on static paths
  // Otherwise use / for clean Django URLs
  const basename = window.location.pathname.startsWith('/static') ? '/static' : '/';

  return (
    <Router basename={basename}>
      <div className="min-h-screen bg-[#030303]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
