'use client';

import { motion } from 'framer-motion';
import { STAR_SHOP_OPEN } from '@/lib/toss/config';
import { getCharacter, type CharacterType } from '@/lib/saju/characters';
import { Link } from '@/i18n/routing';
import CharacterAvatar from './CharacterAvatar';

interface ChatPaywallProps {
  characterId: CharacterType;
  readingId: string;
  onPaymentComplete?: () => void;
}

export default function ChatPaywall({
  characterId,
}: ChatPaywallProps) {
  const character = getCharacter(characterId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-2 justify-start"
    >
      <div className="flex flex-col items-center gap-1 pt-1">
        <CharacterAvatar characterId={characterId} size="sm" />
      </div>

      <div className="max-w-[85%]">
        <p className="text-xs text-gray-500 mb-1 ml-1">{character.name}</p>
        <div className="rounded-2xl rounded-bl-md p-5 glass-panel" style={{ borderColor: 'rgba(73,68,84,0.2)' }}>
          <p className="text-sm leading-relaxed mb-1" style={{ color: '#e4e1e9' }}>
            별이 모두 소진되었어요.
          </p>
          {STAR_SHOP_OPEN ? (
            <>
              <p className="text-xs mb-4" style={{ color: '#958ea0' }}>
                코인샵에서 별을 충전하면 계속 대화할 수 있어요.
              </p>

              <Link
                href="/coin-shop"
                className="block w-full py-3 rounded-xl oracle-gradient text-sm font-semibold text-center
                  hover:opacity-90 transition-opacity active:scale-[0.98]"
                style={{ color: '#3c0091' }}
              >
                별 충전하러 가기
              </Link>
            </>
          ) : (
            <p className="text-xs" style={{ color: '#958ea0' }}>
              지금은 별 충전을 받지 않아요. 친구를 초대하면 별을 받을 수 있어요.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
