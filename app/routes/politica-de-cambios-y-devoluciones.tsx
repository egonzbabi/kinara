import type { Route } from "./+types/politica-de-cambios-y-devoluciones";
import { seoMeta } from "~/lib/seo";

export function meta(_: Route.MetaArgs) {
  return seoMeta({
    title: "Política de Cambios y Devoluciones · KINARA",
    description: "Cuándo procede un cambio por defecto de fábrica en KINARA y cómo reportarlo.",
    path: "/politica-de-cambios-y-devoluciones",
  });
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
          <p className="mt-2 text-sm text-muted">Última actualización: Septiembre de 2026</p>
        </div>

        <p className={pClass}>
          En KINARA buscamos ofrecer productos de la más alta calidad y un control riguroso en
          cada una de nuestras prendas. Por esta razón, te pedimos revisar cuidadosamente tu
          carrito, talla y especificaciones antes de finalizar tu compra.
        </p>

        <section className={sectionClass}>
          <h2 className={h2Class}>1. Regla general de cambios y devoluciones</h2>
          <p className={pClass}>
            Por políticas internas de la marca, KINARA no realiza devoluciones ni reembolsos de
            dinero. Sí procede un cambio de producto en dos casos: (a) cuando la prenda presente
            un daño o defecto de fabricación comprobable de origen, o (b) cuando el cliente
            necesite una talla distinta a la comprada, siempre del mismo modelo y color.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Procedencia por defectos o daños de fábrica</h2>
          <p className={pClass}>
            Los cambios por defecto procederán únicamente cuando la prenda entregada presente
            imperfecciones atribuibles al proceso de producción o confección de KINARA.
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
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Cambios de talla</h2>
          <p className={pClass}>
            Si la prenda te quedó chica o grande, puedes cambiarla por otra talla del mismo
            modelo y color, sujeto a disponibilidad de inventario.
          </p>
          <p className={pClass}>Casos que NO aplican para cambio o devolución:</p>
          <ul className={ulClass}>
            <li>• Cambios por gusto personal, preferencia de color o error en la elección del modelo.</li>
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
          <h2 className={h2Class}>4. Requisitos para la autorización del cambio</h2>
          <p className={pClass}>
            Para que la solicitud de cambio (por defecto de fábrica o por talla) sea evaluada y
            aprobada, el producto deberá cumplir sin excepción con las siguientes condiciones:
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
              fábrica y no causado por el usuario (aplica solo a cambios por defecto).
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Resolución y disponibilidad</h2>
          <p className={pClass}>Una vez aprobado el cambio por nuestro equipo:</p>
          <ul className={ulClass}>
            <li>
              • Se realizará el cambio por una prenda en perfecto estado de la misma referencia
              (defecto de fábrica) o de la talla solicitada (cambio de talla), sujeto a
              disponibilidad de inventario.
            </li>
            <li>
              • Si el producto o la talla solicitada se encuentra agotada, el cliente podrá elegir
              otro producto del catálogo. Si existe una diferencia a favor de KINARA, el cliente
              deberá cubrir el saldo pendiente.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Costos de envío</h2>
          <ul className={ulClass}>
            <li>
              • Por defecto o daño de fábrica validado: KINARA asumirá la logística y los costos
              de envío derivados de la recolección de la prenda defectuosa y el envío de la nueva
              prenda.
            </li>
            <li>
              • Por cambio de talla: al no ser un error de KINARA, el cliente cubre los gastos de
              envío tanto de la prenda que regresa como del envío de la nueva talla.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Proceso de reporte y contacto</h2>
          <p className={pClass}>
            Si recibiste un producto con algún daño de fábrica de los mencionados anteriormente, o
            necesitas cambiarlo por otra talla, contáctanos con tu número de pedido (y, en caso de
            defecto, evidencia fotográfica/en video del detalle afectado):
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
