import type { Route } from "./+types/politica-de-cambios-y-devoluciones";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Política de Cambios y Devoluciones · KINARA" },
    {
      name: "description",
      content: "Cuándo procede un cambio por defecto de fábrica en KINARA y cómo reportarlo.",
    },
  ];
}

const sectionClass = "flex flex-col gap-3";
const h2Class = "font-display text-xl text-espresso";
const pClass = "text-[15px] leading-relaxed text-espresso/80";
const ulClass = "flex flex-col gap-1.5 text-[15px] leading-relaxed text-espresso/80";

const CONTACT_EMAIL = "contacto@kinarafit.com.mx";

export default function PoliticaDeCambiosYDevoluciones() {
  return (
    <div className="pad py-12 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <div>
          <h1 className="font-display text-[clamp(30px,4vw,44px)]">
            Política de Cambios y Devoluciones
          </h1>
          <p className="mt-2 text-sm text-muted">Última actualización: Agosto de 2026</p>
        </div>

        <p className={pClass}>
          En KINARA buscamos ofrecer productos de la más alta calidad y un control riguroso en
          cada una de nuestras prendas. Por esta razón, te pedimos revisar cuidadosamente tu
          carrito, talla y especificaciones antes de finalizar tu compra.
        </p>

        <section className={sectionClass}>
          <h2 className={h2Class}>1. Regla general de cambios y devoluciones</h2>
          <p className={pClass}>
            Por políticas internas de la marca, KINARA no realiza devoluciones, reembolsos de
            dinero ni cambios de talla o modelo, salvo en aquellos casos en que el producto
            presente un daño o defecto de fabricación comprobable de origen, o que la legislación
            aplicable determine lo contrario.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Procedencia por defectos o daños de fábrica</h2>
          <p className={pClass}>
            Los cambios procederán únicamente cuando la prenda entregada presente imperfecciones
            atribuibles al proceso de producción o confección de KINARA.
          </p>
          <p className={pClass}>Ejemplos de fallas de fábrica cubiertas:</p>
          <ul className={ulClass}>
            <li>
              • Prendas rotas o descosidas: costuras abiertas, deshilachadas o rupturas en el
              tejido previas al uso.
            </li>
            <li>
              • Fallas en componentes: cierres defectuosos, broches descompuestos o elásticos
              vencidos/rotos de origen.
            </li>
            <li>
              • Manchas o defectos de tela: desteñidos de origen, manchas de pintura/tinta de
              fabricación o agujeros en el textil.
            </li>
            <li>• Errores de confección: piezas mal ensambladas o asimetrías evidentes de fábrica.</li>
          </ul>
          <p className={pClass}>Casos que NO aplican para cambio o devolución:</p>
          <ul className={ulClass}>
            <li>• Cambios por gusto personal, preferencia de color o error en la elección del modelo.</li>
            <li>• Selección incorrecta de la talla por parte del cliente.</li>
            <li>• Daños ocasionados por uso, desgaste natural o fuerza mayor.</li>
            <li>
              • Daños derivados de un lavado, secado o cuidado inadecuado (no seguir las
              instrucciones de lavado).
            </li>
            <li>
              • Manchas o rasgaduras provocadas accidentalmente durante la apertura del paquete o
              al probarse la prenda.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Requisitos para la autorización del cambio</h2>
          <p className={pClass}>
            Para que la solicitud de cambio por defecto de fábrica sea evaluada y aprobada, el
            producto deberá cumplir sin excepción con las siguientes condiciones:
          </p>
          <ul className={ulClass}>
            <li>
              • Plazo de reporte: notificar el caso dentro de un plazo máximo de 5 (cinco) días
              naturales contados a partir de la fecha de entrega del pedido.
            </li>
            <li>• Estado de la prenda: no haber sido utilizada ni lavada. Debe encontrarse limpia y sin olores.</li>
            <li>• Etiquetas y empaque: conservar intactas sus etiquetas originales y mantener su empaque original.</li>
            <li>
              • Evaluación técnica: una vez recibido el producto en nuestras instalaciones,
              nuestro equipo verificará las evidencias físicas para validar que el daño es de
              fábrica y no causado por el usuario.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Resolución y disponibilidad</h2>
          <p className={pClass}>Una vez aprobado el defecto de fábrica por nuestro equipo:</p>
          <ul className={ulClass}>
            <li>
              • Se realizará el cambio por una prenda en perfecto estado de la misma referencia y
              talla, sujeto a disponibilidad de inventario.
            </li>
            <li>
              • Si el producto se encuentra agotado, el cliente podrá elegir otro producto del
              catálogo. Si existe una diferencia a favor de KINARA, el cliente deberá cubrir el
              saldo pendiente.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Costos de envío</h2>
          <ul className={ulClass}>
            <li>
              • Por defecto o daño de fábrica validado: KINARA asumirá la logística y los costos
              de envío derivados de la recolección de la prenda defectuosa y el envío de la nueva
              prenda.
            </li>
            <li>
              • Cualquier otra solicitud ajena a un defecto comprobado: en el evento
              extraordinario de autorizarse una gestión fuera de la regla por decisión especial
              de la marca, los gastos de envío (tanto el retorno a nuestras instalaciones como el
              nuevo despacho) serán cubiertos en su totalidad por el cliente.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Proceso de reporte y contacto</h2>
          <p className={pClass}>
            Si recibiste un producto con algún daño de fábrica de los mencionados anteriormente,
            por favor contáctanos adjuntando tu número de pedido y evidencia fotográfica/en video
            del detalle afectado:
          </p>
          <ul className={ulClass}>
            <li>
              • Correo electrónico para reportes:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-clay underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>• Horario de atención: Lunes a Viernes de 9:00 am a 6:00 pm</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
