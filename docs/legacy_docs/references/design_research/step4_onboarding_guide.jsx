import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   신혼부부 주거 분석 서비스 — 온보딩(조건 입력) 플로우
   ═══════════════════════════════════════════════════════════════

   ▸ 스텝 구성 (5단계, 총 ~2분 30초 목표)
   ─────────────────────────────────────────
   Step 1 — 우리 부부는요       (주거 형태 + 자녀 계획, ~25초)
   Step 2 — 출퇴근 정보         (직장1 + 직장2 주소, ~40초)
   Step 3 — 소득 & 자산         (합산연봉 + 보유현금, ~30초)
   Step 4 — 부채 & 예산         (기존대출 + 월주거비, ~30초)
   Step 5 — 분석 중…            (결과 전환 애니메이션)

   ▸ 설계 근거
   ─────────────────────────────────────────
   • "원 퀘스천 퍼 스크린"이 이상적이나, 8개 입력을 8스텝으로 나누면
     진행감이 떨어져 이탈 위험 ↑. 유사 맥락끼리 2개씩 묶어 5스텝으로 구성.
   • Step 1을 가벼운 선택지로 시작 → "쉽다" 인상 → 완료 심리 작동
   • 금융 정보(Step 3-4)를 후반에 배치하여 이미 투자한 시간의 매몰비용 효과 활용
   • Step 2 주소 입력은 마찰이 가장 크므로 가벼운 선택 직후에 배치하여
     모멘텀이 살아있을 때 처리

   ▸ 컬러 시스템 (디자인 시스템 준수)
   ─────────────────────────────────────────
   Primary: 웜 틸 블루 #0891B2
   Accent:  코랄 오렌지 #F97316
   Surface: 웜 화이트 #FAFAF9
   Text:    웜 다크 #1C1917
   ═══════════════════════════════════════════════════════════════ */

// ─── CONSTANTS ───────────────────────────────────────────────

const STEPS = [
    { id: 1, label: "우리 부부는요", sub: "주거 취향을 알려주세요" },
    { id: 2, label: "출퇴근 정보", sub: "두 분의 직장 위치를 알려주세요" },
    { id: 3, label: "소득과 자산", sub: "예산 범위를 파악할게요" },
    { id: 4, label: "부채와 예산", sub: "현실적인 주거비를 계산해요" },
    { id: 5, label: "분석 중", sub: "맞춤 결과를 준비하고 있어요" },
];

const HOUSING_TYPES = [
    { value: "buy", emoji: "🏠", label: "매매", desc: "내 집 마련" },
    { value: "jeonse", emoji: "🔑", label: "전세", desc: "목돈 활용" },
    { value: "monthly", emoji: "📆", label: "월세", desc: "유연한 선택" },
];

const CHILD_PLANS = [
    { value: "planning", emoji: "👶", label: "계획 중", desc: "육아 인프라 반영" },
    { value: "none", emoji: "🧑‍🤝‍🧑", label: "계획 없음", desc: "통근 중심 분석" },
    { value: "have", emoji: "👨‍👩‍👧", label: "이미 있어요", desc: "어린이집·학교 반영" },
];

const QUICK_AMOUNTS = {
    salary: [
        { label: "+3,000만", value: 3000 },
        { label: "+5,000만", value: 5000 },
        { label: "+1억", value: 10000 },
    ],
    cash: [
        { label: "+1,000만", value: 1000 },
        { label: "+5,000만", value: 5000 },
        { label: "+1억", value: 10000 },
    ],
    debt: [
        { label: "+1,000만", value: 1000 },
        { label: "+5,000만", value: 5000 },
        { label: "+1억", value: 10000 },
    ],
    monthly: [
        { label: "+50만", value: 50 },
        { label: "+100만", value: 100 },
        { label: "+200만", value: 200 },
    ],
};

const ANALYSIS_STEPS = [
    { icon: "🏘️", text: "입력 조건 분석 중…", duration: 1200 },
    { icon: "🚇", text: "통근 경로 계산 중…", duration: 1400 },
    { icon: "📊", text: "예산 적합도 시뮬레이션 중…", duration: 1600 },
    { icon: "🗺️", text: "조건 부합 단지 탐색 중…", duration: 1800 },
];

// ─── STYLES (Inline for artifact) ────────────────────────────

const palette = {
    primary: "#0891B2",
    primaryDark: "#155E75",
    primaryLight: "#CFFAFE",
    primaryMid: "#06B6D4",
    accent: "#F97316",
    accentDark: "#C2410C",
    surface: "#FAFAF9",
    surfaceWhite: "#FFFFFF",
    textDark: "#1C1917",
    textMuted: "#78716C",
    textLight: "#A8A29E",
    border: "#E7E5E4",
    borderLight: "#F5F5F4",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
};

// ─── UTILITY COMPONENTS ──────────────────────────────────────

function ProgressBar({ currentStep, totalSteps }) {
    const progress = ((currentStep) / (totalSteps - 1)) * 100;
    return (
        <div style={{ padding: "0 24px", marginBottom: 8 }}>
            {/* Step indicators */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                position: "relative",
            }}>
                {/* Background track */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 16,
                    right: 16,
                    height: 2,
                    background: palette.border,
                    transform: "translateY(-50%)",
                    zIndex: 0,
                }} />
                {/* Filled track */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 16,
                    width: `calc(${Math.min(progress, 100)}% - 16px)`,
                    height: 2,
                    background: palette.primary,
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }} />
                {STEPS.slice(0, -1).map((step, i) => (
                    <div
                        key={step.id}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            zIndex: 2,
                            transition: "all 0.3s ease",
                            background: i < currentStep ? palette.primary
                                : i === currentStep ? palette.surfaceWhite
                                    : palette.surfaceWhite,
                            color: i < currentStep ? "#fff"
                                : i === currentStep ? palette.primary
                                    : palette.textLight,
                            border: i === currentStep ? `2px solid ${palette.primary}`
                                : i < currentStep ? "2px solid transparent"
                                    : `2px solid ${palette.border}`,
                            boxShadow: i === currentStep ? `0 0 0 4px ${palette.primaryLight}` : "none",
                        }}
                    >
                        {i < currentStep ? "✓" : i + 1}
                    </div>
                ))}
            </div>
            {/* Step label */}
            <div style={{ textAlign: "center" }}>
        <span style={{
            fontSize: 12,
            color: palette.textMuted,
            fontWeight: 500,
        }}>
          {currentStep + 1} / {totalSteps - 1}
        </span>
            </div>
        </div>
    );
}

