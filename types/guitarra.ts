export type Categoria = "Eléctricas" | "Acústicas" | "Bajos" | "Accesorios";

export interface Guitarra {
  id: number;
  nombre: string;
  marca: string;
  /** Precio en euros (entero). Pasa a céntimos en la Fase 8. */
  precio: number;
  categoria: Categoria;
  badge: string | null;
  imagen: string;
  descripcion: string;
  specs: string[];
}
