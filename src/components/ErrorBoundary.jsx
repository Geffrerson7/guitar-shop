import { Component } from "react";
import Container from "./ui/Container";
import Button from "./ui/Button";
import { buttonClasses } from "./ui/buttonStyles";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error inesperado en el árbol de React:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main id="contenido" className="flex min-h-screen items-center py-24">
        <Container>
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-accent">
            Error inesperado
          </p>
          <h1 className="max-w-3xl font-display text-h1 text-balance">
            Algo se ha desafinado.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft">
            No hemos podido mostrar esta página. Puedes intentarlo de nuevo o
            volver al inicio mientras lo revisamos.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button onClick={this.handleRetry}>Reintentar</Button>
            <a href="/" className={buttonClasses("outline")}>
              Volver al inicio
            </a>
          </div>
        </Container>
      </main>
    );
  }
}
