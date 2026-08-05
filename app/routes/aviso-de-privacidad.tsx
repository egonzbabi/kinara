import type { Route } from "./+types/aviso-de-privacidad";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Aviso de Privacidad · KINARA" },
    {
      name: "description",
      content: "Cómo KINARA recaba, usa y protege tus datos personales.",
    },
  ];
}

const sectionClass = "flex flex-col gap-3";
const h2Class = "font-display text-xl text-espresso";
const pClass = "text-[15px] leading-relaxed text-espresso/80";
const ulClass = "flex flex-col gap-1.5 text-[15px] leading-relaxed text-espresso/80";

export default function AvisoDePrivacidad() {
  return (
    <div className="pad py-12 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <div>
          <h1 className="font-display text-[clamp(30px,4vw,44px)]">
            Aviso de Privacidad
          </h1>
          <p className="mt-2 text-sm text-muted">
            Última actualización: 5 de agosto de 2026
          </p>
        </div>

        <section className={sectionClass}>
          <h2 className={h2Class}>1. Identidad del responsable</h2>
          <p className={pClass}>
            KINARA ("nosotros") es responsable del tratamiento de tus datos
            personales conforme a la Ley Federal de Protección de Datos
            Personales en Posesión de los Particulares (LFPDPPP). Puedes
            contactarnos en{" "}
            <a href="mailto:hola@kinara.mx" className="text-clay underline underline-offset-2">
              hola@kinara.mx
            </a>{" "}
            o a través de nuestro{" "}
            <a href="/contacto" className="text-clay underline underline-offset-2">
              formulario de contacto
            </a>
            .
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Datos que recabamos</h2>
          <p className={pClass}>
            Cuando compras, te contactas o interactúas con nuestro sitio,
            podemos recabar:
          </p>
          <ul className={ulClass}>
            <li>• Datos de identificación y contacto: nombre, correo electrónico, teléfono.</li>
            <li>
              • Datos de envío: dirección (calle, colonia, código postal, municipio/alcaldía,
              estado).
            </li>
          </ul>
          <p className={pClass}>
            No recabamos ni almacenamos los datos de tu tarjeta de pago — tu compra se procesa
            directamente por Stripe, quien tiene sus propias medidas de seguridad y aviso de
            privacidad.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Para qué usamos tus datos</h2>
          <p className={pClass}>Usamos tus datos para:</p>
          <ul className={ulClass}>
            <li>• Procesar y dar seguimiento a tus pedidos.</li>
            <li>• Coordinar el envío de tus productos con nuestra paquetería.</li>
            <li>• Responder tus dudas o solicitudes de contacto.</li>
            <li>• Cumplir obligaciones fiscales y legales.</li>
          </ul>
          <p className={pClass}>
            No usamos tus datos con fines de mercadotecnia (envío de promociones) salvo que nos
            des tu autorización expresa para ello.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Con quién compartimos tus datos</h2>
          <p className={pClass}>
            Para operar la tienda, compartimos únicamente los datos necesarios con:
          </p>
          <ul className={ulClass}>
            <li>• Stripe — procesamiento de pagos.</li>
            <li>• Skydropx — cotización y envío de tu pedido.</li>
            <li>• Nuestros proveedores de hosting y correo (para operar el sitio y responder tus mensajes).</li>
          </ul>
          <p className={pClass}>
            Estos proveedores solo usan tus datos para prestarnos el servicio contratado. No
            vendemos ni rentamos tus datos personales a terceros.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Tus derechos (ARCO)</h2>
          <p className={pClass}>
            Tienes derecho a Acceder, Rectificar o Cancelar tus datos personales, así como a
            Oponerte a su uso (derechos ARCO), y a revocar tu consentimiento en cualquier
            momento. Para ejercerlos, escríbenos a{" "}
            <a href="mailto:hola@kinara.mx" className="text-clay underline underline-offset-2">
              hola@kinara.mx
            </a>{" "}
            indicando tu nombre y la solicitud específica. Te responderemos en un plazo máximo
            de 20 días hábiles.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Cookies</h2>
          <p className={pClass}>
            Hoy nuestro sitio solo utiliza una cookie técnica, necesaria para el funcionamiento
            del panel de administración — no recaba información personal de nuestros clientes.
            Si en el futuro incorporamos herramientas de análisis (como Google Analytics),
            actualizaremos esta sección y te pediremos tu consentimiento antes de activarlas.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Cambios a este aviso</h2>
          <p className={pClass}>
            Podemos actualizar este aviso de privacidad. Cualquier cambio se publicará en esta
            misma página con su fecha de actualización correspondiente.
          </p>
        </section>
      </div>
    </div>
  );
}
