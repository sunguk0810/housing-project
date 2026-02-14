import { useState, useEffect, useRef } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";

/* ═══════════════════════════════════════════
   DESIGN TOKENS (from step3_design_system_basic.md)
   ═══════════════════════════════════════════ */
const T = {
    brand50: "#CFFAFE", brand100: "#A5F3FC", brand200: "#67E8F9",
    brand400: "#06B6D4", brand500: "#0891B2", brand600: "#0E7490",
    brand700: "#155E75", brand800: "#164E63", brand900: "#0C4A6E",
    coral: "#F97316", coralLight: "rgba(249,115,22,0.10)", coralDark: "#C2410C",
    surface: "#FAFAF9", surfaceElevated: "#FFFFFF", surfaceDark: "#F5F5F4",
    warmDark: "#1C1917", warmGray: "#78716C", warmGrayLight: "#A8A29E",
    border: "#E7E5E4", borderLight: "#F5F5F4",
    scoreExcellent: "#1565C0", scoreGood: "#42A5F5",
    scoreAverage: "#90A4AE", scoreBelow: "#FF8A65", scorePoor: "#D84315",
};

const SCORE_COLORS = [
    { min: 80, color: T.scoreExcellent, label: "매우 좋음", badge: "A+" },
    { min: 60, color: T.scoreGood, label: "좋음", badge: "A" },
    { min: 40, color: T.scoreAverage, label: "보통", badge: "B" },
    { min: 20, color: T.scoreBelow, label: "미흡", badge: "C" },
    { min: 0, color: T.scorePoor, label: "부족", badge: "D" },
];
const getScoreInfo = (s) => SCORE_COLORS.find(c => s >= c.min) || SCORE_COLORS[4];

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */
const PROPERTIES = [
    {
        id: 1, name: "래미안 블레스티지", address: "서울 서초구 반포동 20-1",
        units: 1612, built: 2009, area: "84㎡",
        priceRange: { buy: "22억~26억", jeonse: "12억~14억", monthly: "1억/180만" },
        totalScore: 87, budgetScore: 72, commuteScore: 91, childcareScore: 85, safetyScore: 88,
        commute1: 28, commute2: 42, percentile: 8,
        lat: 37.5085, lng: 127.0005,
        commuteFactors: [
            { label: "지하철 도보 3분", icon: "🚇", delta: +18 },
            { label: "배우자 직장 환승 1회", icon: "🔄", delta: +14 },
            { label: "출근 시간대 혼잡", icon: "⏰", delta: -8 },
        ],
        safetyData: [
            { label: "CCTV", value: 34, avg: 15, pct: 92 },
            { label: "가로등", value: null, avg: null, pct: 85 },
            { label: "경찰서", value: "320m", avg: "800m", pct: 90 },
            { label: "비상벨", value: 12, avg: 5, pct: 78 },
        ],
    },
    {
        id: 2, name: "헬리오시티", address: "서울 송파구 가락동 98",
        units: 9510, built: 2018, area: "84㎡",
        priceRange: { buy: "18억~21억", jeonse: "9억~11억", monthly: "8000만/150만" },
        totalScore: 82, budgetScore: 81, commuteScore: 78, childcareScore: 90, safetyScore: 84,
        commute1: 35, commute2: 38, percentile: 12,
        lat: 37.4960, lng: 127.0700,
        commuteFactors: [
            { label: "지하철 도보 5분", icon: "🚇", delta: +15 },
            { label: "직통 노선 운행", icon: "🚌", delta: +10 },
            { label: "환승 2회 필요", icon: "🔄", delta: -12 },
        ],
        safetyData: [
            { label: "CCTV", value: 28, avg: 15, pct: 82 },
            { label: "가로등", value: null, avg: null, pct: 78 },
            { label: "경찰서", value: "450m", avg: "800m", pct: 85 },
            { label: "비상벨", value: 9, avg: 5, pct: 72 },
        ],
    },
    {
        id: 3, name: "마포 래미안 푸르지오", address: "서울 마포구 아현동 777",
        units: 3885, built: 2014, area: "59㎡",
        priceRange: { buy: "14억~16억", jeonse: "7억~9억", monthly: "5000만/130만" },
        totalScore: 79, budgetScore: 88, commuteScore: 85, childcareScore: 68, safetyScore: 75,
        commute1: 22, commute2: 48, percentile: 18,
        lat: 37.5510, lng: 126.9560,
        commuteFactors: [
            { label: "지하철 도보 2분", icon: "🚇", delta: +20 },
            { label: "급행 노선 이용 가능", icon: "🚄", delta: +12 },
            { label: "배우자 통근 50분", icon: "⏰", delta: -15 },
        ],
        safetyData: [
            { label: "CCTV", value: 18, avg: 15, pct: 65 },
            { label: "가로등", value: null, avg: null, pct: 60 },
            { label: "경찰서", value: "650m", avg: "800m", pct: 70 },
            { label: "비상벨", value: 6, avg: 5, pct: 55 },
        ],
    },
    {
        id: 4, name: "e편한세상 금빛그랑메종", address: "서울 금천구 시흥동 911",
        units: 1540, built: 2020, area: "74㎡",
        priceRange: { buy: "9억~11억", jeonse: "5억~6억", monthly: "3000만/90만" },
        totalScore: 74, budgetScore: 95, commuteScore: 62, childcareScore: 72, safetyScore: 70,
        commute1: 45, commute2: 55, percentile: 24,
        lat: 37.4560, lng: 126.9020,
        commuteFactors: [
            { label: "지하철 도보 8분", icon: "🚇", delta: +8 },
            { label: "버스 환승 1회", icon: "🚌", delta: +6 },
            { label: "통근 45분 이상", icon: "⏰", delta: -18 },
        ],
        safetyData: [
            { label: "CCTV", value: 20, avg: 15, pct: 70 },
            { label: "가로등", value: null, avg: null, pct: 62 },
            { label: "경찰서", value: "750m", avg: "800m", pct: 60 },
            { label: "비상벨", value: 5, avg: 5, pct: 50 },
        ],
    },
    {
        id: 5, name: "잠실 엘스", address: "서울 송파구 잠실동 40",
        units: 5678, built: 2008, area: "84㎡",
        priceRange: { buy: "24억~28억", jeonse: "11억~13억", monthly: "1억/200만" },
        totalScore: 85, budgetScore: 65, commuteScore: 88, childcareScore: 82, safetyScore: 92,
        commute1: 30, commute2: 35, percentile: 10,
        lat: 37.5110, lng: 127.0830,
        commuteFactors: [
            { label: "지하철 도보 4분", icon: "🚇", delta: +17 },
            { label: "2호선 직통", icon: "🔄", delta: +16 },
            { label: "출근 혼잡 구간", icon: "⏰", delta: -6 },
        ],
        safetyData: [
            { label: "CCTV", value: 42, avg: 15, pct: 95 },
            { label: "가로등", value: null, avg: null, pct: 90 },
            { label: "경찰서", value: "280m", avg: "800m", pct: 93 },
            { label: "비상벨", value: 15, avg: 5, pct: 88 },
        ],
    },
];

const SORT_OPTIONS = [
    { key: "totalScore", label: "종합 점수순" },
    { key: "budgetScore", label: "예산 적합도순" },
    { key: "commute1", label: "통근 시간순", asc: true },
];

