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

const CONTACT_EMAIL = "contacto@kinarafit.com.mx";

export default function AvisoDePrivacidad() {
  return (
    <div className="pad py-12 sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-10">
        <div>
          <h1 className="font-display text-[clamp(30px,4vw,44px)]">
            Aviso de Privacidad
          </h1>
          <p className="mt-2 text-sm text-muted">Última actualización: Agosto de 2026</p>
        </div>

        <p className={pClass}>
          En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares, KINARA informa lo siguiente:
        </p>

        <section className={sectionClass}>
          <h2 className={h2Class}>1. Responsable del tratamiento de datos</h2>
          <ul className={ulClass}>
            <li>• Razón Social: Administradora Karay S.A. de C.V.</li>
            <li>• Domicilio: Nunkini 234, Col. Jardines del Ajusco, Tlalpan, CDMX, México.</li>
            <li>
              • Correo electrónico:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-clay underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Datos personales que recopilamos</h2>
          <p className={pClass}>Podremos solicitar los siguientes datos:</p>
          <ul className={ulClass}>
            <li>• Nombre completo.</li>
            <li>• Correo electrónico.</li>
            <li>• Número telefónico.</li>
            <li>• Dirección de envío.</li>
            <li>• Información necesaria para procesar pedidos.</li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Finalidad del tratamiento</h2>
          <p className={pClass}>Los datos personales serán utilizados para:</p>
          <ul className={ulClass}>
            <li>• Procesar pedidos.</li>
            <li>• Dar seguimiento a compras.</li>
            <li>• Contactar al cliente respecto de su pedido.</li>
            <li>• Emitir comprobantes cuando corresponda.</li>
            <li>
              • Enviar información comercial sobre promociones, lanzamientos, descuentos,
              novedades y campañas de marketing propias de KINARA.
            </li>
            <li>• Mejorar la experiencia de compra.</li>
          </ul>
          <p className={pClass}>
            <span className="font-semibold text-espresso">
              KINARA únicamente utilizará el correo electrónico del cliente para el envío de
              campañas de marketing, promociones, novedades y comunicaciones relacionadas con la
              marca.
            </span>{" "}
            En cualquier momento el usuario podrá solicitar dejar de recibir dichas
            comunicaciones.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Transferencia de datos</h2>
          <p className={pClass}>
            KINARA no vende, renta ni comparte los datos personales con terceros para fines
            comerciales distintos a los necesarios para la operación del servicio.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Derechos ARCO</h2>
          <p className={pClass}>
            De conformidad con la legislación mexicana, el titular podrá ejercer en cualquier
            momento sus derechos de:
          </p>
          <ul className={ulClass}>
            <li>• Acceso.</li>
            <li>• Rectificación.</li>
            <li>• Cancelación.</li>
            <li>• Oposición.</li>
          </ul>
          <p className={pClass}>
            Para ejercer cualquiera de estos derechos deberá enviar una solicitud al correo{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-clay underline underline-offset-2"
            >
              {CONTACT_EMAIL}
            </a>
            . La solicitud deberá contener:
          </p>
          <ul className={ulClass}>
            <li>• Nombre completo.</li>
            <li>• Medio para recibir respuesta.</li>
            <li>• Documentos que acrediten su identidad.</li>
            <li>• Descripción clara del derecho que desea ejercer.</li>
          </ul>
          <p className={pClass}>
            KINARA responderá dentro de los plazos establecidos por la legislación aplicable.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>6. Uso de cookies</h2>
          <p className={pClass}>
            Nuestro sitio puede utilizar cookies, tecnologías similares y herramientas de
            análisis para mejorar la experiencia del usuario, conocer estadísticas de navegación
            y optimizar nuestras campañas publicitarias. El usuario puede configurar su navegador
            para rechazar el uso de cookies.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Cambios al aviso</h2>
          <p className={pClass}>
            KINARA podrá modificar el presente Aviso de Privacidad en cualquier momento. Las
            modificaciones serán publicadas en www.kinarafit.com.mx.
          </p>
        </section>
      </div>
    </div>
  );
}
