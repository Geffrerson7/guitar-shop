import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Contactanos from "./pages/Contactanos";
import Acerca from "./pages/Acerca";
import Layout from "./layout/Layout";
import Error404 from "./pages/Error404";
import Producto from "./pages/Producto";
import Catalogo from "./pages/Catalogo";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/contacto" element={<Contactanos />} />
        <Route path="/acerca" element={<Acerca />} />
        <Route path="/producto/:id" element={<Producto />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
}