const CATEGORIES = [
    { key: "budgetScore", label: "예산 적합도", icon: "💰", desc: "보유현금+대출 대비 가격" },
    { key: "commuteScore", label: "통근 편의", icon: "🚇", desc: "두 직장 가중 평균 통근시간" },
    { key: "childcareScore", label: "보육 인프라", icon: "💒", desc: "반경 1km 어린이집·유치원·초등" },
    { key: "safetyScore", label: "안전 편의시설", icon: "🛡️", desc: "CCTV·가로등·경찰서 현황" },
];

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */

// Animated counter
function AnimatedNumber({ value, duration = 800 }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(ease * value));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [value, duration]);
    return <>{display}</>;
}

// Score badge
function ScoreBadge({ score, size = "md" }) {
    const info = getScoreInfo(score);
    const sizes = {
        sm: { w: 28, h: 18, fs: 10 },
        md: { w: 36, h: 22, fs: 11 },
        lg: { w: 44, h: 26, fs: 13 },
    };
    const s = sizes[size];
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: s.w, height: s.h, borderRadius: 6,
            background: `${info.color}18`, color: info.color,
            fontSize: s.fs, fontWeight: 700, letterSpacing: -0.3,
        }}>
      {info.badge}
    </span>
    );
}

// Horizontal score bar
function ScoreBar({ score, label, icon, compact = false, showFactors = false, factors = [] }) {
    const info = getScoreInfo(score);
    const [expanded, setExpanded] = useState(false);
    return (
        <div style={{ marginBottom: compact ? 8 : 14 }}>
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 6,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {icon && <span style={{ fontSize: compact ? 12 : 14 }}>{icon}</span>}
                    <span style={{
                        fontSize: compact ? 12 : 13, fontWeight: 500,
                        color: T.warmDark, letterSpacing: -0.3,
                    }}>{label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: info.color, fontVariantNumeric: "tabular-nums" }}>
            {score}
          </span>
                    <ScoreBadge score={score} size="sm" />
                    {showFactors && factors.length > 0 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            style={{
                                width: 20, height: 20, borderRadius: "50%",
                                border: `1px solid ${T.border}`, background: "transparent",
                                cursor: "pointer", fontSize: 10, color: T.warmGray,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            aria-label="점수 산출 방법 보기"
                        >
                            ⓘ
                        </button>
                    )}
                </div>
            </div>
            <div style={{
                height: compact ? 6 : 8, borderRadius: 99,
                background: T.borderLight, overflow: "hidden",
            }}>
                <div style={{
                    height: "100%", borderRadius: 99,
                    background: `linear-gradient(90deg, ${info.color}CC, ${info.color})`,
                    width: `${score}%`,
                    transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                }} />
            </div>
            {expanded && factors.length > 0 && (
                <div style={{
                    marginTop: 8, padding: "10px 12px", borderRadius: 8,
                    background: T.surfaceDark, border: `1px solid ${T.border}`,
                }}>
                    {factors.map((f, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "3px 0", fontSize: 12, color: T.warmGray,
                        }}>
                            <span>{f.icon} {f.label}</span>
                            <span style={{
                                fontWeight: 600, fontVariantNumeric: "tabular-nums",
                                color: f.delta > 0 ? T.scoreGood : T.scoreBelow,
                            }}>
                {f.delta > 0 ? "+" : ""}{f.delta}
              </span>
                        </div>
                    ))}
                    <button style={{
                        marginTop: 6, fontSize: 11, color: T.brand500,
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}>
                        전체 방법론 보기 →
                    </button>
                </div>
            )}
        </div>
    );
}

// Circular gauge for total score
function CircularGauge({ score, size = 88 }) {
    const info = getScoreInfo(score);
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none"
                        stroke={T.borderLight} strokeWidth={6} />
                <circle cx={size/2} cy={size/2} r={r} fill="none"
                        stroke={info.color} strokeWidth={6}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }} />
            </svg>
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
        <span style={{
            fontSize: size * 0.3, fontWeight: 800, color: info.color,
            lineHeight: 1, fontVariantNumeric: "tabular-nums",
        }}>
          <AnimatedNumber value={score} />
        </span>
                <span style={{ fontSize: size * 0.11, color: T.warmGray, marginTop: 2 }}>/100</span>
            </div>
        </div>
    );
}