function TrustBadge({ variant = "full" }) {
    if (variant === "mini") {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 0",
                marginTop: 12,
            }}>
                <span style={{ fontSize: 13, opacity: 0.7 }}>🔒</span>
                <span style={{
                    fontSize: 12,
                    color: palette.textLight,
                    letterSpacing: "-0.01em",
                }}>
          이 금액은 분석 후 즉시 삭제됩니다
        </span>
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            background: `linear-gradient(135deg, ${palette.primaryLight}44, ${palette.primaryLight}22)`,
            borderRadius: 12,
            border: `1px solid ${palette.primaryLight}`,
            marginBottom: 20,
        }}>
            <span style={{ fontSize: 16, marginTop: 1 }}>🔒</span>
            <div>
                <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: palette.primaryDark,
                    marginBottom: 2,
                }}>
                    입력 정보 비저장
                </div>
                <div style={{
                    fontSize: 12,
                    color: palette.primary,
                    lineHeight: 1.5,
                }}>
                    입력하신 금융 정보는 분석에만 사용되며<br />
                    <strong>서버에 저장되지 않습니다</strong>
                </div>
            </div>
        </div>
    );
}

function WhyTooltip({ text, isOpen, onToggle }) {
    return (
        <div style={{ position: "relative", display: "inline-flex" }}>
            <button
                onClick={onToggle}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    fontSize: 12,
                    color: palette.textMuted,
                }}
            >
        <span style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: `1.5px solid ${palette.textLight}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: palette.textLight,
        }}>?</span>
                왜 이 정보가 필요한가요?
            </button>
            {isOpen && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: -20,
                    padding: "10px 12px",
                    background: palette.textDark,
                    color: "#fff",
                    borderRadius: 10,
                    fontSize: 12,
                    lineHeight: 1.6,
                    zIndex: 100,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    animation: "fadeIn 0.2s ease",
                }}>
                    {text}
                    <div style={{
                        position: "absolute",
                        top: -5,
                        left: 16,
                        width: 10,
                        height: 10,
                        background: palette.textDark,
                        transform: "rotate(45deg)",
                    }} />
                </div>
            )}
        </div>
    );
}

function CardSelector({ options, selected, onSelect, multi = false }) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: options.length === 3 ? "1fr 1fr 1fr" : "1fr 1fr",
            gap: 10,
        }}>
            {options.map((opt) => {
                const isSelected = multi
                    ? selected?.includes(opt.value)
                    : selected === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onSelect(opt.value)}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            padding: "18px 10px 14px",
                            borderRadius: 14,
                            border: isSelected
                                ? `2px solid ${palette.primary}`
                                : `1.5px solid ${palette.border}`,
                            background: isSelected
                                ? `linear-gradient(180deg, ${palette.primaryLight}66, ${palette.primaryLight}22)`
                                : palette.surfaceWhite,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected
                                ? `0 0 0 3px ${palette.primaryLight}, 0 2px 8px rgba(8,145,178,0.12)`
                                : "0 1px 3px rgba(0,0,0,0.04)",
                            transform: isSelected ? "scale(1.02)" : "scale(1)",
                            minHeight: 96,
                        }}
                    >
            <span style={{
                fontSize: 26,
                lineHeight: 1,
                transition: "transform 0.2s ease",
                transform: isSelected ? "scale(1.15)" : "scale(1)",
            }}>
              {opt.emoji}
            </span>
                        <span style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: isSelected ? palette.primaryDark : palette.textDark,
                        }}>
              {opt.label}
            </span>
                        <span style={{
                            fontSize: 11,
                            color: isSelected ? palette.primary : palette.textMuted,
                            lineHeight: 1.3,
                        }}>
              {opt.desc}
            </span>
                    </button>
                );
            })}
        </div>
    );
}

function AmountInput({ label, value, onChange, quickAmounts, placeholder = "0", unit = "만 원", helpText }) {
    const [openTooltip, setOpenTooltip] = useState(false);
    const displayValue = value ? Number(value).toLocaleString() : "";

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
            }}>
                <label style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: palette.textDark,
                }}>
                    {label}
                </label>
                {helpText && (
                    <WhyTooltip
                        text={helpText}
                        isOpen={openTooltip}
                        onToggle={() => setOpenTooltip(!openTooltip)}
                    />
                )}
            </div>

            {/* Amount display field */}
            <div style={{
                display: "flex",
                alignItems: "center",
                background: palette.surfaceWhite,
                border: `1.5px solid ${value ? palette.primary : palette.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                transition: "border-color 0.2s",
                gap: 8,
            }}>
                <input
                    type="text"
                    inputMode="numeric"
                    value={displayValue}
                    placeholder={placeholder}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        onChange(raw ? parseInt(raw) : 0);
                    }}
                    style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: 22,
                        fontWeight: 700,
                        color: palette.textDark,
                        background: "transparent",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                    }}
                />
                <span style={{
                    fontSize: 15,
                    color: palette.textMuted,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                }}>
          {unit}
        </span>
            </div>

            {/* Korean amount description */}
            {value > 0 && (
                <div style={{
                    fontSize: 12,
                    color: palette.primary,
                    marginTop: 6,
                    paddingLeft: 4,
                    fontWeight: 500,
                }}>
                    {formatKoreanAmount(value)}
                </div>
            )}

            {/* Quick amount buttons */}
            <div style={{
                display: "flex",
                gap: 8,
                marginTop: 10,
            }}>
                {quickAmounts.map((qa) => (
                    <button
                        key={qa.label}
                        onClick={() => onChange((value || 0) + qa.value)}
                        style={{
                            flex: 1,
                            padding: "10px 6px",
                            borderRadius: 10,
                            border: `1.5px solid ${palette.border}`,
                            background: palette.surfaceWhite,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            color: palette.textDark,
                            transition: "all 0.15s ease",
                            minHeight: 44,
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = "scale(0.96)";
                            e.currentTarget.style.background = palette.borderLight;
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.background = palette.surfaceWhite;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.background = palette.surfaceWhite;
                        }}
                    >
                        {qa.label}
                    </button>
                ))}
                {/* Reset button */}
                <button
                    onClick={() => onChange(0)}
                    style={{
                        width: 44,
                        minHeight: 44,
                        borderRadius: 10,
                        border: `1.5px solid ${palette.border}`,
                        background: palette.surfaceWhite,
                        cursor: "pointer",
                        fontSize: 14,
                        color: palette.textLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    ↺
                </button>
            </div>
        </div>
    );
}

