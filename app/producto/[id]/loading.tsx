import Container from "@/components/ui/Container";

/*
 * Esqueleto del detalle (UX-05): visible mientras se genera por primera vez
 * un producto que no se prerenderizó en el build (p. ej. uno creado desde el
 * panel en la Fase 13). Misma composición 7/5 que la página real.
 */
export default function ProductoLoading() {
  return (
    <div className="pb-8" aria-busy="true">
      <Container className="pt-8">
        <p role="status" className="sr-only">
          Cargando la pieza…
        </p>
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          <div className="mb-10 h-4 w-48 rounded-full bg-paper-deep" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <div className="-mx-5 aspect-[4/5] bg-paper-deep sm:-mx-8 lg:mx-0 lg:rounded-[2rem]" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-4 w-36 rounded-full bg-paper-deep" />
              <div className="mt-14 h-4 w-28 rounded-full bg-paper-deep" />
              <div className="mt-6 h-16 w-full rounded-2xl bg-paper-deep" />
              <div className="mt-10 h-14 w-48 rounded-2xl bg-paper-deep" />
              <div className="mt-10 h-24 w-full rounded-2xl bg-paper-deep" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
