import { Form } from "react-router";

export function AdminTopbar({
  title,
  adminName,
}: {
  title: string;
  adminName?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-sand px-5 py-4 lg:px-8">
      <h1 className="font-display text-xl text-espresso">{title}</h1>
      <div className="flex items-center gap-3">
        {adminName && <span className="text-sm text-muted">{adminName}</span>}
        <Form method="post" action="/admin/logout">
          <button type="submit" className="btn btn-outline px-4 py-2 text-[13px]">
            Salir
          </button>
        </Form>
      </div>
    </div>
  );
}
