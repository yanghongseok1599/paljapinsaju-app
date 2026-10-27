import { redirect } from "next/navigation";
import { STAR_SHOP_OPEN } from "@/lib/toss/config";
import { createClient } from "@/utils/supabase/server";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import CoinShopClient from "@/components/saju/coin-shop/CoinShopClient";

export default async function CoinShopPage() {
  if (!STAR_SHOP_OPEN) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 로그인 후 이 페이지로 되돌아오게 한다.
    redirect("/?login=required&next=/coin-shop");
  }

  // user_stars에서 잔액 조회 (가입 보너스는 DB 트리거가 지급한다. 행이 없으면 0개)
  const { data: stars } = await supabase
    .from("user_stars")
    .select("balance")
    .eq("user_id", user.id)
    .single();


  return (
    <SajuLayout>
      <CoinShopClient
        totalCoins={stars?.balance ?? 0}
        userId={user.id}
        userEmail={user.email}
      />
    </SajuLayout>
  );
}
