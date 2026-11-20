import type { Guitarra } from "@/types/guitarra";
import imgGibsonEs335 from "@/assets/guitarras/1964-gibson-es-335.webp";
import imgBlackBeautyCustom from "@/assets/guitarras/black-beauty-custom.webp";
import imgClassicalConcert1a from "@/assets/guitarras/classical-concert-1a.webp";
import imgDeluxeDriveBundle from "@/assets/guitarras/deluxe-drive-bundle.webp";
import imgGrandAuditoriumC12 from "@/assets/guitarras/grand-auditorium-c12.webp";
import imgHeritageCustomTStyle from "@/assets/guitarras/heritage-custom-t-style.webp";
import imgJazzMasterpieceHollow from "@/assets/guitarras/jazz-masterpiece-hollow.webp";
import imgMasterbuilt57SType from "@/assets/guitarras/masterbuilt-57-s-type.webp";
import imgModernEagleV from "@/assets/guitarras/modern-eagle-v.webp";
import imgOmSeriesArtisan from "@/assets/guitarras/om-series-artisan.webp";
import imgProSeries5StringBass from "@/assets/guitarras/pro-series-5-string-bass.webp";
import imgRoyalReverbCombo from "@/assets/guitarras/royal-reverb-combo.webp";

export const guitarras: Guitarra[] = [
  {
    id: 1,
    nombre: "Heritage Custom T-Style",
    marca: "Luthier House",
    precio: 2450,
    categoria: "Eléctricas",
    badge: "Nuevo",
    imagen: imgHeritageCustomTStyle,
    descripcion:
      "Una obra maestra de la artesanía moderna con sonido cálido y sustain infinito.",
    specs: [
      "Cuerpo de Aliso seleccionado",
      "Mástil de Arce",
      "Pastillas Custom Shop Hand-Wound",
    ],
  },
  {
    id: 2,
    nombre: "1964 Gibson ES-335",
    marca: "Gibson Vintage",
    precio: 8900,
    categoria: "Eléctricas",
    badge: "Vintage",
    imagen: imgGibsonEs335,
    descripcion:
      "Semi-hollowbody icónica con sonido aterciopelado y laca nitrocelulósica original.",
    specs: [
      "Cuerpo semi-hueco de arce laminado",
      "Mástil de caoba",
      "Pastillas PAF humbucker originales",
    ],
  },
  {
    id: 3,
    nombre: "OM-Series Artisan",
    marca: "Voltio & Madera",
    precio: 3100,
    categoria: "Acústicas",
    badge: null,
    imagen: imgOmSeriesArtisan,
    descripcion:
      "Acústica artesanal con tapa de pícea maciza. Proyección y calidez inigualables.",
    specs: [
      "Tapa de Pícea maciza",
      "Fondo y aros de Palosanto",
      "Diapasón de Ébano",
    ],
  },
  {
    id: 4,
    nombre: "Black Beauty Custom",
    marca: "Gibson",
    precio: 5200,
    categoria: "Eléctricas",
    badge: null,
    imagen: imgBlackBeautyCustom,
    descripcion:
      "Les Paul Custom con hardware dorado. Graves profundos y agudos cristalinos.",
    specs: [
      "Cuerpo de Caoba con tapa de Arce",
      "Mástil de Caoba",
      "Pastillas 490R y 498T",
    ],
  },
  {
    id: 5,
    nombre: "Classical Concert 1A",
    marca: "Ramirez Master",
    precio: 4750,
    categoria: "Acústicas",
    badge: "Edición Limitada",
    imagen: imgClassicalConcert1a,
    descripcion: "Guitarra clásica de concierto con incrustaciones de nácar.",
    specs: [
      "Tapa de Pícea alemana",
      "Fondo de Palosanto de India",
      "Incrustaciones de nácar",
    ],
  },
  {
    id: 6,
    nombre: "Modern Eagle V",
    marca: "PRS Guitars",
    precio: 4200,
    categoria: "Eléctricas",
    badge: null,
    imagen: imgModernEagleV,
    descripcion:
      "Arce quilted azul vibrante con pájaros incrustados en el diapasón.",
    specs: ["Tapa de Arce Quilted", "Mástil de Caoba", "Pastillas 58/15 LT"],
  },
  {
    id: 7,
    nombre: "Masterbuilt '57 S-Type",
    marca: "Fender Custom Shop",
    precio: 6100,
    categoria: "Eléctricas",
    badge: null,
    imagen: imgMasterbuilt57SType,
    descripcion:
      "Reissue envejecido a mano. El sonido que definió el rock and roll.",
    specs: ["Cuerpo de Aliso", "Mástil de Arce", "Pastillas Custom Shop"],
  },
  {
    id: 8,
    nombre: "Pro Series 5-String Bass",
    marca: "Warwick",
    precio: 2800,
    categoria: "Bajos",
    badge: null,
    imagen: imgProSeries5StringBass,
    descripcion:
      "Bajo de 5 cuerdas con cuerpo de fresno. Definición y potencia.",
    specs: [
      "Cuerpo de Fresno",
      "Diapasón de Wenge",
      "Pastillas MEC Active/Passive",
    ],
  },
  {
    id: 9,
    nombre: "Royal Reverb Combo",
    marca: "Luthier Amps",
    precio: 1890,
    categoria: "Accesorios",
    badge: null,
    imagen: imgRoyalReverbCombo,
    descripcion:
      "Amp valvular con reverberación. El sonido que soñás desde que agarraste una guitarra.",
    specs: [
      "Potencia de 40W",
      "Altavoz Celestion Vintage 30",
      "Reverb a válvula Accutronics",
    ],
  },
  {
    id: 10,
    nombre: "Deluxe Drive Bundle",
    marca: "Custom Shop",
    precio: 450,
    categoria: "Accesorios",
    badge: null,
    imagen: imgDeluxeDriveBundle,
    descripcion: "Bundle de pedales boutique: overdrive, distorsión y boost.",
    specs: [
      "Overdrive analógico",
      "Distorsión de alta ganancia",
      "Boost conmutable",
    ],
  },
  {
    id: 11,
    nombre: "Grand Auditorium C12",
    marca: "Taylor Guitars",
    precio: 3800,
    categoria: "Acústicas",
    badge: null,
    imagen: imgGrandAuditoriumC12,
    descripcion:
      "Taylor Grand Auditorium. Versatilidad absoluta para cualquier estilo.",
    specs: [
      "Tapa de Pícea maciza",
      "Fondo de Palosanto",
      "Pastillas Expression System 2",
    ],
  },
  {
    id: 12,
    nombre: "Jazz Masterpiece Hollow",
    marca: "D'Angelico",
    precio: 3400,
    categoria: "Eléctricas",
    badge: null,
    imagen: imgJazzMasterpieceHollow,
    descripcion:
      "Hollowbody de jazz con tapa de arce tallada. El estándar de oro.",
    specs: [
      "Cuerpo hueco de Arce tallado",
      "Mástil de Arce",
      "Pastillas Floating Mini-Humbucker",
    ],
  },
];