function formatKoreanAmount(value) {
    if (!value) return "";
    const uk = Math.floor(value / 10000);
    const man = value % 10000;
    let result = "";
    if (uk > 0) result += `${uk}억 `;
    if (man > 0) result += `${man.toLocaleString()}만`;
    if (!result) return "0원";
    return result.trim() + "원";
}

function AddressInput({ label, value, onChange, optional = false, onSkip }) {
    const [focused, setFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [showResults, setShowResults] = useState(false);

    // Mock address results
    const mockResults = searchText.length >= 2 ? [
        { address: `서울 강남구 ${searchText}로 123`, detail: "강남파이낸스센터" },
        { address: `서울 서초구 ${searchText}대로 456`, detail: "삼성타운" },
        { address: `서울 영등포구 ${searchText}로 789`, detail: "여의도 IFC" },
    ] : [];

    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
            }}>
                <label style={{ fontSize: 15, fontWeight: 600, color: palette.textDark }}>
                    {label}
                    {optional && (
                        <span style={{ fontSize: 12, color: palette.textMuted, fontWeight: 400, marginLeft: 6 }}>
              (선택)
            </span>
                    )}
                </label>
            </div>

            {value ? (
                // Selected state
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: `${palette.primaryLight}44`,
                    border: `1.5px solid ${palette.primary}40`,
                    borderRadius: 12,
                }}>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: palette.textDark }}>{value.detail}</div>
                        <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 2 }}>{value.address}</div>
                    </div>
                    <button
                        onClick={() => { onChange(null); setSearchText(""); }}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            color: palette.textLight,
                            padding: 4,
                            minWidth: 44,
                            minHeight: 44,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>
            ) : (
                // Search state
                <div style={{ position: "relative" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        background: palette.surfaceWhite,
                        border: `1.5px solid ${focused ? palette.primary : palette.border}`,
                        borderRadius: showResults && mockResults.length ? "12px 12px 0 0" : 12,
                        padding: "0 16px",
                        transition: "border-color 0.2s",
                        gap: 10,
                    }}>
                        <span style={{ fontSize: 16, color: palette.textLight }}>🔍</span>
                        <input
                            type="text"
                            value={searchText}
                            placeholder="도로명, 건물명, 지번 검색"
                            onFocus={() => { setFocused(true); setShowResults(true); }}
                            onBlur={() => { setFocused(false); setTimeout(() => setShowResults(false), 200); }}
                            onChange={(e) => { setSearchText(e.target.value); setShowResults(true); }}
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                fontSize: 15,
                                color: palette.textDark,
                                background: "transparent",
                                padding: "14px 0",
                                minHeight: 48,
                            }}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && mockResults.length > 0 && (
                        <div style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: palette.surfaceWhite,
                            border: `1.5px solid ${palette.primary}`,
                            borderTop: "none",
                            borderRadius: "0 0 12px 12px",
                            overflow: "hidden",
                            zIndex: 50,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        }}>
                            {mockResults.map((result, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        onChange(result);
                                        setSearchText("");
                                        setShowResults(false);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: i < mockResults.length - 1 ? `1px solid ${palette.borderLight}` : "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        minHeight: 48,
                                    }}
                                >
                                    <div style={{ fontSize: 14, fontWeight: 500, color: palette.textDark }}>{result.detail}</div>
                                    <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 2 }}>{result.address}</div>
                                </button>
                            ))}
                            {/* Kakao attribution */}
                            <div style={{
                                padding: "8px 16px",
                                background: palette.borderLight,
                                fontSize: 10,
                                color: palette.textLight,
                                textAlign: "right",
                            }}>
                                powered by Kakao 주소 API
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Skip option for optional fields */}
            {optional && !value && (
                <button
                    onClick={onSkip}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "10px 0",
                        fontSize: 13,
                        color: palette.textMuted,
                        marginTop: 4,
                    }}
                >
          <span style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              border: `1.5px solid ${palette.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
          }}>
            ✓
          </span>
                    외벌이예요 (배우자 직장 없음)
                </button>
            )}
        </div>
    );
}

function BottomCTA({ label, onClick, disabled = false, secondary, onSecondary }) {
    return (
        <div style={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(to top, ${palette.surface} 70%, ${palette.surface}00)`,
            padding: "16px 24px 24px",
        }}>
            <button
                onClick={onClick}
                disabled={disabled}
                style={{
                    width: "100%",
                    minHeight: 52,
                    borderRadius: 14,
                    border: "none",
                    background: disabled
                        ? palette.border
                        : `linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark})`,
                    color: disabled ? palette.textLight : "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: disabled ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: disabled
                        ? "none"
                        : `0 4px 14px ${palette.primary}40`,
                    letterSpacing: "-0.01em",
                }}
            >
                {label}
            </button>
            {secondary && (
                <button
                    onClick={onSecondary}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        background: "none",
                        border: "none",
                        fontSize: 13,
                        color: palette.textMuted,
                        cursor: "pointer",
                        marginTop: 4,
                    }}
                >
                    {secondary}
                </button>
            )}
        </div>
    );
}

// ─── STEP COMPONENTS ─────────────────────────────────────────

