import type { Route } from "./+types/admin.logout";
import { destroyAdminSession } from "~/lib/session.server";

export async function action({ request }: Route.ActionArgs) {
  return destroyAdminSession(request);
}
