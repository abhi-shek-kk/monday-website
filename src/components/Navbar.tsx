import { getSession } from "@/lib/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const session = await getSession();
  
  const formattedSession = session
    ? {
        username: session.username,
        role: session.role,
        status: session.status,
      }
    : null;

  return <NavbarClient session={formattedSession} />;
}