/*  ╔══════════════════════════════════════════════════════════╗
    ║  STEP 1: 우리 부부는요                                    ║
    ║  입력: 주거 형태 선호 + 자녀 계획                            ║
    ║  UI: 카드 선택 (3x1 그리드)                                ║
    ║  예상 소요: ~25초                                          ║
    ║                                                          ║
    ║  설계 근거:                                                ║
    ║  • 첫 화면을 가벼운 선택지로 구성하여 "쉽다" 인상 전달       ║
    ║  • 카드 UI는 시각적 피드백이 풍부하여 재미 + 달성감 부여     ║
    ║  • 2가지 선택을 한 화면에 배치하되 시각적으로 분리          ║
    ╚══════════════════════════════════════════════════════════╝ */

function Step1({ data, onChange }) {
    return (
        <div style={{ padding: "0 24px", paddingBottom: 100 }}>
            {/* Section title */}
            <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.textDark,
                marginBottom: 4,
                letterSpacing: "-0.03em",
                lineHeight: 1.3,
            }}>
                어떤 집을 찾고 계세요?
            </h2>
            <p style={{
                fontSize: 14,
                color: palette.textMuted,
                marginBottom: 24,
                lineHeight: 1.5,
            }}>
                부부의 상황에 맞게 분석해드릴게요
            </p>

            {/* Housing type selection */}
            <div style={{ marginBottom: 32 }}>
                <label style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: palette.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 10,
                    display: "block",
                }}>
                    주거 형태
                </label>
                <CardSelector
                    options={HOUSING_TYPES}
                    selected={data.housingType}
                    onSelect={(v) => onChange({ ...data, housingType: v })}
                />
            </div>

            {/* Child plan selection */}
            <div>
                <label style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: palette.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 10,
                    display: "block",
                }}>
                    자녀 계획
                </label>
                <CardSelector
                    options={CHILD_PLANS}
                    selected={data.childPlan}
                    onSelect={(v) => onChange({ ...data, childPlan: v })}
                />
                <p style={{
                    fontSize: 11,
                    color: palette.textLight,
                    marginTop: 8,
                    lineHeight: 1.5,
                }}>
                    어린이집·학교 인프라 가중치에 반영돼요
                </p>
            </div>
        </div>
    );
}

/*  ╔══════════════════════════════════════════════════════════╗
    ║  STEP 2: 출퇴근 정보                                      ║
    ║  입력: 직장1 주소 + 직장2 주소                              ║
    ║  UI: 카카오 주소 검색 API 연동 패턴                         ║
    ║  예상 소요: ~40초                                          ║
    ║                                                          ║
    ║  주소 검색 UX 플로우:                                      ║
    ║  1. 검색 필드 탭 → 키보드 자동 올림                        ║
    ║  2. 2글자 이상 입력 → 디바운스 300ms → 검색 결과 표시      ║
    ║  3. 결과 탭 → 주소 확정 → 내부적으로 좌표 변환 (geocoding) ║
    ║  4. 확정된 주소가 칩 형태로 표시 → ✕ 탭으로 재검색          ║
    ║                                                          ║
    ║  위치정보 이용 동의:                                       ║
    ║  직장 주소 → 좌표 변환 시 위치정보 이용에 해당하므로        ║
    ║  Step 0(동의)에서 이미 수집. 여기서는 리마인드만 표시       ║
    ╚══════════════════════════════════════════════════════════╝ */

function Step2({ data, onChange }) {
    const [singleIncome, setSingleIncome] = useState(data.singleIncome || false);

    return (
        <div style={{ padding: "0 24px", paddingBottom: 100 }}>
            <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.textDark,
                marginBottom: 4,
                letterSpacing: "-0.03em",
                lineHeight: 1.3,
            }}>
                직장은 어디에 있나요?
            </h2>
            <p style={{
                fontSize: 14,
                color: palette.textMuted,
                marginBottom: 20,
                lineHeight: 1.5,
            }}>
                두 직장에서의 통근 시간을 함께 분석해요
            </p>

            {/* Location info notice */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: palette.borderLight,
                borderRadius: 8,
                marginBottom: 20,
            }}>
                <span style={{ fontSize: 13 }}>📍</span>
                <span style={{
                    fontSize: 12,
                    color: palette.textMuted,
                    lineHeight: 1.4,
                }}>
          입력하신 주소는 통근 시간 계산에만 사용되며 좌표로 저장되지 않아요
        </span>
            </div>

            <AddressInput
                label="직장 1 (본인)"
                value={data.address1}
                onChange={(v) => onChange({ ...data, address1: v })}
            />

            <AddressInput
                label="직장 2 (배우자)"
                value={singleIncome ? { address: "해당 없음", detail: "외벌이" } : data.address2}
                onChange={(v) => { setSingleIncome(false); onChange({ ...data, address2: v, singleIncome: false }); }}
                optional
                onSkip={() => {
                    setSingleIncome(true);
                    onChange({
                        ...data,
                        address2: { address: "해당 없음", detail: "외벌이" },
                        singleIncome: true,
                    });
                }}
            />
        </div>
    );
}

/*  ╔══════════════════════════════════════════════════════════╗
    ║  STEP 3: 소득과 자산                                      ║
    ║  입력: 합산연봉 + 보유현금                                  ║
    ║  UI: 직접 입력 + 빠른 입력 버튼 (토스 패턴)                ║
    ║  예상 소요: ~30초                                          ║
    ║                                                          ║
    ║  금액 입력 UI 결정:                                        ║
    ║  • 슬라이더 ✕ — 정밀한 금액 입력 어려움, 엄지 조작 부정확  ║
    ║  • 구간 선택 ✕ — 매매/전세 맥락에서 구간이 너무 넓어짐     ║
    ║  • 직접 입력 + 빠른 입력 버튼 ✓ — 토스 검증 패턴           ║
    ║    "+1,000만", "+5,000만", "+1억" 버튼으로 키보드 의존도 ↓ ║
    ║    정밀 조정이 필요하면 직접 타이핑 가능                    ║
    ║                                                          ║
    ║  신뢰 확보:                                                ║
    ║  • 상단: 전체 보안 배지 (TrustBadge full)                  ║
    ║  • 하단: 축약 리마인더 (TrustBadge mini)                   ║
    ╚══════════════════════════════════════════════════════════╝ */

