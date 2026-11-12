# Auditoría Técnica Integral — GUITAR-SHOP

**Proyecto:** `guitarla` (GUITAR-SHOP)
**Fecha:** 11 de noviembre de 2026
**Alcance:** árbol de trabajo actual (incluye cambios sin commitear)
**Rol del auditor:** Senior Frontend Engineer / Software Architect
**Metodología:** inspección estática de todo el código fuente + ejecución de `lint`, `build` y `audit`

---

## 0. Estado de implementación

> Actualizado el 12 de noviembre de 2026. Esta sección se mantiene al día a medida que se ejecuta el roadmap; el resto del documento conserva el diagnóstico original del 11 de noviembre.

| Fase | Estado | Evidencia |
|---|---|---|
| Fase 0 — Estabilización del repositorio | ✅ Completada | Commit `6308420` / merge `790809b` (PR #4) |
| Fase 1 — Seguridad y datos personales | ✅ Completada | Ruta `/admin` y `Admin.jsx` eliminados; sin `mockapi` en `src/`, en el bundle ni en el historial |
| Fase 2 — Accesibilidad y semántica base | ⏳ Pendiente | — |
| Fase 3 — Rediseño tipo Awwwards y UX | ⏳ Pendiente | — |
| Fase 4 — Rendimiento y activos | ⏳ Pendiente | — |
| Fase 5 — SEO y metadatos | ⏳ Pendiente | — |
| Fase 6 — Testing y CI | ⏳ Pendiente | — |
| Fase 7 — Preparación para la evolución | ⏳ Pendiente | — |

### 0.1 Cierre de la Fase 1

**Hallazgos resueltos:** `SEC-01`, `SEC-02`, `SEC-03`.

El formulario de `/admin` y su `POST` a `mockapi.io` fueron retirados del proyecto. Verificación ejecutada el 12/11/2026:

| Comprobación | Resultado |
|---|---|
| `mockapi` en `src/` | 0 coincidencias |
| `mockapi`, "Panel de Administración" y `"usuarios"` en `dist/assets/*.js` | 0 coincidencias |
| `git log --all -S "mockapi"` | Vacío: la URL nunca entró en el historial |
| Rutas activas | Solo las 6 públicas (`/`, `/catalogo`, `/contacto`, `/acerca`, `/producto/:id`, `*`) |
| `pnpm run lint` / `pnpm run build` | 0 problemas / 40 módulos, 89.55 kB gzip |

**Nota operativa:** el endpoint de `mockapi.io` es público. Si se enviaron datos reales durante las pruebas, deben eliminarse desde el panel del servicio; el proyecto ya no contiene la URL.

**Efecto colateral positivo:** el bundle pasó de 41 a 40 módulos y de 90.18 kB a 89.55 kB gzip.

---

## 1. Resumen ejecutivo

GUITAR-SHOP es una aplicación **React 19 + Vite 8** de tipo catálogo, pequeña y legible (~513 líneas en `src/`), con una base razonable: enrutado anidado con `Layout`, componentes de presentación simples, datos centralizados y **cero errores de lint**. El proyecto compila sin problemas y el bundle gzip es de **90.61 kB**, un tamaño correcto para su alcance.

Dicho esto, **no está en condiciones de desplegarse** por tres motivos concretos:

1. **Existe una ruta `/admin` que envía el DNI de un usuario a un servicio de terceros** (`mockapi.io`) sin autenticación, sin consentimiento y sin validación real. Es el hallazgo más grave del proyecto (`SEC-01`).
2. **La capa de presentación es inconsistente**: dos de las seis páginas (`Contacto` y `Acerca`) no tienen ni una sola clase de Tailwind, y hay botones que aparentan funcionalidad inexistente ("Añadir al carrito", iconos de carrito y usuario).
3. **No hay ninguna prueba automatizada ni CI**, y el gestor de paquetes está indeterminado (lockfile de `pnpm`, scripts invocados con `npm`), lo que rompe la reproducibilidad.

> **Actualización (12/11/2026):** el punto 1 (`SEC-01`, `SEC-02`, `SEC-03`) está resuelto y el punto 3 (`MANT-01`) también, tras las fases 0 y 1. Se mantiene el texto original como diagnóstico histórico; el estado vigente está en la sección 0.

El resto de hallazgos son de prioridad media o baja: accesibilidad semántica, metadatos SEO, imágenes remotas sin optimizar y ausencia de una capa de acceso a datos que facilite una futura API.

**Valoración global: 5.5 / 10.** Código limpio y comprensible, pero sin red de seguridad (tests), con deuda de accesibilidad/SEO y un problema de seguridad que debe resolverse antes de cualquier publicación.

### Los cinco hallazgos más importantes

| # | ID | Hallazgo | Por qué importa |
|---|---|---|---|
| 1 | `SEC-01` | `/admin` envía `usuario` + `DNI` a `mockapi.io` sin auth ni consentimiento | Datos personales a un tercero; riesgo legal (RGPD) y reputacional |
| 2 | `SEC-02` | `fetch` sin `await`: el `try/catch` nunca captura fallos de red | El formulario falla en silencio; el usuario no recibe feedback |
| 3 | `MANT-01` | Lockfile `pnpm` + scripts `npm`; `npm audit` falla con `ENOLOCK` | Builds no reproducibles; imposible auditar dependencias con npm |
| 4 | `PERF-01` | 12 imágenes remotas de `googleusercontent.com` sin `width/height` ni `loading="lazy"` | CLS y LCP degradados, especialmente en móvil |
| 5 | `UX-02` | `Contacto` y `Acerca` sin estilos (0 clases Tailwind) | Ruptura visual evidente en el 33 % de las páginas |

---

## 2. Descripción del estado actual del proyecto

### 2.1 Inventario de archivos

| Archivo | Líneas | Responsabilidad |
|---|---:|---|
| `index.html` | 13 | Documento raíz (metadatos, punto de montaje) |
| `vite.config.js` | 7 | Plugins `react` + `tailwindcss` |
| `eslint.config.js` | 21 | Flat config (js, react-hooks, react-refresh) |
| `src/main.jsx` | 13 | `createRoot` + `StrictMode` + `BrowserRouter` |
| `src/App.jsx` | 25 | Definición de rutas |
| `src/index.css` | 1 | `@import "tailwindcss"` |
| `src/layout/Layout.jsx` | 15 | Header + `<main>` + Footer |
| `src/components/Header.jsx` | 22 | Navegación superior |
| `src/components/Footer.jsx` | 42 | Pie de página de 4 columnas |
| `src/components/GuitarCard.jsx` | 30 | Tarjeta de producto |
| `src/pages/Home.jsx` | 15 | Hero de inicio |
| `src/pages/Catalogo.jsx` | 19 | Grid de productos |
| `src/pages/Producto.jsx` | 73 | Detalle de producto |
| `src/pages/Acerca.jsx` | 8 | Texto plano |
| `src/pages/Contactanos.jsx` | 9 | Texto plano |
| `src/pages/Error404.jsx` | 13 | Página 404 |
| `src/pages/Admin.jsx` | 94 | Formulario "login" (**sin trackear en git**) |
| `src/data/guitarras.js` | 134 | Dataset de 12 productos |

**Assets no referenciados:** `src/assets/hero.png` (13 KB), `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg` (5 KB). Verificado con búsqueda en `src/`: ninguna referencia.

### 2.2 Estado de git

```
 M src/App.jsx          (+2 líneas: ruta /admin)
?? src/pages/Admin.jsx  (nuevo, 94 líneas)
?? prompt-1.md
```

El repositorio tiene 7 commits agrupados en 3 pull requests (`catalog`, `global-layout`, `core-pages`), con mensajes convencionales correctos (`feat:`, `chore:`). La rama actual incluye trabajo en curso sobre un panel de administración que **no forma parte de las funcionalidades descritas en el prompt** y que, como se detalla en `SEC-01`, introduce el mayor riesgo del proyecto.

### 2.3 Funcionalidades reales vs. aparentes

| Funcionalidad | Estado real |
|---|---|
| Navegación entre páginas | ✅ Funciona |
| Catálogo (12 productos) | ✅ Funciona, sin filtros ni búsqueda |
| Detalle de producto por `:id` | ✅ Funciona, con fallback "no encontrado" |
| 404 para rutas desconocidas | ✅ Funciona |
| Carrito | ❌ Solo un icono decorativo y un botón sin handler |
| Login / sesión de usuario | ❌ Solo un icono decorativo |
| Panel de administración | ⚠️ Formulario que hace POST a un mock externo; no autentica nada |
| Formulario de contacto | ❌ La página solo muestra dirección y email |
| Filtros por categoría | ❌ El campo `categoria` existe en los datos pero no se usa |

---

## 3. Stack tecnológico verificado

Versiones leídas de `package.json` e instaladas en `node_modules`:

| Tecnología | Declarado | Verificado en build | Observaciones |
|---|---|---|---|
| React / React DOM | `^19.2.8` | 19.2.8 | ✅ Correcto |
| Vite | `^8.3.0` | 8.3.0 | ⚠️ Rango con vulnerabilidades conocidas (ver `SEC-04`) |
| `@vitejs/plugin-react` | `^6.1.1` | 6.1.1 | ✅ |
| React Router DOM | `^7.18.4` | 7.18.4 | ✅ Modo declarativo (`<Routes>`) |
| Tailwind CSS | `^4.3.3` | 4.3.3 | ✅ Config vía plugin de Vite, sin `tailwind.config.js` |
| React Icons | `^5.7.0` | 5.7.0 | ✅ Solo 2 iconos importados; tree-shaking correcto |
| ESLint | `^10.10.0` | 10.10.0 | ✅ Flat config |
| `eslint-plugin-react-hooks` | `^7.1.1` | 7.1.1 | ✅ |
| `eslint-plugin-react-refresh` | `^0.5.6` | 0.5.6 | ✅ |
| `@types/react`, `@types/react-dom` | `^19.2.x` | instalados | ⚠️ Inútiles sin TypeScript (`MANT-03`) |
| JavaScript (JSX) | — | — | Sin TypeScript |
| Gestor de paquetes | — | `pnpm-lock.yaml` | ⚠️ Scripts usan `npm` (`MANT-01`) |
| Prettier | — | ausente | Sin formateo automatizado |
| Testing | — | ausente | Sin framework ni script `test` |
| CI/CD | — | ausente | Sin `.github/` |

**Salida real del build:**

```
vite v8.3.0 building client environment for production...
✓ 42 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-jmwPuEe2.css   19.83 kB │ gzip:   4.62 kB
dist/assets/index-CCmjp-q4.js   280.10 kB │ gzip:  90.61 kB
✓ built in 511ms
```

---

## 4. Evaluación por categorías

| Categoría | Valoración | Diagnóstico en una línea |
|---|---|---|
| **A. Arquitectura y organización** | 6/10 | Estructura clara y mínima, pero sin capa de datos ni separación por dominio |
| **B. Calidad del código** | 6/10 | Legible y sin hooks mal usados; duplicación de estilos e inconsistencias de formato |
| **C. Rendimiento** | 6/10 | Bundle correcto; el problema son las imágenes remotas, no el JS |
| **D. UX/UI** | 4/10 | Dos páginas sin estilos y varias affordances falsas |
| **E. Accesibilidad** | 4/10 | Buen HTML base, pero `lang` incorrecto y elementos no interactivos con apariencia de serlo |
| **F. Seguridad** | 3/10 | PII a un tercero sin auth; dependencias dev con CVEs |
| **G. SEO** | 3/10 | Metadatos de plantilla, sin títulos por ruta ni Open Graph |
| **H. Testing y calidad** | 2/10 | Cero pruebas, cero CI |
| **I. Mantenibilidad y escalabilidad** | 5/10 | Simple de extender, pero acoplada a los datos locales |

---

## 5. Hallazgos detallados y priorizados

> Convención de tipo: **[C]** problema confirmado · **[R]** riesgo potencial · **[O]** oportunidad de mejora · **[D]** decisión que depende de necesidades futuras.

### 5.1 Tabla resumen

| ID | Título | Categoría | Prioridad | Tipo | Esfuerzo |
|---|---|---|---|---|---|
| `SEC-01` | DNI enviado a un tercero sin autenticación | Seguridad | **P0** | C | Bajo |
| `SEC-02` | `fetch` sin `await`: manejo de errores inoperante | Seguridad / Calidad | **P1** | C | Bajo |
| `SEC-03` | `/admin` pública y "login" que no autentica | Seguridad | **P1** | C | Bajo |
| `MANT-01` | Lockfile `pnpm` con scripts `npm` | Mantenibilidad | **P1** | C | Bajo |
| `A11Y-03` | `lang="en"` en un sitio en español | Accesibilidad | **P1** | C | Bajo |
| `UX-01` | "Añadir al carrito" sin handler | UX | **P1** | C | Bajo |
| `UX-02` | Contacto y Acerca sin estilos | UX | **P1** | C | Bajo |
| `PERF-01` | Imágenes remotas sin dimensiones ni lazy loading | Rendimiento | **P1** | C | Medio |
| `TEST-01` | Ausencia total de tests y CI | Testing | **P1** | C | Medio |
| `A11Y-01` | Items del footer no interactivos | Accesibilidad | **P2** | C | Bajo |
| `A11Y-02` | Iconos sin nombre accesible ni acción | Accesibilidad | **P2** | C | Bajo |
| `A11Y-04` | `alt` genérico en detalle de producto | Accesibilidad | **P2** | C | Bajo |
| `UX-03` | Header sin enlace al catálogo ni estado activo | UX | **P2** | C | Bajo |
| `UX-04` | 404 carga imagen aleatoria de `cataas.com` | UX / Seguridad | **P2** | C | Bajo |
| `UX-05` | Sin error boundary ni estados de carga/error | UX / Calidad | **P2** | C | Medio |
| `UX-06` | Sin dirección de arte: interfaz genérica y plana | UX / UI | **P2** | O | Alto |
| `SEO-01` | Metadatos de plantilla y sin títulos por ruta | SEO | **P2** | C | Bajo |
| `SEO-02` | Sin `robots.txt`, `sitemap.xml` ni prerender | SEO | **P2** | C | Medio |
| `COD-01` | Formato de precio inconsistente y dependiente del locale | Calidad | **P2** | C | Bajo |
| `ARQ-01` | Datos importados directamente en los componentes | Arquitectura | **P2** | C | Bajo |
| `SEC-04` | 9 CVEs en dependencias de desarrollo | Seguridad | **P2** | R | Bajo |
| `TEST-02` | ESLint no evalúa accesibilidad | Testing | **P2** | O | Bajo |
| `DEP-01` | Deep links sin estrategia de rewrite | Mantenibilidad | **P2** | R | Bajo |
| `A11Y-05` | Marca no enlazada, `nav` sin `aria-label`, sin skip link | Accesibilidad | **P3** | C | Bajo |
| `A11Y-06` | Saltos en jerarquía de encabezados (h1 → h3) | Accesibilidad | **P3** | C | Bajo |
| `COD-02` | Optional chaining redundante tras el guard | Calidad | **P3** | C | Bajo |
| `COD-03` | Estilos duplicados y ausencia de design tokens | Calidad | **P3** | O | Medio |
| `COD-04` | Formato inconsistente; sin Prettier | Calidad | **P3** | C | Bajo |
| `COD-05` | Mezcla de idiomas en el código | Calidad | **P3** | D | Bajo |
| `ARQ-02` | `layout/` en singular frente a `components/` | Arquitectura | **P3** | O | Bajo |
| `ARQ-03` | `Admin.jsx` mezclado con páginas públicas | Arquitectura | **P3** | D | Bajo |
| `MANT-02` | Assets muertos en `src/assets` y `public` | Mantenibilidad | **P3** | C | Bajo |
| `MANT-03` | `@types/react` sin TypeScript | Mantenibilidad | **P3** | C | Bajo |
| `MANT-04` | Sin `engines`, `.nvmrc` ni `.editorconfig` | Mantenibilidad | **P3** | O | Bajo |
| `MANT-05` | README es la plantilla de Vite | Mantenibilidad | **P3** | C | Bajo |
| `SEC-05` | Sin cabeceras de seguridad / CSP | Seguridad | **P3** | R | Bajo |
| `SEO-03` | Favicon ajeno a la identidad visual | SEO | **P3** | C | Bajo |

**Distribución:** 1 P0 · 8 P1 · 14 P2 · 12 P3.

---

### 5.2 Hallazgos P0 — Críticos

#### `SEC-01` — Envío de DNI a un servicio de terceros sin autenticación ni consentimiento

- **Categoría:** Seguridad · **Prioridad:** P0 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** La ruta `/admin` expone un formulario que recopila `usuario` y `dni` y los envía mediante `POST` a `https://6ac44beeae53bf25b80f552e.mockapi.io/usuarios`. El endpoint es un mock público de terceros, no está autenticado, no hay aviso de privacidad, no hay consentimiento y la única validación es "campo no vacío". Además, el DNI es un identificador personal directo (dato de categoría ordinaria pero identificativo) y el endpoint no está bajo control del proyecto.
- **Evidencia:**
  ```jsx
  // src/pages/Admin.jsx:17-33
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!formulario.usuario || !formulario.dni) {
        throw new Error("Todos los campos son obligatorios.");
      }
      fetch("https://6ac44beeae53bf25b80f552e.mockapi.io/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  }
  ```
  ```jsx
  // src/App.jsx:20
  <Route path="/admin" element={<Admin />} />
  ```
- **Archivos afectados:** `src/pages/Admin.jsx`, `src/App.jsx`
- **Impacto:** Cualquier visitante que llegue a `/admin` puede enviar datos; los datos salen del perímetro del proyecto hacia un servicio de terceros sin contrato de tratamiento. Riesgo legal (RGPD art. 5 y 6: minimización y base jurídica) y reputacional. Un mock público suele permitir lectura anónima del recurso, por lo que el DNI quedaría potencialmente expuesto a cualquiera que conozca la URL (no verificado en esta auditoría; se marca como riesgo).
- **Solución recomendada:** Mientras no exista backend propio, **retirar la ruta y el formulario** (o moverlos a una rama de experimentación no desplegada). Si el panel es un requisito, sustituirlo por un flujo real: autenticación en servidor, endpoint propio sobre HTTPS, validación de DNI (formato y dígito de control), aviso de privacidad y consentimiento explícito. No almacenar DNI si no es imprescindible.
- **Dependencias:** Decisión de producto sobre si `/admin` forma parte del alcance. Requiere backend para una versión funcional.

---

### 5.3 Hallazgos P1 — Altos

#### `SEC-02` — `fetch` sin `await`: el manejo de errores no funciona

- **Categoría:** Seguridad / Calidad · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** La función es `async` y está envuelta en `try/catch`, pero la promesa de `fetch` no se espera. Cualquier fallo de red, CORS o respuesta 4xx/5xx produce una *unhandled promise rejection* que el `catch` nunca verá. Tampoco se comprueba `response.ok`.
- **Evidencia:** `src/pages/Admin.jsx:23-29` (el `fetch` no lleva `await` ni se asigna a una variable).
- **Impacto:** El usuario pulsa "Iniciar sesión" y no ocurre nada visible, incluso si el envío falla. Se pierde el dato silenciosamente. El `console.error` nunca se ejecuta para errores de red.
- **Solución recomendada:** `const res = await fetch(...)`, comprobar `res.ok`, y modelar tres estados (`idle` / `enviando` / `error`) con feedback en la UI. Deshabilitar el botón durante el envío.
- **Dependencias:** Ninguna.

#### `SEC-03` — `/admin` es pública y el "login" no autentica

- **Categoría:** Seguridad · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** La ruta no tiene guardas, el formulario no verifica credenciales y el botón se etiqueta "Iniciar sesión" sin crear sesión alguna. Es una *security theater*: transmite la impresión de un área protegida sin serlo.
- **Evidencia:** `src/App.jsx:20` (ruta hermana de las públicas), `src/pages/Admin.jsx:88` (texto del botón).
- **Impacto:** Falsa sensación de seguridad; si en el futuro se añade contenido sensible bajo `/admin`, quedará expuesto por omisión.
- **Solución recomendada:** Eliminar la ruta hasta que exista autenticación real. Cuando exista, protegerla con un guard basado en sesión del servidor (no en `localStorage`) y un `<Route element={<RequireAuth />}>`.
- **Dependencias:** Backend de autenticación.

#### `MANT-01` — Lockfile de `pnpm` con scripts invocados mediante `npm`

- **Categoría:** Mantenibilidad · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** El repositorio contiene `pnpm-lock.yaml` y **no** contiene `package-lock.json`, pero los scripts documentados y usados son `npm run lint` / `npm run build`. `npm audit` no puede ejecutarse.
- **Evidencia:**
  ```
  $ npm audit
  npm error code ENOLOCK
  npm error audit This command requires an existing lockfile.
  ```
  ```
  package.json:6-10  →  "dev": "vite", "build": "vite build", "lint": "eslint ."
  pnpm-lock.yaml     →  presente
  package-lock.json  →  ausente
  ```
- **Impacto:** Instalaciones no reproducibles: dos desarrolladores pueden obtener árboles de dependencias distintos. Bloquea auditorías de seguridad con npm y complica el CI. `npm install` generaría un segundo lockfile, agravando el problema.
- **Solución recomendada:** Elegir un gestor y declararlo. Dado que el lockfile existente es de pnpm, lo coherente es **adoptar pnpm**: `"packageManager": "pnpm@<versión>"` en `package.json`, documentar `pnpm install / dev / build / lint` y añadir `package-lock.json` a `.gitignore`. Alternativa: borrar `pnpm-lock.yaml` y generar uno de npm (requiere confirmación del equipo).
- **Dependencias:** Acuerdo de equipo. No ejecutar ambos gestores sobre el mismo `node_modules`.

#### `A11Y-03` — `lang="en"` en un sitio íntegramente en español

- **Categoría:** Accesibilidad · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** El documento declara inglés. Todo el contenido está en español.
- **Evidencia:** `index.html:2` → `<html lang="en">`
- **Impacto:** Los lectores de pantalla seleccionan la voz y las reglas de pronunciación inglesas sobre texto español, lo que hace el contenido difícil o ininteligible. También afecta a la traducción automática del navegador y a la indexación por idioma.
- **Solución recomendada:** `<html lang="es">`.
- **Dependencias:** Ninguna. Es el cambio de mayor relación impacto/esfuerzo de toda la auditoría.

#### `UX-01` — El botón "Añadir al carrito" no hace nada

- **Categoría:** UX · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** El botón principal de la página de detalle no tiene `onClick`, no está deshabilitado y no comunica que la función no existe. Lo mismo ocurre con los iconos de carrito y usuario del header.
- **Evidencia:**
  ```jsx
  // src/pages/Producto.jsx:66-68
  <button className="bg-amber-700 text-amber-50 font-bold py-3 px-6 rounded-lg ...">
    AÑADIR AL CARRITO
  </button>
  ```
  ```jsx
  // src/components/Header.jsx:16-19
  <div className="flex items-center gap-2">
    <IoCartOutline className="text-2xl" />
    <FaRegUser className="text-2xl" />
  </div>
  ```
- **Impacto:** El usuario cree que puede comprar y no recibe respuesta. Es la peor clase de error de UX: una affordance falsa en el *call to action* principal del producto.
- **Solución recomendada:** Si el carrito no está en el alcance, **retirar el botón** (o mostrarlo con `disabled` y un texto "Próximamente"). Si está en el alcance, implementarlo con estado local en un contexto y persistencia en `localStorage`.
- **Dependencias:** Decisión de producto sobre el carrito.

#### `UX-02` — Contacto y Acerca no tienen estilos

- **Categoría:** UX · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** Ambas páginas devuelven HTML sin una sola clase de Tailwind. El resto de la aplicación usa una paleta coherente (`amber`/`stone`, `font-serif` en títulos, contenedores `max-w-6xl mx-auto px-6`).
- **Evidencia:**
  ```jsx
  // src/pages/Contactanos.jsx:1-9
  <div>
    <h1>Contacto</h1>
    <p>Calle Mayor 12, Madrid</p>
    <p>info@luthierandco.es</p>
  </div>
  ```
  ```jsx
  // src/pages/Acerca.jsx:1-8
  <div>
    <h1>Acerca de nosotros</h1>
    <p>Artesanos apasionados por el sonido desde 1994.</p>
  </div>
  ```
- **Impacto:** Ruptura visual evidente en 2 de 6 páginas. El `h1` se renderiza con el tamaño por defecto del navegador y el texto pegado al borde izquierdo, bajo un `<main>` con `pt-20`. Inconsistencia de jerarquía y de espaciado.
- **Solución recomendada:** Reutilizar el contenedor y la escala tipográfica del resto (`max-w-6xl mx-auto px-6 py-16`, `text-4xl font-bold font-serif text-stone-800`). En Contacto, añadir un formulario real o, como mínimo, enlaces `mailto:`/`tel:` accesibles.
- **Dependencias:** Ninguna.

#### `PERF-01` — Imágenes remotas sin dimensiones, sin lazy loading y sin formatos modernos

- **Categoría:** Rendimiento · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Medio
- **Descripción:** Las 12 imágenes de producto apuntan a URLs largas de `lh3.googleusercontent.com`, con el tamaño original servido y redimensionado solo por CSS. No se declaran `width`/`height`, ni `loading="lazy"`, ni `decoding="async"`, ni `srcset`/`sizes`.
- **Evidencia:**
  ```jsx
  // src/components/GuitarCard.jsx:7-11
  <img
    src={guitarra.imagen}
    alt={guitarra.nombre}
    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
  />
  ```
  ```jsx
  // src/data/guitarras.js:9 (y las 11 restantes)
  imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQJkDps...'
  ```
- **Impacto:** El contenedor usa `aspect-4/5`, lo que evita el salto de layout *si* el CSS carga, pero el navegador no puede reservar el espacio antes de parsear la imagen. En el catálogo se solicitan 12 imágenes en paralelo, todas en el *above the fold* en escritorio. En móvil con red lenta esto domina el LCP y consume datos. Además, la disponibilidad del sitio depende de un CDN ajeno.
- **Solución recomendada:** Descargar y versionar las imágenes en `src/assets/` (o servirlas desde el backend propio), exportarlas en AVIF/WebP con varios anchos, y usar `srcset`/`sizes` con `width`/`height` explícitos. Añadir `loading="lazy"` a las tarjetas del catálogo (no a la imagen del detalle, que es LCP) y `decoding="async"`. Verificar el peso resultante antes y después.
- **Dependencias:** Licencia/permiso de uso de las imágenes actuales.

#### `TEST-01` — Cero pruebas automatizadas y cero CI

- **Categoría:** Testing · **Prioridad:** P1 · **Tipo:** Confirmado · **Esfuerzo:** Medio
- **Descripción:** No hay framework de test, ni script `test`, ni carpeta `.github/`. No existe ninguna red de seguridad ante refactorizaciones.
- **Evidencia:** `package.json:6-10` (solo `dev`, `build`, `lint`, `preview`); ausencia de `vitest`, `jest`, `playwright` o `@testing-library/*` en dependencias; ausencia de `.github/workflows/`.
- **Impacto:** Cualquier cambio en rutas, datos o componentes puede romper la navegación sin que nadie lo detecte hasta la inspección manual. Es la deuda que más encarece el resto del roadmap.
- **Solución recomendada:** Empezar por lo pequeño y de mayor valor: **Vitest + React Testing Library** para (1) render del catálogo con 12 tarjetas, (2) detalle de producto con id válido e inválido, (3) ruta desconocida → 404. Añadir Playwright solo cuando exista un flujo crítico real (carrito/checkout). CI mínimo en GitHub Actions: `pnpm install --frozen-lockfile`, `lint`, `build`, `test`.
- **Dependencias:** `MANT-01` (decidir gestor) para que el CI sea reproducible.

---

### 5.4 Hallazgos P2 — Medios

#### `A11Y-01` — Los enlaces del footer son `<li>` con `cursor-pointer`

- **Categoría:** Accesibilidad · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** Ocho elementos de navegación del footer (categorías y servicios) son `<li>` con clase `cursor-pointer`. No son enfocables, no responden a Enter ni a Espacio y no tienen `href`.
- **Evidencia:** `src/components/Footer.jsx:16-19` y `:25-28`.
  ```jsx
  <li className="hover:text-amber-200 cursor-pointer">Guitarras Eléctricas</li>
  ```
- **Impacto:** Inaccesibles por teclado y para lectores de pantalla, que no los anuncian como enlaces. Además, la falsa interactividad engaña al usuario vidente: parecen enlaces y no llevan a ningún sitio.
- **Solución recomendada:** Convertirlos en `<Link>` a `/catalogo` (con query param de categoría cuando exista filtro) o en `<button>` si disparan una acción. Si no van a funcionar todavía, renderizarlos como texto sin `cursor-pointer` ni hover.
- **Dependencias:** `ARQ-04` (filtros por categoría) si se quieren enlaces reales.

#### `A11Y-02` — Iconos de carrito y usuario sin nombre accesible ni acción

- **Categoría:** Accesibilidad · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** `IoCartOutline` y `FaRegUser` se renderizan como SVG decorativos dentro de un `<div>`. No son botones, no tienen `aria-label` y no hacen nada.
- **Evidencia:** `src/components/Header.jsx:16-19`.
- **Impacto:** Un usuario de lector de pantalla no sabe que existen (correcto si son decorativos), pero un usuario vidente intenta pulsarlos y no ocurre nada. Inconsistencia de expectativas.
- **Solución recomendada:** Si no hay funcionalidad, eliminarlos. Si la habrá, envolverlos en `<button type="button" aria-label="Abrir carrito">` con `aria-hidden="true"` en el SVG, y un contador con `aria-live` cuando exista carrito.
- **Dependencias:** `UX-01`.

#### `A11Y-04` — `alt` genérico en el detalle de producto

- **Categoría:** Accesibilidad · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** La tarjeta usa el nombre del producto como `alt` (correcto), pero la página de detalle usa `alt="Foto de guitarra"`, que no aporta información y no distingue el modelo.
- **Evidencia:** `src/components/GuitarCard.jsx:9` (`alt={guitarra.nombre}`) frente a `src/pages/Producto.jsx:37` (`alt="Foto de guitarra"`).
- **Impacto:** Inconsistencia; en un contexto con varias imágenes el texto alternativo es inútil.
- **Solución recomendada:** `alt={`${guitarra.nombre} — ${guitarra.marca}`}`. Si la imagen es puramente decorativa en el detalle, `alt=""` sería preferible a un texto vacío de significado.
- **Dependencias:** Ninguna.

#### `UX-03` — El header no enlaza al catálogo ni indica la sección activa

- **Categoría:** UX · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** La navegación ofrece Inicio, Contacto y Acerca, pero **omite el catálogo**, que es la funcionalidad central. Tampoco se marca la ruta activa.
- **Evidencia:** `src/components/Header.jsx:11-15` (`<Link to="/">`, `/contacto`, `/acerca`; ningún `/catalogo`).
- **Impacto:** Desde cualquier página interior solo se llega al catálogo volviendo a Inicio. El usuario no sabe dónde está.
- **Solución recomendada:** Añadir el enlace a `/catalogo` y sustituir `Link` por `NavLink` con `className={({ isActive }) => ...}` y `aria-current="page"`.
- **Dependencias:** Ninguna.

#### `UX-04` — La 404 carga una imagen aleatoria de `cataas.com`

- **Categoría:** UX / Seguridad · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** La página 404 inserta `https://cataas.com/cat`, que devuelve una imagen distinta en cada carga.
- **Evidencia:** `src/pages/Error404.jsx:9`.
- **Impacto:** Dependencia de un servicio externo sin garantía de disponibilidad; en cada visita se envía la IP y el `Referer` del usuario a un tercero; el aspecto cambia en cada recarga; si el servicio cae, aparece una imagen rota en la página de error. Además rompe la identidad visual del sitio.
- **Solución recomendada:** Sustituir por un recurso local o por ningún recurso. La 404 ya es funcional sin imagen.
- **Dependencias:** Ninguna.

#### `UX-05` — Sin error boundary ni estados de carga, error o vacío

- **Categoría:** UX / Calidad · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Medio
- **Descripción:** No hay `ErrorBoundary`. No hay estados de carga (no aplica hoy porque los datos son síncronos, pero sí aplicará con API). El catálogo no contempla lista vacía ni error de datos.
- **Evidencia:** `src/main.jsx:7-13` y `src/App.jsx:11-25` (árbol sin boundary); `src/pages/Catalogo.jsx:12-16` (`guitarras.map` sin rama vacía).
- **Impacto:** Cualquier excepción en render desmonta el árbol completo y deja pantalla blanca sin explicación. Al integrar una API, la ausencia de estados obligará a reescribir las páginas.
- **Solución recomendada:** Un `ErrorBoundary` de clase (o `react-error-boundary` si se acepta una dependencia mínima) envolviendo `<Routes>`, con mensaje y enlace a inicio. Añadir la rama `guitarras.length === 0` en el catálogo.
- **Dependencias:** Para los estados de carga reales, `ARQ-01`.

#### `UX-06` — Ausencia de dirección de arte: interfaz correcta pero genérica

- **Categoría:** UX / UI · **Prioridad:** P2 · **Tipo:** Oportunidad · **Esfuerzo:** Alto
- **Descripción:** La paleta `amber`/`stone` y el `font-serif` son coherentes, pero no hay una decisión de diseño propia detrás: tipografía del sistema (sin fuentes cargadas), una única escala de tamaños sin `clamp()`, un solo gesto de motion (`hover:-translate-y-1` en las tarjetas) y ninguna transición entre rutas. El resultado se lee como una plantilla de Tailwind bien aplicada, no como una tienda de instrumentos de boutique. La inconsistencia de `Home.jsx:12` (`bg-black`, `rounded-2xl`) frente al resto (`amber-700`, `rounded-lg`) es el síntoma más visible de que no existe un sistema rector.
- **Evidencia:**
  - `src/index.css:1` — solo `@import "tailwindcss";`, sin bloque `@theme`, sin fuentes, sin tokens.
  - `src/pages/Home.jsx:12` — CTA con `bg-black text-white rounded-2xl` en una paleta ámbar.
  - `src/components/GuitarCard.jsx:5,10` — único motion del sitio (`hover:shadow-lg hover:-translate-y-1`, `hover:scale-110`).
  - `src/layout/Layout.jsx:9-11` — `<main>` sin transición ni animación de entrada.
  - Ausencia de `@font-face`/`@import` de fuentes en todo el proyecto.
- **Impacto:** No es un defecto funcional, pero limita el valor percibido del producto: un catálogo de instrumentos de 2.000–9.000 € compite por percepción de calidad, y la interfaz actual no la transmite. También explica la deriva visual (cada página nueva inventa su escala).
- **Solución recomendada:** Definir y aplicar una dirección de arte explícita. El proyecto ha decidido apostar por un **estilo tipo Awwwards** (ver **Fase 3.2** del roadmap): tipografía editorial a gran escala, grid roto, motion con intención y textura. Esto **sustituye la restricción inicial de "no cambiar la identidad visual"**, por ser ahora una decisión de producto declarada.
- **Dependencias:** Fase 2 (base de accesibilidad) y Fase 4 (imágenes locales) para las composiciones a sangre. El trabajo de motion debe respetar `prefers-reduced-motion` desde el primer commit.

#### `SEO-01` — Metadatos de plantilla y ausencia de títulos por ruta

- **Categoría:** SEO · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** El documento conserva los valores de la plantilla de Vite: `title` = "guitarla", sin `meta description`, sin Open Graph, sin `canonical`, sin `theme-color`. Al ser una SPA, todas las rutas comparten el mismo título.
- **Evidencia:** `index.html:2-7`.
  ```html
  <html lang="en">
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>guitarla</title>
  </head>
  ```
- **Impacto:** Malos resultados en buscadores y enlaces compartidos sin vista previa. El título de la pestaña no identifica la sección.
- **Solución recomendada:** `title` y `description` reales en `index.html`. Para títulos por ruta, aprovechar el soporte de React 19 para renderizar `<title>` y `<meta>` desde los componentes (se elevan al `<head>` automáticamente), sin añadir librerías. Open Graph requiere prerender/SSR para que los crawlers sociales lo lean (`SEO-02`).
- **Dependencias:** Ninguna para lo básico; `SEO-02` para OG fiable.

#### `SEO-02` — Sin `robots.txt`, `sitemap.xml` ni estrategia de prerender

- **Categoría:** SEO · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Medio
- **Descripción:** No existe `public/robots.txt` ni `public/sitemap.xml`. El contenido se genera en cliente.
- **Evidencia:** `public/` solo contiene `favicon.svg` e `icons.svg`.
- **Impacto:** Los buscadores pueden indexar la SPA, pero con contenido dependiente de la ejecución de JS y sin control de qué rutas se indexan (incluida `/admin`, que no debería indexarse nunca).
- **Solución recomendada:** `robots.txt` con `Disallow: /admin`, `sitemap.xml` estático con las rutas públicas y, si el SEO orgánico es un objetivo de negocio, evaluar prerender (`vite-plugin-ssr`/`react-snap` o migrar a un framework con SSR). **No hacerlo si el SEO no es un objetivo**: sería coste sin retorno.
- **Dependencias:** Decisión de producto sobre SEO orgánico.

#### `COD-01` — Formato de precio inconsistente y dependiente del locale del navegador

- **Categoría:** Calidad · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** La tarjeta usa `toLocaleString()` sin locale ni moneda; el detalle imprime el número crudo. Ambos añaden el símbolo `€` manualmente.
- **Evidencia:**
  ```jsx
  // src/components/GuitarCard.jsx:24
  {guitarra.precio.toLocaleString()} €
  // src/pages/Producto.jsx:49
  <p className="text-2xl font-bold text-amber-700">{guitarra.precio} €</p>
  ```
- **Impacto:** El mismo producto se muestra como "2.450 €" en el catálogo y "2450 €" en el detalle. Peor: `toLocaleString()` sin argumentos usa el locale del navegador, así que un usuario con configuración `en-US` verá "2,450 €", que en español se lee como 2,45 €. Es un error de interpretación de precio.
- **Solución recomendada:** Un único helper, p. ej. `const formatearPrecio = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)`, usado en ambos componentes. Ubicarlo en `src/utils/` o `src/lib/`.
- **Dependencias:** Ninguna.

#### `ARQ-01` — Los datos se importan directamente en los componentes

- **Categoría:** Arquitectura · **Prioridad:** P2 · **Tipo:** Confirmado · **Esfuerzo:** Bajo
- **Descripción:** `guitarras` se importa desde `src/data/guitarras.js` en dos componentes. No hay capa de acceso: los componentes conocen la forma del dato y su origen.
- **Evidencia:** `src/pages/Catalogo.jsx:1`, `src/pages/Producto.jsx:2`, `src/data/guitarras.js:1`.
- **Impacto:** Al migrar a una API REST habrá que modificar cada componente, introducir estados de carga y manejar errores en varios sitios. El acoplamiento actual impide sustituir el origen de datos sin tocar la UI.
- **Solución recomendada:** Introducir un módulo mínimo, p. ej. `src/services/guitarras.js`, con `getGuitarras()` y `getGuitarraById(id)` que hoy devuelvan datos locales y mañana hagan `fetch`. **No** crear todavía un `useGuitarras` con estados ni un contexto global: eso solo se justifica cuando exista la API.
- **Dependencias:** Ninguna (puede hacerse en 30 minutos y desbloquea la Fase 7).

#### `SEC-04` — Nueve vulnerabilidades en dependencias de desarrollo

- **Categoría:** Seguridad · **Prioridad:** P2 · **Tipo:** Riesgo · **Esfuerzo:** Bajo
- **Descripción:** `pnpm audit` reporta 9 avisos: 3 altos, 5 moderados y 1 bajo. Todos en dependencias de desarrollo (transitivas), por lo que no se envían al bundle de producción.
- **Evidencia:**
  ```
  high     | source-map-js | <1.2.2 -> >=1.2.2 | DoS por section offsets
  high     | vite          | 8.3.0-8.3.2 -> >=8.3.3 | launch-editor: bypass de fs.existsSync en Windows
  high     | zod           | <4.6.6 -> >=4.6.6 | agotamiento de memoria
  moderate | vite (x4)     | 8.3.0-8.3.2 -> >=8.3.3 | launch-editor / server.fs / wasm
  moderate | minimatch     | <11.0.1 -> >=11.0.1 | DoS por globparts
  low      | vite          | 8.3.0-8.3.2 -> >=8.3.3 | cross-origin script execution
  ```
- **Impacto:** No afecta al usuario final, pero sí al entorno de desarrollo: varios de los avisos de `vite` permiten ejecución de comandos o lectura de archivos fuera del proyecto durante `vite dev`, y esta auditoría se ejecutó en Windows, donde el aviso del `launch-editor` es el más relevante. Riesgo real solo si se ejecuta el servidor de desarrollo en una máquina compartida o se abren proyectos no confiables.
- **Solución recomendada:** Actualizar dentro del rango declarado (`^8.3.0` ya admite 8.3.3): `pnpm update vite vite@latest --recursive` o equivalente. Verificar con `pnpm audit` y `pnpm run build`. **No** forzar *major* de `zod`/`minimatch` si son transitivos de herramientas de build; el override solo si persiste el aviso.
- **Dependencias:** `MANT-01` (usar el gestor correcto).

#### `TEST-02` — ESLint no evalúa accesibilidad

- **Categoría:** Testing · **Prioridad:** P2 · **Tipo:** Oportunidad · **Esfuerzo:** Bajo
- **Descripción:** La configuración cubre `js.configs.recommended`, `react-hooks` y `react-refresh`, pero no `jsx-a11y`. El lint pasa limpio pese a que existen varios problemas de accesibilidad confirmados en esta auditoría.
- **Evidencia:** `eslint.config.js:7-21` (sin `eslint-plugin-jsx-a11y`); salida de `npm run lint` sin warnings.
- **Impacto:** El "lint limpio" da una falsa señal de calidad. Los problemas de `A11Y-01`, `A11Y-02` y `A11Y-04` no se detectan automáticamente.
- **Solución recomendada:** Añadir `eslint-plugin-jsx-a11y` con su config `recommended` en el flat config. Es una devDependency pequeña y de alto retorno.
- **Dependencias:** Ninguna.

#### `DEP-01` — Deep links sin estrategia de rewrite

- **Categoría:** Mantenibilidad · **Prioridad:** P2 · **Tipo:** Riesgo · **Esfuerzo:** Bajo
- **Descripción:** `BrowserRouter` gestiona rutas en cliente, pero no hay configuración de despliegue que redirija rutas desconocidas a `index.html`.
- **Evidencia:** `src/main.jsx:9` (`BrowserRouter`); ausencia de `vercel.json`, `netlify.toml`, `_redirects` o `nginx.conf`.
- **Impacto:** En un hosting estático sin fallback, recargar `/producto/3` o compartir ese enlace devuelve un 404 del servidor. El sitio funciona al navegar, pero no al entrar directamente.
- **Solución recomendada:** Documentar y añadir la configuración del hosting elegido (`/* /index.html 200` en Netlify, `rewrites` en Vercel, `try_files` en nginx). No hace falta cambiar código.
- **Dependencias:** Decisión de hosting.

---

### 5.5 Hallazgos P3 — Bajos

#### `A11Y-05` — Marca no enlazada, `nav` sin `aria-label`, sin skip link

- **Evidencia:** `src/components/Header.jsx:8-10` (la marca es un `<span>` en un `<div>`), `:11` (`<nav>` sin etiqueta), `src/layout/Layout.jsx:7-13` (sin enlace "Saltar al contenido").
- **Impacto:** Menor, pero son tres mejoras de bajo coste: la marca debería volver a inicio; el `nav` debería distinguirse de otros `nav` futuros; el skip link ahorra tabulaciones en navegación por teclado.
- **Solución:** `<Link to="/">` en la marca, `aria-label="Navegación principal"` en el `nav` y un enlace visualmente oculto al `#contenido` con `<main id="contenido">`.

#### `A11Y-06` — Saltos en la jerarquía de encabezados

- **Evidencia:** `src/pages/Catalogo.jsx:6` (`h1`) → `src/components/GuitarCard.jsx:19` (`h3`), sin `h2` intermedio. `src/pages/Producto.jsx:46` (`h1`) → `:54` (`h3`). `src/components/Footer.jsx:6` (`h3`) → `:14` (`h4`) sin `h2`.
- **Impacto:** La navegación por encabezados de los lectores de pantalla pierde un nivel. El impacto real es bajo porque el documento es corto, pero es trivial de corregir.
- **Solución:** Pasar los títulos de tarjeta y de "Especificaciones" a `h2`, o introducir un `h2` de sección en el catálogo ("Nuestra colección") y en el detalle.

#### `COD-02` — Optional chaining redundante

- **Evidencia:** `src/pages/Producto.jsx:58` → `{guitarra?.specs.map(...)}`. El guard de la línea 8 ya garantiza que `guitarra` existe.
- **Impacto:** Ruido que sugiere una posible ausencia de datos que el código ya descartó. Confunde al lector sobre el flujo.
- **Solución:** `guitarra.specs.map(...)`. Considerar `specs` vacío como caso válido (mostrar la sección solo si `specs.length > 0`).

#### `COD-03` — Estilos duplicados y ausencia de design tokens

- **Evidencia:** `src/index.css:1` es solo `@import "tailwindcss";`, sin bloque `@theme`. El contenedor `max-w-6xl mx-auto px-6` se repite en `Catalogo.jsx:5`, `Producto.jsx:25` y `Footer.jsx:4`. El CTA de `Home.jsx:12` usa `bg-black rounded-2xl` mientras el resto usa `amber-700`/`rounded-lg`. El `text-amber-700 underline` de "Volver al catálogo" se duplica en `Producto.jsx:16` y `:28`.
- **Impacto:** Cambiar la identidad visual exige buscar y reemplazar cadenas de clases en varios archivos. La inconsistencia de `Home` ya es visible (botón negro en una paleta ámbar).
- **Solución:** Definir tokens en `@theme` (colores de marca, radios, contenedor) y extraer 2–3 componentes pequeños: `Container`, `PageTitle`, `Button`. **No** crear un sistema de diseño completo: con tres primitivas basta.
- **Dependencias:** Ninguna.

#### `COD-04` — Formato inconsistente y ausencia de Prettier

- **Evidencia:** Comillas simples y dobles mezcladas (`main.jsx` vs `App.jsx`); punto y coma presente y ausente (`Home.jsx:14` sin `;`, `Catalogo.jsx:18` con `;`); indentación de 3 espacios y `};` tras una declaración de función en `Admin.jsx:17,33`; llaves en la misma línea vs. línea nueva (`Layout.jsx:9`).
- **Impacto:** Los diffs incluyen ruido de formato; las revisiones se centran en estilo en vez de en lógica.
- **Solución:** Añadir Prettier con `printWidth: 80` y `singleQuote: false` (o el criterio que se elija), un script `format` y `eslint-config-prettier` para evitar conflictos. Un único commit de formateo, aislado del resto de cambios.
- **Dependencias:** Ninguna.

#### `COD-05` — Mezcla de idiomas en el código

- **Evidencia:** Identificadores en español (`guitarras`, `nombre`, `precio`, `formulario`, `handleSubmit`), clases y atributos en inglés, textos de UI en español.
- **Impacto:** Ninguno funcional. Es una decisión de convención: mientras sea consistente, es aceptable. El problema aparecerá si se mezclan ambos criterios en el mismo módulo.
- **Solución:** Documentar la convención en el README (p. ej. "dominio en español, infraestructura en inglés") y aplicarla. **No** renombrar nada ahora.

#### `ARQ-02` — `layout/` en singular frente a `components/` y `pages/` en plural

- **Evidencia:** `src/layout/Layout.jsx`.
- **Impacto:** Cosmético. Rompe el paralelismo de nombres de carpeta.
- **Solución:** Renombrar a `src/layouts/` cuando se toque esa zona, no como cambio aislado.

#### `ARQ-03` — `Admin.jsx` convive con las páginas públicas

- **Evidencia:** `src/pages/Admin.jsx` junto a `Home`, `Catalogo`, `Acerca`, `Contactanos`, `Error404`.
- **Impacto:** Si el panel crece, `pages/` mezclará dos áreas con requisitos distintos (público vs. privado, layout distinto, guardas).
- **Solución:** Cuando exista más de una pantalla de administración, mover a `src/features/admin/` o `src/pages/admin/` con su propio layout. Hoy no se justifica.

#### `MANT-02` — Assets muertos

- **Evidencia:** `src/assets/hero.png` (13 KB), `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg` (5 KB). Sin referencias en `src/` (verificado por búsqueda).
- **Impacto:** Confusión sobre qué recursos son reales; los de `public/` se copian a `dist/` sin usarse.
- **Solución:** Eliminarlos en un commit dedicado, previa confirmación. **No** borrar sin verificar que no se usarán en el rediseño.

#### `MANT-03` — `@types/react` sin TypeScript

- **Evidencia:** `package.json:21-22`.
- **Impacto:** Dependencias instaladas que no aportan nada al build; ruido en el árbol.
- **Solución:** Eliminarlas, o mantenerlas si se decide migrar a TypeScript. Ver la nota sobre TypeScript en la sección 9.

#### `MANT-04` — Sin `engines`, `.nvmrc` ni `.editorconfig`

- **Evidencia:** `package.json` sin `engines`; no hay `.nvmrc` ni `.editorconfig`.
- **Impacto:** Diferencias de versión de Node entre entornos (Vite 8 exige Node moderno); indentación distinta según el editor.
- **Solución:** `"engines": { "node": ">=22" }` (ajustar a la versión realmente usada), `.nvmrc` con la misma y `.editorconfig` básico.

#### `MANT-05` — El README es la plantilla de Vite

- **Evidencia:** `README.md:1-29` (habla de `@vitejs/plugin-react-swc` y del React Compiler, nada del proyecto).
- **Impacto:** Un nuevo colaborador no sabe cómo arrancar, qué scripts existen ni qué convenciones seguir. Es el primer archivo que se lee.
- **Solución:** README con propósito, stack, requisitos, comandos (`pnpm dev/build/lint`), estructura de carpetas y convenciones.

#### `SEC-05` — Sin cabeceras de seguridad ni CSP

- **Evidencia:** No hay configuración de hosting ni middleware que defina `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy` o `Permissions-Policy`.
- **Impacto:** Preventivo. Una CSP reduciría el impacto de una futura inyección y bloquearía orígenes no previstos. Hoy el único riesgo de inyección relevante es el de `Admin.jsx` (`SEC-01`), que es de otro tipo.
- **Solución:** Definir las cabeceras en el hosting cuando se elija. Empezar en modo `report-only`. Una CSP estricta requerirá alojar las imágenes en el propio dominio (`PERF-01`), lo que refuerza esa decisión.

#### `SEO-03` — Favicon ajeno a la identidad visual

- **Evidencia:** `public/favicon.svg` es un icono violeta (`#863bff`) con degradados, sin relación con la paleta ámbar/piedra ni con una guitarra.
- **Impacto:** La pestaña del navegador no identifica la marca.
- **Solución:** Favicon propio en SVG (y PNG 32×32 de respaldo). Bajo esfuerzo, impacto perceptible.

---

### 5.6 Matriz de priorización (impacto × esfuerzo)

```
IMPACTO ALTO
   │  SEC-01            PERF-01
   │  SEC-02  SEC-03    TEST-01
   │  A11Y-03 UX-01     UX-05  SEO-02
   │  UX-02   MANT-01
   │  ─────────────────────────────
   │  A11Y-01 A11Y-02   COD-03
   │  A11Y-04 UX-03     ARQ-01
   │  UX-04   SEO-01    SEC-04
   │  COD-01  TEST-02   UX-06
   │  DEP-01  MANT-02/05
   │  A11Y-05/06 COD-02/04
   └──────────────────────────────→ ESFUERZO
     BAJO              MEDIO        ALTO
```

Los nueve hallazgos de la esquina superior izquierda (alto impacto, bajo esfuerzo) resuelven la mayor parte del riesgo del proyecto en aproximadamente una jornada de trabajo. `UX-06` es el único de alto esfuerzo y alto impacto: no es una corrección, es una inversión de producto.

---

## 6. Fortalezas del proyecto

No todo es deuda. Lo siguiente está bien resuelto y conviene **no** tocarlo:

1. **Enrutado idiomático.** `Layout` como ruta padre con `<Outlet />` y ruta comodín `*` para la 404 es exactamente el patrón recomendado en React Router 7. Evita duplicar header y footer.
2. **Hooks usados con criterio.** No hay `useEffect` para datos derivados, ni `useMemo`/`useCallback` preventivos, ni estado global innecesario. Solo existe un `useState` (en `Admin.jsx`) y su actualización es funcional (`setFormulario((prev) => ...)`), que es la forma correcta de evitar closures obsoletos.
3. **Cero errores de lint** con `react-hooks` y `react-refresh` activos. No hay dependencias faltantes en hooks ni exports que rompan el Fast Refresh.
4. **Datos centralizados y tipados de facto.** Un único módulo con 12 objetos de forma homogénea, incluyendo un campo `categoria` ya presente que habilita filtros futuros sin tocar el modelo.
5. **Separación componente/página razonable.** `GuitarCard` está extraído y recibe props; `Catalogo` orquesta. No hay componentes de 200 líneas con lógica mezclada.
6. **Accesibilidad de base correcta.** Hay `<header>`, `<nav>`, `<main>`, `<footer>`, `h1` único por página, `alt` en todas las imágenes, `label` con `htmlFor` en el formulario, y **no se detectaron fallos de contraste** en los pares principales (p. ej. `text-stone-600` sobre `amber-50` ≈ 7,6:1; `text-amber-700` sobre `amber-50` ≈ 5:1).
7. **Bundle razonable.** 90.61 kB gzip para React + Router + Tailwind + 2 iconos. Los iconos se importan por paquete específico (`react-icons/io5`, `react-icons/fa6`) y el tree-shaking funciona: 42 módulos transformados.
8. **Historial de git limpio.** Mensajes convencionales y trabajo agrupado por *features* en PRs.
9. **Stack actualizado.** React 19.2, Vite 8.3, Router 7.18, Tailwind 4.3, ESLint 10. No hay deuda de versiones mayores pendiente.
10. **Sin sobreingeniería.** No hay Redux, ni Zustand, ni capa de servicios vacía, ni TypeScript a medias. Es una base honesta sobre la que construir.

---

## 7. Deuda técnica identificada

| Deuda | Origen | Coste de no pagarla | Cuándo pagarla |
|---|---|---|---|
| Ausencia de tests | Proyecto nacido como ejercicio | Cada cambio exige prueba manual; los refactors son arriesgados | **Fase 6**, antes de añadir features |
| Gestor de paquetes indeterminado | Convivencia de `pnpm-lock` y `npm` | Builds irreproducibles, auditorías bloqueadas | **Fase 0** |
| Acceso a datos acoplado | Import directo del array | Reescribir 2 componentes + añadir estados al integrar API | **Fase 7** (o antes de la API) |
| Estilos sin tokens | Clases literales repetidas | Cambios de marca costosos y deriva visual | **Fase 3** |
| Sin dirección de arte | Interfaz genérica, sin jerarquía editorial ni motion | El producto no transmite el valor de su catálogo | **Fase 3.2** |
| Sin capa de accesibilidad automatizada | ESLint sin `jsx-a11y` | Regresiones silenciosas de a11y | **Fase 6** |
| Metadatos de plantilla | `index.html` sin tocar | Mala indexación y enlaces sin preview | **Fase 5** |
| Formulario "admin" sin backend | Solución provisional | Riesgo legal y de datos | **Fase 1** (bloqueante) |
| Assets y README de plantilla | Restos del scaffold | Confusión para nuevos colaboradores | **Fase 0** |

**Deuda aceptable (no pagar ahora):** ausencia de TypeScript, ausencia de estado global, ausencia de code splitting, ausencia de SSR. Las cuatro se justifican solo con un cambio de escala o de requisitos, y hoy no se dan.

---

## 8. Roadmap de mejoras por fases

> Orden: primero **estabilidad y seguridad**, luego **calidad percibida (a11y/UX)**, después **rendimiento y SEO**, y al final **arquitectura para el futuro**. Cada fase es desplegable de forma independiente.

### Fase 0 — Estabilización del repositorio

- **Objetivo:** Que cualquier persona pueda clonar, instalar y construir el proyecto de forma idéntica.
- **Hallazgos que resuelve:** `MANT-01`, `MANT-02`, `MANT-03`, `MANT-04`, `MANT-05`, `SEC-04`
- **Archivos:** `package.json`, `.gitignore`, `README.md`, `pnpm-lock.yaml`, `src/assets/*`, `public/icons.svg`
- **Tareas:**
  1. Decidir el gestor (recomendado: pnpm) y declarar `packageManager`.
  2. Actualizar `vite` a `>=8.3.3` dentro del rango y re-ejecutar `audit`.
  3. Eliminar `@types/react` y `@types/react-dom`.
  4. Eliminar assets sin referencia (commit aislado, previa confirmación).
  5. Reescribir el README con stack, comandos y estructura.
  6. Añadir `engines`, `.nvmrc`, `.editorconfig`.
- **Dependencias:** Ninguna. Es la primera fase.
- **Criterios de aceptación:** `pnpm install --frozen-lockfile` funciona desde cero; `pnpm audit` sin avisos altos; `pnpm build` verde; el README permite arrancar sin ayuda.
- **Pruebas:** Instalación limpia en un directorio temporal; `pnpm build`.
- **Resultado esperado:** Repositorio reproducible y auditable.

### Fase 1 — Seguridad y datos personales (bloqueante para publicar)

- **Objetivo:** Eliminar la exposición de datos personales y cualquier apariencia de autenticación.
- **Hallazgos que resuelve:** `SEC-01`, `SEC-02`, `SEC-03`
- **Archivos:** `src/pages/Admin.jsx`, `src/App.jsx`
- **Tareas:**
  1. **Retirar la ruta `/admin` y el formulario** del árbol desplegable (decisión recomendada). Alternativa: moverlos a una rama de experimentación.
  2. Si se conserva: `await` + `response.ok`, validación de DNI (formato y letra), estados `enviando`/`error`/`éxito`, aviso de privacidad.
  3. Eliminar el `POST` a `mockapi.io` en cualquier caso.
  4. Añadir `Disallow: /admin` si la ruta sobrevive.
- **Dependencias:** Fase 0 (para poder construir de forma reproducible).
- **Criterios de aceptación:** No existe ninguna petición saliente con datos personales; `grep -r "mockapi" src/` sin resultados; el build no incluye `Admin`.
- **Pruebas:** Búsqueda estática del endpoint; revisión manual del bundle generado.
- **Resultado esperado:** Riesgo legal y reputacional eliminado.

### Fase 2 — Accesibilidad y semántica base

- **Objetivo:** Que la aplicación sea navegable y comprensible con teclado y lector de pantalla.
- **Hallazgos que resuelve:** `A11Y-01`, `A11Y-02`, `A11Y-03`, `A11Y-04`, `A11Y-05`, `A11Y-06`
- **Archivos:** `index.html`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/layout/Layout.jsx`, `src/pages/Producto.jsx`, `src/components/GuitarCard.jsx`
- **Tareas:**
  1. `lang="es"`.
  2. Footer: `<li>` → `<Link>`/`<button>` o texto sin falsa interactividad.
  3. Header: marca como enlace a `/`, `aria-label` en `nav`, iconos con `aria-label` o eliminados.
  4. `alt` descriptivo en el detalle.
  5. Skip link + `<main id="contenido">`.
  6. Corregir la jerarquía `h1 → h3`.
  7. Verificar foco visible en tarjetas y enlaces.
- **Dependencias:** Ninguna (paralelizable con Fase 3).
- **Criterios de aceptación:** Navegación completa con Tab sin trampas; cero violaciones críticas en axe DevTools; todos los `img` con `alt` significativo.
- **Pruebas:** Recorrido manual con teclado; axe en las 6 rutas.
- **Resultado esperado:** Accesibilidad base WCAG 2.1 AA en estructura y semántica.

### Fase 3 — Rediseño visual tipo Awwwards y consistencia de UX

- **Objetivo:** Pasar de "plantilla de Tailwind bien aplicada" a una identidad propia de tienda de instrumentos de boutique, eliminando de paso la ruptura visual y las affordances falsas. La dirección de arte elegida es **tipo Awwwards**: editorial, tipográfica, con motion intencionado.
- **Hallazgos que resuelve:** `UX-01`, `UX-02`, `UX-03`, `UX-04`, `UX-05`, `UX-06`, `COD-01`, `COD-03`
- **Archivos:** `src/pages/Contactanos.jsx`, `src/pages/Acerca.jsx`, `src/pages/Producto.jsx`, `src/pages/Home.jsx`, `src/pages/Catalogo.jsx`, `src/pages/Error404.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/GuitarCard.jsx`, `src/index.css`, `src/utils/`, `public/fonts/`, `src/hooks/useReveal.js` (nuevo)
- **Restricción de diseño:** el prompt original pedía no alterar la identidad visual sin justificación. **Este rediseño es una decisión de producto declarada**, por lo que sustituye esa restricción; se documenta aquí para que quede trazable.

#### 3.1 Correcciones previas al rediseño (no dependen de la dirección de arte)

1. Estilar Contacto y Acerca con el contenedor y la escala tipográfica existentes.
2. Header: enlace a catálogo + `NavLink` con estado activo.
3. Decidir el destino del botón "Añadir al carrito": retirar, deshabilitar con texto claro, o implementar.
4. Sustituir la imagen de `cataas.com` por un recurso local o por nada.
5. Helper único de formato de precio (`Intl.NumberFormat("es-ES")`).
6. `ErrorBoundary` envolviendo `<Routes>`; rama vacía en el catálogo.
7. Tokens base en `@theme` (color, radios, contenedor) y primitivas `Container` / `Button` / `PageTitle`.

#### 3.2 Dirección de arte tipo Awwwards

> **Regla de oro:** nada de esto se implementa "porque queda bien". Cada decisión debe poder justificarse en una frase y sobrevivir a un presupuesto de rendimiento.

1. **Definir el concepto antes de escribir CSS.** Un documento breve (media página en `docs/`) con: 3 adjetivos que debe transmitir la marca, 2–3 referencias visuales, qué se conserva (paleta cálida, `serif` en titulares) y qué se descarta. Sin esto, el rediseño deriva en una colección de efectos.
2. **Tipografía editorial.** Sustituir la serif del sistema por una **display de alto contraste** para titulares (o una grotesca condensada si se prefiere un tono más moderno) y una **sans neutra** para UI y cuerpo. Máximo **2 familias y 3 pesos**, self-hosted en `woff2`, subset latino, `font-display: swap`. Presupuesto: **≤ 120 kB** de fuentes en total.
3. **Escala tipográfica fluida.** Tokens en `@theme` con `clamp()` (`--text-display`, `--text-h1`, `--text-h2`, `--text-body`). Titulares de Home y detalle de producto a escala display (rango 56–140 px según viewport), sin media queries ad hoc.
4. **Grid editorial con ruptura deliberada.** Base de 12 columnas, pero el catálogo **no** es un grid uniforme de 3: alternar tarjetas de 5 y 7 columnas, imágenes a sangre (`100vw`) en Home y en el detalle, y numeración de sección tipo `01 — Catálogo`, `02 — Detalle`. El detalle de producto pasa a composición asimétrica (imagen 60 % / ficha 40 %) con el precio como elemento tipográfico, no como etiqueta.
5. **Motion con intención.** (a) Transición de entrada por ruta (fade + desplazamiento de 12–16 px, 250–350 ms); (b) *reveal* on scroll con `IntersectionObserver` + clases CSS, sin librería; (c) hover de tarjeta: la imagen escala, la marca y el precio aparecen con *stagger*; (d) entrada escalonada del grid del catálogo. Todo con `transform` y `opacity` únicamente.
6. **Microinteracciones.** Botones con estado `hover`/`active`/`focus-visible` diferenciados; subrayado animado en los enlaces del header; contador o *ticker* de marcas (Fender, Gibson, Taylor, PRS…) solo si se alimenta de datos reales del catálogo, no como relleno.
7. **Textura y profundidad.** Grano/noise sutil en SVG inline o `feTurbulence` sobre el fondo, sombras en dos niveles (reposo/hover) coherentes entre tarjetas, bordes de 1 px en `stone-200`. **No** usar glassmorphism ni degradados morados: no encajan con la marca.
8. **Hero de Home a pantalla completa.** Imagen local (de Fase 4) a sangre, titular display, y una única llamada a la acción. El `min-h-[70vh]` actual pasa a una composición de altura completa con el contenido alineado a la base del grid.
9. **Cursor personalizado, solo si aporta.** Permitido únicamente bajo `@media (hover: hover) and (pointer: fine)`, con fallback al cursor nativo. Nunca en táctil, nunca ocultando el cursor por defecto sin alternativa.
10. **Guardarraíles no negociables.**
    - `prefers-reduced-motion: reduce` desactiva **todas** las animaciones no esenciales (implementarlo en el primer commit, no al final).
    - Ninguna animación bloquea la lectura ni retrasa el contenido; nada de *scroll hijacking* ni *pinned sections* en esta fase.
    - No animar `width`, `height`, `top`, `left`, `margin` ni `box-shadow`: solo `transform`/`opacity` (y `filter` con moderación).
    - La Fase 2 no se negocia: contraste AA, foco visible sobre los nuevos fondos, navegación por teclado intacta.
    - Ningún texto de UI por debajo de 14 px (el badge de `GuitarCard.jsx:13` está a 10 px y debe subir).

#### 3.3 Presupuesto técnico del rediseño

| Recurso | Límite |
|---|---|
| Fuentes (woff2, subset latino) | ≤ 120 kB total, 2 familias, 3 pesos |
| JS añadido para motion | ≤ 15 kB gzip |
| Librerías nuevas | 0 por defecto. `motion`/`framer-motion` solo si la coreografía lo exige **y** se justifica por escrito |
| Animaciones simultáneas en pantalla | ≤ 3 propiedades por elemento |
| Lighthouse móvil tras el rediseño | Performance ≥ 90, Accessibility ≥ 95 |

- **Dependencias:** Fase 2 (a11y base, para no repetir trabajo) y Fase 4 (imágenes locales) para cerrar las composiciones a sangre; durante la Fase 3 se trabaja con las imágenes actuales como marcador de posición.
- **Criterios de aceptación:**
  - Existe el documento de concepto/dirección de arte y el código lo respeta (tipografía, escala, paleta, reglas de motion).
  - Las 6 páginas comparten el mismo sistema; ninguna vista se sale de la paleta ni inventa su escala.
  - Al menos **3 decisiones de arte verificables** que no existen hoy: tipografía display propia, ruptura de grid y motion propio.
  - Ningún botón visible sin acción; el precio se muestra idéntico en catálogo y detalle.
  - Con `prefers-reduced-motion: reduce` el sitio es completamente estático y funcional.
  - Cero violaciones críticas en axe; navegación completa con teclado.
  - Presupuesto de 3.3 cumplido, medido con el build y Lighthouse.
- **Pruebas:**
  - Revisión visual en 360, 768, 1024, 1440 y 1920 px.
  - `prefers-reduced-motion: reduce` emulado en DevTools → sin transiciones ni reveals.
  - Recorrido completo con Tab y verificación de `:focus-visible` sobre los fondos nuevos.
  - Lighthouse antes/después (móvil con throttling); comprobación del peso de fuentes en el build.
  - Emulación táctil para confirmar que no aparece el cursor personalizado.
  - Forzar un error de render para validar el `ErrorBoundary`; probar la 404.
- **Resultado esperado:** Una identidad visual reconocible, con la misma coherencia funcional que antes pero sin parecer una plantilla. Es la fase con mayor impacto percibido y también la de mayor riesgo de sobreingeniería: el presupuesto de 3.3 existe para contenerlo.

### Fase 4 — Rendimiento y activos

- **Objetivo:** Reducir LCP y CLS en móvil sin tocar la arquitectura.
- **Hallazgos que resuelve:** `PERF-01` (+ decisión documentada sobre `PERF-02`)
- **Archivos:** `src/assets/`, `src/data/guitarras.js`, `src/components/GuitarCard.jsx`, `src/pages/Producto.jsx`
- **Tareas:**
  1. Descargar las 12 imágenes y versionarlas localmente.
  2. Exportar en AVIF/WebP a 320/640/960 px de ancho.
  3. `srcset`/`sizes` + `width`/`height` explícitos.
  4. `loading="lazy"` en tarjetas, `loading="eager"` + `fetchpriority="high"` en el detalle.
  5. Medir antes/después con Lighthouse (móvil, throttling).
- **Dependencias:** Licencia de las imágenes; Fase 0 para el pipeline de build.
- **Criterios de aceptación:** LCP móvil < 2,5 s en 4G simulada; CLS < 0,1; peso total de imágenes del catálogo < 1 MB; ninguna petición a `googleusercontent.com`.
- **Pruebas:** Lighthouse antes/después; Network throttling; comprobación de que no hay imágenes rotas.
- **Resultado esperado:** Core Web Vitals en verde y autonomía respecto a CDNs ajenos.
- **Nota sobre `PERF-02`:** con 90.61 kB gzip y 7 rutas triviales, **no se recomienda code splitting por ruta**. `React.lazy` añadiría latencia y complejidad a cambio de una mejora marginal. Revisar solo si `/admin` vuelve con un bundle propio grande.

### Fase 5 — SEO y metadatos

- **Objetivo:** Que cada página sea identificable al compartirse y correctamente indexada.
- **Hallazgos que resuelve:** `SEO-01`, `SEO-02`, `SEO-03`, `DEP-01`
- **Archivos:** `index.html`, `public/`, componentes de página, configuración de hosting
- **Tareas:**
  1. `title`, `description`, `theme-color` reales.
  2. `<title>`/`<meta>` por ruta con el *hoisting* nativo de React 19 (sin librerías).
  3. Open Graph + Twitter Card con una imagen de 1200×630 local.
  4. `robots.txt` y `sitemap.xml`.
  5. Favicon propio.
  6. Configuración de rewrite del hosting para deep links.
- **Dependencias:** Fase 4 (imágenes locales) para OG; Fase 0 (hosting decidido) para `DEP-01`.
- **Criterios de aceptación:** Cada ruta tiene un título distinto; los enlaces compartidos muestran preview; recargar `/producto/3` no devuelve 404 del servidor.
- **Pruebas:** Inspección del `<head>` por ruta; validador de Open Graph; recarga directa de cada URL en producción.
- **Resultado esperado:** Presencia correcta en buscadores y redes.

### Fase 6 — Calidad automatizada: tests y CI

- **Objetivo:** Introducir la red de seguridad que hoy no existe.
- **Hallazgos que resuelve:** `TEST-01`, `TEST-02`, `COD-04`
- **Archivos:** `package.json`, `eslint.config.js`, `vitest.config.js` (nuevo), `src/**/*.test.jsx` (nuevos), `.github/workflows/ci.yml` (nuevo), `.prettierrc` (nuevo)
- **Tareas:**
  1. `vitest` + `@testing-library/react` + `jsdom`, script `test`.
  2. Tres tests de humo: catálogo renderiza 12 tarjetas; detalle con id válido/inválido; ruta desconocida → 404.
  3. `eslint-plugin-jsx-a11y` + `eslint-config-prettier`; script `format`.
  4. Un commit de formateo aislado con Prettier.
  5. Workflow: `install --frozen-lockfile`, `lint`, `build`, `test`.
  6. Playwright **solo** cuando exista carrito/checkout.
- **Dependencias:** Fase 0 (gestor y lockfile) y Fase 3 (componentes estabilizados).
- **Criterios de aceptación:** `pnpm test` verde; el CI falla si el lint o un test falla; PR bloqueado sin CI verde.
- **Pruebas:** Romper a propósito un test y verificar que el CI falla.
- **Resultado esperado:** Cambios futuros verificados automáticamente.

### Fase 7 — Preparación para la evolución del producto

- **Objetivo:** Dejar la arquitectura lista para carrito, filtros, auth y API **sin implementarlos**.
- **Hallazgos que resuelve:** `ARQ-01`, `ARQ-02`, `ARQ-03`, `COD-05`, `SEC-05`
- **Archivos:** `src/services/guitarras.js` (nuevo), `src/pages/Catalogo.jsx`, `src/pages/Producto.jsx`, README
- **Tareas:**
  1. Capa de acceso a datos: `getGuitarras()`, `getGuitarraById(id)`, `getCategorias()`.
  2. Documentar la convención de idioma del código.
  3. Renombrar `layout/` → `layouts/` si se toca esa zona.
  4. Definir cabeceras de seguridad en el hosting (CSP en `report-only`).
  5. Documentar en el README el plan de evolución (dónde iría el estado del carrito, dónde el contexto de auth).
- **Dependencias:** Fases 3 y 6.
- **Criterios de aceptación:** Sustituir los datos locales por una API no requiere tocar `Catalogo`/`Producto` más allá de añadir estados de carga.
- **Pruebas:** Test de `getGuitarraById` con id inexistente; revisión de que ningún componente importa `data/guitarras` directamente.
- **Resultado esperado:** Base preparada, sin funcionalidades nuevas.

### 8.1 Dependencias entre fases

```
Fase 0 ──┬── Fase 1 (seguridad, bloqueante)
         ├── Fase 2 ── Fase 3 ── Fase 4 ── Fase 5
         └── Fase 6 ── Fase 7
```

Las fases 2 y 4 pueden solaparse; las 6 y 7 requieren que la UI esté estabilizada.

**Matiz por el rediseño (Fase 3.2):** la Fase 3 se desarrolla con las imágenes actuales como marcador de posición y **se cierra visualmente al terminar la Fase 4**, cuando las imágenes locales y optimizadas ya existen. Es un ida y vuelta deliberado: no tiene sentido componer imágenes a sangre con URLs remotas que se van a reemplazar. Las correcciones de 3.1 no esperan a nada.

---

## 9. Recomendaciones técnicas

### 9.1 Qué hacer primero y por qué

1. **`SEC-01` / `SEC-02` / `SEC-03` (Fase 1).** Un DNI saliendo hacia un mock de terceros es un problema que no se puede dejar "para la semana que viene". Se resuelve eliminando código, no escribiéndolo.
2. **`A11Y-03` (`lang="es"`).** Un carácter. El mayor retorno por esfuerzo de todo el informe.
3. **`UX-02` (Contacto y Acerca).** Dos páginas que hoy parecen rotas. Es lo primero que ve un evaluador.
4. **`MANT-01` (gestor de paquetes).** Sin esto, el CI de la Fase 6 no será reproducible.
5. **Rediseño tipo Awwwards (Fase 3.2).** Va **después** de las correcciones de 3.1: rediseñar sobre dos páginas sin estilos y un CTA roto solo amplifica el problema. Primero se arregla lo que está mal, luego se le da carácter.

### 9.2 Lo que **no** se recomienda hacer

| Tentación | Veredicto | Motivo |
|---|---|---|
| Añadir Redux / Zustand | ❌ No ahora | No hay estado compartido. El único estado es un formulario local. Un `useState` en un contexto basta cuando llegue el carrito. |
| Migrar a TypeScript | ⚠️ Solo si el proyecto crece | Con ~500 líneas y 12 productos, el coste de migración (tipos, config, curva) supera el beneficio. Si se integra una API con contratos complejos, reevaluar. Mientras tanto, los `@types` instalados sobran. |
| Code splitting por ruta | ❌ No ahora | 90.61 kB gzip totales. `React.lazy` en 7 rutas triviales empeora la latencia percibida. |
| `React.memo` / `useMemo` / `useCallback` | ❌ No | No hay re-renders costosos: sin estado compartido, sin listas de miles de elementos, sin cálculos pesados. Añadirlos sería ruido. |
| Librería de componentes (MUI, shadcn) | ❌ No | La dirección de arte es propia y se construye sobre Tailwind. Un sistema ajeno impondría su lenguaje visual. |
| GSAP / Framer Motion para el rediseño | ⚠️ Solo si la coreografía lo exige | Con CSS + `IntersectionObserver` se cubren reveals, transiciones de ruta y hover (Fase 3.2). Añadir una librería de motion sin necesidad contradice el presupuesto de 15 kB y el principio de no sobreingeniería. |
| Cursor personalizado global | ⚠️ Solo en puntero fino | En táctil no existe hover y un cursor falso rompe la accesibilidad. Se limita con `@media (hover: hover) and (pointer: fine)`. |
| Scroll hijacking / secciones pinned | ❌ No en esta fase | Un sitio Awwwards no requiere secuestrar el scroll. Añade frustración, rompe `prefers-reduced-motion` y complica el SEO. |
| `react-helmet` | ❌ No | React 19 eleva `<title>` y `<meta>` al `<head>` de forma nativa. |
| SSR / Next.js | ⚠️ Depende del negocio | Solo si el SEO orgánico o el tiempo de primera carga son objetivos medibles. Hoy no hay evidencia de ello. |
| i18n (`react-i18next`) | ❌ No | Un solo idioma, sin requisito de multiidioma. |

### 9.3 Convenciones sugeridas

- **Precios:** siempre vía helper con `Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })`.
- **Datos:** ningún componente importa `data/guitarras` directamente; todo pasa por `services/`.
- **Accesibilidad:** todo elemento clicable es `<a>`, `<Link>` o `<button>`; nunca un `<div>`/`<li>` con `onClick` o `cursor-pointer`.
- **Formato:** Prettier como única fuente de verdad; el lint no discute estilo.
- **Nombres:** dominio en español (`guitarra`, `precio`), infraestructura en inglés (`fetchGuitarras` → o `getGuitarras`, pero consistente).

---

## 10. Conclusión y valoración general

GUITAR-SHOP es un proyecto **bien encaminado y mal rematado**. La arquitectura de rutas es la correcta, los componentes son pequeños, los hooks se usan con criterio y no hay sobreingeniería: eso es más de lo que se ve en la mayoría de proyectos de este tamaño. El build es rápido (511 ms) y ligero (90.61 kB gzip).

Lo que falta no es talento arquitectónico, es **disciplina de acabado**: dos páginas sin estilos, botones que no hacen nada, un formulario que filtra datos personales, metadatos de plantilla y cero pruebas. Son problemas de ejecución, no de diseño, y por eso son baratos de resolver.

| Dimensión | Nota | Comentario |
|---|---:|---|
| Arquitectura | 6/10 | Correcta y simple; falta capa de datos |
| Calidad de código | 6/10 | Legible; sin formato unificado |
| Rendimiento | 6/10 | JS bien; imágenes mal |
| UX/UI | 4/10 | Inconsistencia visible |
| Accesibilidad | 4/10 | Base sólida, remate ausente |
| Seguridad | 3/10 | PII a un tercero |
| SEO | 3/10 | Metadatos de plantilla |
| Testing | 2/10 | Nada |
| Mantenibilidad | 5/10 | Fácil de leer, difícil de verificar |
| **Global** | **5.5/10** | **Base sólida, acabado pendiente** |

**Con las fases 0 a 3.1** (unas 2–3 jornadas de trabajo) el proyecto pasaría de "ejercicio de bootcamp" a "aplicación presentable". **La Fase 3.2** (rediseño tipo Awwwards) es una inversión aparte, de esfuerzo alto: añade entre 1 y 2 semanas si se hace con criterio, y es la única partida del roadmap que se justifica por valor percibido y no por riesgo. **Con las fases 4 a 6** quedaría en condiciones de producción para un catálogo estático. La fase 7 es preparación, no obligación.

---

## Anexo A — Comandos ejecutados y resultados

| Comando | Resultado |
|---|---|
| `npm run lint` | ✅ Sin errores ni warnings (`eslint .` sobre todo el repo) |
| `npm run build` | ✅ 42 módulos, 511 ms. JS 280.10 kB (90.61 kB gzip), CSS 19.83 kB (4.62 kB gzip), HTML 0.45 kB |
| `npm audit` | ❌ `ENOLOCK`: no existe `package-lock.json` (evidencia de `MANT-01`) |
| `pnpm audit` | ⚠️ 9 vulnerabilidades: 3 altas, 5 moderadas, 1 baja. Todas en dependencias de desarrollo |
| `git status` | `M src/App.jsx`, `?? src/pages/Admin.jsx`, `?? prompt-1.md` |
| `git log --oneline -10` | 7 commits, 3 PRs mergeados |
| `grep` de assets | `hero.png`, `react.svg`, `vite.svg`, `icons.svg`: 0 referencias en `src/` |

**No se ejecutó `npm install`** (habría creado `package-lock.json` y agravado `MANT-01`). `node_modules` ya estaba presente y el build funcionó con él.

**Cambios realizados en el repositorio:** únicamente la creación de `docs/AUDITORIA_TECNICA.md`. La carpeta `dist/` fue generada por el build y está cubierta por `.gitignore`.

---

## Anexo B — Limitaciones de la auditoría

1. **Sin ejecución en navegador.** No se levantó el servidor de desarrollo ni se hicieron pruebas manuales de interacción, foco o responsive. Los hallazgos de UX y accesibilidad se basan en inspección del código y en el comportamiento esperado de las clases de Tailwind; conviene confirmarlos con un recorrido real.
2. **Sin métricas de campo.** No se midieron Core Web Vitals con Lighthouse ni con datos de usuarios reales. La valoración de `PERF-01` se apoya en el patrón de carga (12 imágenes remotas sin `srcset`), no en una medición.
3. **Endpoint de `mockapi.io` no inspeccionado.** No se realizó ninguna petición al servicio externo. Se desconoce si permite lectura anónima; por eso `SEC-01` lo trata como riesgo además de problema confirmado.
4. **Sin `npm install` limpio.** El build se ejecutó sobre el `node_modules` existente, cuyo origen (pnpm o npm) no se verificó.
5. **Contraste calculado de forma aproximada.** Los ratios citados se estiman a partir de los valores hex de la paleta de Tailwind; no se usó un medidor sobre píxeles renderizados.
6. **Sin revisión de historial completo.** No se auditó el contenido de los commits anteriores ni las ramas remotas; el análisis se centra en el estado actual del árbol.
7. **Alcance de seguridad acotado al frontend.** No hay backend, infraestructura ni pipeline que auditar. Los puntos de `SEC-05` son recomendaciones preventivas, no vulnerabilidades observadas.
