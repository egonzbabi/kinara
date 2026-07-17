import { Link } from "react-router";
import type { Route } from "./+types/checkout.cancelado";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Pago cancelado · KINARA" }];
}

export default function CheckoutCancelado() {
  return (
    <div className="pad flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="font-display text-[clamp(30px,4vw,44px)]">No completaste el pago</h1>
      <p className="max-w-[46ch] text-muted">
        No te preocupes, tu carrito sigue intacto. Puedes volver a intentarlo cuando quieras.
      </p>
      <Link to="/tienda" className="btn btn-clay mt-2">
        Volver a la tienda
      </Link>
    </div>
  );
}