function Step3({ data, onChange }) {
    return (
        <div style={{ padding: "0 24px", paddingBottom: 100 }}>
            <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.textDark,
                marginBottom: 4,
                letterSpacing: "-0.03em",
                lineHeight: 1.3,
            }}>
                소득과 자산을 알려주세요
            </h2>
            <p style={{
                fontSize: 14,
                color: palette.textMuted,
                marginBottom: 20,
                lineHeight: 1.5,
            }}>
                현실적인 예산 범위를 계산하는 데 사용돼요
            </p>

            {/* Trust Badge — full version */}
            <TrustBadge variant="full" />

            <AmountInput
                label="부부 합산 연봉"
                value={data.salary}
                onChange={(v) => onChange({ ...data, salary: v })}
                quickAmounts={QUICK_AMOUNTS.salary}
                placeholder="0"
                helpText="DSR(총부채원리금상환비율)을 계산해요. 쉽게 말해, 연봉 대비 얼마까지 대출이 가능한지 파악하는 기준이에요."
            />

            <AmountInput
                label="보유 현금 (예적금 포함)"
                value={data.cash}
                onChange={(v) => onChange({ ...data, cash: v })}
                quickAmounts={QUICK_AMOUNTS.cash}
                placeholder="0"
                helpText="전세 보증금이나 매매 계약금으로 활용할 수 있는 금액을 파악해요. 대략적인 금액이면 충분해요."
            />

            {/* Mini trust reminder */}
            <TrustBadge variant="mini" />
        </div>
    );
}

/*  ╔══════════════════════════════════════════════════════════╗
    ║  STEP 4: 부채와 예산                                      ║
    ║  입력: 기존대출 잔액 + 최대 월주거비                        ║
    ║  UI: 직접 입력 + 빠른 입력 버튼                            ║
    ║  예상 소요: ~30초                                          ║
    ║                                                          ║
    ║  이탈 방지:                                                ║
    ║  • "여기까지만 입력해도 기본 분석 가능" 안내                ║
    ║  • 기존대출 0원이면 "없어요" 원탭 버튼                     ║
    ║  • 월주거비는 스킵 가능 (시스템이 자동 계산 대체)           ║
    ╚══════════════════════════════════════════════════════════╝ */

function Step4({ data, onChange }) {
    return (
        <div style={{ padding: "0 24px", paddingBottom: 100 }}>
            <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.textDark,
                marginBottom: 4,
                letterSpacing: "-0.03em",
                lineHeight: 1.3,
            }}>
                마지막이에요!
            </h2>
            <p style={{
                fontSize: 14,
                color: palette.textMuted,
                marginBottom: 20,
                lineHeight: 1.5,
            }}>
                현실적인 주거 비용을 계산할게요
            </p>

            <AmountInput
                label="기존 대출 잔액"
                value={data.debt}
                onChange={(v) => onChange({ ...data, debt: v })}
                quickAmounts={QUICK_AMOUNTS.debt}
                placeholder="0"
                helpText="기존 대출이 있으면 추가 대출 한도에 영향을 줘요. 없으면 0으로 두시면 돼요."
            />

            {/* Zero debt shortcut */}
            {!data.debt && (
                <button
                    onClick={() => onChange({ ...data, debt: 0, debtConfirmed: true })}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: `1.5px solid ${data.debtConfirmed ? palette.primary : palette.border}`,
                        background: data.debtConfirmed
                            ? `${palette.primaryLight}44`
                            : palette.surfaceWhite,
                        cursor: "pointer",
                        marginBottom: 24,
                        marginTop: -12,
                        transition: "all 0.2s ease",
                        fontSize: 14,
                        color: data.debtConfirmed ? palette.primaryDark : palette.textDark,
                        fontWeight: 500,
                    }}
                >
          <span style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: data.debtConfirmed
                  ? `2px solid ${palette.primary}`
                  : `2px solid ${palette.border}`,
              background: data.debtConfirmed ? palette.primary : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              color: "#fff",
          }}>
            {data.debtConfirmed ? "✓" : ""}
          </span>
                    대출 없어요
                </button>
            )}

            <AmountInput
                label="매달 낼 수 있는 최대 주거비"
                value={data.monthlyBudget}
                onChange={(v) => onChange({ ...data, monthlyBudget: v })}
                quickAmounts={QUICK_AMOUNTS.monthly}
                placeholder="0"
                helpText="월세라면 월세+관리비, 매매라면 대출 원리금 상환액을 포함한 금액이에요."
            />

            {/* Inline disclaimer */}
            <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                padding: "10px 12px",
                background: palette.borderLight,
                borderRadius: 8,
                marginTop: 8,
            }}>
                <span style={{ fontSize: 12, marginTop: 1 }}>ℹ️</span>
                <span style={{
                    fontSize: 11,
                    color: palette.textMuted,
                    lineHeight: 1.6,
                }}>
          참고용 시뮬레이션이며 실제 대출 승인 금액과 다를 수 있습니다.
          정확한 한도는 금융기관에서 확인해주세요.
        </span>
            </div>

            <TrustBadge variant="mini" />
        </div>
    );
}

/*  ╔══════════════════════════════════════════════════════════╗
    ║  STEP 5: 분석 중… (결과 전환)                              ║
    ║  UI: 로딩 애니메이션 + 기대감 조성                          ║
    ║                                                          ║
    ║  설계 근거:                                                ║
    ║  • 빈 로딩보다 "무엇을 분석 중인지" 보여주면                ║
    ║    사용자가 체감하는 대기 시간이 36% 감소 (NN/g)            ║
    ║  • 단계별 진행 메시지로 서비스 가치를 재확인시킴            ║
    ║  • 완료 시 confetti-like 효과로 달성감 부여                 ║
    ╚══════════════════════════════════════════════════════════╝ */

