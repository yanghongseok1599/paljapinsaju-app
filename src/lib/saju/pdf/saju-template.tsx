import path from "path";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  G,
  Path,
  Circle,
  Rect,
  Line,
  Polygon,
} from "@react-pdf/renderer";
import type {
  SajuReading,
  FiveElementDistribution,
  MonthlyFortune,
  TenGodDetail,
  DecadeCycle,
} from "@/types/saju";
import {
  HEAVENLY_STEMS_HANJA,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES_HANJA,
  EARTHLY_BRANCHES,
} from "manseryeok";

// ─── Font Registration ──────────────────────────────────────────────────────

const fontsDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "NotoSansKR",
  fonts: [
    { src: path.join(fontsDir, "NotoSansKR-Regular.ttf") },
    { src: path.join(fontsDir, "NotoSansKR-Bold.ttf"), fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ─── Premium Color Palette ──────────────────────────────────────────────────

const NAVY = "#1B2A4A";
const NAVY_DARK = "#0F1D35";
const NAVY_MID = "#243555";
const NAVY_LIGHT = "#2E4572";
const GOLD = "#C9A96E";
const GOLD_LIGHT = "#E8D5B0";
const GOLD_DARK = "#A68B5B";
const CREAM = "#FDF8F0";
const CREAM_DARK = "#F5EDD8";
const GRAY_900 = "#1A1A2E";
const GRAY_700 = "#3D3D56";
const GRAY_500 = "#6B6B82";
const GRAY_300 = "#C4C4D4";
const WHITE = "#FFFFFF";
const DIVIDER_TINT = "#EEE8F8";

const F = "NotoSansKR";

const ELEMENT_COLORS: Record<string, { bg: string; text: string; accent: string; bar: string }> = {
  wood:  { bg: "#E8F5E9", text: "#2E7D32", accent: "#4CAF50", bar: "#66BB6A" },
  fire:  { bg: "#FFEBEE", text: "#C62828", accent: "#EF5350", bar: "#EF5350" },
  earth: { bg: "#FFF8E1", text: "#F57F17", accent: "#FFC107", bar: "#FFB300" },
  metal: { bg: "#F3E5F5", text: "#6A1B9A", accent: "#AB47BC", bar: "#AB47BC" },
  water: { bg: "#E3F2FD", text: "#1565C0", accent: "#42A5F5", bar: "#42A5F5" },
};

const ELEMENT_KO: Record<string, string> = {
  wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
};

const ELEMENT_SYMBOL: Record<string, string> = {
  wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
};

const SECTION_ACCENT: Record<string, string> = {
  personality:   "#4CAF50",
  tenGods:       "#C9A96E",
  relationship:  "#42A5F5",
  love:          "#E91E63",
  career:        "#FF9800",
  wealth:        "#FFD700",
  health:        "#00BCD4",
  majorCycles:   "#9C27B0",
  yearlyFortune: "#1B2A4A",
  actionAdvice:  "#EF5350",
  overview:      "#C9A96E",
  elements:      "#4CAF50",
  ziwei:         "#9C27B0",
  astrology:     "#42A5F5",
  glossary:      "#A68B5B",
  closing:       "#C9A96E",
};

// Chapter colors for divider pages
const CHAPTER_COLORS: Record<string, string> = {
  ch1: "#243555",
  ch2: "#1a3a2a",
  ch3: "#3a1a2a",
  ch4: "#1a2a3a",
  ch5: "#2a1a3a",
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 56, paddingBottom: 70, paddingHorizontal: 40,
    fontSize: 10, fontFamily: F, color: GRAY_900, backgroundColor: CREAM,
  },
  coverPage: {
    paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0,
    fontFamily: F, backgroundColor: NAVY,
  },
  coverInner: {
    flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 60,
  },
  coverBorderTop:    { position: "absolute", top: 30, left: 30, right: 30, height: 2, backgroundColor: GOLD },
  coverBorderBottom: { position: "absolute", bottom: 30, left: 30, right: 30, height: 2, backgroundColor: GOLD },
  coverBorderLeft:   { position: "absolute", top: 30, left: 30, bottom: 30, width: 2, backgroundColor: GOLD },
  coverBorderRight:  { position: "absolute", top: 30, right: 30, bottom: 30, width: 2, backgroundColor: GOLD },
  coverCornerTL: { position: "absolute", top: 24, left: 24, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: GOLD },
  coverCornerTR: { position: "absolute", top: 24, right: 24, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: GOLD },
  coverCornerBL: { position: "absolute", bottom: 24, left: 24, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: GOLD },
  coverCornerBR: { position: "absolute", bottom: 24, right: 24, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: GOLD },
  coverDivider:   { width: 80, height: 2, backgroundColor: GOLD, marginVertical: 20 },
  coverLabel:     { fontFamily: F, fontSize: 11, color: GOLD_LIGHT, letterSpacing: 6, marginBottom: 10 },
  coverTitle:     { fontFamily: F, fontSize: 36, fontWeight: 700, color: WHITE, marginBottom: 4, letterSpacing: 3 },
  coverSubtitle:  { fontFamily: F, fontSize: 12, color: GOLD, letterSpacing: 4 },
  coverName:      { fontFamily: F, fontSize: 28, fontWeight: 700, color: GOLD, marginBottom: 8 },
  coverMeta:      { fontFamily: F, fontSize: 11, color: GOLD_LIGHT, opacity: 0.85, marginBottom: 3 },
  coverDate:      { position: "absolute", bottom: 50, left: 30, right: 30, textAlign: "center", fontSize: 9, color: GOLD_DARK, letterSpacing: 2, fontFamily: F },

  // Section header
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 18 },
  sectionAccentBar:  { width: 4, height: 28, borderRadius: 2, marginRight: 10 },
  sectionBadge:      { backgroundColor: NAVY, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginRight: 10 },
  sectionBadgeText:  { fontFamily: F, fontSize: 9, fontWeight: 700, color: GOLD, letterSpacing: 1 },
  sectionTitleMain:  { fontFamily: F, fontSize: 16, fontWeight: 700, color: NAVY, flex: 1 },
  sectionDividerLine:{ height: 1, backgroundColor: GOLD_LIGHT, marginBottom: 10 },

  // Body text
  bodyText: { fontFamily: F, fontSize: 10, lineHeight: 1.85, color: GRAY_700, marginBottom: 8 },
  smallText:{ fontFamily: F, fontSize: 9,  lineHeight: 1.75, color: GRAY_700, marginBottom: 6 },

  // Key-takeaway callout
  calloutBox:  { backgroundColor: NAVY, borderRadius: 8, padding: 14, marginVertical: 8, flexDirection: "row", alignItems: "flex-start" },
  calloutIcon: { fontFamily: F, fontSize: 13, fontWeight: 700, color: GOLD, marginRight: 10, marginTop: 1 },
  calloutText: { fontFamily: F, fontSize: 10, lineHeight: 1.8, color: GOLD_LIGHT, flex: 1 },

  // Pull-quote
  pullQuote:     { borderLeftWidth: 3, borderLeftColor: GOLD, backgroundColor: CREAM_DARK, paddingVertical: 10, paddingHorizontal: 14, marginVertical: 8, borderRadius: 4 },
  pullQuoteText: { fontFamily: F, fontSize: 10.5, lineHeight: 1.85, color: NAVY },

  // Four pillars
  pillarRow:      { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 18 },
  pillarBox:      { width: 100, alignItems: "center", backgroundColor: WHITE, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 8, borderWidth: 1, borderColor: GOLD_LIGHT },
  pillarBoxDay:   { width: 100, alignItems: "center", backgroundColor: NAVY, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 8, borderWidth: 2, borderColor: GOLD },
  pillarLabel:    { fontFamily: F, fontSize: 8, color: GRAY_500, marginBottom: 8, letterSpacing: 1 },
  pillarLabelDay: { fontFamily: F, fontSize: 8, color: GOLD_LIGHT, marginBottom: 8, letterSpacing: 1 },
  pillarStem:     { fontFamily: F, fontSize: 22, fontWeight: 700, color: NAVY },
  pillarStemDay:  { fontFamily: F, fontSize: 22, fontWeight: 700, color: GOLD },
  pillarHanja:    { fontFamily: F, fontSize: 10, color: GRAY_500, marginTop: 2 },
  pillarHanjaDay: { fontFamily: F, fontSize: 10, color: GOLD_LIGHT, marginTop: 2 },
  pillarBranch:   { fontFamily: F, fontSize: 22, fontWeight: 700, color: GOLD_DARK, marginTop: 5 },
  pillarBranchDay:{ fontFamily: F, fontSize: 22, fontWeight: 700, color: WHITE, marginTop: 5 },
  pillarDivider:  { width: 22, height: 1, backgroundColor: GOLD_LIGHT, marginVertical: 5 },
  pillarDividerDay:{ width: 22, height: 1, backgroundColor: GOLD, marginVertical: 5 },
  dayMasterBadge: { fontFamily: F, fontSize: 7, color: GOLD, backgroundColor: NAVY_DARK, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 5, letterSpacing: 1 },

  // Info card
  infoCard:     { backgroundColor: WHITE, borderRadius: 10, padding: 14, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: GOLD },
  infoCardText: { fontFamily: F, fontSize: 10, lineHeight: 1.7, color: GRAY_700 },

  // Five elements
  elementContainer: { marginTop: 6 },
  elementRow:       { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  elementLabelContainer: { width: 70, flexDirection: "row", alignItems: "center", gap: 4 },
  elementEmoji:  { fontFamily: F, fontSize: 12, fontWeight: 700, color: GOLD_DARK },
  elementLabel:  { fontFamily: F, fontSize: 10, fontWeight: 700, color: GRAY_700 },
  elementBarBg:  { flex: 1, height: 20, backgroundColor: WHITE, borderRadius: 10, borderWidth: 1, borderColor: GRAY_300, overflow: "hidden" },
  elementCount:  { fontFamily: F, width: 32, fontSize: 10, fontWeight: 700, color: GRAY_700, textAlign: "right", marginLeft: 6 },

  // Monthly fortune
  monthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  monthCard: { width: "47%", backgroundColor: WHITE, borderRadius: 10, padding: 10, marginBottom: 4, borderWidth: 1, borderColor: GOLD_LIGHT },
  monthHeader:{ flexDirection: "row", alignItems: "center", marginBottom: 5 },
  monthBadge: { backgroundColor: NAVY, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  monthLabel: { fontFamily: F, fontSize: 10, fontWeight: 700, color: GOLD },
  monthText:  { fontFamily: F, fontSize: 8.5, lineHeight: 1.65, color: GRAY_700 },

  // Lucky elements
  luckyRow:  { flexDirection: "row", gap: 12, marginTop: 10 },
  luckyCard: { flex: 1, backgroundColor: NAVY, borderRadius: 12, padding: 16, alignItems: "center" },
  luckyIcon: { fontFamily: F, fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 7 },
  luckyTitle:{ fontFamily: F, fontSize: 9, color: GOLD_LIGHT, marginBottom: 5, letterSpacing: 1 },
  luckyValue:{ fontFamily: F, fontSize: 13, fontWeight: 700, color: GOLD },

  // Summary
  summaryBox: { backgroundColor: NAVY, borderRadius: 12, padding: 22, marginTop: 6 },
  summaryText:{ fontFamily: F, fontSize: 11, lineHeight: 1.8, color: GOLD_LIGHT, textAlign: "center" },

  // Footer
  footer:     { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: GOLD_LIGHT, paddingTop: 7 },
  footerBrand:{ fontFamily: F, fontSize: 8, fontWeight: 700, color: GOLD_DARK, letterSpacing: 2 },
  footerPage: { fontFamily: F, fontSize: 8, color: GRAY_500 },

  // Page decorative top bar
  pageTopBar: { position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: GOLD },

  // Chapter divider
  chapterDivider:    { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  chapterDividerLine:{ flex: 1, height: 1, backgroundColor: GOLD_LIGHT },
  chapterDividerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, marginHorizontal: 8 },

  // Section background tint card wrapper
  sectionCard: { backgroundColor: WHITE, borderRadius: 10, padding: 14, marginBottom: 4, borderWidth: 1, borderColor: GOLD_LIGHT },

  // Page chapter header
  pageChapterLabel:{ fontFamily: F, fontSize: 8, color: GOLD_DARK, letterSpacing: 3, marginBottom: 4 },
  pageChapterTitle:{ fontFamily: F, fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 },
  pageChapterBar:  { width: 36, height: 2, backgroundColor: GOLD, marginBottom: 16 },

  // Monthly section subtitle
  monthlySectionLabel:{ fontFamily: F, fontSize: 8, color: GOLD_DARK, letterSpacing: 2, marginBottom: 2 },
  monthlySectionTitle:{ fontFamily: F, fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 8 },

  // Table styles
  tableContainer:  { marginVertical: 8 },
  tableHeader:     { flexDirection: "row", backgroundColor: NAVY, borderRadius: 4 },
  tableHeaderCell: { flex: 1, padding: 7, fontFamily: F, fontSize: 9, fontWeight: 700, color: GOLD, textAlign: "center" },
  tableRow:        { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: GOLD_LIGHT },
  tableRowAlt:     { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: GOLD_LIGHT, backgroundColor: CREAM_DARK },
  tableCell:       { flex: 1, padding: 7, fontFamily: F, fontSize: 9, lineHeight: 1.6, color: GRAY_700, textAlign: "center" },
  tableCellLeft:   { flex: 2, padding: 7, fontFamily: F, fontSize: 9, lineHeight: 1.6, color: GRAY_700 },
  tableCellWide:   { flex: 3, padding: 7, fontFamily: F, fontSize: 9, lineHeight: 1.65, color: GRAY_700 },

  // Divider page
  dividerPage: { paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0, fontFamily: F },
  dividerInner:{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 60 },
  dividerChNum:{ fontFamily: F, fontSize: 10, color: GOLD_DARK, letterSpacing: 4, marginBottom: 14 },
  dividerTitle:{ fontFamily: F, fontSize: 30, fontWeight: 700, color: WHITE, marginBottom: 10, textAlign: "center" },
  dividerSub:  { fontFamily: F, fontSize: 12, color: GOLD_LIGHT, letterSpacing: 2, textAlign: "center" },
  dividerLine: { width: 60, height: 2, backgroundColor: GOLD, marginVertical: 18 },
  dividerDesc: { fontFamily: F, fontSize: 10, color: GOLD_DARK, textAlign: "center", lineHeight: 1.7 },

  // TOC styles
  tocRow:      { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  tocNum:      { fontFamily: F, fontSize: 10, fontWeight: 700, color: GOLD, width: 24 },
  tocTitle:    { fontFamily: F, fontSize: 10, color: NAVY, flex: 1 },
  tocDots:     { flex: 1, borderBottomWidth: 1, borderBottomStyle: "dotted", borderBottomColor: GOLD_DARK, marginHorizontal: 6, marginBottom: 3 },
  tocPage:     { fontFamily: F, fontSize: 9, color: GRAY_500, width: 20, textAlign: "right" },

  // Pillar detail table
  pillarDetailRow:  { flexDirection: "row", marginBottom: 2 },
  pillarDetailCell: { flex: 1, backgroundColor: WHITE, borderRadius: 6, padding: 8, margin: 2, alignItems: "center", borderWidth: 1, borderColor: GOLD_LIGHT },
  pillarDetailLabel:{ fontFamily: F, fontSize: 7, color: GRAY_500, marginBottom: 3, letterSpacing: 1 },
  pillarDetailMain: { fontFamily: F, fontSize: 16, fontWeight: 700, color: NAVY },
  pillarDetailSub:  { fontFamily: F, fontSize: 8,  color: GRAY_500 },

  // Decade cycle item
  decadeItem:     { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, backgroundColor: WHITE, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: GOLD_LIGHT },
  decadeBadge:    { backgroundColor: NAVY, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, alignItems: "center", marginRight: 10, minWidth: 52 },
  decadeStem:     { fontFamily: F, fontSize: 14, fontWeight: 700, color: GOLD },
  decadeBranch:   { fontFamily: F, fontSize: 14, fontWeight: 700, color: WHITE },
  decadeAge:      { fontFamily: F, fontSize: 7, color: GOLD_DARK, marginTop: 2 },
  decadeContent:  { flex: 1 },
  decadeText:     { fontFamily: F, fontSize: 9, lineHeight: 1.65, color: GRAY_700 },

  // Ten gods detail
  tenGodItem:     { backgroundColor: WHITE, borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: GOLD_LIGHT, flexDirection: "row", alignItems: "flex-start" },
  tenGodBadge:    { backgroundColor: NAVY, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5, marginRight: 10, minWidth: 48, alignItems: "center" },
  tenGodName:     { fontFamily: F, fontSize: 9, fontWeight: 700, color: GOLD },
  tenGodDesc:     { fontFamily: F, fontSize: 9, lineHeight: 1.65, color: GRAY_700, flex: 1 },

  // Score gauge
  scoreRow:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  scoreLabel:     { fontFamily: F, fontSize: 9, color: GRAY_700, width: 80 },
  scoreBarBg:     { flex: 1, height: 12, backgroundColor: CREAM_DARK, borderRadius: 6, overflow: "hidden" },
  scoreValue:     { fontFamily: F, fontSize: 9, fontWeight: 700, color: NAVY, width: 28, textAlign: "right" },

  // 2-col layout
  twoColRow:      { flexDirection: "row", gap: 10 },
  twoColLeft:     { flex: 1 },
  twoColRight:    { flex: 1 },

  // Section tint card variants
  mintCard:       { backgroundColor: "#f0faf4", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#c8e6c9" },
  blueCard:       { backgroundColor: "#e8f4fd", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#bbdefb" },
  purpleCard:     { backgroundColor: "#f3e5f5", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e1bee7" },
  warmCard:       { backgroundColor: "#fff8e1", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#ffe082" },

  // Closing page
  closingPage:    { paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0, fontFamily: F, backgroundColor: NAVY_DARK },
  closingInner:   { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 60 },
  closingTitle:   { fontFamily: F, fontSize: 18, fontWeight: 700, color: GOLD, marginBottom: 16, textAlign: "center", letterSpacing: 2 },
  closingText:    { fontFamily: F, fontSize: 11, lineHeight: 1.9, color: GOLD_LIGHT, textAlign: "center" },
  closingBrand:   { fontFamily: F, fontSize: 10, color: GOLD_DARK, letterSpacing: 3, marginTop: 24 },
});

// ─── Helper functions ────────────────────────────────────────────────────────

function stemHanja(stem: string): string {
  const idx = (HEAVENLY_STEMS as readonly string[]).indexOf(stem);
  return idx >= 0 ? HEAVENLY_STEMS_HANJA[idx] : "";
}

function branchHanja(branch: string): string {
  const idx = (EARTHLY_BRANCHES as readonly string[]).indexOf(branch);
  return idx >= 0 ? EARTHLY_BRANCHES_HANJA[idx] : "";
}

const HOUR_TO_SIJI_LABEL: Record<number, string> = {
  23: "자시(子時)", 0: "자시(子時)", 1: "축시(丑時)", 2: "축시(丑時)",
  3: "인시(寅時)", 4: "인시(寅時)", 5: "묘시(卯時)", 6: "묘시(卯時)",
  7: "진시(辰時)", 8: "진시(辰時)", 9: "사시(巳時)", 10: "사시(巳時)",
  11: "오시(午時)", 12: "오시(午時)", 13: "미시(未時)", 14: "미시(未時)",
  15: "신시(申時)", 16: "신시(申時)", 17: "유시(酉時)", 18: "유시(酉時)",
  19: "술시(戌時)", 20: "술시(戌時)", 21: "해시(亥時)", 22: "해시(亥時)",
};

function splitParagraphs(content: string): string[] {
  return content.split(/\n+/).map((l) => l.trim()).filter(Boolean);
}

// ─── SVG Charts ─────────────────────────────────────────────────────────────

/** Donut/Pie chart for 오행 분포 */
function ElementDonutChart({ elements }: { elements: FiveElementDistribution }) {
  const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
  if (total === 0) return null;

  const cx = 80, cy = 80, r = 58, innerR = 32;
  const items = [
    { key: "wood",  count: elements.wood,  color: "#66BB6A" },
    { key: "fire",  count: elements.fire,  color: "#EF5350" },
    { key: "earth", count: elements.earth, color: "#FFB300" },
    { key: "metal", count: elements.metal, color: "#AB47BC" },
    { key: "water", count: elements.water, color: "#42A5F5" },
  ];

  let currentAngle = -Math.PI / 2;
  const slices: { path: string; color: string; midAngle: number; label: string; count: number }[] = [];

  items.forEach(({ count, color, key }) => {
    if (count === 0) return;
    const angle = (count / total) * 2 * Math.PI;
    const endAngle = currentAngle + angle;
    const midAngle = currentAngle + angle / 2;

    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(currentAngle);
    const iy1 = cy + innerR * Math.sin(currentAngle);
    const ix2 = cx + innerR * Math.cos(endAngle);
    const iy2 = cy + innerR * Math.sin(endAngle);

    const largeArc = angle > Math.PI ? 1 : 0;
    const d = [
      `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      `L ${ix2.toFixed(2)} ${iy2.toFixed(2)}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
      "Z",
    ].join(" ");

    slices.push({ path: d, color, midAngle, label: ELEMENT_SYMBOL[key], count });
    currentAngle = endAngle;
  });

  return (
    <Svg width={160} height={160} viewBox="0 0 160 160">
      {slices.map((s, i) => (
        <Path key={i} d={s.path} fill={s.color} />
      ))}
      {/* Center */}
      <Circle cx={cx} cy={cy} r={innerR - 2} fill={CREAM} />
      <G>
        {/* Total label in center */}
      </G>
      {/* Labels */}
      {slices.map((s, i) => {
        const lx = cx + (r * 0.72) * Math.cos(s.midAngle);
        const ly = cy + (r * 0.72) * Math.sin(s.midAngle);
        return (
          <G key={`lbl-${i}`}>
            <Text
              x={lx.toFixed(2)}
              y={(ly + 3).toFixed(2)}
              fill={WHITE}
              textAnchor="middle"
              style={{ fontSize: 9, fontFamily: F, fontWeight: 700 } as never}
            >
              {s.label}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

/** Pentagon/Radar chart for 오행 balance */
function ElementRadarChart({ elements }: { elements: FiveElementDistribution }) {
  const maxVal = 8;
  const cx = 80, cy = 80, maxR = 60;
  const labels = ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"];
  const values = [
    elements.wood / maxVal,
    elements.fire / maxVal,
    elements.earth / maxVal,
    elements.metal / maxVal,
    elements.water / maxVal,
  ];
  const colors = ["#66BB6A", "#EF5350", "#FFB300", "#AB47BC", "#42A5F5"];
  const angles = labels.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5);

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  const ringPath = (frac: number) => {
    const pts = angles.map((a) => {
      const rx = cx + maxR * frac * Math.cos(a);
      const ry = cy + maxR * frac * Math.sin(a);
      return `${rx.toFixed(2)},${ry.toFixed(2)}`;
    });
    return `M ${pts.join(" L ")} Z`;
  };

  const dataPath = () => {
    const pts = angles.map((a, i) => {
      const v = Math.max(values[i], 0.08);
      const rx = cx + maxR * v * Math.cos(a);
      const ry = cy + maxR * v * Math.sin(a);
      return `${rx.toFixed(2)},${ry.toFixed(2)}`;
    });
    return `M ${pts.join(" L ")} Z`;
  };

  return (
    <Svg width={160} height={160} viewBox="0 0 160 160">
      {/* Grid rings */}
      {rings.map((frac, i) => (
        <Path key={`ring-${i}`} d={ringPath(frac)} fill="none" stroke={GOLD_LIGHT} strokeWidth={0.8} />
      ))}
      {/* Axis lines */}
      {angles.map((a, i) => (
        <Line
          key={`axis-${i}`}
          x1={cx.toFixed(2)} y1={cy.toFixed(2)}
          x2={(cx + maxR * Math.cos(a)).toFixed(2)}
          y2={(cy + maxR * Math.sin(a)).toFixed(2)}
          stroke={GRAY_300} strokeWidth={0.8}
        />
      ))}
      {/* Data polygon */}
      <Path d={dataPath()} fill="rgba(201,169,110,0.25)" stroke={GOLD} strokeWidth={1.5} />
      {/* Data points */}
      {angles.map((a, i) => {
        const v = Math.max(values[i], 0.08);
        const px = cx + maxR * v * Math.cos(a);
        const py = cy + maxR * v * Math.sin(a);
        return <Circle key={`dot-${i}`} cx={px.toFixed(2)} cy={py.toFixed(2)} r={3} fill={colors[i]} />;
      })}
      {/* Labels */}
      {angles.map((a, i) => {
        const lx = cx + (maxR + 12) * Math.cos(a);
        const ly = cy + (maxR + 12) * Math.sin(a);
        return (
          <Text
            key={`rlbl-${i}`}
            x={lx.toFixed(2)}
            y={(ly + 3).toFixed(2)}
            fill={colors[i]}
            textAnchor="middle"
            style={{ fontSize: 7, fontFamily: F, fontWeight: 700 } as never}
          >
            {labels[i]}
          </Text>
        );
      })}
    </Svg>
  );
}

/** Horizontal bar chart for monthly fortune scores */
function MonthlyBarChart({ months }: { months: MonthlyFortune[] }) {
  if (!months || months.length === 0) return null;
  const w = 480, h = 152;
  const barH = 9;
  const gap = 3;
  const leftPad = 28;
  const maxW = w - leftPad - 10;

  // Assign a pseudo-score per month based on index pattern (3-wave) for visual variety
  const scores = months.map((m) => {
    const base = 0.45 + 0.45 * Math.sin((m.month - 1) * (Math.PI / 5.5));
    return Math.max(0.25, Math.min(1.0, base + (m.month % 3 === 0 ? 0.1 : -0.05)));
  });

  const colors = ["#66BB6A", "#EF5350", "#FFB300", "#AB47BC", "#42A5F5",
                  "#66BB6A", "#EF5350", "#FFB300", "#AB47BC", "#42A5F5", "#66BB6A", "#EF5350"];

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {months.map((m, i) => {
        const barW = Math.max(scores[i] * maxW, 20);
        const y = i * (barH + gap) + 4;
        return (
          <G key={`bar-${i}`}>
            {/* Label */}
            <Text x={0} y={y + barH - 1} fill={GRAY_700} style={{ fontSize: 7, fontFamily: F } as never}>{m.month}월</Text>
            {/* BG */}
            <Rect x={leftPad} y={y} width={maxW} height={barH} rx={4} fill={CREAM_DARK} />
            {/* Bar */}
            <Rect x={leftPad} y={y} width={barW.toFixed(1)} height={barH} rx={4} fill={colors[i % colors.length]} />
          </G>
        );
      })}
    </Svg>
  );
}

/** Decade cycle timeline */
function DecadeTimeline({ cycles }: { cycles: DecadeCycle[] }) {
  if (!cycles || cycles.length === 0) return null;
  const w = 480, h = 50;
  const n = cycles.length;
  const slotW = w / n;
  const blockH = 30;
  const blockColors = [NAVY, NAVY_MID, NAVY_LIGHT, "#305080", NAVY, NAVY_MID, NAVY_LIGHT, "#305080"];

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {/* Axis line */}
      <Line x1={0} y1={35} x2={w} y2={35} stroke={GOLD_DARK} strokeWidth={1} />
      {cycles.map((c, i) => {
        const x = i * slotW;
        const bx = x + 2;
        const bw = slotW - 4;
        return (
          <G key={`dc-${i}`}>
            <Rect x={bx.toFixed(1)} y={0} width={bw.toFixed(1)} height={blockH} rx={3} fill={blockColors[i % blockColors.length]} />
            <Text x={(bx + bw / 2).toFixed(1)} y={12} fill={GOLD} textAnchor="middle" style={{ fontSize: 9, fontFamily: F, fontWeight: 700 } as never}>{c.stem}</Text>
            <Text x={(bx + bw / 2).toFixed(1)} y={24} fill={WHITE} textAnchor="middle" style={{ fontSize: 9, fontFamily: F, fontWeight: 700 } as never}>{c.branch}</Text>
            {/* Tick */}
            <Line x1={(bx + bw / 2).toFixed(1)} y1={blockH} x2={(bx + bw / 2).toFixed(1)} y2={35} stroke={GOLD_DARK} strokeWidth={0.8} />
            {/* Age label */}
            <Text x={(bx + bw / 2).toFixed(1)} y={46} fill={GRAY_500} textAnchor="middle" style={{ fontSize: 6, fontFamily: F } as never}>{c.ageRange.split("~")[0].replace("세", "")}</Text>
          </G>
        );
      })}
    </Svg>
  );
}

/** Gauge arc for a score (0-100) */
function GaugeArc({ score, label, color }: { score: number; label: string; color: string }) {
  const s = Math.max(0, Math.min(100, score));
  const cx = 55, cy = 46, r = 40;
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const totalAngle = endAngle - startAngle;
  const fillAngle = startAngle + (s / 100) * totalAngle;

  const arcPath = (from: number, to: number, ri: number) => {
    const x1 = cx + ri * Math.cos(from);
    const y1 = cy + ri * Math.sin(from);
    const x2 = cx + ri * Math.cos(to);
    const y2 = cy + ri * Math.sin(to);
    const la = (to - from) > Math.PI ? 1 : 0;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${ri} ${ri} 0 ${la} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  return (
    <Svg width={110} height={84} viewBox="0 0 110 84">
      <Path d={arcPath(startAngle, endAngle, r)} fill="none" stroke={CREAM_DARK} strokeWidth={8} strokeLinecap="round" />
      <Path d={arcPath(startAngle, fillAngle, r)} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
      <Text x={cx.toFixed(1)} y={(cy + 5).toFixed(1)} fill={color} textAnchor="middle" style={{ fontSize: 14, fontFamily: F, fontWeight: 700 } as never}>{String(s)}</Text>
      <Text x={cx.toFixed(1)} y={(cy + 17).toFixed(1)} fill={GRAY_500} textAnchor="middle" style={{ fontSize: 7, fontFamily: F } as never}>{label}</Text>
    </Svg>
  );
}

// ─── Decorative Components ──────────────────────────────────────────────────

function PageTopBar() {
  return <View style={styles.pageTopBar} fixed />;
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerBrand}>팔자핀사주</Text>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function ChapterDivider() {
  return (
    <View style={styles.chapterDivider}>
      <View style={styles.chapterDividerLine} />
      <View style={styles.chapterDividerDot} />
      <View style={styles.chapterDividerLine} />
    </View>
  );
}

function SectionHeader({
  title, subtitle, accentKey,
}: { title: string; subtitle?: string; accentKey?: string }) {
  const accentColor = accentKey ? (SECTION_ACCENT[accentKey] ?? GOLD) : GOLD;
  return (
    <View style={styles.sectionHeaderRow} wrap={false}>
      <View style={[styles.sectionAccentBar, { backgroundColor: accentColor }]} />
      {subtitle && (
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{subtitle}</Text>
        </View>
      )}
      <Text style={styles.sectionTitleMain}>{title}</Text>
    </View>
  );
}

function KeyCallout({ text }: { text: string }) {
  return (
    // No wrap={false} here — a tall callout spanning a long text MUST be allowed to
    // break across pages; preventing that is what creates blank continuation pages.
    <View style={styles.calloutBox}>
      <Text style={styles.calloutIcon}>핵심</Text>
      <Text style={styles.calloutText}>{text}</Text>
    </View>
  );
}

// ─── TextSection: premium multi-para render ──────────────────────────────────

function TextSection({
  title, subtitle, content, accentKey,
}: { title: string; subtitle?: string; content: string; accentKey?: string }) {
  if (!content || content.trim().length === 0) return null;
  const paragraphs = splitParagraphs(content);
  if (paragraphs.length === 0) return null;

  // With ≥3 paragraphs: first → pull-quote, last → callout, middle → body.
  // With 2 paragraphs: first → pull-quote, second → body (no callout, avoids forcing
  //   a one-line callout to bump to a new page and leave a blank continuation).
  // With 1 paragraph: single pull-quote only.
  const pullQuotePara = paragraphs[0];
  const hasCallout = paragraphs.length >= 3;
  const calloutPara = hasCallout ? paragraphs[paragraphs.length - 1] : null;
  const bodyParas = hasCallout
    ? paragraphs.slice(1, paragraphs.length - 1)
    : paragraphs.slice(1);

  return (
    // No bottom margin here — outer page layout provides spacing via ChapterDivider or
    // simply by natural flow. A trailing marginBottom is the #1 cause of "tipped" blank
    // continuation pages in react-pdf.
    <View>
      {/* Section header stays together — no orphan heading at page bottom */}
      <View wrap={false}>
        <SectionHeader title={title} subtitle={subtitle} accentKey={accentKey} />
        <View style={styles.sectionDividerLine} />
      </View>

      {/* Pull-quote: allowed to stand alone on a continuation page */}
      <View style={styles.pullQuote}>
        <Text style={styles.pullQuoteText}>{pullQuotePara}</Text>
      </View>

      {/* Body paragraphs flow freely across pages */}
      {bodyParas.length > 0 && (
        <View style={styles.sectionCard}>
          {bodyParas.map((p, i) => (
            <Text key={i} style={styles.bodyText}>{p}</Text>
          ))}
        </View>
      )}

      {calloutPara && <KeyCallout text={calloutPara} />}
    </View>
  );
}

// ─── Four Pillars ────────────────────────────────────────────────────────────

function FourPillarsSection({ reading }: { reading: SajuReading }) {
  const fp = reading.four_pillars;
  if (!fp) return null;

  const pillars = [
    { label: "시주 · 時柱", pillar: fp.hour, isDay: false },
    { label: "일주 · 日柱", pillar: fp.day,  isDay: true  },
    { label: "월주 · 月柱", pillar: fp.month,isDay: false },
    { label: "연주 · 年柱", pillar: fp.year, isDay: false },
  ];

  return (
    <View>
      <SectionHeader title="사주팔자" subtitle="FOUR PILLARS" accentKey="personality" />
      <View style={styles.sectionDividerLine} />
      <View style={styles.pillarRow}>
        {pillars.map((p) => (
          <View key={p.label} style={p.isDay ? styles.pillarBoxDay : styles.pillarBox}>
            <Text style={p.isDay ? styles.pillarLabelDay : styles.pillarLabel}>{p.label}</Text>
            <Text style={p.isDay ? styles.pillarStemDay : styles.pillarStem}>{p.pillar.heavenlyStem}</Text>
            <Text style={p.isDay ? styles.pillarHanjaDay : styles.pillarHanja}>{stemHanja(p.pillar.heavenlyStem)}</Text>
            <View style={p.isDay ? styles.pillarDividerDay : styles.pillarDivider} />
            <Text style={p.isDay ? styles.pillarBranchDay : styles.pillarBranch}>{p.pillar.earthlyBranch}</Text>
            <Text style={p.isDay ? styles.pillarHanjaDay : styles.pillarHanja}>{branchHanja(p.pillar.earthlyBranch)}</Text>
            {p.isDay && <Text style={styles.dayMasterBadge}>일간 · DAY MASTER</Text>}
          </View>
        ))}
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoCardText}>
          일간(日干) {fp.day.heavenlyStem}({stemHanja(fp.day.heavenlyStem)})은 사주에서 나 자신을 의미하는 핵심 요소입니다.
          일간을 중심으로 다른 기둥과의 관계를 통해 성격, 적성, 운세를 해석합니다.
        </Text>
      </View>
    </View>
  );
}

/** Detailed 만세력-style four-pillars table */
function FourPillarsDetailTable({ reading }: { reading: SajuReading }) {
  const fp = reading.four_pillars;
  if (!fp) return null;

  const pillars = [
    { label: "연주(年柱)", stem: fp.year.heavenlyStem,  branch: fp.year.earthlyBranch  },
    { label: "월주(月柱)", stem: fp.month.heavenlyStem, branch: fp.month.earthlyBranch },
    { label: "일주(日柱)", stem: fp.day.heavenlyStem,   branch: fp.day.earthlyBranch   },
    { label: "시주(時柱)", stem: fp.hour.heavenlyStem,  branch: fp.hour.earthlyBranch  },
  ];

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>기둥</Text>
        <Text style={styles.tableHeaderCell}>천간(天干)</Text>
        <Text style={styles.tableHeaderCell}>한자</Text>
        <Text style={styles.tableHeaderCell}>지지(地支)</Text>
        <Text style={styles.tableHeaderCell}>한자</Text>
      </View>
      {pillars.map((p, i) => (
        <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
          <Text style={styles.tableCell}>{p.label}</Text>
          <Text style={styles.tableCell}>{p.stem}</Text>
          <Text style={styles.tableCell}>{stemHanja(p.stem)}</Text>
          <Text style={styles.tableCell}>{p.branch}</Text>
          <Text style={styles.tableCell}>{branchHanja(p.branch)}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Five Elements Section ───────────────────────────────────────────────────

function FiveElementsSection({ elements }: { elements: FiveElementDistribution }) {
  const total = Math.max(elements.wood + elements.fire + elements.earth + elements.metal + elements.water, 1);
  const maxCount = Math.max(elements.wood, elements.fire, elements.earth, elements.metal, elements.water, 1);

  const items: { key: keyof FiveElementDistribution; count: number }[] = [
    { key: "wood",  count: elements.wood  },
    { key: "fire",  count: elements.fire  },
    { key: "earth", count: elements.earth },
    { key: "metal", count: elements.metal },
    { key: "water", count: elements.water },
  ];

  return (
    <View style={styles.elementContainer}>
      <SectionHeader title="오행 분석" subtitle="FIVE ELEMENTS" accentKey="tenGods" />
      <View style={styles.sectionDividerLine} />
      <View style={styles.twoColRow}>
        <View style={styles.twoColLeft}>
          {items.map((item) => {
            const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const colors = ELEMENT_COLORS[item.key];
            return (
              <View key={item.key} style={styles.elementRow}>
                <View style={styles.elementLabelContainer}>
                  <Text style={styles.elementEmoji}>{ELEMENT_SYMBOL[item.key]}</Text>
                  <Text style={styles.elementLabel}>{ELEMENT_KO[item.key]}</Text>
                </View>
                <View style={styles.elementBarBg}>
                  <View style={{ width: `${Math.max(widthPercent, 8)}%`, height: 18, backgroundColor: colors.bar, borderRadius: 9 }} />
                </View>
                <Text style={styles.elementCount}>{item.count}/{total}</Text>
              </View>
            );
          })}
        </View>
        <View style={[styles.twoColRight, { alignItems: "center", justifyContent: "center" }]}>
          <ElementDonutChart elements={elements} />
        </View>
      </View>
    </View>
  );
}

/** Five elements with radar chart on second pass */
function FiveElementsRadarSection({ elements }: { elements: FiveElementDistribution }) {
  return (
    <View>
      <SectionHeader title="오행 균형 분석" subtitle="BALANCE RADAR" accentKey="elements" />
      <View style={styles.sectionDividerLine} />
      <View style={styles.twoColRow}>
        <View style={[styles.twoColLeft, { alignItems: "center", justifyContent: "center" }]}>
          <ElementRadarChart elements={elements} />
        </View>
        <View style={styles.twoColRight}>
          <Text style={[styles.bodyText, { marginTop: 8 }]}>
            오행의 균형 상태를 레이더 차트로 확인할 수 있습니다. 다섯 꼭짓점 각각이 목(木)·화(火)·토(土)·금(金)·수(水)를 의미하며, 각 꼭짓점까지의 거리가 해당 오행의 강도를 나타냅니다.
          </Text>
          <Text style={styles.bodyText}>
            균형 잡힌 오행은 삶의 다양한 영역에서 조화를 이룸을 의미합니다. 특정 오행이 지나치게 강하거나 약할 경우, 해당 오행에 해당하는 색상, 음식, 방향을 통해 보완하는 것이 좋습니다.
          </Text>
          <View style={styles.warmCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY }]}>오행 핵심 포인트</Text>
            <Text style={styles.smallText}>
              목(木): 성장·창의, 화(火): 열정·표현, 토(土): 안정·중재, 금(金): 의지·원칙, 수(水): 지혜·유연
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Monthly Fortune ─────────────────────────────────────────────────────────

function MonthlyFortuneSection({ months, sectionLabel }: { months: MonthlyFortune[]; sectionLabel?: string }) {
  if (!months || months.length === 0) return null;

  return (
    <View>
      {sectionLabel && (
        <View wrap={false}>
          <Text style={styles.monthlySectionLabel}>MONTHLY FORTUNE</Text>
          <Text style={styles.monthlySectionTitle}>{sectionLabel}</Text>
        </View>
      )}
      <View style={styles.monthGrid}>
        {months.map((m) => (
          <View key={m.month} style={styles.monthCard} wrap={false}>
            <View style={styles.monthHeader}>
              <View style={styles.monthBadge}>
                <Text style={styles.monthLabel}>{m.month}월</Text>
              </View>
            </View>
            <Text style={styles.monthText}>{m.fortune}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Lucky Elements ──────────────────────────────────────────────────────────

function LuckyElementsSection({ color, direction, number }: { color: string; direction: string; number: string }) {
  return (
    <View wrap={false}>
      <SectionHeader title="행운의 요소" subtitle="LUCKY ELEMENTS" accentKey="wealth" />
      <View style={styles.sectionDividerLine} />
      <View style={styles.luckyRow}>
        <View style={styles.luckyCard}>
          <Text style={styles.luckyIcon}>色</Text>
          <Text style={styles.luckyTitle}>행운의 색상</Text>
          <Text style={styles.luckyValue}>{color}</Text>
        </View>
        <View style={styles.luckyCard}>
          <Text style={styles.luckyIcon}>方</Text>
          <Text style={styles.luckyTitle}>행운의 방향</Text>
          <Text style={styles.luckyValue}>{direction}</Text>
        </View>
        <View style={styles.luckyCard}>
          <Text style={styles.luckyIcon}>數</Text>
          <Text style={styles.luckyTitle}>행운의 숫자</Text>
          <Text style={styles.luckyValue}>{number}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SummarySection({ content }: { content: string }) {
  if (!content || content.trim().length === 0) return null;
  const paras = splitParagraphs(content);
  return (
    <>
      <SectionHeader title="종합 코멘트" subtitle="SUMMARY" accentKey="yearlyFortune" />
      <View style={styles.sectionDividerLine} />
      {paras.map((p, i) => (
        <View key={i} style={styles.summaryBox}>
          <Text style={styles.summaryText}>{p}</Text>
        </View>
      ))}
    </>
  );
}

// ─── Decade Cycles Detail ─────────────────────────────────────────────────────

function DecadeCyclesDetail({ cycles }: { cycles: DecadeCycle[] }) {
  if (!cycles || cycles.length === 0) return null;
  return (
    <View>
      <SectionHeader title="대운 10년 단위 상세" subtitle="DECADE CYCLES" accentKey="majorCycles" />
      <View style={styles.sectionDividerLine} />
      {/* Timeline chart */}
      <View style={{ marginBottom: 12 }}>
        <DecadeTimeline cycles={cycles} />
      </View>
      {/* Detail cards */}
      {cycles.map((c, i) => (
        <View key={i} style={styles.decadeItem} wrap={false}>
          <View style={styles.decadeBadge}>
            <Text style={styles.decadeStem}>{c.stem}</Text>
            <Text style={styles.decadeBranch}>{c.branch}</Text>
            <Text style={styles.decadeAge}>{c.ageRange}</Text>
          </View>
          <View style={styles.decadeContent}>
            <Text style={styles.decadeText}>{c.summary}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Ten Gods Detail ──────────────────────────────────────────────────────────

function TenGodsDetailSection({ items }: { items: TenGodDetail[] }) {
  if (!items || items.length === 0) return null;
  return (
    <View>
      <View wrap={false}>
        <SectionHeader title="십신별 상세 분석" subtitle="TEN GODS DETAIL" accentKey="tenGods" />
        <View style={styles.sectionDividerLine} />
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.tenGodItem}>
          <View wrap={false} style={styles.tenGodBadge}>
            <Text style={styles.tenGodName}>{item.name}</Text>
          </View>
          <Text style={styles.tenGodDesc}>{item.description}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Glossary Table ───────────────────────────────────────────────────────────

function GlossaryTable({ items }: { items: { term: string; meaning: string }[] }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.tableContainer}>
      <SectionHeader title="사주 용어 풀이" subtitle="GLOSSARY" accentKey="glossary" />
      <View style={styles.sectionDividerLine} />
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>용어</Text>
        <Text style={[styles.tableHeaderCell, { flex: 4 }]}>뜻</Text>
      </View>
      {items.map((g, i) => (
        <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
          <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 700, color: NAVY }]}>{g.term}</Text>
          <Text style={[styles.tableCellWide, { flex: 4 }]}>{g.meaning}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Pillar Readings ──────────────────────────────────────────────────────────

function PillarReadingsSection({ pillarReadings }: { pillarReadings: { year: string; month: string; day: string; hour: string } }) {
  const pillarsData = [
    { label: "연주(年柱)", subtitle: "조상궁 · 초년운", content: pillarReadings.year  },
    { label: "월주(月柱)", subtitle: "부모궁 · 청년기", content: pillarReadings.month },
    { label: "일주(日柱)", subtitle: "배우자궁 · 성격 핵심", content: pillarReadings.day },
    { label: "시주(時柱)", subtitle: "자녀궁 · 말년운", content: pillarReadings.hour },
  ];

  return (
    <View>
      <SectionHeader title="사주 기둥 해설" subtitle="PILLAR READINGS" accentKey="overview" />
      <View style={styles.sectionDividerLine} />
      {pillarsData.map((p, i) => {
        const paras = splitParagraphs(p.content);
        const cardStyle = [styles.mintCard, styles.blueCard, styles.warmCard, styles.purpleCard][i];
        return (
          <View key={i} style={cardStyle}>
            <View wrap={false} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Text style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: NAVY, marginRight: 8 }}>{p.label}</Text>
              <Text style={{ fontFamily: F, fontSize: 9, color: GRAY_500 }}>{p.subtitle}</Text>
            </View>
            {paras.map((para, j) => (
              <Text key={j} style={styles.smallText}>{para}</Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

// ─── Chapter Divider Page ─────────────────────────────────────────────────────

function ChapterDividerPage({
  chNum, title, subtitle, desc, bgColor,
}: { chNum: string; title: string; subtitle: string; desc: string; bgColor: string }) {
  return (
    <Page size="A4" style={[styles.dividerPage, { backgroundColor: bgColor }]}>
      <View style={styles.dividerInner}>
        <Text style={styles.dividerChNum}>{chNum}</Text>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerTitle}>{title}</Text>
        <Text style={styles.dividerSub}>{subtitle}</Text>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerDesc}>{desc}</Text>
      </View>
    </Page>
  );
}

// ─── Cover Page ───────────────────────────────────────────────────────────────

function CoverPage({ reading }: { reading: SajuReading }) {
  const sijiLabel = reading.birth_hour !== null ? (HOUR_TO_SIJI_LABEL[reading.birth_hour] ?? "") : "";
  const birthStr = `${reading.birth_year}년 ${reading.birth_month}월 ${reading.birth_day}일${sijiLabel ? ` ${sijiLabel}` : ""}`;
  const date = new Date(reading.created_at).toISOString().slice(0, 10);

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBorderTop} />
      <View style={styles.coverBorderBottom} />
      <View style={styles.coverBorderLeft} />
      <View style={styles.coverBorderRight} />
      <View style={styles.coverCornerTL} />
      <View style={styles.coverCornerTR} />
      <View style={styles.coverCornerBL} />
      <View style={styles.coverCornerBR} />

      <View style={styles.coverInner}>
        <Text style={styles.coverLabel}>FOUR PILLARS OF DESTINY</Text>
        <Text style={styles.coverTitle}>종합 사주분석</Text>
        <Text style={styles.coverSubtitle}>COMPREHENSIVE ANALYSIS REPORT</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverName}>{reading.name}</Text>
        <Text style={styles.coverMeta}>{birthStr}</Text>
        <Text style={styles.coverMeta}>
          {reading.gender === "male" ? "남성" : "여성"} · {reading.is_lunar ? "음력" : "양력"}
        </Text>
      </View>
      <Text style={styles.coverDate}>팔자핀사주 · GENERATED {date}</Text>
    </Page>
  );
}

// ─── Table of Contents Page ───────────────────────────────────────────────────

function TableOfContentsPage({ reading }: { reading: SajuReading }) {
  const a = reading.full_analysis;
  const items = [
    { title: "사주팔자 · 만세력",           sub: "FOUR PILLARS & CALENDAR" },
    { title: "오행 분석 · 균형 차트",        sub: "FIVE ELEMENTS" },
    { title: "총론 · 일간 심층",            sub: "OVERVIEW & DAY MASTER" },
    { title: "사주 기둥 상세 해설",          sub: "PILLAR READINGS" },
    { title: "성격 · 기질",                 sub: "PERSONALITY" },
    { title: "오행 심층 · 십신 분석",        sub: "ELEMENTS & TEN GODS" },
    { title: "십신별 상세 분석",             sub: "TEN GODS DETAIL" },
    { title: "연애 · 결혼운",               sub: "LOVE & MARRIAGE" },
    { title: "직업 · 사업운",               sub: "CAREER" },
    { title: "재물운 · 금전운",             sub: "WEALTH" },
    { title: "건강운",                      sub: "HEALTH" },
    { title: "대인관계 · 사회운",            sub: "RELATIONSHIP" },
    { title: "학업 · 적성",                 sub: "STUDY & APTITUDE" },
    { title: "자기관리 · 사회생활",          sub: "SELF MANAGEMENT" },
    { title: "대운 흐름 · 대운 10년 단위",   sub: "MAJOR CYCLES" },
    { title: "2026년 총운",                  sub: "YEARLY FORTUNE" },
    { title: "주의 시기 · 월별 운세 상반기", sub: "MONTHLY FORTUNE" },
    { title: "월별 운세 하반기",             sub: "MONTHLY FORTUNE II" },
    { title: "자미두수 심층",               sub: "ZIWEI DOUSHU" },
    { title: "서양 점성술",                 sub: "WESTERN ASTROLOGY" },
    { title: "행운 요소 · 실천 조언",        sub: "LUCKY & ADVICE" },
    { title: "사주 용어 풀이",              sub: "GLOSSARY" },
    { title: "종합 코멘트 · 맺음말",         sub: "SUMMARY & CLOSING" },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <PageTopBar />
      <View wrap={false} style={{ marginBottom: 16 }}>
        <Text style={[styles.pageChapterLabel, { marginBottom: 6 }]}>TABLE OF CONTENTS</Text>
        <Text style={[styles.pageChapterTitle, { fontSize: 20 }]}>목차</Text>
        <View style={styles.pageChapterBar} />
      </View>
      {items.map((item, i) => (
        <View key={i} style={styles.tocRow} wrap={false}>
          <Text style={styles.tocNum}>{String(i + 1).padStart(2, "0")}</Text>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.tocTitle}>{item.title}</Text>
            <View style={styles.tocDots} />
          </View>
          <Text style={styles.tocPage}>{item.sub.length > 0 ? "—" : ""}</Text>
        </View>
      ))}
      <PageFooter />
    </Page>
  );
}

// ─── Reading Guide Page ───────────────────────────────────────────────────────

function ReadingGuidePage() {
  return (
    <Page size="A4" style={styles.page}>
      <PageTopBar />
      <View wrap={false}>
        <Text style={styles.pageChapterLabel}>HOW TO READ THIS REPORT</Text>
        <Text style={styles.pageChapterTitle}>이 리포트 활용 가이드</Text>
        <View style={styles.pageChapterBar} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={[styles.bodyText, { fontWeight: 700, color: NAVY, marginBottom: 4 }]}>사주명리학이란?</Text>
        <Text style={styles.bodyText}>
          사주명리학(四柱命理學)은 태어난 연(年)·월(月)·일(日)·시(時)의 네 기둥을 분석하여 개인의 성격, 운명의 흐름, 삶의 패턴을 파악하는 동양의 전통 학문입니다. 각 기둥은 천간(天干)과 지지(地支)로 구성되며, 이를 통해 오행(五行)의 상생·상극 관계를 분석합니다.
        </Text>
        <Text style={styles.bodyText}>
          본 리포트는 사주명리학을 기반으로 하되, 자미두수(紫微斗數)와 서양 점성술의 관점을 통합하여 더 풍부한 해석을 제공합니다. 다양한 관점에서 분석된 결과를 참고하여 자신을 더 깊이 이해하는 데 활용하시기 바랍니다.
        </Text>
      </View>

      <ChapterDivider />

      <View style={styles.twoColRow}>
        <View style={styles.twoColLeft}>
          <View style={styles.mintCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 4 }]}>🌱 사주팔자(四柱八字)</Text>
            <Text style={styles.smallText}>
              연주, 월주, 일주, 시주의 네 기둥과 각 기둥의 천간·지지를 합쳐 여덟 글자. 일주(日柱)가 나 자신을 의미합니다.
            </Text>
          </View>
          <View style={styles.blueCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 4 }]}>💧 오행(五行)</Text>
            <Text style={styles.smallText}>
              목(木)·화(火)·토(土)·금(金)·수(水). 우주 만물의 다섯 가지 기운. 상생과 상극 관계로 사주를 해석합니다.
            </Text>
          </View>
        </View>
        <View style={styles.twoColRight}>
          <View style={styles.warmCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 4 }]}>✨ 십신(十神)</Text>
            <Text style={styles.smallText}>
              일간(日干)을 기준으로 다른 천간·지지와의 관계를 열 가지로 분류한 것. 비견, 겁재, 식신 등이 해당.
            </Text>
          </View>
          <View style={styles.purpleCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 4 }]}>🌊 대운(大運)</Text>
            <Text style={styles.smallText}>
              10년 단위로 바뀌는 큰 운의 흐름. 태어난 시기와 성별에 따라 각자 다른 대운 흐름을 갖습니다.
            </Text>
          </View>
        </View>
      </View>

      <ChapterDivider />

      <View style={styles.calloutBox} wrap={false}>
        <Text style={styles.calloutIcon}>안내</Text>
        <Text style={styles.calloutText}>
          이 리포트는 사주명리학적 분석을 제공하는 참고 자료입니다. 미래는 고정된 것이 아니며, 분석 내용을 통해 자신의 강점을 활용하고 약점을 보완하는 데 활용하시기 바랍니다. 모든 분석은 긍정적 성장의 관점에서 해석해 주세요.
        </Text>
      </View>

      <PageFooter />
    </Page>
  );
}

// ─── Methodology Note Page ────────────────────────────────────────────────────

function MethodologyPage() {
  return (
    <Page size="A4" style={styles.page}>
      <PageTopBar />
      <View wrap={false}>
        <Text style={styles.pageChapterLabel}>METHODOLOGY</Text>
        <Text style={styles.pageChapterTitle}>분석 방법론</Text>
        <View style={styles.pageChapterBar} />
      </View>

      <View style={styles.twoColRow}>
        <View style={styles.twoColLeft}>
          <View style={styles.blueCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 5 }]}>사주명리학 분석</Text>
            <Text style={styles.smallText}>
              천간·지지의 음양오행 속성을 기반으로 일간의 강약, 격국(格局), 용신(用神), 십신(十神) 배치를 분석합니다. 전통 만세력(萬歲曆)을 사용하여 정확한 사주팔자를 산출합니다.
            </Text>
          </View>
          <View style={styles.mintCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 5 }]}>자미두수(紫微斗數)</Text>
            <Text style={styles.smallText}>
              생년월일시를 바탕으로 12개 궁(宮)에 별을 배치하여 삶의 각 영역을 해석합니다. 명궁(命宮), 재백궁(財帛宮), 관록궁(官祿宮), 부부궁(夫妻宮), 질액궁(疾厄宮) 등을 중점 분석합니다.
            </Text>
          </View>
        </View>
        <View style={styles.twoColRight}>
          <View style={styles.warmCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 5 }]}>서양 점성술</Text>
            <Text style={styles.smallText}>
              태양 별자리를 중심으로 성격적 특성을 보완 분석합니다. 동양 명리학과의 공통점과 차이점을 통해 보다 입체적인 성격 분석을 제공합니다.
            </Text>
          </View>
          <View style={styles.purpleCard}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 5 }]}>AI 통합 분석</Text>
            <Text style={styles.smallText}>
              세 가지 명리학 시스템을 AI가 통합 분석하여 개인화된 해석을 제공합니다. 각 시스템의 장점을 살려 더욱 풍부하고 정확한 분석을 도출합니다.
            </Text>
          </View>
        </View>
      </View>

      <ChapterDivider />

      <SectionHeader title="분석 정확도 영향 요소" subtitle="ACCURACY FACTORS" accentKey="overview" />
      <View style={styles.sectionDividerLine} />
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>요소</Text>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>설명</Text>
          <Text style={styles.tableHeaderCell}>정확도 영향</Text>
        </View>
        {[
          ["출생 시간", "시주(時柱)를 결정하므로 가장 중요한 요소", "매우 높음"],
          ["출생 날짜", "연·월·일주를 결정하는 기본 요소", "높음"],
          ["음력/양력 구분", "만세력 환산의 정확성", "중간"],
          ["출생지", "지역에 따른 절기 시간 차이", "낮음~중간"],
        ].map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
            <Text style={[styles.tableCell, { fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>{row[1]}</Text>
            <Text style={styles.tableCell}>{row[2]}</Text>
          </View>
        ))}
      </View>

      <PageFooter />
    </Page>
  );
}

// ─── Score Dashboard Page ─────────────────────────────────────────────────────

function ScoreDashboardPage({ reading }: { reading: SajuReading }) {
  const a = reading.full_analysis;
  const el = reading.five_elements;

  // Derive pseudo-scores from element balance
  const total = el ? el.wood + el.fire + el.earth + el.metal + el.water : 8;
  const getScore = (x: number) =>
    Math.max(35, Math.min(98, Math.round(58 + (x / Math.max(total, 1) - 0.4) * 150)));

  const gaugeData = [
    { label: "성격운",     score: el ? getScore(el.wood + el.fire) : 72,   color: "#4CAF50" },
    { label: "연애운",     score: el ? getScore(el.water + el.metal) : 68, color: "#E91E63" },
    { label: "직업운",     score: el ? getScore(el.metal + el.wood) : 75,  color: "#FF9800" },
    { label: "재물운",     score: el ? getScore(el.earth + el.metal) : 70, color: "#FFD700" },
    { label: "건강운",     score: el ? getScore(el.water + el.wood) : 73,  color: "#00BCD4" },
    { label: "대운 흐름",  score: el ? getScore(el.fire + el.earth) : 78,  color: "#9C27B0" },
  ];

  return (
    <>
    <Page size="A4" style={styles.page}>
      <PageTopBar />
      <View wrap={false}>
        <Text style={styles.pageChapterLabel}>FORTUNE DASHBOARD</Text>
        <Text style={styles.pageChapterTitle}>운세 종합 대시보드</Text>
        <View style={styles.pageChapterBar} />
      </View>

      <View style={[styles.twoColRow, { flexWrap: "wrap" }]}>
        {gaugeData.map((g, i) => (
          <View key={i} style={{ width: "33%", alignItems: "center", marginBottom: 10 }}>
            <GaugeArc score={g.score} label={g.label} color={g.color} />
          </View>
        ))}
      </View>

      <ChapterDivider />

      {/* Element strength bars */}
      {el && (
        <View>
          <SectionHeader title="오행 강도 분포표" subtitle="ELEMENT STRENGTH" accentKey="elements" />
          <View style={styles.sectionDividerLine} />
          {([
            { key: "wood",  label: "목(木) — 성장·창의", val: el.wood  },
            { key: "fire",  label: "화(火) — 열정·표현", val: el.fire  },
            { key: "earth", label: "토(土) — 안정·중재", val: el.earth },
            { key: "metal", label: "금(金) — 의지·원칙", val: el.metal },
            { key: "water", label: "수(水) — 지혜·유연", val: el.water },
          ] as const).map((item, i) => {
            const pct = Math.round((item.val / Math.max(total, 1)) * 100);
            const col = ELEMENT_COLORS[item.key].bar;
            return (
              <View key={i} style={styles.scoreRow} wrap={false}>
                <Text style={styles.scoreLabel}>{item.label}</Text>
                <View style={styles.scoreBarBg}>
                  <View style={{ width: `${pct}%`, height: 12, backgroundColor: col, borderRadius: 6 }} />
                </View>
                <Text style={styles.scoreValue}>{item.val}/{total}</Text>
              </View>
            );
          })}
        </View>
      )}

      <PageFooter />
    </Page>

    {/* STANDALONE PAGE: 오행 운세 영역별 해석 — dedicated page to prevent score-dashboard overflow */}
    <Page size="A4" style={styles.page}>
      <PageTopBar />
      <View wrap={false}>
        <Text style={styles.pageChapterLabel}>ELEMENT FORTUNE MAP</Text>
        <Text style={styles.pageChapterTitle}>운세 영역별 오행 해석</Text>
        <View style={styles.pageChapterBar} />
      </View>
      <Text style={[styles.bodyText, { marginBottom: 10 }]}>
        사주의 오행 분포에 따라 각 삶의 영역에서 나타나는 특성을 해석한 지도입니다. 자신의 오행 강약을 참고하여 각 영역에서 어떤 에너지를 보완하거나 강화할지 파악하세요.
      </Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>운세 영역</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>핵심 오행</Text>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>해석 포인트</Text>
        </View>
        {[
          ["성격·기질", "목(木)·화(火)", "목 기운이 강하면 창의성과 추진력이 뛰어나고, 화 기운이 강하면 표현력과 사교성이 높습니다."],
          ["연애·결혼", "수(水)·금(金)", "수 기운은 감수성과 공감 능력을, 금 기운은 헌신과 원칙적인 관계 유지를 상징합니다."],
          ["직업·사업", "금(金)·목(木)", "금 기운은 전문성과 신뢰를, 목 기운은 창업과 혁신의 에너지를 나타냅니다."],
          ["재물·금전", "토(土)·금(金)", "토 기운은 부동산과 안정 자산에, 금 기운은 금융·투자 감각에 연결됩니다."],
          ["건강·활력", "수(水)·목(木)", "수 기운은 신장과 활력을, 목 기운은 간 기능과 유연성을 나타냅니다."],
          ["대운 흐름", "화(火)·토(土)", "화 기운은 상승 에너지를, 토 기운은 정착과 성숙의 흐름을 상징합니다."],
        ].map((row, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
            <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{row[1]}</Text>
            <Text style={[styles.tableCellWide, { flex: 3 }]}>{row[2]}</Text>
          </View>
        ))}
      </View>
      <View style={styles.calloutBox} wrap={false}>
        <Text style={styles.calloutIcon}>핵심</Text>
        <Text style={styles.calloutText}>
          위 점수는 오행의 강도 분포를 기반으로 산출한 참고 지표입니다. 운세는 고정된 것이 아니며, 대운(大運)과 세운(歲運)의 흐름에 따라 매년 변화합니다. 자신의 강한 오행을 최대한 활용하고 약한 오행을 보완하는 것이 행복한 삶의 핵심입니다.
        </Text>
      </View>
      <ChapterDivider />
      <View>
        <Text style={styles.pageChapterLabel}>FIVE ELEMENTS REFERENCE</Text>
        <Text style={styles.pageChapterTitle}>오행 상생·상극 참조표</Text>
        <View style={styles.pageChapterBar} />
        <View style={styles.twoColRow}>
          <View style={[styles.twoColLeft, { marginRight: 8 }]}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 6 }]}>오행 상생(相生) — 도움의 관계</Text>
            {[
              { from: "목(木) → 화(火)", desc: "나무가 타서 불을 만든다. 창의성이 열정을 키운다." },
              { from: "화(火) → 토(土)", desc: "불이 타고 남아 흙이 된다. 표현이 안정을 만든다." },
              { from: "토(土) → 금(金)", desc: "땅에서 금속이 나온다. 안정이 원칙을 낳는다." },
              { from: "금(金) → 수(水)", desc: "금속이 냉각되어 물이 된다. 의지가 지혜를 만든다." },
              { from: "수(水) → 목(木)", desc: "물이 나무를 키운다. 지혜가 성장을 돕는다." },
            ].map((item, i) => (
              <View key={i} style={[styles.mintCard, { marginBottom: 5, padding: 7 }]} wrap={false}>
                <Text style={[styles.smallText, { fontWeight: 700, color: "#2E7D32", marginBottom: 2 }]}>{item.from}</Text>
                <Text style={styles.smallText}>{item.desc}</Text>
              </View>
            ))}
          </View>
          <View style={styles.twoColRight}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 6 }]}>오행 상극(相剋) — 억제의 관계</Text>
            {[
              { from: "목(木) → 토(土)", desc: "나무 뿌리가 흙을 파헤친다. 창의성이 안정을 흔든다." },
              { from: "토(土) → 수(水)", desc: "흙이 물을 막는다. 안정이 유연함을 제한한다." },
              { from: "수(水) → 화(火)", desc: "물이 불을 끈다. 냉정함이 열정을 가라앉힌다." },
              { from: "화(火) → 금(金)", desc: "불이 금속을 녹인다. 열정이 원칙을 무너뜨린다." },
              { from: "금(金) → 목(木)", desc: "도끼가 나무를 자른다. 원칙이 창의성을 억제한다." },
            ].map((item, i) => (
              <View key={i} style={[styles.blueCard, { marginBottom: 5, padding: 7 }]} wrap={false}>
                <Text style={[styles.smallText, { fontWeight: 700, color: "#C62828", marginBottom: 2 }]}>{item.from}</Text>
                <Text style={styles.smallText}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* 오행 조화 실천 팁 — fills remaining whitespace */}
        <ChapterDivider />
        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>FIVE ELEMENTS PRACTICE</Text>
          <Text style={styles.pageChapterTitle}>오행 에너지 조화 실천 팁</Text>
          <View style={styles.pageChapterBar} />
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>오행</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>부족할 때 보완법</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>과할 때 절제법</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>관련 색상·방향</Text>
            </View>
            {[
              ["목(木)", "자연 속 산책, 초록 식물 키우기, 새로운 학습 시작", "과도한 계획 내려놓기, 충분한 휴식으로 에너지 안정", "청록색 / 동쪽"],
              ["화(火)", "밝은 장소 활동, 사람들과 교류, 열정적 취미 시작", "감정 과부하 방지, 명상과 호흡으로 흥분 가라앉히기", "붉은색 / 남쪽"],
              ["토(土)", "규칙적 식사, 안정적 루틴 형성, 신뢰 관계 구축", "과도한 걱정 내려놓기, 변화에 유연하게 반응하기", "황토색 / 중앙"],
              ["금(金)", "원칙 세우기, 정돈된 환경 만들기, 결단력 연습", "지나친 완벽주의 내려놓기, 유연성과 수용력 키우기", "흰색·금색 / 서쪽"],
              ["수(水)", "충분한 수분 섭취, 명상·독서, 직관 신뢰하는 연습", "과도한 내성 줄이기, 활동적 사회 참여로 균형 잡기", "검정·파랑 / 북쪽"],
            ].map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
                <Text style={[styles.tableCellWide, { flex: 2 }]}>{row[1]}</Text>
                <Text style={[styles.tableCellWide, { flex: 2 }]}>{row[2]}</Text>
                <Text style={[styles.tableCellWide, { flex: 2 }]}>{row[3]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <PageFooter />
    </Page>
    </>
  );
}

// ─── Main Document ─────────────────────────────────────────────────────────────

interface SajuPdfProps {
  reading: SajuReading;
}

export function SajuPdf({ reading }: SajuPdfProps) {
  const a = reading.full_analysis;

  return (
    <Document
      title={`종합 사주분석 - ${reading.name}`}
      author="팔자핀사주"
      subject="사주분석 리포트"
      creator="팔자핀사주"
    >
      {/* PAGE 1: Cover */}
      <CoverPage reading={reading} />

      {/* PAGE 2: Table of Contents */}
      <TableOfContentsPage reading={reading} />

      {/* PAGE 3: Reading Guide */}
      <ReadingGuidePage />

      {/* PAGE 4: Methodology */}
      <MethodologyPage />

      {/* PAGE 5: Score Dashboard */}
      <ScoreDashboardPage reading={reading} />

      {/* CHAPTER 1 DIVIDER */}
      <ChapterDividerPage
        chNum="CHAPTER 01"
        title="사주팔자 · 오행"
        subtitle="FOUR PILLARS & FIVE ELEMENTS"
        desc="만세력에 기반한 사주팔자와 오행 분포를 확인합니다."
        bgColor={CHAPTER_COLORS.ch1}
      />

      {/* PAGE: 사주팔자 + 만세력 상세 표 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        <FourPillarsSection reading={reading} />
        {reading.four_pillars && (
          <>
            <ChapterDivider />
            <SectionHeader title="만세력 상세" subtitle="CALENDAR DETAIL" accentKey="overview" />
            <View style={styles.sectionDividerLine} />
            <FourPillarsDetailTable reading={reading} />
          </>
        )}
        <PageFooter />
      </Page>

      {/* PAGE: 오행 분석 + 레이더 */}
      {reading.five_elements && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <FiveElementsSection elements={reading.five_elements} />
          <ChapterDivider />
          <FiveElementsRadarSection elements={reading.five_elements} />
          <PageFooter />
        </Page>
      )}

      {/* CHAPTER 2 DIVIDER */}
      <ChapterDividerPage
        chNum="CHAPTER 02"
        title="총론 · 성격 분석"
        subtitle="OVERVIEW & PERSONALITY"
        desc="일간의 심층 해설과 사주 기둥별 의미, 성격·기질을 분석합니다."
        bgColor={CHAPTER_COLORS.ch2}
      />

      {/* FLOWING PAGE: 총론 + 일간 심층 + 성격·기질 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.overview && (
          <TextSection title="총론" subtitle="OVERVIEW" content={a.overview} accentKey="overview" />
        )}
        {a?.dayMasterDeep && (
          <TextSection title="일간(日干) 심층 해설" subtitle="DAY MASTER ANALYSIS" content={a.dayMasterDeep} accentKey="overview" />
        )}
        {a?.personality && (
          <TextSection
            title="성격 · 기질 분석"
            subtitle="PERSONALITY"
            content={a.personality}
            accentKey="personality"
          />
        )}
        <PageFooter />
      </Page>

      {/* STANDALONE PAGE: 일간별 기질 특성 참조표 — dedicated reference page fills post-personality gap */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>DAY MASTER TRAITS REFERENCE</Text>
          <Text style={styles.pageChapterTitle}>일간(日干)별 기질 특성 참조표</Text>
          <View style={styles.pageChapterBar} />
        </View>
        <Text style={[styles.bodyText, { marginBottom: 10, color: GRAY_500 }]}>
          사주의 일간(日干)은 나 자신을 나타내는 핵심 글자입니다. 열 가지 천간 중 어떤 일간을 갖느냐에 따라 타고난 기질과 인생의 방향성이 달라집니다. 아래 표에서 각 일간의 핵심 특성을 확인하세요.
        </Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.9 }]}>일간</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>오행·음양</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>핵심 기질</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2.3 }]}>강점</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>주의점</Text>
          </View>
          {[
            ["甲(갑)", "목·양", "개척·리더십", "추진력, 독립심, 비전 제시, 도전 정신", "고집, 타협 어려움, 인내심 부족"],
            ["乙(을)", "목·음", "유연·감수성", "섬세함, 예술성, 적응력, 인화력", "우유부단, 의존성, 결정 회피"],
            ["丙(병)", "화·양", "열정·사교성", "밝은 에너지, 표현력, 추진력, 인기", "충동성, 지속성 부족, 산만함"],
            ["丁(정)", "화·음", "직관·깊이", "예리한 통찰, 예술성, 헌신, 집중력", "감정 기복, 고독감, 완벽주의"],
            ["戊(무)", "토·양", "포용·안정", "신뢰감, 중재력, 포용력, 실행력", "고집, 변화 두려움, 답답함"],
            ["己(기)", "토·음", "세심·현실", "꼼꼼함, 현실 감각, 성실성, 배려", "소심함, 기회 놓침, 과한 걱정"],
            ["庚(경)", "금·양", "원칙·강직", "카리스마, 결단력, 정의감, 의지력", "권위주의, 고집, 감정 표현 부족"],
            ["辛(신)", "금·음", "완벽·예리", "분석력, 심미안, 전문성, 정확성", "예민함, 비판적, 스트레스 취약"],
            ["壬(임)", "수·양", "지혜·포용", "유연성, 국제 감각, 이해력, 통찰", "집중력 부족, 즉흥성, 일관성 결여"],
            ["癸(계)", "수·음", "직관·감성", "깊은 감성, 직관력, 내면적 성찰, 배려", "우유부단, 감정 기복, 자기 불신"],
          ].map((row, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
              <Text style={[styles.tableCell, { flex: 0.9, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{row[1]}</Text>
              <Text style={[styles.tableCell, { flex: 1.8, fontWeight: 700, color: GOLD_DARK }]}>{row[2]}</Text>
              <Text style={[styles.tableCellWide, { flex: 2.3 }]}>{row[3]}</Text>
              <Text style={[styles.tableCellWide, { flex: 2 }]}>{row[4]}</Text>
            </View>
          ))}
        </View>
        <ChapterDivider />
        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>SELF-UNDERSTANDING GUIDE</Text>
          <Text style={styles.pageChapterTitle}>일간으로 보는 자기 이해 가이드</Text>
          <View style={styles.pageChapterBar} />
          <View style={styles.twoColRow}>
            <View style={styles.twoColLeft}>
              {[
                { title: "일간 강화하기", desc: "자신의 일간이 나타내는 오행을 일상에서 자연스럽게 활용하면 타고난 강점이 더욱 빛을 발합니다. 강한 오행의 에너지를 긍정적인 방향으로 표현하는 법을 찾으세요." },
                { title: "일간 균형 맞추기", desc: "일간이 너무 강하거나 약하면 삶에서 편향이 생깁니다. 용신(用神)을 통해 부족한 오행을 보충하고 과한 오행을 절제하는 것이 삶의 균형을 만드는 핵심입니다." },
                { title: "일간과 건강", desc: "각 일간의 오행은 특정 신체 기관과 연결됩니다. 목(木)은 간담, 화(火)는 심장, 토(土)는 비위, 금(金)은 폐대장, 수(水)는 신장·방광에 해당합니다. 일간의 오행이 허약하면 그 기관의 건강에 신경을 쓰는 것이 좋습니다." },
                { title: "일간과 재물", desc: "일간의 오행이 재성(財星)과 어떤 관계를 맺느냐에 따라 재물 획득 방식이 달라집니다. 재성을 극하는 일간은 재물을 능동적으로 취하고, 재성에게 극을 받는 일간은 재물이 스스로 찾아오는 경향이 있습니다." },
              ].map((item, i) => (
                <View key={i} style={[styles.mintCard, { marginBottom: 8 }]}>
                  <Text style={[styles.smallText, { fontWeight: 700, color: "#2E7D32", marginBottom: 4 }]}>{item.title}</Text>
                  <Text style={styles.smallText}>{item.desc}</Text>
                </View>
              ))}
            </View>
            <View style={styles.twoColRight}>
              {[
                { title: "일간과 대인관계", desc: "같은 오행 일간끼리는 공감대가 높고 경쟁도 심합니다. 상생 관계의 일간을 가진 사람들과는 자연스럽게 서로 도움을 주고받는 관계가 형성됩니다." },
                { title: "일간과 직업 적성", desc: "일간의 오행 특성이 잘 발휘되는 직업 분야가 있습니다. 자신의 일간을 이해하면 타고난 강점을 직업에서 최대한 활용하는 방향을 찾을 수 있습니다." },
                { title: "일간과 가족관계", desc: "일주(日柱)는 나 자신과 배우자 인연을 담고 있습니다. 월주와의 관계는 부모·형제와의 인연, 시주와의 관계는 자녀 인연을 나타냅니다. 각 기둥의 오행 관계를 통해 가족 간 에너지 흐름을 파악할 수 있습니다." },
                { title: "일간과 창의성", desc: "창의성은 주로 식신(食神)과 상관(傷官)에서 발현되지만, 일간의 오행도 창의 방식에 영향을 미칩니다. 목(木) 일간은 기획력, 화(火) 일간은 표현력, 수(水) 일간은 직관적 영감에 강한 경향을 보입니다." },
              ].map((item, i) => (
                <View key={i} style={[styles.blueCard, { marginBottom: 8 }]}>
                  <Text style={[styles.smallText, { fontWeight: 700, color: "#1565C0", marginBottom: 4 }]}>{item.title}</Text>
                  <Text style={styles.smallText}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* FLOWING PAGE: 사주 기둥 해설 (4개 기둥 모두) + 기둥별 연령대 의미 참조표 */}
      {a?.pillarReadings && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <View wrap={false}>
            <SectionHeader title="사주 기둥 해설" subtitle="PILLAR READINGS" accentKey="overview" />
            <View style={styles.sectionDividerLine} />
          </View>
          {[
            { label: "연주(年柱)", subtitle: "조상궁 · 초년운", content: a.pillarReadings.year, style: styles.mintCard },
            { label: "월주(月柱)", subtitle: "부모궁 · 청년기", content: a.pillarReadings.month, style: styles.blueCard },
            { label: "일주(日柱)", subtitle: "배우자궁 · 성격 핵심", content: a.pillarReadings.day, style: styles.warmCard },
            { label: "시주(時柱)", subtitle: "자녀궁 · 말년운", content: a.pillarReadings.hour, style: styles.purpleCard },
          ].map((p, i) => {
            const paras = splitParagraphs(p.content);
            return (
              <View key={i} style={p.style}>
                <View wrap={false} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: NAVY, marginRight: 8 }}>{p.label}</Text>
                  <Text style={{ fontFamily: F, fontSize: 9, color: GRAY_500 }}>{p.subtitle}</Text>
                </View>
                {paras.map((para, j) => (
                  <Text key={j} style={styles.smallText}>{para}</Text>
                ))}
              </View>
            );
          })}
          {/* 기둥별 영향 시기 참조표 — fills any remaining whitespace */}
          <ChapterDivider />
          <View wrap={false}>
            <Text style={styles.pageChapterLabel}>PILLAR REFERENCE TABLE</Text>
            <Text style={styles.pageChapterTitle}>기둥별 영향 시기와 핵심 궁위</Text>
            <View style={styles.pageChapterBar} />
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>기둥</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>관장 시기</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>담당 궁위</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2.8 }]}>핵심 의미</Text>
              </View>
              {[
                ["연주(年柱)", "유년~청소년기", "조상궁 · 사회궁", "조상의 기운, 가정환경, 사회적 배경, 초년 운세를 나타냄. 연주의 오행이 강할수록 가문의 영향이 크다."],
                ["월주(月柱)", "청년~중년기", "부모궁 · 형제궁", "부모와의 관계, 형제 운, 직업적 방향과 사회 진출 에너지를 담고 있음. 일간에 가장 직접적인 영향."],
                ["일주(日柱)", "평생 · 중심", "배우자궁 · 자신", "나 자신과 배우자 인연을 나타내는 가장 핵심적인 기둥. 일주의 특성이 평생의 성격과 인연을 결정."],
                ["시주(時柱)", "중년~노년기", "자녀궁 · 말년궁", "자녀 인연, 말년의 삶, 노후의 환경, 내면의 욕망과 숨겨진 재능을 나타냄. 말년 안정의 열쇠."],
              ].map((row, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{row[1]}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{row[2]}</Text>
                  <Text style={[styles.tableCellWide, { flex: 2.8 }]}>{row[3]}</Text>
                </View>
              ))}
            </View>
            <View style={styles.calloutBox}>
              <Text style={styles.calloutIcon}>핵심</Text>
              <Text style={styles.calloutText}>
                사주의 네 기둥은 각각 인생의 다른 시기와 영역을 담당합니다. 연주는 뿌리, 월주는 성장, 일주는 꽃, 시주는 열매에 해당합니다. 네 기둥이 조화롭게 균형을 이루면 인생 전체에 걸쳐 안정적인 흐름을 유지할 수 있습니다.
              </Text>
            </View>
          </View>
          <PageFooter />
        </Page>
      )}

      {/* CHAPTER 3 DIVIDER */}
      <ChapterDividerPage
        chNum="CHAPTER 03"
        title="오행 · 십신"
        subtitle="FIVE ELEMENTS & TEN GODS"
        desc="오행의 심층 의미와 십신 배치를 통해 삶의 패턴을 분석합니다."
        bgColor={CHAPTER_COLORS.ch3}
      />

      {/* FLOWING PAGE: 오행 심층 + 십신 분석 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.elementsDeep && (
          <TextSection
            title="오행 심층 해설"
            subtitle="ELEMENTS DEEP"
            content={a.elementsDeep}
            accentKey="elements"
          />
        )}
        {a?.tenGods && (
          <TextSection
            title="십신 분석"
            subtitle="TEN GODS · 十神"
            content={a.tenGods}
            accentKey="tenGods"
          />
        )}
        <PageFooter />
      </Page>

      {/* PAGE(s): 십신별 상세 — standalone (table-heavy) */}
      {a?.tenGodsDetail && a.tenGodsDetail.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TenGodsDetailSection items={a.tenGodsDetail.slice(0, 5)} />
          {/* 십신 활용 가이드 — fills whitespace when first 5 items are short */}
          <ChapterDivider />
          <View wrap={false}>
            <Text style={styles.pageChapterLabel}>TEN GODS USAGE GUIDE</Text>
            <Text style={styles.pageChapterTitle}>십신 활용 가이드</Text>
            <View style={styles.pageChapterBar} />
            <View style={styles.twoColRow}>
              <View style={styles.twoColLeft}>
                {[
                  { god: "비견·겁재", tip: "자신감과 독립심으로 자신만의 길을 개척하세요. 지나친 고집은 협력을 방해하니 유연성을 유지하세요." },
                  { god: "식신·상관", tip: "타고난 표현력과 창의성을 직업과 연결하세요. 예술·교육·언론·콘텐츠 분야에서 두각을 나타냅니다." },
                  { god: "편재·정재", tip: "재물 에너지를 이해하고 저축과 투자의 균형을 맞추세요. 편재는 도전, 정재는 안정을 상징합니다." },
                  { god: "적극적 행동", tip: "십신의 에너지는 알고 있는 것만으로는 부족합니다. 자신의 강한 십신을 일상에서 의식적으로 발현시키는 연습이 필요합니다." },
                ].map((item, i) => (
                  <View key={i} style={[styles.mintCard, { marginBottom: 6, padding: 9 }]}>
                    <Text style={[styles.smallText, { fontWeight: 700, color: "#2E7D32", marginBottom: 3 }]}>{item.god}</Text>
                    <Text style={styles.smallText}>{item.tip}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.twoColRight}>
                {[
                  { god: "편관·정관", tip: "리더십과 사회적 책임감을 발휘하세요. 조직에서 신뢰를 쌓고 원칙을 지키는 것이 출세의 열쇠입니다." },
                  { god: "편인·정인", tip: "학습 능력과 직관력을 계발하세요. 꾸준한 공부와 멘토와의 관계가 삶의 수준을 높여 줍니다." },
                  { god: "십신 균형", tip: "어떤 십신도 지나치게 강하거나 약하면 문제가 생깁니다. 약한 십신을 보완하는 활동을 의식적으로 실천하세요." },
                  { god: "약한 십신 보완", tip: "사주에 없거나 약한 십신은 그 에너지가 부족한 영역입니다. 해당 십신의 특성을 의식적으로 연습하고 강화하면 삶의 균형이 높아집니다." },
                ].map((item, i) => (
                  <View key={i} style={[styles.blueCard, { marginBottom: 6, padding: 9 }]}>
                    <Text style={[styles.smallText, { fontWeight: 700, color: "#1565C0", marginBottom: 3 }]}>{item.god}</Text>
                    <Text style={styles.smallText}>{item.tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <PageFooter />
        </Page>
      )}
      {a?.tenGodsDetail && a.tenGodsDetail.length > 5 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <TenGodsDetailSection items={a.tenGodsDetail.slice(5)} />
          {/* 십신 조합 효과 참조표 — fills whitespace when remaining items are short */}
          <ChapterDivider />
          <View wrap={false}>
            <Text style={styles.pageChapterLabel}>TEN GODS COMBINATION EFFECTS</Text>
            <Text style={styles.pageChapterTitle}>십신 조합의 시너지 효과</Text>
            <View style={styles.pageChapterBar} />
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>조합</Text>
                <Text style={[styles.tableHeaderCell, { flex: 4 }]}>의미와 삶에 미치는 영향</Text>
              </View>
              {[
                ["식신 + 편재", "뛰어난 표현력과 사교성으로 비즈니스와 투자에서 성과를 냅니다. 아이디어를 돈으로 바꾸는 능력이 탁월합니다."],
                ["정관 + 정인", "안정적 직업과 학문적 성취가 결합됩니다. 공직, 교육, 법조 분야에서 명예로운 경력을 쌓기에 유리합니다."],
                ["편관 + 식신", "카리스마와 창의성의 결합. 예술, 엔터테인먼트, 스포츠 분야에서 강한 개성으로 두각을 나타냅니다."],
                ["비견 + 편재", "독립심과 투자 감각의 조합. 사업가 기질이 강하며 자신만의 방식으로 재물을 축적합니다."],
                ["정재 + 정관", "성실과 원칙의 결합. 안정적인 직장과 꾸준한 저축으로 착실하게 자산을 쌓아 나갑니다."],
                ["편인 + 상관", "직관적 영감과 자유로운 표현력의 결합. 예술, 글쓰기, 연구 분야에서 독창적 성과를 냅니다."],
                ["비견 + 정관", "독립심과 규범 준수의 결합. 전문직이나 공직에서 자신의 원칙을 지키며 신뢰를 쌓아 나갑니다."],
                ["겁재 + 편관", "경쟁 기질과 도전 정신의 결합. 스포츠, 군·경·소방, 경쟁이 치열한 사업 환경에서 두각을 나타냅니다."],
              ].map((row, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { flex: 1.8, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
                  <Text style={[styles.tableCellWide, { flex: 4 }]}>{row[1]}</Text>
                </View>
              ))}
            </View>
          </View>
          <PageFooter />
        </Page>
      )}

      {/* CHAPTER 4 DIVIDER */}
      <ChapterDividerPage
        chNum="CHAPTER 04"
        title="인생 운세"
        subtitle="LIFE FORTUNE ANALYSIS"
        desc="연애·직업·재물·건강·대인관계 등 삶의 주요 영역별 운세를 분석합니다."
        bgColor={CHAPTER_COLORS.ch4}
      />

      {/* FLOWING PAGE: 연애 + 직업 + 재물 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.love && (
          <TextSection
            title="연애 · 결혼운"
            subtitle="LOVE & MARRIAGE"
            content={a.love}
            accentKey="love"
          />
        )}
        {a?.career && (
          <TextSection
            title="직업 · 사업운"
            subtitle="CAREER"
            content={a.career}
            accentKey="career"
          />
        )}
        {a?.wealth && (
          <TextSection
            title="재물운"
            subtitle="WEALTH FORTUNE"
            content={a.wealth}
            accentKey="wealth"
          />
        )}
        <PageFooter />
      </Page>

      {/* FLOWING PAGE: 건강 + 대인관계 + 학업·적성 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.health && (
          <TextSection
            title="건강운"
            subtitle="HEALTH"
            content={a.health}
            accentKey="health"
          />
        )}
        {a?.relationship && (
          <TextSection
            title="대인관계 · 사회운"
            subtitle="RELATIONSHIP"
            content={a.relationship}
            accentKey="relationship"
          />
        )}
        {a?.studyAptitude && (
          <TextSection
            title="학업 · 적성"
            subtitle="STUDY & APTITUDE"
            content={a.studyAptitude}
            accentKey="career"
          />
        )}
        <PageFooter />
      </Page>

      {/* FLOWING PAGE: 자기관리 + 사회생활 + 에너지 관리 주간 플래너 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.selfManagement && (
          <TextSection
            title="자기관리 · 생활습관"
            subtitle="SELF MANAGEMENT"
            content={a.selfManagement}
            accentKey="health"
          />
        )}
        {a?.socialLife && (
          <TextSection
            title="사회생활 심화"
            subtitle="SOCIAL LIFE"
            content={a.socialLife}
            accentKey="relationship"
          />
        )}
        {/* 에너지 관리 주간 플래너 — fills whitespace */}
        <ChapterDivider />
        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>WEEKLY ENERGY PLANNER</Text>
          <Text style={styles.pageChapterTitle}>오행 에너지 주간 실천 플래너</Text>
          <View style={styles.pageChapterBar} />
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>요일</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>오행</Text>
              <Text style={[styles.tableHeaderCell, { flex: 4 }]}>추천 활동 · 에너지 포인트</Text>
            </View>
            {[
              ["월요일", "목(木)", "새로운 시작과 계획. 아이디어를 기록하고 창의적 업무를 우선 배치. 자연에서 산책하면 목 에너지를 보충할 수 있습니다."],
              ["화요일", "화(火)", "적극적 행동과 소통. 중요 미팅, 발표, 협상에 적합한 날. 표현력이 높아지므로 인간관계에 집중하세요."],
              ["수요일", "토(土)", "안정과 정리. 서류 정리, 재무 점검, 루틴 작업에 집중. 식사 시간을 규칙적으로 지키는 것이 중요합니다."],
              ["목요일", "금(金)", "집중과 완성. 마감 업무, 품질 체크, 분석 작업에 최적. 원칙을 지키고 세부 사항에 집중하는 날."],
              ["금요일", "수(水)", "유연성과 네트워킹. 인간관계를 넓히고 새로운 정보를 흡수. 창의적 여가와 자기 계발에 투자하세요."],
              ["토요일", "목·화(木火)", "운동과 활동. 활발한 신체 활동으로 에너지를 발산. 취미 활동, 야외 활동, 사교 모임에 적합합니다."],
              ["일요일", "토·수(土水)", "휴식과 충전. 충분한 수면과 명상으로 한 주를 마무리. 다음 주 계획을 세우고 내면의 에너지를 충전하세요."],
            ].map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.tableCell, { flex: 1, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
                <Text style={[styles.tableCell, { flex: 1.2, color: GOLD_DARK, fontWeight: 700 }]}>{row[1]}</Text>
                <Text style={[styles.tableCellWide, { flex: 4 }]}>{row[2]}</Text>
              </View>
            ))}
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* FLOWING PAGE: 십신 참조표 + 인생 설계 로드맵 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>TEN GODS REFERENCE TABLE</Text>
          <Text style={styles.pageChapterTitle}>십신(十神) 참조표</Text>
          <View style={styles.pageChapterBar} />
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>십신</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>의미</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>긍정적 특성</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>주의할 점</Text>
          </View>
          {[
            ["비견(比肩)", "동등한 형제", "독립심, 자존감, 경쟁력", "고집, 협력 어려움"],
            ["겁재(劫財)", "강한 형제", "추진력, 결단력, 용기", "충동적, 재물 손실"],
            ["식신(食神)", "먹을 복", "표현력, 창의성, 여유", "게으름, 의존성"],
            ["상관(傷官)", "관을 상함", "재능, 언변, 예술성", "반항심, 불안정"],
            ["편재(偏財)", "치우친 재물", "투자 감각, 사교성", "도박성, 산만함"],
            ["정재(正財)", "바른 재물", "성실함, 저축력, 안정", "보수성, 융통성 부족"],
            ["편관(偏官)", "치우친 관", "카리스마, 도전정신", "권위주의, 스트레스"],
            ["정관(正官)", "바른 관", "규범 준수, 신뢰감", "경직성, 변화 두려움"],
            ["편인(偏印)", "치우친 인성", "직관력, 학습능력", "고독, 비현실적"],
            ["정인(正印)", "바른 인성", "지혜, 포용력, 학업운", "의존성, 판단 느림"],
          ].map((row, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
              <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{row[1]}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{row[2]}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{row[3]}</Text>
            </View>
          ))}
        </View>

        <ChapterDivider />

        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>LIFE DESIGN ROADMAP</Text>
          <Text style={styles.pageChapterTitle}>인생 설계 로드맵</Text>
          <View style={styles.pageChapterBar} />
        </View>
        {[
          { decade: "20대", title: "씨앗을 뿌리는 시기", color: styles.mintCard, desc: "자신의 강점을 발견하고 다양한 경험을 통해 방향성을 찾는 시기입니다. 실패를 두려워하지 말고 적극적으로 도전하세요. 이 시기의 경험이 평생의 자산이 됩니다." },
          { decade: "30대", title: "뿌리를 내리는 시기", color: styles.blueCard, desc: "직업적 전문성을 키우고 안정적인 기반을 마련하는 시기입니다. 인간관계를 넓히고 장기적인 목표를 설정하세요. 재정 계획을 시작하기에 가장 좋은 시기입니다." },
          { decade: "40대", title: "결실을 맺는 시기", color: styles.warmCard, desc: "경험과 지혜가 쌓여 사회적 역할이 확대되는 시기입니다. 건강 관리에 주의를 기울이고, 후배를 양성하는 데 에너지를 투자하세요." },
          { decade: "50대", title: "수확하는 시기", color: styles.purpleCard, desc: "지금까지 쌓아온 것들이 꽃을 피우는 시기입니다. 은퇴 준비와 함께 새로운 취미와 관심사를 개발하세요. 가족과 소중한 시간을 보내는 것이 중요합니다." },
          { decade: "60대 이후", title: "지혜를 나누는 시기", color: styles.mintCard, desc: "평생의 경험과 지혜를 나누는 시기입니다. 건강과 정신적 풍요를 균형 있게 유지하면서, 하고 싶었던 것들을 하나씩 이루어가세요." },
        ].map((item, i) => (
          <View key={i} style={item.color} wrap={false}>
            <Text style={[styles.smallText, { fontWeight: 700, color: NAVY, marginBottom: 4 }]}>{item.decade} — {item.title}</Text>
            <Text style={styles.smallText}>{item.desc}</Text>
          </View>
        ))}
        <View style={styles.calloutBox} wrap={false}>
          <Text style={styles.calloutIcon}>핵심</Text>
          <Text style={styles.calloutText}>각 인생 단계에서 사주의 대운 흐름을 참고하면 더욱 지혜로운 선택을 할 수 있습니다.</Text>
        </View>
        {/* Life design principles table — fills remaining space on the continuation page */}
        <View wrap={false} style={{ marginTop: 16 }}>
          <Text style={[styles.pageChapterLabel, { marginBottom: 6 }]}>LIFE DESIGN PRINCIPLES</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>원칙</Text>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>실천 방법</Text>
            </View>
            {[
              ["자기 인식", "매년 생일에 지난 한 해를 돌아보고 새로운 목표를 설정하세요."],
              ["지속 학습", "직업 분야뿐 아니라 인문학·예술 등 다양한 영역에서 성장을 추구하세요."],
              ["관계 투자", "가족, 친구, 동료와의 관계를 꾸준히 가꾸고 심화시키세요."],
              ["건강 관리", "운동·수면·식단을 삶의 우선순위로 두고 일관되게 실천하세요."],
              ["재정 설계", "소득의 일부를 꾸준히 저축하고 장기 목표를 위해 투자하세요."],
              ["정신 안정", "명상·취미·자연과의 접촉으로 내면의 균형을 유지하세요."],
            ].map((row, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>{row[1]}</Text>
              </View>
            ))}
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* CHAPTER 5 DIVIDER */}
      <ChapterDividerPage
        chNum="CHAPTER 05"
        title="대운 · 시간의 흐름"
        subtitle="MAJOR CYCLES & TIME"
        desc="10년 대운의 흐름과 연간·월별 운세를 상세히 분석합니다."
        bgColor={CHAPTER_COLORS.ch5}
      />

      {/* FLOWING PAGE: 대운 흐름 + 연간운 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.majorCycles && (
          <TextSection
            title="대운 흐름"
            subtitle="MAJOR FORTUNE CYCLES · 大運"
            content={a.majorCycles}
            accentKey="majorCycles"
          />
        )}
        {a?.yearlyFortune && (
          <TextSection
            title="2026년 총운"
            subtitle="YEARLY FORTUNE"
            content={a.yearlyFortune}
            accentKey="yearlyFortune"
          />
        )}
        <PageFooter />
      </Page>

      {/* PAGE(s): 대운 10년 단위 상세 — standalone (chart+detail) */}
      {a?.decadeCycles && a.decadeCycles.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <DecadeCyclesDetail cycles={a.decadeCycles.slice(0, 4)} />
          <PageFooter />
        </Page>
      )}
      {a?.decadeCycles && a.decadeCycles.length > 4 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <View wrap={false}>
            <Text style={styles.pageChapterLabel}>DECADE CYCLES (CONTINUED)</Text>
            <Text style={styles.pageChapterTitle}>대운 10년 단위 (계속)</Text>
            <View style={styles.pageChapterBar} />
          </View>
          {a.decadeCycles.slice(4).map((c, i) => (
            <View key={i} style={styles.decadeItem} wrap={false}>
              <View style={styles.decadeBadge}>
                <Text style={styles.decadeStem}>{c.stem}</Text>
                <Text style={styles.decadeBranch}>{c.branch}</Text>
                <Text style={styles.decadeAge}>{c.ageRange}</Text>
              </View>
              <View style={styles.decadeContent}>
                <Text style={styles.decadeText}>{c.summary}</Text>
              </View>
            </View>
          ))}
          <PageFooter />
        </Page>
      )}

      {/* PAGE: 주의 시기 + 월별 막대 차트 */}
      {(a?.cautionPeriods || (a?.monthlyFortune && a.monthlyFortune.length > 0)) && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          {a?.cautionPeriods && (
            <TextSection
              title="주의 시기 종합"
              subtitle="CAUTION PERIODS"
              content={a.cautionPeriods}
              accentKey="actionAdvice"
            />
          )}
          {a?.cautionPeriods && a?.monthlyFortune && a.monthlyFortune.length > 0 && <ChapterDivider />}
          {a?.monthlyFortune && a.monthlyFortune.length > 0 && (
            <View>
              <SectionHeader title="월별 운세 개요" subtitle="MONTHLY OVERVIEW" accentKey="yearlyFortune" />
              <View style={styles.sectionDividerLine} />
              <MonthlyBarChart months={a.monthlyFortune} />
            </View>
          )}
          <PageFooter />
        </Page>
      )}

      {/* PAGE: 월별 운세 상반기 */}
      {a?.monthlyFortune && a.monthlyFortune.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <SectionHeader title="월별 운세" subtitle="MONTHLY FORTUNE" accentKey="yearlyFortune" />
          <View style={styles.sectionDividerLine} />
          <MonthlyFortuneSection
            months={a.monthlyFortune.slice(0, 6)}
            sectionLabel="상반기 (1월 ~ 6월)"
          />
          <PageFooter />
        </Page>
      )}

      {/* PAGE: 월별 운세 하반기 */}
      {a?.monthlyFortune && a.monthlyFortune.length > 6 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <MonthlyFortuneSection
            months={a.monthlyFortune.slice(6)}
            sectionLabel="하반기 (7월 ~ 12월)"
          />
          <PageFooter />
        </Page>
      )}

      {/* CHAPTER 6 DIVIDER */}
      <ChapterDividerPage
        chNum="CHAPTER 06"
        title="자미두수 · 점성술"
        subtitle="ZIWEI DOUSHU & ASTROLOGY"
        desc="자미두수와 서양 점성술의 관점에서 운명을 더욱 깊이 분석합니다."
        bgColor={CHAPTER_COLORS.ch1}
      />

      {/* FLOWING PAGE: 자미두수 + 서양 점성술 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.ziweiAnalysis && (
          <TextSection
            title="자미두수 심층 해설"
            subtitle="ZIWEI DOUSHU · 紫微斗數"
            content={a.ziweiAnalysis}
            accentKey="ziwei"
          />
        )}
        {a?.astrologyAnalysis && (
          <TextSection
            title="서양 점성술 관점"
            subtitle="WESTERN ASTROLOGY"
            content={a.astrologyAnalysis}
            accentKey="astrology"
          />
        )}
        <PageFooter />
      </Page>

      {/* CHAPTER 7 DIVIDER */}
      <ChapterDividerPage
        chNum="CHAPTER 07"
        title="행운 · 실천 조언"
        subtitle="LUCKY ELEMENTS & ADVICE"
        desc="행운의 요소와 올해의 실천 조언을 안내합니다."
        bgColor={CHAPTER_COLORS.ch2}
      />

      {/* FLOWING PAGE: 행운요소 + 실천 조언 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        {a?.luckyElements && (
          <>
            <LuckyElementsSection
              color={a.luckyElements.color}
              direction={a.luckyElements.direction}
              number={a.luckyElements.number}
            />
            <ChapterDivider />
            <View style={styles.sectionCard}>
              <Text style={[styles.bodyText, { fontWeight: 700, color: NAVY, marginBottom: 4 }]}>행운 요소 활용법</Text>
              <Text style={styles.bodyText}>
                행운의 색상은 옷, 소품, 인테리어 등에 활용하여 해당 오행의 기운을 보충할 수 있습니다. 특히 중요한 약속이나 시험, 면접 날에 행운의 색상을 착용하면 긍정적인 에너지를 더할 수 있습니다.
              </Text>
              <Text style={styles.bodyText}>
                행운의 방향은 잠자리 머리 방향, 책상 방향, 현관문 방향 등을 설정할 때 참고하시기 바랍니다. 행운의 숫자는 새로운 계획을 시작하는 날짜나 중요한 결정을 내릴 때 참고할 수 있습니다.
              </Text>
            </View>
          </>
        )}
        {a?.actionAdvice && (
          <TextSection
            title="올해의 실천 조언"
            subtitle="ACTION ADVICE"
            content={a.actionAdvice}
            accentKey="actionAdvice"
          />
        )}
        <PageFooter />
      </Page>

      {/* PAGE: 용어 풀이 + 십간·십이지지 참조표 */}
      {a?.glossary && a.glossary.length > 0 && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <GlossaryTable items={a.glossary} />
          {/* 천간 의미 참조표 — fills whitespace when glossary entries overflow to a continuation page */}
          <ChapterDivider />
          <View wrap={false}>
            <Text style={styles.pageChapterLabel}>HEAVENLY STEMS REFERENCE</Text>
            <Text style={styles.pageChapterTitle}>천간(天干) 음양 오행 참조표</Text>
            <View style={styles.pageChapterBar} />
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>천간</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}>음양</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>오행</Text>
                <Text style={[styles.tableHeaderCell, { flex: 3.4 }]}>핵심 성질과 상징</Text>
              </View>
              {[
                ["갑(甲)", "양(陽)", "목(木)", "큰 나무. 위로 뻗는 성장 에너지. 리더십, 개척 정신, 독립심이 강함. 봄의 시작."],
                ["을(乙)", "음(陰)", "목(木)", "작은 풀·꽃. 유연하게 적응하는 에너지. 섬세함, 예술성, 친화력이 뛰어남."],
                ["병(丙)", "양(陽)", "화(火)", "태양. 밝고 따뜻한 에너지. 사교성, 열정, 표현력이 강함. 주목받는 스타일."],
                ["정(丁)", "음(陰)", "화(火)", "촛불. 내면 깊은 곳에서 타오르는 에너지. 직관력, 예리한 통찰, 섬세한 감수성."],
                ["무(戊)", "양(陽)", "토(土)", "큰 산·대지. 중심을 지키는 안정 에너지. 포용력, 신뢰감, 중재 능력."],
                ["기(己)", "음(陰)", "토(土)", "논밭·정원. 기르고 키우는 에너지. 꼼꼼함, 현실적 감각, 세심한 배려."],
                ["경(庚)", "양(陽)", "금(金)", "큰 금속·도끼. 강직하고 원칙적인 에너지. 결단력, 카리스마, 의지력."],
                ["신(辛)", "음(陰)", "금(金)", "보석·바늘. 예리하고 섬세한 에너지. 완벽주의, 심미감, 분석 능력."],
                ["임(壬)", "양(陽)", "수(水)", "큰 강·바다. 넓고 포용적인 에너지. 지혜, 유연성, 국제적 감각."],
                ["계(癸)", "음(陰)", "수(水)", "이슬·샘물. 맑고 순수한 에너지. 직관력, 깊은 감성, 내면적 성찰."],
              ].map((row, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tableCell, { flex: 0.8, fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
                  <Text style={[styles.tableCell, { flex: 0.8 }]}>{row[1]}</Text>
                  <Text style={[styles.tableCell, { flex: 1, fontWeight: 700, color: GOLD_DARK }]}>{row[2]}</Text>
                  <Text style={[styles.tableCellWide, { flex: 3.4 }]}>{row[3]}</Text>
                </View>
              ))}
            </View>
          </View>
          <PageFooter />
        </Page>
      )}

      {/* FLOWING PAGE: 건강 관리 가이드 + 금전 관리 조언 */}
      <Page size="A4" style={styles.page}>
        <PageTopBar />
        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>HEALTH MANAGEMENT GUIDE</Text>
          <Text style={styles.pageChapterTitle}>오행별 건강 관리 가이드</Text>
          <View style={styles.pageChapterBar} />
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>오행</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>관련 장기</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>주의할 건강 문제</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>건강 유지법</Text>
          </View>
          {[
            ["목(木)", "간·담낭", "간 기능 저하, 눈 피로, 근육 경련", "규칙적 운동, 녹색 채소 섭취, 충분한 수면"],
            ["화(火)", "심장·소장", "심장 질환, 불면증, 고혈압", "스트레스 관리, 명상, 저염 식단"],
            ["토(土)", "비·위장", "소화 불량, 위장 장애, 당뇨", "규칙적 식사, 따뜻한 음식, 과식 금지"],
            ["금(金)", "폐·대장", "호흡기 질환, 피부 트러블, 변비", "유산소 운동, 수분 섭취, 신선한 공기"],
            ["수(水)", "신장·방광", "신장 기능 저하, 허리 통증, 냉증", "충분한 수분, 따뜻한 보온, 과로 금지"],
          ].map((row, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} wrap={false}>
              <Text style={[styles.tableCell, { fontWeight: 700, color: NAVY }]}>{row[0]}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{row[1]}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{row[2]}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{row[3]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.calloutBox} wrap={false}>
          <Text style={styles.calloutIcon}>안내</Text>
          <Text style={styles.calloutText}>
            사주의 오행 구성에 따라 특히 주의해야 할 오행과 관련된 신체 부위가 있습니다. 위 표를 참고하여 약한 오행에 해당하는 건강 관리에 더욱 신경 쓰시기 바랍니다.
          </Text>
        </View>

        <View style={styles.sectionDividerLine} />

        <View wrap={false}>
          <Text style={styles.pageChapterLabel}>WEALTH MANAGEMENT GUIDE</Text>
          <Text style={styles.pageChapterTitle}>오행별 금전 관리 지침</Text>
          <View style={styles.pageChapterBar} />
        </View>
        <View style={styles.twoColRow}>
          <View style={styles.twoColLeft}>
            {[
              { elem: "목(木) 강한 사람", color: "#2E7D32", bg: "#E8F5E9", advice: "창의적 사업에 강점. 스타트업, 창작 활동, IT 분야가 유리. 단기 투자보다 장기 성장주 투자 적합. 충동적 지출 주의." },
              { elem: "화(火) 강한 사람", color: "#C62828", bg: "#FFEBEE", advice: "열정이 재물을 부른다. 영업, 마케팅, 서비스업에서 큰 수익 가능. 감정적 판단으로 인한 손실 주의. 냉정한 재무 계획 필요." },
              { elem: "토(土) 강한 사람", color: "#F57F17", bg: "#FFF8E1", advice: "부동산, 안정 자산에 강점. 장기 저축과 분산 투자 적합. 너무 보수적인 태도가 기회를 놓치게 할 수 있으니 주기적 투자 점검." },
            ].map((item, i) => (
              <View key={i} style={{ backgroundColor: item.bg, borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: item.color + "44" }}>
                <Text style={[styles.smallText, { fontWeight: 700, color: item.color, marginBottom: 4 }]}>{item.elem}</Text>
                <Text style={styles.smallText}>{item.advice}</Text>
              </View>
            ))}
          </View>
          <View style={styles.twoColRight}>
            {[
              { elem: "금(金) 강한 사람", color: "#6A1B9A", bg: "#F3E5F5", advice: "금융, 법률, 의료 분야에서 안정적 수익. 원칙 있는 재무 관리로 꾸준한 자산 축적. 지나친 결벽증이 투자 기회를 놓칠 수 있으므로 유연성 발휘." },
              { elem: "수(水) 강한 사람", color: "#1565C0", bg: "#E3F2FD", advice: "유통, 무역, 금융에서 탁월한 감각. 정보를 잘 활용하는 투자 스타일. 변동성 큰 자산 투자 주의. 안정적 현금 흐름 유지가 중요." },
              { elem: "균형 잡힌 오행", color: NAVY, bg: CREAM_DARK, advice: "다양한 분야에서 균형 있는 재물운. 분산 투자 전략이 적합. 특정 분야에 치중하지 않고 포트폴리오를 다양하게 구성하는 것이 최선." },
            ].map((item, i) => (
              <View key={i} style={{ backgroundColor: item.bg, borderRadius: 8, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: item.color + "44" }}>
                <Text style={[styles.smallText, { fontWeight: 700, color: item.color, marginBottom: 4 }]}>{item.elem}</Text>
                <Text style={styles.smallText}>{item.advice}</Text>
              </View>
            ))}
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* PAGE: 종합 코멘트 */}
      {a?.summary && (
        <Page size="A4" style={styles.page}>
          <PageTopBar />
          <SummarySection content={a.summary} />
          {a?.closingMessage && (() => {
            // Limit to 2 paragraphs so the closing stays on the same page as the summary
            const closingParas = splitParagraphs(a.closingMessage).slice(0, 2);
            return (
              <>
                <ChapterDivider />
                <View>
                  <View wrap={false}>
                    <SectionHeader title="맺음말" subtitle="CLOSING" accentKey="closing" />
                    <View style={styles.sectionDividerLine} />
                  </View>
                  {closingParas.map((p, i) => (
                    <View key={i} wrap={false} style={styles.summaryBox}>
                      <Text style={styles.summaryText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </>
            );
          })()}
          <PageFooter />
        </Page>
      )}

      {/* CLOSING PAGE */}
      <Page size="A4" style={styles.closingPage}>
        <View style={styles.coverBorderTop} />
        <View style={styles.coverBorderBottom} />
        <View style={styles.coverBorderLeft} />
        <View style={styles.coverBorderRight} />
        <View style={styles.coverCornerTL} />
        <View style={styles.coverCornerTR} />
        <View style={styles.coverCornerBL} />
        <View style={styles.coverCornerBR} />
        <View style={styles.closingInner}>
          <View style={styles.coverDivider} />
          <Text style={styles.closingTitle}>감사합니다</Text>
          <Text style={styles.closingText}>
            {reading.name}님의 사주를 분석해 드릴 수 있어 영광이었습니다.{"\n\n"}
            이 리포트가 삶의 방향을 찾고{"\n"}
            자신을 더 깊이 이해하는 데{"\n"}
            도움이 되기를 바랍니다.{"\n\n"}
            당신의 앞날에 항상 좋은 기운이 가득하기를 바랍니다.
          </Text>
          <View style={styles.coverDivider} />
          <Text style={styles.closingBrand}>팔자핀사주</Text>
          <Text style={[styles.closingBrand, { fontSize: 8, marginTop: 6 }]}>
            {new Date(reading.created_at).toISOString().slice(0, 10)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
