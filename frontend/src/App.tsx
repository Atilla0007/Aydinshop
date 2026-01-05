import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { Home } from "@/pages/home";
import { About } from "@/pages/about";
import { Services } from "@/pages/services";
import { Contact } from "@/pages/contact";
import { Error404 } from "@/pages/404";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#030303]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