function Step5({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let timer;
        const totalDuration = ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0);
        let elapsed = 0;

        const advance = (step) => {
            if (step >= ANALYSIS_STEPS.length) {
                setDone(true);
                setProgress(100);
                setTimeout(() => onComplete?.(), 800);
                return;
            }
            setCurrentStep(step);
            const duration = ANALYSIS_STEPS[step].duration;
            const startProgress = (elapsed / totalDuration) * 100;
            elapsed += duration;
            const endProgress = (elapsed / totalDuration) * 100;

            // Animate progress
            const startTime = Date.now();
            const animateProgress = () => {
                const now = Date.now();
                const fraction = Math.min((now - startTime) / duration, 1);
                setProgress(startProgress + (endProgress - startProgress) * fraction);
                if (fraction < 1) {
                    requestAnimationFrame(animateProgress);
                }
            };
            requestAnimationFrame(animateProgress);

            timer = setTimeout(() => advance(step + 1), duration);
        };

        advance(0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
        }}>
            {/* Animated circle */}
            <div style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `conic-gradient(${palette.primary} ${progress * 3.6}deg, ${palette.primaryLight} 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 32,
                transition: "all 0.3s ease",
                boxShadow: done ? `0 0 40px ${palette.primary}40` : "none",
            }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: palette.surface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: done ? 36 : 28,
                    transition: "all 0.3s ease",
                }}>
                    {done ? "✨" : ANALYSIS_STEPS[currentStep]?.icon}
                </div>
            </div>

            {/* Status text */}
            <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: palette.textDark,
                marginBottom: 8,
                letterSpacing: "-0.02em",
            }}>
                {done ? "분석이 완료되었어요!" : ANALYSIS_STEPS[currentStep]?.text}
            </div>

            {/* Progress percentage */}
            <div style={{
                fontSize: 14,
                color: palette.textMuted,
                fontVariantNumeric: "tabular-nums",
                marginBottom: 24,
            }}>
                {Math.round(progress)}%
            </div>

            {/* Step indicators */}
            <div style={{ display: "flex", gap: 6 }}>
                {ANALYSIS_STEPS.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i <= currentStep ? 24 : 8,
                            height: 8,
                            borderRadius: 4,
                            background: i <= currentStep ? palette.primary : palette.border,
                            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── CONSENT SCREEN ──────────────────────────────────────────

/*  ╔══════════════════════════════════════════════════════════╗
    ║  동의 화면 (Step 0)                                       ║
    ║  입력 시작 직전, 인라인으로 동의를 수집                     ║
    ║                                                          ║
    ║  • 개인정보 수집·이용 동의 [필수]                          ║
    ║  • 위치정보 이용 동의 [필수]                               ║
    ║  • 정밀 분석 추가 정보 동의 [선택]                         ║
    ╚══════════════════════════════════════════════════════════╝ */

function ConsentScreen({ onAgree }) {
    const [required1, setRequired1] = useState(false);
    const [required2, setRequired2] = useState(false);
    const [optional1, setOptional1] = useState(false);

    const allRequired = required1 && required2;
    const allChecked = required1 && required2 && optional1;

    const CheckItem = ({ checked, onChange, required, label, detail }) => (
        <button
            onClick={() => onChange(!checked)}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                width: "100%",
                padding: "14px 16px",
                background: checked ? `${palette.primaryLight}33` : "transparent",
                border: "none",
                borderBottom: `1px solid ${palette.borderLight}`,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s",
            }}
        >
            <div style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: checked ? `2px solid ${palette.primary}` : `2px solid ${palette.border}`,
                background: checked ? palette.primary : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#fff",
                flexShrink: 0,
                marginTop: 1,
                transition: "all 0.2s",
            }}>
                {checked ? "✓" : ""}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: required ? palette.accent : palette.textMuted,
              letterSpacing: "0.03em",
          }}>
            {required ? "필수" : "선택"}
          </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: palette.textDark }}>
            {label}
          </span>
                </div>
                <div style={{ fontSize: 12, color: palette.textMuted, lineHeight: 1.5 }}>
                    {detail}
                </div>
                <button
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: 11,
                        color: palette.primary,
                        cursor: "pointer",
                        padding: 0,
                        marginTop: 4,
                        textDecoration: "underline",
                    }}
                >
                    전문 보기
                </button>
            </div>
        </button>
    );

    return (
        <div style={{ padding: "0 24px", paddingBottom: 100 }}>
            <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: palette.textDark,
                marginBottom: 4,
                letterSpacing: "-0.03em",
                lineHeight: 1.3,
            }}>
                시작하기 전에
            </h2>
            <p style={{
                fontSize: 14,
                color: palette.textMuted,
                marginBottom: 16,
                lineHeight: 1.5,
            }}>
                정확한 분석을 위해 동의가 필요해요
            </p>

            <TrustBadge variant="full" />

            {/* Consent items */}
            <div style={{
                borderRadius: 14,
                border: `1px solid ${palette.border}`,
                overflow: "hidden",
                marginBottom: 16,
            }}>
                {/* Select all */}
                <button
                    onClick={() => {
                        const next = !allChecked;
                        setRequired1(next);
                        setRequired2(next);
                        setOptional1(next);
                    }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: "16px",
                        background: allChecked ? `${palette.primaryLight}44` : palette.borderLight,
                        border: "none",
                        borderBottom: `1.5px solid ${palette.border}`,
                        cursor: "pointer",
                        transition: "background 0.2s",
                    }}
                >
                    <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: allChecked ? `2px solid ${palette.primary}` : `2px solid ${palette.textLight}`,
                        background: allChecked ? palette.primary : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "#fff",
                        transition: "all 0.2s",
                    }}>
                        {allChecked ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: palette.textDark }}>
            전체 동의
          </span>
                </button>

                <CheckItem
                    checked={required1}
                    onChange={setRequired1}
                    required
                    label="개인정보 수집·이용 동의"
                    detail="직장 권역, 예산 범위 · 세션 종료 시 즉시 삭제"
                />
                <CheckItem
                    checked={required2}
                    onChange={setRequired2}
                    required
                    label="위치정보 이용 동의"
                    detail="직장 주소 → 좌표 변환 (통근 계산용) · 좌표 미저장"
                />
                <CheckItem
                    checked={optional1}
                    onChange={setOptional1}
                    required={false}
                    label="정밀 분석 추가 정보 동의"
                    detail="보유 현금, 상세 소득 · 세션 종료 시 즉시 삭제"
                />
            </div>

            {/* Disclaimer */}
            <div style={{
                fontSize: 11,
                color: palette.textLight,
                lineHeight: 1.6,
                textAlign: "center",
                padding: "0 8px",
            }}>
                ℹ️ 입력하신 정보는 분석 목적으로만 사용되며 거래 연결에 사용되지 않습니다
            </div>
        </div>
    );
}

// ─── EXIT INTENT OVERLAY ─────────────────────────────────────

function ExitIntentOverlay({ currentStep, onContinue, onExit }) {
    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease",
        }}>
            <div style={{
                background: palette.surfaceWhite,
                borderRadius: "20px 20px 0 0",
                padding: "28px 24px 32px",
                width: "100%",
                maxWidth: 420,
                animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
                <div style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    background: palette.border,
                    margin: "0 auto 20px",
                }} />
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <span style={{ fontSize: 40, marginBottom: 12, display: "block" }}>🏠</span>
                    <h3 style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: palette.textDark,
                        marginBottom: 6,
                    }}>
                        여기까지만 입력해도 괜찮아요
                    </h3>
                    <p style={{
                        fontSize: 14,
                        color: palette.textMuted,
                        lineHeight: 1.5,
                    }}>
                        {currentStep >= 2
                            ? "지금까지 입력한 정보만으로도 기본 분석 결과를 볼 수 있어요"
                            : "조금만 더 입력하면 맞춤 분석 결과를 확인할 수 있어요"}
                    </p>
                </div>

                <button
                    onClick={onContinue}
                    style={{
                        width: "100%",
                        minHeight: 50,
                        borderRadius: 14,
                        border: "none",
                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.primaryDark})`,
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginBottom: 10,
                        boxShadow: `0 4px 14px ${palette.primary}40`,
                    }}
                >
                    이어서 입력하기
                </button>

                {currentStep >= 2 && (
                    <button
                        onClick={onExit}
                        style={{
                            width: "100%",
                            minHeight: 44,
                            borderRadius: 14,
                            border: `1.5px solid ${palette.border}`,
                            background: "transparent",
                            color: palette.textMuted,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        기본 분석 결과 보기
                    </button>
                )}

                <button
                    onClick={() => {}}
                    style={{
                        width: "100%",
                        padding: "12px 0",
                        background: "none",
                        border: "none",
                        fontSize: 13,
                        color: palette.textLight,
                        cursor: "pointer",
                        marginTop: 4,
                    }}
                >
                    나중에 다시 할게요
                </button>
            </div>
        </div>
    );
}

