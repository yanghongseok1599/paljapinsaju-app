import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MOCK_DASHBOARD } from "@/utils/supabase/mock-admin";
import { getPaidCategory } from "@/lib/saju/categories";
import { getChatMessages } from "@/services/saju/chat-actions";
import { CHARACTERS, type CharacterType } from "@/lib/saju/characters";
import SajuLayout from "@/components/saju/layout/SajuLayout";
import ChatRoom from "@/components/saju/chat/ChatRoom";
import type { SajuReading } from "@/types/saju";
import type { UIMessage } from "ai";

interface ChatPageProps {
  params: Promise<{ characterId: string; locale: string }>;
  searchParams: Promise<{ r?: string; new?: string; category?: string }>;
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { characterId, locale } = await params;
  const { r: readingIdParam, new: isNewChat, category: categoryParam } = await searchParams;

  // 유료 카테고리로 들어온 상담이면 주제를 상담 전체에 전달한다.
  const category = categoryParam ? getPaidCategory(categoryParam) : undefined;
  const categoryId = category?.id;

  if (!CHARACTERS[characterId as CharacterType]) {
    redirect(`/${locale}`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // LOCAL-ONLY: 목 모드에는 실제 로그인이 없으므로, 홈으로 튕기는 대신
    // 자격증명 없이 동작하는 체험 분석 플로우로 보낸다.
    if (MOCK_DASHBOARD) {
      redirect(
        categoryId
          ? `/${locale}/reading?category=${categoryId}`
          : `/${locale}/reading`
      );
    }
    // 로그인 후 원래 가려던 곳(상담 주제 포함)으로 되돌아오게 한다.
    // 이게 없으면 고민별 상담에서 들어온 사용자가 주제를 잃고 홈에 남는다.
    const intended = categoryId
      ? `/chat/${characterId}?category=${categoryId}`
      : `/chat/${characterId}`;
    redirect(
      `/${locale}?login=required&next=${encodeURIComponent(intended)}`
    );
  }

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").filter(Boolean);
  const isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;

  // user_stars에서 잔액 조회
  let starBalance = 0;
  if (isAdmin) {
    starBalance = 99999;
  } else {
    const { data: stars } = await supabase
      .from("user_stars")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    // 가입 보너스는 DB 트리거가 지급한다. 행이 없으면 0개다.
    starBalance = stars?.balance ?? 0;
  }

  // 새 대화 모드면 기존 reading 건너뛰고 바로 입력 폼
  if (isNewChat === 'true') {
    // 기존 사주정보 참고용으로 가져오기
    const { data: anyReading } = await supabase
      .from("saju_readings")
      .select("name, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, birth_city")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const previousBirthInfo = anyReading
      ? {
          name: anyReading.name as string,
          gender: anyReading.gender as "male" | "female",
          birthYear: anyReading.birth_year as number,
          birthMonth: anyReading.birth_month as number,
          birthDay: anyReading.birth_day as number,
          birthHour: anyReading.birth_hour as number | null,
          isLunar: anyReading.is_lunar as boolean,
          birthCity: (anyReading.birth_city as string) ?? undefined,
        }
      : undefined;

    return (
      <SajuLayout>
        <ChatRoom
          characterId={characterId as CharacterType}
          needsBirthInfo
          starBalance={starBalance}
          previousBirthInfo={previousBirthInfo}
          isAdmin={isAdmin}
          categoryId={categoryId}
        />
      </SajuLayout>
    );
  }

  // readingId 파라미터가 있으면 해당 reading, 없으면 최신 reading
  let readingQuery = supabase
    .from("saju_readings")
    .select("*")
    .eq("user_id", user.id);

  if (readingIdParam) {
    readingQuery = readingQuery.eq("id", readingIdParam);
  } else {
    readingQuery = readingQuery.eq("character_id", characterId);
  }

  const { data: existingReading } = await readingQuery
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existingReading) {
    const typedReading = existingReading as SajuReading;
    const { data: chatMessages } = await getChatMessages(existingReading.id);

    const initialMessages: UIMessage[] = chatMessages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: msg.content }],
    }));

    const readingInfo = {
      id: existingReading.id,
      characterId: characterId as CharacterType,
      name: typedReading.name,
      gender: typedReading.gender as 'male' | 'female',
      birthYear: typedReading.birth_year,
      birthMonth: typedReading.birth_month,
      birthDay: typedReading.birth_day,
      birthHour: typedReading.birth_hour,
      isLunar: typedReading.is_lunar,
      birthCity: typedReading.birth_city ?? undefined,
    };

    // 오행 분포 데이터
    const fiveElements = typedReading.five_elements ?? undefined;

    return (
      <SajuLayout currentReading={readingInfo}>
        <ChatRoom
          readingId={existingReading.id}
          characterId={characterId as CharacterType}
          initialMessages={initialMessages}
          starBalance={starBalance}
          fiveElements={fiveElements}
          isAdmin={isAdmin}
          categoryId={categoryId}
        />
      </SajuLayout>
    );
  }

  // 이 캐릭터용 reading은 없지만, 다른 캐릭터로 입력한 사주정보가 있을 수 있음
  const { data: anyReading } = await supabase
    .from("saju_readings")
    .select("name, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, birth_city")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const previousBirthInfo = anyReading
    ? {
        name: anyReading.name as string,
        gender: anyReading.gender as "male" | "female",
        birthYear: anyReading.birth_year as number,
        birthMonth: anyReading.birth_month as number,
        birthDay: anyReading.birth_day as number,
        birthHour: anyReading.birth_hour as number | null,
        isLunar: anyReading.is_lunar as boolean,
        birthCity: (anyReading.birth_city as string) ?? undefined,
      }
    : undefined;

  return (
    <SajuLayout>
      <ChatRoom
        characterId={characterId as CharacterType}
        needsBirthInfo
        starBalance={starBalance}
        previousBirthInfo={previousBirthInfo}
        categoryId={categoryId}
      />
    </SajuLayout>
  );
}
