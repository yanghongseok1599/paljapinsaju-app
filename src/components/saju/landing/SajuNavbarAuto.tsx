import { createClient } from "@/utils/supabase/server";
import SajuNavbar from "./SajuNavbar";
import { isAdminEmail } from "@/lib/admin";

/**
 * Server-side wrapper that auto-fills SajuNavbar's auth props.
 *
 * Use this from any server page that renders the navbar so the
 * "로그인 / 회원가입" buttons are correctly hidden for signed-in users
 * and the admin link is shown for ADMIN_EMAILS.
 */
export default async function SajuNavbarAuto() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();


  const isLoggedIn = !!user;
  const isAdmin = !!user?.email && isAdminEmail(user.email);

  return <SajuNavbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} />;
}
