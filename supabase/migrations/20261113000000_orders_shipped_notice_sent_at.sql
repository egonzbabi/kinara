-- Aviso "Tu pedido va en camino" en dos fases (tarea 147).
-- El correo ya no sale al comprar la guía sino cuando Skydropx reporta que la
-- paquetería recogió el paquete (in_transit). Esta columna guarda cuándo se
-- mandó, para no avisar dos veces ni dejar de avisar.
alter table public.orders
  add column shipped_notice_sent_at timestamptz;

-- Los pedidos que ya tienen guía ya recibieron su aviso (salía al comprarla):
-- se marcan como avisados para que el proceso nuevo no les mande otro.
update public.orders
  set shipped_notice_sent_at = now()
  where tracking_number is not null;
