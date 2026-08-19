import type { Route } from "./+types/politica-de-envios";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Política de Envíos · KINARA" },
    {
      name: "description",
      content: "Tiempos de preparación y entrega, rastreo y costos de envío en KINARA.",
    },
  ];
}

const sectionClass = "flex flex-col gap-3";
const h2Class = "font-display text-xl text-espresso";
const pClass = "text-[15px] leading-relaxed text-espresso/80";
const ulClass = "flex flex-col gap-1.5 text-[15px] leading-relaxed text-espresso/80";

export default function PoliticaDeEnvios() {
  return (
    <div className="pad py-12 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <div>
          <h1 className="font-display text-[clamp(30px,4vw,44px)]">Política de Envíos</h1>
          <p className="mt-2 text-sm text-muted">Última actualización: Agosto de 2026</p>
        </div>

        <p className={pClass}>
          En KINARA trabajamos para preparar cada pedido de forma segura y eficiente.
        </p>

        <section className={sectionClass}>
          <h2 className={h2Class}>1. Tiempo de preparación</h2>
          <p className={pClass}>
            Todos los pedidos son preparados y despachados desde nuestra bodega en un plazo
            estimado de 3 a 8 días hábiles, contados a partir de la confirmación del pago.
          </p>
          <p className={pClass}>
            Durante temporadas de alta demanda, promociones especiales o eventos comerciales,
            este plazo podrá extenderse.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Tiempo de entrega</h2>
          <p className={pClass}>
            Una vez entregado el paquete a la empresa de mensajería, los tiempos de entrega
            dependerán exclusivamente de la paquetería seleccionada y del destino del envío.
          </p>
          <p className={pClass}>KINARA no tiene control sobre retrasos ocasionados por:</p>
          <ul className={ulClass}>
            <li>• Condiciones climatológicas.</li>
            <li>• Alta demanda de las paqueterías.</li>
            <li>• Incidentes logísticos.</li>
            <li>• Direcciones incorrectas o incompletas proporcionadas por el cliente.</li>
            <li>• Cualquier otra causa ajena a KINARA.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Guía de rastreo</h2>
          <p className={pClass}>
            Una vez que el pedido haya sido enviado, el cliente recibirá un número de rastreo
            mediante correo electrónico. Con dicho número podrá consultar directamente el
            estatus de su envío en el sitio web de la empresa transportista.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Costos de envío</h2>
          <p className={pClass}>
            El costo del envío será calculado durante el proceso de compra y será cubierto por
            el cliente, salvo que exista una promoción vigente que indique expresamente lo
            contrario.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Dirección incorrecta</h2>
          <p className={pClass}>
            Es responsabilidad del cliente verificar que la dirección proporcionada sea correcta
            y completa. Si el pedido es devuelto debido a información incorrecta o incompleta,
            el costo del nuevo envío será cubierto por el cliente.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Cambios de talla</h2>
          <p className={pClass}>
            En caso de solicitar un cambio de talla, todos los gastos de envío relacionados con
            el retorno del producto y el nuevo envío correrán por cuenta del cliente.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Pedidos no entregados</h2>
          <p className={pClass}>
            Si un pedido no puede ser entregado por causas atribuibles al cliente y es devuelto
            a nuestras instalaciones, el reenvío deberá ser cubierto por el cliente.
          </p>
        </section>
      </div>
    </div>
  );
}