// ─── RESULT PREVIEW ──────────────────────────────────────────

function ResultPreview() {
    const [show, setShow] = useState(false);
    useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

    return (
        <div style={{
            padding: "0 24px",
            paddingBottom: 40,
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h2 style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: palette.textDark,
                    marginBottom: 6,
                    letterSpacing: "-0.03em",
                }}>
                    분석 결과가 준비되었어요
                </h2>
                <p style={{
                    fontSize: 14,
                    color: palette.textMuted,
                    lineHeight: 1.5,
                }}>
                    조건에 부합하는 단지 <span style={{ color: palette.primary, fontWeight: 700 }}>24곳</span>을 찾았어요
                </p>
            </div>

            {/* Result summary cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {/* Budget range card */}
                <div style={{
                    padding: "18px 20px",
                    background: `linear-gradient(135deg, ${palette.primaryDark}, ${palette.primary})`,
                    borderRadius: 16,
                    color: "#fff",
                }}>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8, fontWeight: 500 }}>
                        예상 예산 범위 (참고용)
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              3.5 ~ 5.2
            </span>
                        <span style={{ fontSize: 16, opacity: 0.8, fontWeight: 500 }}>억 원</span>
                    </div>
                    <div style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                    }}>
                        {["안정적 3.5억", "다소 부담 4.3억", "적극적 5.2억"].map((label, i) => (
                            <span key={i} style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                borderRadius: 6,
                                background: "rgba(255,255,255,0.15)",
                                fontWeight: 500,
                            }}>
                {label}
              </span>
                        ))}
                    </div>
                </div>

                {/* Score preview cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                        { icon: "🚇", label: "통근 편의", score: 82, rank: "상위 15%" },
                        { icon: "👶", label: "육아 인프라", score: 76, rank: "상위 22%" },
                        { icon: "🏘️", label: "안전 시설", score: 88, rank: "상위 8%" },
                        { icon: "💰", label: "가성비", score: 71, rank: "상위 28%" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            padding: "16px",
                            borderRadius: 14,
                            background: palette.surfaceWhite,
                            border: `1px solid ${palette.border}`,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 20 }}>{item.icon}</span>
                                <span style={{
                                    fontSize: 10,
                                    padding: "2px 8px",
                                    borderRadius: 100,
                                    background: `${palette.primaryLight}`,
                                    color: palette.primaryDark,
                                    fontWeight: 600,
                                }}>
                  {item.rank}
                </span>
                            </div>
                            <div style={{ fontSize: 12, color: palette.textMuted, marginBottom: 4 }}>{item.label}</div>
                            <div style={{
                                fontSize: 22,
                                fontWeight: 800,
                                color: palette.textDark,
                                fontVariantNumeric: "tabular-nums",
                            }}>
                                {item.score}
                            </div>
                            <div style={{
                                height: 4,
                                borderRadius: 2,
                                background: palette.borderLight,
                                marginTop: 8,
                                overflow: "hidden",
                            }}>
                                <div style={{
                                    height: "100%",
                                    borderRadius: 2,
                                    background: item.score >= 80 ? palette.primary : palette.primaryMid,
                                    width: `${item.score}%`,
                                    transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data source tags */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 12,
            }}>
                {["📊 국토교통부 실거래가", "🚇 ODsay 경로 API", "🏫 공공데이터포털"].map((tag, i) => (
                    <span key={i} style={{
                        fontSize: 10,
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: palette.borderLight,
                        color: palette.textMuted,
                    }}>
            {tag}
          </span>
                ))}
            </div>
            <div style={{
                fontSize: 10,
                color: palette.textLight,
                marginBottom: 20,
            }}>
                공공데이터 기반 참고용 분석 결과 · 기준일 2026.02.01
            </div>

            {/* CTA */}
            <button style={{
                width: "100%",
                minHeight: 52,
                borderRadius: 14,
                border: "none",
                background: `linear-gradient(135deg, ${palette.accent}, ${palette.accentDark})`,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 4px 14px ${palette.accent}40`,
                letterSpacing: "-0.01em",
            }}>
                지도에서 단지 탐색하기 →
            </button>

            {/* Footer disclaimer */}
            <div style={{
                textAlign: "center",
                marginTop: 24,
                padding: "16px 0",
                borderTop: `1px solid ${palette.borderLight}`,
            }}>
                <p style={{ fontSize: 10, color: palette.textLight, lineHeight: 1.6 }}>
                    본 서비스는 공공데이터 기반 정보 분석 플랫폼입니다<br />
                    부동산 중개·알선·자문 서비스가 아닙니다
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
                    {["이용약관", "개인정보처리방침", "위치정보이용약관"].map((link, i) => (
                        <button key={i} style={{
                            background: "none",
                            border: "none",
                            fontSize: 10,
                            color: palette.textLight,
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}>
                            {link}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── MAIN APP ────────────────────────────────────────────────

export default function OnboardingFlow() {
    const [phase, setPhase] = useState("consent"); // consent | onboarding | analyzing | result
    const [step, setStep] = useState(0);
    const [showExitIntent, setShowExitIntent] = useState(false);
    const [formData, setFormData] = useState({
        housingType: null,
        childPlan: null,
        address1: null,
        address2: null,
        singleIncome: false,
        salary: 0,
        cash: 0,
        debt: 0,
        debtConfirmed: false,
        monthlyBudget: 0,
    });

    const canProceed = () => {
        switch (step) {
            case 0: return formData.housingType && formData.childPlan;
            case 1: return formData.address1 && (formData.address2 || formData.singleIncome);
            case 2: return formData.salary > 0;
            case 3: return (formData.debt > 0 || formData.debtConfirmed) && formData.monthlyBudget > 0;
            default: return true;
        }
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setPhase("analyzing");
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            setPhase("consent");
        }
    };

    // Keyboard CSS animation injection
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      * { 
        box-sizing: border-box; 
        -webkit-font-smoothing: antialiased;
      }
      input::placeholder { color: #D6D3D1; }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    return (
        <div style={{
            maxWidth: 420,
            margin: "0 auto",
            background: palette.surface,
            minHeight: "100vh",
            fontFamily: '"Pretendard Variable", "Pretendard", -apple-system, system-ui, sans-serif',
            position: "relative",
            overflow: "hidden",
        }}>
            {/* ─── HEADER ─── */}
            {phase !== "analyzing" && phase !== "result" && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    position: "sticky",
                    top: 0,
                    background: `${palette.surface}F0`,
                    backdropFilter: "blur(12px)",
                    zIndex: 100,
                }}>
                    {phase === "onboarding" ? (
                        <button
                            onClick={handleBack}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: 18,
                                color: palette.textMuted,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ←
                        </button>
                    ) : (
                        <div style={{ width: 44 }} />
                    )}
                    <span style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: palette.textDark,
                    }}>
            {phase === "consent" ? "정보 동의" : STEPS[step]?.label}
          </span>
                    <button
                        onClick={() => setShowExitIntent(true)}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontSize: 18,
                            color: palette.textLight,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ─── PROGRESS BAR ─── */}
            {phase === "onboarding" && (
                <ProgressBar currentStep={step} totalSteps={STEPS.length} />
            )}

            {/* ─── STEP CONTENT ─── */}
            <div style={{ paddingTop: 8 }}>
                {phase === "consent" && (
                    <>
                        <ConsentScreen />
                        <BottomCTA
                            label="동의하고 시작하기"
                            onClick={() => { setPhase("onboarding"); setStep(0); }}
                            disabled={false}
                        />
                    </>
                )}

                {phase === "onboarding" && step === 0 && (
                    <>
                        <Step1 data={formData} onChange={setFormData} />
                        <BottomCTA
                            label="다음"
                            onClick={handleNext}
                            disabled={!canProceed()}
                            secondary="나중에 할게요"
                            onSecondary={() => setShowExitIntent(true)}
                        />
                    </>
                )}

                {phase === "onboarding" && step === 1 && (
                    <>
                        <Step2 data={formData} onChange={setFormData} />
                        <BottomCTA
                            label="다음"
                            onClick={handleNext}
                            disabled={!canProceed()}
                            secondary="여기까지만 입력하고 결과 보기"
                            onSecondary={() => setPhase("analyzing")}
                        />
                    </>
                )}

                {phase === "onboarding" && step === 2 && (
                    <>
                        <Step3 data={formData} onChange={setFormData} />
                        <BottomCTA
                            label="다음"
                            onClick={handleNext}
                            disabled={!canProceed()}
                            secondary="여기까지만 입력하고 결과 보기"
                            onSecondary={() => setPhase("analyzing")}
                        />
                    </>
                )}

                {phase === "onboarding" && step === 3 && (
                    <>
                        <Step4 data={formData} onChange={setFormData} />
                        <BottomCTA
                            label="분석 결과 보기"
                            onClick={handleNext}
                            disabled={!canProceed()}
                        />
                    </>
                )}

                {phase === "analyzing" && (
                    <Step5 onComplete={() => setPhase("result")} />
                )}

                {phase === "result" && (
                    <ResultPreview />
                )}
            </div>

            {/* ─── EXIT INTENT OVERLAY ─── */}
            {showExitIntent && (
                <ExitIntentOverlay
                    currentStep={step}
                    onContinue={() => setShowExitIntent(false)}
                    onExit={() => { setShowExitIntent(false); setPhase("analyzing"); }}
                />
            )}
        </div>
    );
}