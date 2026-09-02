export type DemonSpriteId = 'imp' | 'shade' | 'brute';

/** PS2 tarzı piksel iblis portreleri — inline SVG */
export const DEMON_SVGS: Record<DemonSpriteId, string> = {
  imp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" shape-rendering="crispEdges">
  <rect width="64" height="80" fill="none"/>
  <!-- gölge -->
  <ellipse cx="32" cy="76" rx="14" ry="3" fill="#0a0608" opacity="0.6"/>
  <!-- kuyruk -->
  <rect x="44" y="52" width="4" height="3" fill="#6a1818"/>
  <rect x="47" y="54" width="5" height="3" fill="#5a1010"/>
  <rect x="50" y="56" width="4" height="3" fill="#8b2020"/>
  <polygon points="53,58 58,57 54,61" fill="#c03030"/>
  <!-- sol kanat -->
  <polygon points="8,36 20,28 22,42 14,48" fill="#3a1018"/>
  <polygon points="6,40 16,34 18,46 10,50" fill="#2a0810"/>
  <!-- sağ kanat -->
  <polygon points="56,36 44,28 42,42 50,48" fill="#3a1018"/>
  <polygon points="58,40 48,34 46,46 54,50" fill="#2a0810"/>
  <!-- bacaklar -->
  <rect x="22" y="58" width="7" height="12" fill="#5a1010"/>
  <rect x="35" y="58" width="7" height="12" fill="#5a1010"/>
  <rect x="21" y="68" width="9" height="4" fill="#2a0808"/>
  <rect x="34" y="68" width="9" height="4" fill="#2a0808"/>
  <!-- gövde -->
  <rect x="20" y="38" width="24" height="22" fill="#8b2020"/>
  <rect x="22" y="40" width="20" height="6" fill="#a02828"/>
  <rect x="24" y="50" width="16" height="8" fill="#6a1818"/>
  <!-- kollar -->
  <rect x="12" y="40" width="8" height="14" fill="#7a1c1c"/>
  <rect x="44" y="40" width="8" height="14" fill="#7a1c1c"/>
  <rect x="10" y="52" width="6" height="6" fill="#5a1010"/>
  <rect x="48" y="52" width="6" height="6" fill="#5a1010"/>
  <!-- pençeler -->
  <rect x="8" y="56" width="3" height="4" fill="#1a0808"/>
  <rect x="11" y="57" width="2" height="3" fill="#e8c040"/>
  <rect x="53" y="56" width="3" height="4" fill="#1a0808"/>
  <rect x="51" y="57" width="2" height="3" fill="#e8c040"/>
  <!-- baş -->
  <rect x="18" y="18" width="28" height="22" fill="#9a2828"/>
  <rect x="20" y="20" width="24" height="8" fill="#b03030"/>
  <!-- boynuzlar -->
  <polygon points="20,18 16,6 24,16" fill="#1a0808"/>
  <polygon points="44,18 48,6 40,16" fill="#1a0808"/>
  <polygon points="21,16 18,8 23,15" fill="#3a1818"/>
  <polygon points="43,16 46,8 41,15" fill="#3a1818"/>
  <!-- kulaklar -->
  <polygon points="16,24 10,20 16,30" fill="#6a1818"/>
  <polygon points="48,24 54,20 48,30" fill="#6a1818"/>
  <!-- gözler -->
  <rect x="24" y="28" width="6" height="5" fill="#1a0808"/>
  <rect x="34" y="28" width="6" height="5" fill="#1a0808"/>
  <rect x="25" y="29" width="3" height="3" fill="#e8c040"/>
  <rect x="35" y="29" width="3" height="3" fill="#e8c040"/>
  <rect x="26" y="29" width="1" height="1" fill="#fff8c0"/>
  <rect x="36" y="29" width="1" height="1" fill="#fff8c0"/>
  <!-- ağız -->
  <rect x="27" y="36" width="10" height="2" fill="#1a0808"/>
  <rect x="28" y="37" width="3" height="1" fill="#f0e0c0"/>
  <rect x="33" y="37" width="3" height="1" fill="#f0e0c0"/>
  <!-- dişler -->
  <rect x="29" y="35" width="2" height="2" fill="#e8e0d0"/>
  <rect x="33" y="35" width="2" height="2" fill="#e8e0d0"/>
</svg>`,

  shade: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" shape-rendering="crispEdges">
  <rect width="64" height="80" fill="none"/>
  <ellipse cx="32" cy="77" rx="12" ry="2" fill="#06040a" opacity="0.7"/>
  <!-- duman tabanı -->
  <polygon points="14,72 32,68 50,72 48,78 16,78" fill="#100818" opacity="0.8"/>
  <polygon points="18,66 32,62 46,66 42,72 22,72" fill="#181020" opacity="0.6"/>
  <!-- pelerin / silüet gövde -->
  <polygon points="32,8 52,30 56,70 40,74 32,68 24,74 8,70 12,30" fill="#0c0814"/>
  <polygon points="32,12 48,32 50,66 32,62 14,66 16,32" fill="#14101c"/>
  <!-- iç gölge -->
  <polygon points="32,20 42,36 40,60 32,56 24,60 22,36" fill="#08060e"/>
  <!-- yüz boşluğu -->
  <ellipse cx="32" cy="34" rx="10" ry="12" fill="#040308"/>
  <!-- gözler -->
  <rect x="24" y="30" width="5" height="3" fill="#9070d0"/>
  <rect x="35" y="30" width="5" height="3" fill="#9070d0"/>
  <rect x="25" y="30" width="2" height="2" fill="#d0b0ff"/>
  <rect x="36" y="30" width="2" height="2" fill="#d0b0ff"/>
  <!-- üçüncü göz -->
  <rect x="30" y="24" width="4" height="3" fill="#6040a0"/>
  <rect x="31" y="24" width="2" height="2" fill="#c0a0f0"/>
  <!-- ağız yarığı -->
  <polygon points="28,42 32,48 36,42" fill="#201030"/>
  <rect x="29" y="43" width="6" height="1" fill="#503070"/>
  <!-- parçalanan kenarlar -->
  <rect x="10" y="44" width="4" height="8" fill="#0c0814" opacity="0.5"/>
  <rect x="50" y="40" width="4" height="10" fill="#0c0814" opacity="0.5"/>
  <rect x="8" y="52" width="3" height="6" fill="#181020"/>
  <rect x="53" y="48" width="3" height="8" fill="#181020"/>
  <!-- el izleri -->
  <polygon points="6,38 12,36 10,48 4,46" fill="#100818" opacity="0.7"/>
  <polygon points="58,38 52,36 54,48 60,46" fill="#100818" opacity="0.7"/>
  <!-- parıltı -->
  <rect x="20" y="18" width="2" height="2" fill="#302040" opacity="0.5"/>
  <rect x="42" y="22" width="1" height="1" fill="#403050" opacity="0.4"/>
</svg>`,

  brute: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" shape-rendering="crispEdges">
  <rect width="64" height="80" fill="none"/>
  <ellipse cx="32" cy="77" rx="18" ry="3" fill="#0a0406" opacity="0.7"/>
  <!-- bacaklar -->
  <rect x="18" y="58" width="10" height="16" fill="#3a0808"/>
  <rect x="36" y="58" width="10" height="16" fill="#3a0808"/>
  <rect x="17" y="70" width="12" height="5" fill="#1a0404"/>
  <rect x="35" y="70" width="12" height="5" fill="#1a0404"/>
  <!-- gövde - kaslı -->
  <rect x="14" y="32" width="36" height="28" fill="#5a0c0c"/>
  <rect x="16" y="34" width="32" height="10" fill="#7a1414"/>
  <rect x="18" y="44" width="28" height="12" fill="#4a0808"/>
  <!-- göğüs işareti -->
  <polygon points="32,38 36,42 32,46 28,42" fill="#1a0404"/>
  <rect x="31" y="40" width="2" height="4" fill="#c04020"/>
  <!-- omuz zırhı -->
  <rect x="8" y="30" width="12" height="10" fill="#2a0606"/>
  <rect x="44" y="30" width="12" height="10" fill="#2a0606"/>
  <rect x="6" y="32" width="4" height="6" fill="#1a0404"/>
  <rect x="54" y="32" width="4" height="6" fill="#1a0404"/>
  <!-- kollar -->
  <rect x="4" y="38" width="10" height="18" fill="#5a0c0c"/>
  <rect x="50" y="38" width="10" height="18" fill="#5a0c0c"/>
  <!-- zincirler -->
  <rect x="10" y="42" width="2" height="2" fill="#607080"/>
  <rect x="12" y="46" width="2" height="2" fill="#8090a0"/>
  <rect x="10" y="50" width="2" height="2" fill="#607080"/>
  <rect x="52" y="42" width="2" height="2" fill="#607080"/>
  <rect x="50" y="46" width="2" height="2" fill="#8090a0"/>
  <!-- pençeler -->
  <rect x="2" y="54" width="4" height="5" fill="#1a0404"/>
  <rect x="58" y="54" width="4" height="5" fill="#1a0404"/>
  <rect x="1" y="56" width="2" height="3" fill="#802020"/>
  <rect x="61" y="56" width="2" height="3" fill="#802020"/>
  <!-- boyun -->
  <rect x="24" y="24" width="16" height="10" fill="#4a0808"/>
  <!-- baş -->
  <rect x="16" y="6" width="32" height="22" fill="#6a1010"/>
  <rect x="18" y="8" width="28" height="8" fill="#8a1818"/>
  <!-- boynuzlar - büyük -->
  <polygon points="14,10 8,0 20,8" fill="#1a0404"/>
  <polygon points="50,10 56,0 44,8" fill="#1a0404"/>
  <polygon points="15,8 10,2 19,7" fill="#3a0808"/>
  <polygon points="49,8 54,2 45,7" fill="#3a0808"/>
  <!-- çatlaklar -->
  <rect x="22" y="14" width="1" height="6" fill="#3a0808"/>
  <rect x="41" y="12" width="1" height="8" fill="#3a0808"/>
  <!-- gözler - ateşli -->
  <rect x="22" y="16" width="7" height="5" fill="#1a0404"/>
  <rect x="35" y="16" width="7" height="5" fill="#1a0404"/>
  <rect x="23" y="17" width="4" height="3" fill="#e06020"/>
  <rect x="36" y="17" width="4" height="3" fill="#e06020"/>
  <rect x="24" y="17" width="2" height="2" fill="#ffc040"/>
  <rect x="37" y="17" width="2" height="2" fill="#ffc040"/>
  <!-- ağız -->
  <rect x="24" y="24" width="16" height="3" fill="#1a0404"/>
  <rect x="26" y="25" width="4" height="1" fill="#c04020"/>
  <rect x="34" y="25" width="4" height="1" fill="#c04020"/>
  <!-- dişler -->
  <rect x="27" y="22" width="2" height="3" fill="#d0c8b8"/>
  <rect x="31" y="22" width="2" height="3" fill="#d0c8b8"/>
  <rect x="35" y="22" width="2" height="3" fill="#d0c8b8"/>
</svg>`,
};

export function getDemonPortraitDataUrl(id: DemonSpriteId): string {
  return `data:image/svg+xml,${encodeURIComponent(DEMON_SVGS[id])}`;
}

export function getEnemySpriteId(enemyId: string): DemonSpriteId {
  switch (enemyId) {
    case 'imp':
      return 'imp';
    case 'shade':
      return 'shade';
    case 'wraith':
    case 'hellhound':
    case 'demon':
    case 'archdemon':
      return 'brute';
    default:
      return 'imp';
  }
}