// Data source tags (compliance requirement)
function DataSourceTags({ compact = false }) {
    const tags = compact
        ? ["📊 공공데이터 기반", "참고용 정보"]
        : ["📊 공공데이터 기반 분석 결과", "기준일 2026.02.01", "참고용 정보"];
    return (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tags.map((t, i) => (
                <span key={i} style={{
                    padding: "3px 8px", borderRadius: 4, fontSize: 10,
                    background: T.surfaceDark, color: T.warmGray,
                    border: `1px solid ${T.borderLight}`,
                }}>{t}</span>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════
   SECTION NAVIGATION
   ═══════════════════════════════════════════ */
const VIEWS = [
    { id: "list", label: "리스트 뷰", icon: "☰" },
    { id: "map", label: "지도 뷰", icon: "🗺" },
    { id: "score", label: "점수 시각화", icon: "📊" },
    { id: "detail", label: "단지 상세", icon: "🏠" },
    { id: "compare", label: "비교 기능", icon: "⚖️" },
];

/* ═══════════════════════════════════════════
   1. LIST VIEW
   ═══════════════════════════════════════════ */
function PropertyCard({ property, rank, onSelect, onCompare, isCompared }) {
    const p = property;
    const info = getScoreInfo(p.totalScore);
    return (
        <div
            onClick={() => onSelect(p)}
            style={{
                background: T.surfaceElevated, borderRadius: 16,
                border: `1px solid ${T.border}`, padding: 0, cursor: "pointer",
                transition: "all 0.2s", boxShadow: "0 1px 3px rgba(28,25,23,0.06)",
                overflow: "hidden",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(28,25,23,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(28,25,23,0.06)"; e.currentTarget.style.transform = "none"; }}
        >
            {/* Top: Rank + Score */}
            <div style={{
                padding: "16px 16px 12px", display: "flex", alignItems: "flex-start",
                justifyContent: "space-between",
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
                width: 24, height: 24, borderRadius: 8,
                background: rank <= 3 ? T.coralLight : T.surfaceDark,
                color: rank <= 3 ? T.coral : T.warmGray,
                fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>{rank}</span>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: T.warmDark, margin: 0, letterSpacing: -0.5 }}>
                            {p.name}
                        </h3>
                    </div>
                    <p style={{ fontSize: 12, color: T.warmGray, margin: "0 0 4px", letterSpacing: -0.2 }}>
                        {p.address}
                    </p>
                    <div style={{ display: "flex", gap: 8, fontSize: 11, color: T.warmGrayLight }}>
                        <span>{p.units.toLocaleString()}세대</span>
                        <span>·</span>
                        <span>{p.built}년</span>
                        <span>·</span>
                        <span>{p.area}</span>
                    </div>
                </div>
                <CircularGauge score={p.totalScore} size={64} />
            </div>

            {/* Price */}
            <div style={{
                padding: "0 16px 12px",
                display: "flex", gap: 12, fontSize: 13,
            }}>
                <div>
                    <span style={{ color: T.warmGrayLight, fontSize: 11 }}>매매 </span>
                    <span style={{ fontWeight: 700, color: T.warmDark, fontVariantNumeric: "tabular-nums" }}>{p.priceRange.buy}</span>
                </div>
                <div>
                    <span style={{ color: T.warmGrayLight, fontSize: 11 }}>전세 </span>
                    <span style={{ fontWeight: 600, color: T.warmDark, fontVariantNumeric: "tabular-nums" }}>{p.priceRange.jeonse}</span>
                </div>
            </div>

            {/* Category scores - compact bars */}
            <div style={{ padding: "0 16px 12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                    {CATEGORIES.map(c => {
                        const sc = p[c.key];
                        const si = getScoreInfo(sc);
                        return (
                            <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 11 }}>{c.icon}</span>
                                <span style={{ fontSize: 11, color: T.warmGray, flex: 1 }}>{c.label}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: si.color, fontVariantNumeric: "tabular-nums", width: 24, textAlign: "right" }}>{sc}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Commute times */}
            <div style={{
                padding: "10px 16px", borderTop: `1px solid ${T.borderLight}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
          <span style={{ color: T.warmGray }}>
            🏢 직장1 <strong style={{ color: T.warmDark }}>{p.commute1}분</strong>
          </span>
                    <span style={{ color: T.warmGray }}>
            🏢 직장2 <strong style={{ color: T.warmDark }}>{p.commute2}분</strong>
          </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onCompare(p.id); }}
                    style={{
                        padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        border: isCompared ? `1.5px solid ${T.coral}` : `1px solid ${T.border}`,
                        background: isCompared ? T.coralLight : "transparent",
                        color: isCompared ? T.coral : T.warmGray,
                        cursor: "pointer", transition: "all 0.2s",
                    }}
                >
                    {isCompared ? "✓ 비교중" : "+ 비교"}
                </button>
            </div>
        </div>
    );
}

function ListView({ properties, onSelect, compareIds, onCompare, sortKey, onSortChange }) {
    return (
        <div>
            {/* Sort + Result count */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 16,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.warmDark }}>
            분석 결과
          </span>
                    <span style={{
                        fontSize: 12, fontWeight: 600, color: T.coral,
                        background: T.coralLight, padding: "2px 8px", borderRadius: 99,
                    }}>
            {properties.length}개 단지
          </span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => onSortChange(opt.key)}
                            style={{
                                padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 500,
                                border: sortKey === opt.key ? `1.5px solid ${T.brand500}` : `1px solid ${T.border}`,
                                background: sortKey === opt.key ? `${T.brand500}10` : "transparent",
                                color: sortKey === opt.key ? T.brand500 : T.warmGray,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                        >{opt.label}</button>
                    ))}
                </div>
            </div>

            <DataSourceTags compact />

            {/* Cards */}
            <div style={{
                display: "grid", gap: 12, marginTop: 12,
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            }}>
                {properties.map((p, i) => (
                    <PropertyCard
                        key={p.id} property={p} rank={i + 1}
                        onSelect={onSelect}
                        onCompare={onCompare}
                        isCompared={compareIds.includes(p.id)}
                    />
                ))}
            </div>

            {/* Load more */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
                <button style={{
                    padding: "12px 32px", borderRadius: 12,
                    border: `1px solid ${T.border}`, background: T.surfaceElevated,
                    color: T.warmDark, fontSize: 14, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                }}>
                    더 보기
                </button>
                <p style={{ fontSize: 11, color: T.warmGrayLight, marginTop: 8 }}>
                    조건에 맞는 총 23개 단지 중 5개 표시 중
                </p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   2. MAP VIEW
   ═══════════════════════════════════════════ */
function MapView({ properties, onSelect, compareIds, onCompare }) {
    const [selectedPin, setSelectedPin] = useState(null);
    const [hoveredPin, setHoveredPin] = useState(null);
    const mapW = 800, mapH = 500;

    // Simple lat/lng to pixel mapping for demo
    const lats = properties.map(p => p.lat);
    const lngs = properties.map(p => p.lng);
    const latRange = [Math.min(...lats) - 0.02, Math.max(...lats) + 0.02];
    const lngRange = [Math.min(...lngs) - 0.02, Math.max(...lngs) + 0.02];
    const toXY = (lat, lng) => ({
        x: ((lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * (mapW - 80) + 40,
        y: ((latRange[1] - lat) / (latRange[1] - latRange[0])) * (mapH - 80) + 40,
    });

    const selected = selectedPin ? properties.find(p => p.id === selectedPin) : null;

    return (
        <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <DataSourceTags compact />
            </div>

            <div style={{
                position: "relative", borderRadius: 16, overflow: "hidden",
                border: `1px solid ${T.border}`, background: "#EAE6DA",
                height: mapH,
            }}>
                {/* Fake map background */}
                <div style={{
                    position: "absolute", inset: 0, opacity: 0.15,
                    backgroundImage: `
            linear-gradient(${T.brand200} 1px, transparent 1px),
            linear-gradient(90deg, ${T.brand200} 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }} />

                {/* Workplace markers */}
                {[
                    { label: "직장 1", x: mapW * 0.5, y: mapH * 0.2 },
                    { label: "직장 2", x: mapW * 0.75, y: mapH * 0.7 },
                ].map((w, i) => (
                    <div key={i} style={{
                        position: "absolute", left: w.x, top: w.y, transform: "translate(-50%, -50%)",
                        display: "flex", flexDirection: "column", alignItems: "center", zIndex: 5,
                    }}>
                        <div style={{
                            padding: "4px 10px", borderRadius: 8,
                            background: "#1C1917", color: "#FFF",
                            fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}>
                            🏢 {w.label}
                        </div>
                        <div style={{
                            width: 0, height: 0,
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: "6px solid #1C1917",
                        }} />
                    </div>
                ))}

                {/* Property markers */}
                {properties.map((p) => {
                    const { x, y } = toXY(p.lat, p.lng);
                    const info = getScoreInfo(p.totalScore);
                    const isActive = selectedPin === p.id || hoveredPin === p.id;
                    return (
                        <div
                            key={p.id}
                            style={{
                                position: "absolute", left: x, top: y, transform: "translate(-50%, -100%)",
                                zIndex: isActive ? 20 : 10, cursor: "pointer",
                                transition: "transform 0.15s",
                                ...(isActive ? { transform: "translate(-50%, -100%) scale(1.15)" } : {}),
                            }}
                            onClick={() => setSelectedPin(p.id === selectedPin ? null : p.id)}
                            onMouseEnter={() => setHoveredPin(p.id)}
                            onMouseLeave={() => setHoveredPin(null)}
                        >
                            <div style={{
                                padding: "5px 10px", borderRadius: 8,
                                background: isActive ? info.color : T.surfaceElevated,
                                color: isActive ? "#FFF" : T.warmDark,
                                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                                boxShadow: isActive
                                    ? `0 4px 16px ${info.color}40`
                                    : "0 2px 8px rgba(0,0,0,0.12)",
                                border: `2px solid ${isActive ? info.color : T.surfaceElevated}`,
                                display: "flex", alignItems: "center", gap: 4,
                                fontVariantNumeric: "tabular-nums",
                            }}>
                <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: isActive ? "#FFF" : info.color,
                }} />
                                {p.totalScore}점
                            </div>
                            <div style={{
                                width: 0, height: 0, margin: "0 auto",
                                borderLeft: "7px solid transparent",
                                borderRight: "7px solid transparent",
                                borderTop: `7px solid ${isActive ? info.color : T.surfaceElevated}`,
                            }} />
                        </div>
                    );
                })}

                {/* Mini preview card */}
                {selected && (() => {
                    const { x, y } = toXY(selected.lat, selected.lng);
                    const cardW = 280;
                    const cardX = Math.min(Math.max(x - cardW / 2, 10), mapW - cardW - 10);
                    return (
                        <div style={{
                            position: "absolute", left: cardX, top: y + 14,
                            width: cardW, borderRadius: 12, overflow: "hidden",
                            background: T.surfaceElevated, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                            border: `1px solid ${T.border}`, zIndex: 30,
                            animation: "fadeInUp 0.2s ease",
                        }}>
                            <div style={{ padding: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: T.warmDark, margin: "0 0 4px" }}>
                                            {selected.name}
                                        </h4>
                                        <p style={{ fontSize: 11, color: T.warmGray, margin: 0 }}>{selected.address}</p>
                                    </div>
                                    <CircularGauge score={selected.totalScore} size={48} />
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 12 }}>
                                    <span style={{ color: T.warmGray }}>매매 <strong style={{ color: T.warmDark }}>{selected.priceRange.buy}</strong></span>
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 11, color: T.warmGray }}>
                                    <span>🏢 직장1 {selected.commute1}분</span>
                                    <span>🏢 직장2 {selected.commute2}분</span>
                                </div>
                                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                                    <button
                                        onClick={() => onSelect(selected)}
                                        style={{
                                            flex: 1, padding: "8px 0", borderRadius: 8,
                                            background: T.brand500, color: "#FFF",
                                            fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                        }}
                                    >상세 보기</button>
                                    <button
                                        onClick={() => onCompare(selected.id)}
                                        style={{
                                            padding: "8px 14px", borderRadius: 8,
                                            border: `1px solid ${T.border}`, background: T.surfaceElevated,
                                            fontSize: 12, fontWeight: 500, color: T.warmGray, cursor: "pointer",
                                        }}
                                    >{compareIds.includes(selected.id) ? "✓ 비교중" : "+ 비교"}</button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Score legend */}
                <div style={{
                    position: "absolute", bottom: 12, left: 12,
                    padding: "8px 12px", borderRadius: 10,
                    background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    display: "flex", gap: 8, fontSize: 10,
                }}>
                    {SCORE_COLORS.slice(0, 3).map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                            <span style={{ color: T.warmGray }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile toggle hint */}
            <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 10,
                background: T.surfaceDark, border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", gap: 8,
            }}>
                <span style={{ fontSize: 14 }}>📱</span>
                <div style={{ fontSize: 12, color: T.warmGray, lineHeight: 1.5 }}>
                    <strong style={{ color: T.warmDark }}>모바일 UX:</strong> 지도 위 3단 바텀시트(Peek→Half→Expanded)로 리스트 전환.
                    바텀시트 넌모달 유지하여 지도 인터랙션 항상 가능.
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   3. SCORE VISUALIZATION COMPARISON
   ═══════════════════════════════════════════ */
function ScoreVisualization({ properties }) {
    const [selectedProp, setSelectedProp] = useState(properties[0]);
    const [vizType, setVizType] = useState("bar");

    const radarData = CATEGORIES.map(c => ({
        axis: c.label, value: selectedProp[c.key],
    }));

    const barData = CATEGORIES.map(c => ({
        name: c.label, score: selectedProp[c.key], icon: c.icon,
    }));

    const vizOptions = [
        { key: "bar", label: "수평 바 차트", rec: true },
        { key: "radar", label: "레이더 차트" },
        { key: "gauge", label: "게이지+바 조합", rec: true },
        { key: "badge", label: "숫자+배지(미니멀)" },
    ];

    return (
        <div>
            {/* Analysis header */}
            <div style={{
                padding: 16, borderRadius: 12, marginBottom: 16,
                background: `linear-gradient(135deg, ${T.brand500}08, ${T.coral}06)`,
                border: `1px solid ${T.border}`,
            }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.warmDark, margin: "0 0 8px" }}>
                    📊 점수 시각화 방식 비교 평가
                </h3>
                <p style={{ fontSize: 12, color: T.warmGray, margin: 0, lineHeight: 1.7 }}>
                    모바일 가독성, 비교 가능성, 구현 복잡도, 색맹 접근성을 종합 평가한 결과,
                    <strong style={{ color: T.brand700 }}> 원형 게이지(종합) + 수평 바(카테고리)</strong> 조합을 권장합니다.
                </p>
            </div>

            {/* Property selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
                {properties.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedProp(p)}
                        style={{
                            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
                            border: selectedProp.id === p.id ? `1.5px solid ${T.brand500}` : `1px solid ${T.border}`,
                            background: selectedProp.id === p.id ? `${T.brand500}10` : T.surfaceElevated,
                            color: selectedProp.id === p.id ? T.brand500 : T.warmGray,
                            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                        }}
                    >{p.name}</button>
                ))}
            </div>

            {/* Viz type toggle */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                {vizOptions.map(v => (
                    <button
                        key={v.key}
                        onClick={() => setVizType(v.key)}
                        style={{
                            padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                            border: vizType === v.key ? `1.5px solid ${T.coral}` : `1px solid ${T.border}`,
                            background: vizType === v.key ? T.coralLight : "transparent",
                            color: vizType === v.key ? T.coral : T.warmGray,
                            cursor: "pointer", position: "relative",
                        }}
                    >
                        {v.label}
                        {v.rec && (
                            <span style={{
                                position: "absolute", top: -4, right: -4,
                                width: 8, height: 8, borderRadius: "50%",
                                background: T.coral,
                            }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Visualizations */}
            <div style={{
                padding: 20, borderRadius: 16, background: T.surfaceElevated,
                border: `1px solid ${T.border}`, boxShadow: "0 1px 3px rgba(28,25,23,0.06)",
            }}>
                {/* Type: Horizontal Bar (recommended) */}
                {vizType === "bar" && (
                    <div>
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <CircularGauge score={selectedProp.totalScore} size={96} />
                            <p style={{ fontSize: 12, color: T.warmGray, marginTop: 8 }}>
                                종합 점수 · 수도권 상위 {selectedProp.percentile}%
                            </p>
                        </div>
                        {CATEGORIES.map(c => (
                            <ScoreBar
                                key={c.key}
                                score={selectedProp[c.key]}
                                label={c.label}
                                icon={c.icon}
                                showFactors={c.key === "commuteScore"}
                                factors={c.key === "commuteScore" ? selectedProp.commuteFactors : []}
                            />
                        ))}
                        <div style={{
                            marginTop: 12, padding: 10, borderRadius: 8,
                            background: "#E8F5E9", border: "1px solid #C8E6C9",
                            fontSize: 11, color: "#2E7D32",
                        }}>
                            ✅ <strong>권장</strong> — 375px 모바일에서 가독성 최고, 색맹 안전(블루-오렌지), 구현 간단(Tailwind만으로 가능)
                        </div>
                    </div>
                )}

                {/* Type: Radar Chart */}
                {vizType === "radar" && (
                    <div>
                        <div style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke={T.border} />
                                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: T.warmGray }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: T.warmGrayLight }} />
                                    <Radar dataKey="value" stroke={T.brand500} fill={T.brand500} fillOpacity={0.2} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{
                            marginTop: 12, padding: 10, borderRadius: 8,
                            background: "#FFF3E0", border: "1px solid #FFE0B2",
                            fontSize: 11, color: "#E65100",
                        }}>
                            ⚠️ <strong>제한 권장</strong> — 단일 단지에는 비효율. 2~3개 단지 비교 전용으로만 사용.
                            최소 200×200px 필요하여 모바일 카드 내 삽입 어려움.
                        </div>
                    </div>
                )}

                {/* Type: Gauge + Bar Combo (recommended) */}
                {vizType === "gauge" && (
                    <div>
                        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
                            <CircularGauge score={selectedProp.totalScore} size={96} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 700, color: T.warmDark, margin: "0 0 4px" }}>
                                    {selectedProp.name}
                                </p>
                                <p style={{ fontSize: 12, color: T.warmGray, margin: "0 0 8px" }}>
                                    수도권 상위 {selectedProp.percentile}% · {getScoreInfo(selectedProp.totalScore).label}
                                </p>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {CATEGORIES.map(c => {
                                        const sc = selectedProp[c.key];
                                        const si = getScoreInfo(sc);
                                        return (
                                            <div key={c.key} style={{
                                                padding: "4px 8px", borderRadius: 6,
                                                background: `${si.color}12`, fontSize: 10,
                                            }}>
                                                <span>{c.icon}</span>
                                                <span style={{ fontWeight: 700, color: si.color, marginLeft: 3 }}>{sc}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {CATEGORIES.map(c => (
                            <ScoreBar
                                key={c.key} compact
                                score={selectedProp[c.key]}
                                label={c.label}
                                icon={c.icon}
                            />
                        ))}
                        <div style={{
                            marginTop: 12, padding: 10, borderRadius: 8,
                            background: "#E8F5E9", border: "1px solid #C8E6C9",
                            fontSize: 11, color: "#2E7D32",
                        }}>
                            ✅ <strong>최적 조합</strong> — 종합 점수 한눈에 파악(게이지) + 카테고리별 비교(수평 바).
                            토스 신용점수 UI 패턴 검증됨.
                        </div>
                    </div>
                )}

                {/* Type: Minimal Badge */}
                {vizType === "badge" && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{
                  fontSize: 36, fontWeight: 800, color: getScoreInfo(selectedProp.totalScore).color,
                  fontVariantNumeric: "tabular-nums",
              }}>
                {selectedProp.totalScore}
              </span>
                            <div>
                                <ScoreBadge score={selectedProp.totalScore} size="lg" />
                                <p style={{ fontSize: 11, color: T.warmGray, margin: "4px 0 0" }}>
                                    수도권 상위 {selectedProp.percentile}%
                                </p>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {CATEGORIES.map(c => {
                                const sc = selectedProp[c.key];
                                const si = getScoreInfo(sc);
                                return (
                                    <div key={c.key} style={{
                                        padding: 12, borderRadius: 10,
                                        background: T.surfaceDark, border: `1px solid ${T.borderLight}`,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 13 }}>{c.icon}</span>
                                            <ScoreBadge score={sc} size="md" />
                                        </div>
                                        <p style={{ fontSize: 11, color: T.warmGray, margin: "0 0 2px" }}>{c.label}</p>
                                        <p style={{ fontSize: 20, fontWeight: 800, color: si.color, margin: 0, fontVariantNumeric: "tabular-nums" }}>{sc}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{
                            marginTop: 12, padding: 10, borderRadius: 8,
                            background: "#E3F2FD", border: "1px solid #BBDEFB",
                            fontSize: 11, color: "#1565C0",
                        }}>
                            ℹ️ <strong>대안</strong> — 구현 가장 간단(차트 라이브러리 불필요).
                            단, 4개 카테고리 한눈에 비교하기에는 수평 바가 더 효과적.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   4. DETAIL PAGE
   ═══════════════════════════════════════════ */
function DetailPage({ property, onBack }) {
    const p = property;
    const [showExternalModal, setShowExternalModal] = useState(false);
    const info = getScoreInfo(p.totalScore);

    return (
        <div>
            {/* Back button */}
            <button
                onClick={onBack}
                style={{
                    display: "flex", alignItems: "center", gap: 6, marginBottom: 16,
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: T.brand500, fontWeight: 500, padding: 0,
                }}
            >← 목록으로</button>

            {/* Hero */}
            <div style={{
                borderRadius: 16, overflow: "hidden",
                background: `linear-gradient(135deg, ${T.brand900}, ${T.brand700})`,
                padding: "28px 20px", marginBottom: 16, color: "#FFF",
            }}>
                <DataSourceTags compact />
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "12px 0 4px", letterSpacing: -0.5 }}>
                    {p.name}
                </h2>
                <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 16px" }}>{p.address}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <CircularGauge score={p.totalScore} size={80} />
                    <div>
                        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 4px" }}>종합 점수</p>
                        <p style={{ fontSize: 28, fontWeight: 800, margin: "0 0 2px", fontVariantNumeric: "tabular-nums" }}>
                            {p.totalScore}<span style={{ fontSize: 14, opacity: 0.5 }}>/100</span>
                        </p>
                        <span style={{
                            padding: "3px 10px", borderRadius: 99,
                            background: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600,
                        }}>수도권 상위 {p.percentile}% · {info.label}</span>
                    </div>
                </div>
            </div>

            {/* Section: Scores */}
            <Section title="카테고리별 점수" icon="📊">
                {CATEGORIES.map(c => (
                    <ScoreBar
                        key={c.key}
                        score={p[c.key]}
                        label={c.label}
                        icon={c.icon}
                        showFactors
                        factors={c.key === "commuteScore" ? p.commuteFactors : []}
                    />
                ))}
            </Section>

            {/* Section: Price */}
            <Section title="실거래가 정보" icon="💰">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                        { label: "매매", value: p.priceRange.buy },
                        { label: "전세", value: p.priceRange.jeonse },
                        { label: "월세", value: p.priceRange.monthly },
                    ].map((item, i) => (
                        <div key={i} style={{
                            padding: 12, borderRadius: 10,
                            background: T.surfaceDark, border: `1px solid ${T.borderLight}`,
                            textAlign: "center",
                        }}>
                            <p style={{ fontSize: 11, color: T.warmGrayLight, margin: "0 0 4px" }}>{item.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: T.warmDark, margin: 0, fontVariantNumeric: "tabular-nums" }}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: 10, color: T.warmGrayLight, margin: "8px 0 0" }}>
                    📊 국토교통부 실거래가 · 2026.02 기준 · 실거래 반영까지 최대 30일 소요
                </p>
                <div style={{
                    marginTop: 8, padding: 10, borderRadius: 8,
                    background: "rgba(99,102,241,0.04)", border: `1px solid rgba(99,102,241,0.08)`,
                    fontSize: 11, color: T.warmGray,
                }}>
                    ℹ️ 참고용 시뮬레이션이며 실제 대출 승인 금액과 다를 수 있습니다. 정확한 한도는 금융기관에서 확인해주세요.
                </div>
            </Section>

            {/* Section: Commute */}
            <Section title="통근 분석" icon="🚇">
                <div style={{ display: "flex", gap: 12 }}>
                    {[
                        { label: "직장 1", time: p.commute1 },
                        { label: "직장 2", time: p.commute2 },
                    ].map((w, i) => (
                        <div key={i} style={{
                            flex: 1, padding: 14, borderRadius: 10,
                            background: T.surfaceDark, border: `1px solid ${T.borderLight}`,
                            textAlign: "center",
                        }}>
                            <p style={{ fontSize: 11, color: T.warmGray, margin: "0 0 6px" }}>🏢 {w.label}</p>
                            <p style={{ fontSize: 24, fontWeight: 800, color: T.brand700, margin: 0, fontVariantNumeric: "tabular-nums" }}>
                                {w.time}<span style={{ fontSize: 12, color: T.warmGray }}>분</span>
                            </p>
                            <p style={{ fontSize: 10, color: T.warmGrayLight, margin: "4px 0 0" }}>대중교통 기준</p>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: T.warmDark, margin: "0 0 8px" }}>점수 산출 요인</p>
                    {p.commuteFactors.map((f, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "6px 0", borderBottom: i < p.commuteFactors.length - 1 ? `1px solid ${T.borderLight}` : "none",
                            fontSize: 13,
                        }}>
                            <span style={{ color: T.warmGray }}>{f.icon} {f.label}</span>
                            <span style={{
                                fontWeight: 700, fontVariantNumeric: "tabular-nums",
                                color: f.delta > 0 ? T.scoreGood : T.scoreBelow,
                            }}>
                {f.delta > 0 ? "+" : ""}{f.delta}
              </span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: 10, color: T.warmGrayLight, margin: "8px 0 0" }}>
                    🚇 ODsay 경로 API 기준 · 평일 오전 8시 출발 기준
                </p>
            </Section>

            {/* Section: Childcare */}
            <Section title="보육 인프라" icon="👶">
                <ScoreBar score={p.childcareScore} label="보육 점수" icon="👶" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                    {[
                        { label: "어린이집", count: "12개", dist: "도보 5분" },
                        { label: "유치원", count: "5개", dist: "도보 8분" },
                        { label: "초등학교", count: "3개", dist: "도보 10분" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            padding: 10, borderRadius: 8,
                            background: T.surfaceDark, textAlign: "center",
                        }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: T.warmDark, margin: "0 0 2px" }}>{item.count}</p>
                            <p style={{ fontSize: 10, color: T.warmGrayLight, margin: "0 0 1px" }}>{item.label}</p>
                            <p style={{ fontSize: 10, color: T.warmGray, margin: 0 }}>{item.dist} 이내</p>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: 10, color: T.warmGrayLight, margin: "8px 0 0" }}>
                    🏫 공공데이터포털 보육시설 · 반경 1km 기준
                </p>
            </Section>

            {/* Section: Safety (positive framing per compliance) */}
            <Section title="안전 편의시설 현황" icon="🛡️">
                <p style={{ fontSize: 12, color: T.warmGray, margin: "0 0 12px" }}>
                    서울시 평균 대비 안전 편의시설 현황입니다.
                </p>
                {p.safetyData.map((s, i) => {
                    const pct = s.pct;
                    const barColor = pct >= 80 ? "#4CAF50" : pct >= 60 ? "#FF9800" : "#9E9E9E";
                    return (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: T.warmGray }}>
                  {["📹", "💡", "🏥", "🚨"][i]} {s.label}
                </span>
                                <span style={{ color: T.warmDark, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {s.value !== null ? `${s.value}${typeof s.value === "number" ? `개 (평균 ${s.avg}개)` : ` (평균 ${s.avg})`}` : `상위 ${100 - pct}%`}
                </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 99, background: T.borderLight, overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", borderRadius: 99, background: barColor,
                                    width: `${pct}%`, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                                }} />
                            </div>
                        </div>
                    );
                })}
                <div style={{
                    padding: "10px 12px", borderRadius: 8,
                    background: T.surfaceDark, marginTop: 8,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <span style={{ fontSize: 12, color: T.warmGray }}>안전 인프라 종합</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.brand700 }}>수도권 상위 {100 - Math.round((p.safetyData.reduce((a, s) => a + s.pct, 0) / p.safetyData.length))}%</span>
                </div>
                <p style={{ fontSize: 10, color: T.warmGrayLight, margin: "8px 0 0" }}>
                    출처: 경찰청 생활안전지도 · 서울시 안전환경 데이터 · 기준일 2026.01
                </p>
            </Section>

            {/* CTA: External link (compliance pattern) */}
            <div style={{
                padding: 16, borderRadius: 14,
                background: T.surfaceElevated, border: `1px solid ${T.border}`,
                marginTop: 16,
            }}>
                <button
                    onClick={() => setShowExternalModal(true)}
                    style={{
                        width: "100%", padding: "14px 0", borderRadius: 12,
                        background: T.brand500, color: "#FFF",
                        fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "background 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.brand600}
                    onMouseLeave={e => e.currentTarget.style.background = T.brand500}
                >
                    외부 매물 보러가기 <span style={{ fontSize: 12 }}>↗</span> 네이버 부동산
                </button>
                <p style={{ fontSize: 10, color: T.warmGrayLight, textAlign: "center", margin: "8px 0 0" }}>
                    외부 사이트로 이동합니다
                </p>
            </div>

            {/* External link modal (compliance requirement) */}
            {showExternalModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000, padding: 20,
                }} onClick={() => setShowExternalModal(false)}>
                    <div style={{
                        background: T.surfaceElevated, borderRadius: 16,
                        padding: 24, maxWidth: 380, width: "100%",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                    }} onClick={e => e.stopPropagation()}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: T.warmDark, margin: "0 0 8px" }}>
                            ↗ 외부 사이트로 이동합니다
                        </p>
                        <p style={{ fontSize: 13, color: T.warmGray, margin: "0 0 16px", lineHeight: 1.6 }}>
                            <strong>네이버 부동산</strong>의 매물 상세 페이지로 이동합니다.
                            해당 페이지의 정보는 네이버 부동산이 제공하며, 본 서비스와 무관합니다.
                        </p>
                        <div style={{
                            padding: 12, borderRadius: 8,
                            background: T.surfaceDark, marginBottom: 16,
                            fontSize: 12, color: T.warmGray, lineHeight: 1.6,
                        }}>
                            본 서비스는 정보 분석 플랫폼이며 부동산 중개 서비스가 아닙니다.
                            매물 정보의 정확성은 해당 외부 사이트에서 확인해주세요.
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={() => setShowExternalModal(false)}
                                style={{
                                    flex: 1, padding: "12px 0", borderRadius: 10,
                                    border: `1px solid ${T.border}`, background: T.surfaceElevated,
                                    fontSize: 14, fontWeight: 600, color: T.warmGray, cursor: "pointer",
                                }}
                            >취소</button>
                            <button
                                style={{
                                    flex: 1, padding: "12px 0", borderRadius: 10,
                                    border: "none", background: T.brand500, color: "#FFF",
                                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                                }}
                            >네이버 부동산으로 이동 ↗</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <div style={{
            padding: 16, borderRadius: 14,
            background: T.surfaceElevated, border: `1px solid ${T.border}`,
            marginBottom: 12,
        }}>
            <h3 style={{
                fontSize: 14, fontWeight: 700, color: T.warmDark,
                margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6,
            }}>
                {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
                {title}
            </h3>
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════
   5. COMPARISON VIEW
   ═══════════════════════════════════════════ */
function ComparisonView({ properties, compareIds, onRemove }) {
    const compared = properties.filter(p => compareIds.includes(p.id));

    if (compared.length < 2) {
        return (
            <div style={{
                textAlign: "center", padding: 40,
                background: T.surfaceElevated, borderRadius: 16,
                border: `1px solid ${T.border}`,
            }}>
                <p style={{ fontSize: 40, margin: "0 0 12px" }}>⚖️</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: T.warmDark, margin: "0 0 8px" }}>
                    2개 이상 단지를 선택해주세요
                </p>
                <p style={{ fontSize: 13, color: T.warmGray }}>
                    리스트에서 "+ 비교" 버튼을 눌러 단지를 추가할 수 있습니다
                </p>
            </div>
        );
    }

    // Radar data for comparison
    const radarData = CATEGORIES.map(c => {
        const d = { axis: c.label };
        compared.forEach(p => { d[p.name] = p[c.key]; });
        return d;
    });

    const radarColors = [T.brand500, T.coral, "#8B5CF6"];

    return (
        <div>
            {/* Comparison header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.warmDark, margin: 0 }}>
                    단지 비교 ({compared.length}개)
                </h3>
                <button style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12,
                    background: T.coralLight, color: T.coral, fontWeight: 600,
                    border: `1px solid ${T.coral}30`, cursor: "pointer",
                }}>
                    📤 카카오톡으로 공유
                </button>
            </div>

            <DataSourceTags />

            {/* Radar comparison (2-3 items only) */}
            <div style={{
                padding: 16, borderRadius: 16, background: T.surfaceElevated,
                border: `1px solid ${T.border}`, marginTop: 12, marginBottom: 12,
            }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.warmDark, margin: "0 0 4px" }}>
                    카테고리별 비교
                </p>
                <p style={{ fontSize: 11, color: T.warmGray, margin: "0 0 12px" }}>
                    레이더 차트는 2~3개 단지 비교에 최적화되어 있습니다
                </p>
                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke={T.border} />
                            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: T.warmGray }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: T.warmGrayLight }} />
                            {compared.map((p, i) => (
                                <Radar key={p.id} name={p.name} dataKey={p.name}
                                       stroke={radarColors[i]} fill={radarColors[i]} fillOpacity={0.1}
                                       strokeWidth={2} />
                            ))}
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                    {compared.map((p, i) => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: radarColors[i] }} />
                            <span style={{ color: T.warmGray }}>{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Side-by-side comparison table */}
            <div style={{
                borderRadius: 16, overflow: "hidden",
                border: `1px solid ${T.border}`, background: T.surfaceElevated,
            }}>
                {/* Header row */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: `120px repeat(${compared.length}, 1fr)`,
                    borderBottom: `1px solid ${T.border}`,
                }}>
                    <div style={{ padding: "12px 14px", background: T.surfaceDark }} />
                    {compared.map((p, i) => (
                        <div key={p.id} style={{
                            padding: "12px 14px", textAlign: "center",
                            background: T.surfaceDark,
                            borderLeft: `1px solid ${T.border}`,
                        }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: T.warmDark, margin: "0 0 2px" }}>{p.name}</p>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <CircularGauge score={p.totalScore} size={36} />
                                <span style={{ fontSize: 12, color: T.warmGray }}>종합 {p.totalScore}</span>
                            </div>
                            <button
                                onClick={() => onRemove(p.id)}
                                style={{
                                    marginTop: 6, fontSize: 10, color: T.warmGrayLight,
                                    background: "none", border: "none", cursor: "pointer",
                                    textDecoration: "underline",
                                }}
                            >제거</button>
                        </div>
                    ))}
                </div>

                {/* Data rows */}
                {[
                    { label: "매매가", key: "priceRange", sub: "buy" },
                    { label: "전세가", key: "priceRange", sub: "jeonse" },
                    { label: "직장1 통근", key: "commute1", suffix: "분", lower: true },
                    { label: "직장2 통근", key: "commute2", suffix: "분", lower: true },
                    ...CATEGORIES.map(c => ({ label: c.label, key: c.key, isScore: true, icon: c.icon })),
                ].map((row, ri) => {
                    const values = compared.map(p =>
                        row.sub ? p[row.key][row.sub]
                            : row.isScore ? p[row.key]
                                : p[row.key]
                    );

                    // Determine winner
                    let bestIdx = -1;
                    if (row.isScore) {
                        const max = Math.max(...values);
                        bestIdx = values.indexOf(max);
                        if (values.filter(v => v === max).length > 1) bestIdx = -1;
                    } else if (row.lower && !row.sub) {
                        const min = Math.min(...values);
                        bestIdx = values.indexOf(min);
                        if (values.filter(v => v === min).length > 1) bestIdx = -1;
                    }

                    return (
                        <div key={ri} style={{
                            display: "grid",
                            gridTemplateColumns: `120px repeat(${compared.length}, 1fr)`,
                            borderBottom: ri < 7 ? `1px solid ${T.borderLight}` : "none",
                        }}>
                            <div style={{
                                padding: "10px 14px", fontSize: 12, color: T.warmGray,
                                display: "flex", alignItems: "center", gap: 4,
                                background: ri % 2 === 0 ? "transparent" : T.surfaceDark,
                            }}>
                                {row.icon && <span style={{ fontSize: 12 }}>{row.icon}</span>}
                                {row.label}
                            </div>
                            {values.map((v, vi) => (
                                <div key={vi} style={{
                                    padding: "10px 14px", textAlign: "center",
                                    borderLeft: `1px solid ${T.borderLight}`,
                                    background: bestIdx === vi
                                        ? `${T.brand500}08`
                                        : ri % 2 === 0 ? "transparent" : T.surfaceDark,
                                }}>
                  <span style={{
                      fontSize: 13, fontWeight: bestIdx === vi ? 700 : 500,
                      color: bestIdx === vi ? T.brand700 : T.warmDark,
                      fontVariantNumeric: "tabular-nums",
                  }}>
                    {row.isScore ? v : `${v}${row.suffix || ""}`}
                  </span>
                                    {row.isScore && <ScoreBadge score={v} size="sm" />}
                                    {bestIdx === vi && (
                                        <span style={{
                                            display: "block", fontSize: 9, color: T.brand500,
                                            fontWeight: 600, marginTop: 2,
                                        }}>더 좋음</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Kakao share preview */}
            <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.warmDark, margin: "0 0 8px" }}>
                    📱 카카오톡 공유 미리보기
                </p>
                <div style={{
                    maxWidth: 320, borderRadius: 12, overflow: "hidden",
                    border: `1px solid ${T.border}`, background: T.surfaceElevated,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                    <div style={{
                        padding: "12px 14px", borderBottom: `1px solid ${T.borderLight}`,
                        background: "#FEE500",
                    }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#3C1E1E", margin: 0 }}>
                            🏠 우리 후보 단지 {compared.length}곳
                        </p>
                    </div>
                    {compared.map((p, i) => (
                        <div key={p.id} style={{
                            padding: "10px 14px", display: "flex", justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: i < compared.length - 1 ? `1px solid ${T.borderLight}` : "none",
                        }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: T.warmDark, margin: "0 0 2px" }}>{p.name}</p>
                                <p style={{ fontSize: 11, color: T.warmGray, margin: 0 }}>
                                    매매 {p.priceRange.buy} · 종합 {p.totalScore}점
                                </p>
                            </div>
                            <CircularGauge score={p.totalScore} size={36} />
                        </div>
                    ))}
                    <div style={{
                        padding: "10px 14px", textAlign: "center",
                        borderTop: `1px solid ${T.borderLight}`,
                    }}>
            <span style={{ fontSize: 12, color: T.brand500, fontWeight: 600 }}>
              비교 보드에서 확인하기 →
            </span>
                    </div>
                </div>
            </div>

            {/* Mobile comparison UX note */}
            <div style={{
                marginTop: 16, padding: "12px 14px", borderRadius: 10,
                background: T.surfaceDark, border: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", gap: 8,
            }}>
                <span style={{ fontSize: 14 }}>📱</span>
                <div style={{ fontSize: 12, color: T.warmGray, lineHeight: 1.5 }}>
                    <strong style={{ color: T.warmDark }}>모바일 비교 UX:</strong> 좌우 스와이프로 단지 전환 + 상단 고정 탭으로 카테고리 네비게이션.
                    스크롤 비교 대신 스와이프가 모바일에서 더 직관적.
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function PropertyResultScreen() {
    const [view, setView] = useState("list");
    const [sortKey, setSortKey] = useState("totalScore");
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [compareIds, setCompareIds] = useState([1, 2]);

    const sorted = [...PROPERTIES].sort((a, b) => {
        const opt = SORT_OPTIONS.find(o => o.key === sortKey);
        return opt?.asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
    });

    const handleCompare = (id) => {
        setCompareIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : prev.length < 3
                    ? [...prev, id]
                    : prev
        );
    };

    const handleSelect = (p) => {
        setSelectedProperty(p);
        setView("detail");
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: T.surface,
            fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            color: T.warmDark,
            letterSpacing: "-0.02em",
        }}>
            <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
        * { box-sizing: border-box; margin: 0; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 4px; }
      `}</style>

            {/* Header */}
            <div style={{
                padding: "20px 20px 14px",
                borderBottom: `1px solid ${T.border}`,
                background: T.surfaceElevated,
            }}>
                <div style={{ maxWidth: 780, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{
                fontSize: 10, fontWeight: 700, color: T.brand500,
                letterSpacing: 1.2, textTransform: "uppercase",
            }}>조건 부합 단지 분석 결과</span>
                    </div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px", color: T.warmDark, letterSpacing: -0.5 }}>
                        결과 화면 UI 설계
                    </h1>
                    <p style={{ fontSize: 12, color: T.warmGray }}>
                        리스트 · 지도 · 점수 시각화 · 상세 · 비교 — 5개 뷰 인터랙티브 프로토타입
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div style={{
                borderBottom: `1px solid ${T.border}`, background: T.surfaceElevated,
                position: "sticky", top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: 780, margin: "0 auto",
                    display: "flex", gap: 2, padding: "8px 16px",
                    overflowX: "auto",
                }}>
                    {VIEWS.map(v => (
                        <button
                            key={v.id}
                            onClick={() => {
                                setView(v.id);
                                if (v.id !== "detail") setSelectedProperty(null);
                            }}
                            style={{
                                padding: "8px 16px", borderRadius: 10,
                                border: view === v.id ? `1.5px solid ${T.brand500}` : "1px solid transparent",
                                background: view === v.id ? `${T.brand500}0A` : "transparent",
                                color: view === v.id ? T.brand700 : T.warmGray,
                                fontSize: 13, fontWeight: view === v.id ? 700 : 500,
                                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                                display: "flex", alignItems: "center", gap: 6,
                                transition: "all 0.2s",
                            }}
                        >
                            <span style={{ fontSize: 14 }}>{v.icon}</span>
                            {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Compare bar */}
            {compareIds.length > 0 && view !== "compare" && (
                <div style={{
                    position: "fixed", bottom: 0, left: 0, right: 0,
                    background: "rgba(250,250,249,0.92)", backdropFilter: "blur(12px)",
                    borderTop: `1px solid ${T.border}`, padding: "10px 16px",
                    zIndex: 50, display: "flex", justifyContent: "center",
                }}>
                    <div style={{
                        maxWidth: 780, width: "100%",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.warmDark }}>
                비교함 {compareIds.length}/3
              </span>
                            <div style={{ display: "flex", gap: 4 }}>
                                {compareIds.map(id => {
                                    const p = PROPERTIES.find(x => x.id === id);
                                    return (
                                        <span key={id} style={{
                                            padding: "3px 10px", borderRadius: 99,
                                            background: T.brand50, color: T.brand700,
                                            fontSize: 11, fontWeight: 500,
                                        }}>
                      {p?.name}
                    </span>
                                    );
                                })}
                            </div>
                        </div>
                        <button
                            onClick={() => setView("compare")}
                            style={{
                                padding: "8px 20px", borderRadius: 10,
                                background: T.coral, color: "#FFF",
                                fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
                            }}
                        >비교하기</button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div style={{
                maxWidth: 780, margin: "0 auto", padding: "20px 16px 80px",
                animation: "fadeInUp 0.3s ease",
            }}>
                {view === "list" && (
                    <ListView
                        properties={sorted}
                        onSelect={handleSelect}
                        compareIds={compareIds}
                        onCompare={handleCompare}
                        sortKey={sortKey}
                        onSortChange={setSortKey}
                    />
                )}
                {view === "map" && (
                    <MapView
                        properties={PROPERTIES}
                        onSelect={handleSelect}
                        compareIds={compareIds}
                        onCompare={handleCompare}
                    />
                )}
                {view === "score" && (
                    <ScoreVisualization properties={PROPERTIES} />
                )}
                {view === "detail" && selectedProperty && (
                    <DetailPage
                        property={selectedProperty}
                        onBack={() => setView("list")}
                    />
                )}
                {view === "detail" && !selectedProperty && (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        <p style={{ fontSize: 15, color: T.warmGray }}>리스트에서 단지를 선택해주세요</p>
                    </div>
                )}
                {view === "compare" && (
                    <ComparisonView
                        properties={PROPERTIES}
                        compareIds={compareIds}
                        onRemove={(id) => setCompareIds(prev => prev.filter(x => x !== id))}
                    />
                )}
            </div>

            {/* Footer disclaimer (compliance requirement - always visible) */}
            <div style={{
                padding: "16px 20px", borderTop: `1px solid ${T.border}`,
                background: T.surfaceElevated, textAlign: "center",
            }}>
                <p style={{ fontSize: 11, color: T.warmGrayLight, lineHeight: 1.7 }}>
                    본 서비스는 공공데이터 기반 정보 분석 플랫폼입니다 · 부동산 중개·알선·자문 서비스가 아닙니다
                </p>
                <p style={{ fontSize: 10, color: T.warmGrayLight, marginTop: 4 }}>
                    © 2026 서비스명 · 이용약관 · 개인정보처리방침 · 위치정보이용약관
                </p>
            </div>
        </div>
    );
}