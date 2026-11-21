-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioCentimos" INTEGER NOT NULL,
    "imagen" TEXT NOT NULL,
    "specs" TEXT[],
    "badge" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "categoriaId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");

-- CreateIndex
CREATE INDEX "Producto_categoriaId_idx" ON "Producto"("categoriaId");

-- CreateIndex
CREATE INDEX "Producto_activo_idx" ON "Producto"("activo");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
