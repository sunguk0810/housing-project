import { useState } from "react";

const SECTIONS = [
  { id: "terms", label: "용어 가이드", icon: "📝" },
  { id: "consent", label: "동의 플로우", icon: "🔐" },
  { id: "trust", label: "신뢰 UI", icon: "🛡️" },
  { id: "safety", label: "안전 점수", icon: "🏘️" },
  { id: "cta", label: "외부 링크 CTA", icon: "🔗" },
  { id: "disclaimer", label: "면책 고지", icon: "⚖️" },
];

// ─── 1. TERMINOLOGY GUIDE ───
function TerminologyGuide() {
  const forbidden = [
    { bad: "추천", good: "분석 결과 안내", reason: "공인중개사법 — '추천'은 알선/중개 행위로 오인 가능", category: "핵심" },
    { bad: "알선", good: "정보 연결", reason: "공인중개사법 — 직접적 중개 용어", category: "핵심" },
    { bad: "중개", good: "정보 분석", reason: "공인중개사법 — 중개업 등록 없이 사용 불가", category: "핵심" },
    { bad: "매물 추천", good: "조건 맞춤 단지 탐색", reason: "추천 + 매물 조합 → 중개 알선 인상 강화", category: "핵심" },
    { bad: "최적 매물", good: "분석 상위 단지", reason: "단정적 표현 + 매물 조합 → 자문/알선 오인", category: "핵심" },
    { bad: "매물 문의", good: "외부 매물 보러가기", reason: "서비스가 문의 접수 주체로 오인됨", category: "CTA" },
    { bad: "상담 신청", good: "외부 사이트에서 확인", reason: "직접 상담을 제공하는 인상", category: "CTA" },
    { bad: "중개사 연결", good: "주변 중개사무소 정보", reason: "3자 연결 = 알선 행위 해당 가능", category: "CTA" },
    { bad: "대출 가능", good: "예상 대출 범위 (참고용)", reason: "금융 자문 오인, 승인 보장 인상", category: "금융" },
    { bad: "투자 수익률", good: "과거 실거래가 변동 추이", reason: "투자 자문 오인 가능", category: "금융" },
    { bad: "대출 승인 가능", good: "참고용 시뮬레이션 결과", reason: "금융 승인 보장으로 오인", category: "금융" },
    { bad: "범죄율 높음", good: "안전 편의시설 현황", reason: "지역 비하 / 명예훼손 리스크", category: "치안" },
    { bad: "위험 지역", good: "안전 인프라 보통", reason: "부정적 단정 표현 금지", category: "치안" },
    { bad: "치안 열악", good: "CCTV·가로등 보강 여지", reason: "부정적 프레이밍 → 긍정적 지표로 전환", category: "치안" },
    { bad: "가장 안전한", good: "안전 인프라 상위", reason: "절대적 단정 표현 지양", category: "치안" },
  ];

  const [filter, setFilter] = useState("전체");
  const categories = ["전체", "핵심", "CTA", "금융", "치안"];
  const filtered = filter === "전체" ? forbidden : forbidden.filter(f => f.category === filter);

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
        공인중개사법·개인정보보호법·표시광고법에 의해 서비스 전체에 적용되는 용어 매핑입니다.
        기획서·디자인·개발·QA 전 단계에서 아래 테이블을 기준으로 용어를 통제합니다.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: "6px 16px",
              borderRadius: 100,
              border: filter === c ? "1.5px solid #f97316" : "1px solid #334155",
              background: filter === c ? "rgba(249,115,22,0.12)" : "transparent",
              color: filter === c ? "#fb923c" : "#94a3b8",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ borderRadius: 12, border: "1px solid #1e293b", overflow: "hidden" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr",
          background: "#0f172a",
          padding: "12px 16px",
          gap: 12,
          borderBottom: "1px solid #1e293b",
        }}>
          <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>✕ 금지 표현</span>
          <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>✓ 대체 표현</span>
          <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>사유</span>
        </div>
        {filtered.map((item, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 2fr",
              padding: "12px 16px",
              gap: 12,
              borderBottom: i < filtered.length - 1 ? "1px solid #1e293b" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(15,23,42,0.4)",
              alignItems: "center",
            }}
          >
            <span style={{
              color: "#fca5a5",
              fontSize: 13,
              textDecoration: "line-through",
              textDecorationColor: "rgba(239,68,68,0.4)",
            }}>
              {item.bad}
            </span>
            <span style={{ color: "#86efac", fontSize: 13, fontWeight: 500 }}>{item.good}</span>
            <span style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>{item.reason}</span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20,
        padding: 16,
        borderRadius: 10,
        background: "rgba(249,115,22,0.06)",
        border: "1px solid rgba(249,115,22,0.15)",
      }}>
        <p style={{ color: "#fb923c", fontSize: 13, fontWeight: 600, margin: "0 0 8px" }}>운영 규칙</p>
        <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.8, margin: 0 }}>
          • PR/디자인 리뷰 시 금지 용어 체크리스트 자동 검사 (CI Lint 권장)<br/>
          • 마케팅 소재·푸시 알림·이메일 제목에도 동일 기준 적용<br/>
          • 외부 제휴사 콘텐츠 노출 시에도 금지 표현 필터링 필수<br/>
          • 분기 1회 전체 UI 텍스트 감사(audit) 실행
        </p>
      </div>
    </div>
  );
}

// ─── 2. CONSENT FLOW ───
function ConsentFlow() {
  const [step, setStep] = useState(0);
  const [consents, setConsents] = useState({ required: false, optional: false, location: false });

  const steps = [
    {
      title: "Step 0 — 랜딩 진입",
      subtitle: "가치 전달 우선, 동의는 아직 요청하지 않음",
      description: "사용자가 처음 서비스에 진입했을 때, 회원가입이나 동의 없이 서비스의 가치를 먼저 경험합니다.",
      mockup: (
        <div style={{ background: "#0c0f1a", borderRadius: 16, padding: 28, border: "1px solid #1e293b" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏠</div>
            <h3 style={{ color: "#f8fafc", fontSize: 18, margin: "0 0 6px", fontWeight: 700 }}>
              우리 부부에게 딱 맞는 동네 찾기
            </h3>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
              맞벌이 통근·육아·예산을 한 번에 분석하는 정보 플랫폼
            </p>
          </div>
          <div style={{
            background: "rgba(249,115,22,0.08)",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: 10,
            padding: "14px 16px",
            textAlign: "center",
            marginBottom: 16,
          }}>
            <span style={{ color: "#fb923c", fontSize: 14, fontWeight: 600 }}>
              3가지만 입력하면 바로 결과 확인 →
            </span>
          </div>
          <p style={{ color: "#475569", fontSize: 11, textAlign: "center", margin: 0 }}>
            회원가입 없이 무료로 이용 · 입력 정보 서버 미저장
          </p>
        </div>
      ),
      designNote: "핵심 패턴: Value-First. 43%의 모바일 사용자가 본인 인증에서 이탈하므로, 결과 확인까지 로그인을 요구하지 않습니다. 하단에 '서버 미저장' 메시지로 신뢰를 선제적으로 확보합니다.",
    },
    {
      title: "Step 1 — 입력 시작 직전",
      subtitle: "개인정보 동의 — 필수/선택 분리",
      description: "예산 입력 플로우 시작 전, 최소한의 동의를 인라인으로 수집합니다.",
      mockup: (
        <div style={{ background: "#0c0f1a", borderRadius: 16, padding: 24, border: "1px solid #1e293b" }}>
          <div style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 10,
            padding: 14,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ color: "#86efac", fontSize: 12, lineHeight: 1.6 }}>
              입력하신 금융 정보는 분석에만 사용되며<br/>
              <strong>서버에 저장되지 않습니다</strong>
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={consents.required}
                onChange={() => setConsents(p => ({ ...p, required: !p.required }))}
                style={{ accentColor: "#f97316", marginTop: 2 }}
              />
              <span style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.5 }}>
                <strong style={{ color: "#f97316" }}>[필수]</strong> 개인정보 수집·이용 동의
                <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>
                  수집 항목: 직장 권역, 예산 범위 · 보유 기간: 세션 종료 시 즉시 삭제
                </span>
                <span style={{ color: "#475569", fontSize: 11, textDecoration: "underline", cursor: "pointer" }}>
                  전문 보기
                </span>
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={consents.optional}
                onChange={() => setConsents(p => ({ ...p, optional: !p.optional }))}
                style={{ accentColor: "#f97316", marginTop: 2 }}
              />
              <span style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.5 }}>
                <strong style={{ color: "#94a3b8" }}>[선택]</strong> 정밀 분석을 위한 추가 정보 제공
                <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>
                  수집 항목: 보유 현금, 상세 소득 · 미동의 시 기본 분석만 제공
                </span>
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={consents.location}
                onChange={() => setConsents(p => ({ ...p, location: !p.location }))}
                style={{ accentColor: "#f97316", marginTop: 2 }}
              />
              <span style={{ color: "#e2e8f0", fontSize: 13, lineHeight: 1.5 }}>
                <strong style={{ color: "#f97316" }}>[필수]</strong> 위치정보 이용 동의
                <span style={{ color: "#64748b", fontSize: 11, display: "block" }}>
                  직장 주소 → 좌표 변환 → 통근 시간 계산 목적 · 좌표 미저장
                </span>
                <span style={{ color: "#475569", fontSize: 11, textDecoration: "underline", cursor: "pointer" }}>
                  전문 보기
                </span>
              </span>
            </label>
          </div>

          <button
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 10,
              border: "none",
              background: consents.required && consents.location ? "#f97316" : "#334155",
              color: consents.required && consents.location ? "#fff" : "#64748b",
              fontSize: 15,
              fontWeight: 600,
              cursor: consents.required && consents.location ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {consents.required && consents.location ? "분석 시작하기" : "필수 동의를 체크해주세요"}
          </button>
        </div>
      ),
      designNote: "핵심 패턴: Inline Consent. 별도 페이지 이동 없이 입력 플로우 상단에 동의를 배치합니다. 필수/선택이 시각적으로 분리되고, 각 항목의 수집 목적·보유기간이 1줄로 요약됩니다. '전문 보기'로 법적 요건을 충족하면서 화면 점유를 최소화합니다.",
    },
    {
      title: "Step 2 — 입력 플로우 (3단계)",
      subtitle: "원 퀘스천 퍼 스크린 + 프로그레스",
      description: "토스 패턴을 적용한 최소 마찰 입력. 한 화면에 하나의 질문만 표시합니다.",
      mockup: (
        <div style={{ background: "#0c0f1a", borderRadius: 16, padding: 24, border: "1px solid #1e293b" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: n <= 2 ? "#f97316" : "#1e293b",
                transition: "all 0.3s",
              }} />
            ))}
          </div>

          <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 8px" }}>2 / 3</p>
          <h3 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
            부부 합산 보유 자산은 얼마인가요?
          </h3>
          <p style={{ color: "#475569", fontSize: 12, margin: "0 0 24px" }}>
            전세 보증금 또는 매매 자기자금 범위를 계산하는 데 사용돼요
          </p>

          <div style={{
            background: "#1e293b",
            borderRadius: 10,
            padding: "16px",
            textAlign: "right",
            marginBottom: 12,
            fontSize: 24,
            fontWeight: 700,
            color: "#f8fafc",
            fontVariantNumeric: "tabular-nums",
          }}>
            1억 5,000<span style={{ color: "#64748b", fontSize: 16 }}>만 원</span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {["+1,000만", "+5,000만", "+1억", "직접 입력"].map(label => (
              <button key={label} style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
              }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "rgba(99,102,241,0.08)",
            borderRadius: 8,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 12 }}>🔒</span>
            <span style={{ color: "#818cf8", fontSize: 11 }}>이 금액은 분석 후 즉시 삭제됩니다</span>
          </div>

          <button style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: "#f97316",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}>
            다음
          </button>
        </div>
      ),
      designNote: "핵심 패턴: Progressive Disclosure + Inline Trust. 매 입력 화면마다 '왜 필요한지' 한 줄 설명, '서버 미저장' 리마인더를 배치합니다. 빠른 입력 버튼으로 모바일 키보드 의존도를 줄이고 마찰을 최소화합니다.",
    },
    {
      title: "Step 3 — 결과 확인 후",
      subtitle: "점진적 몰입 — 찜/로그인 시점",
      description: "결과를 먼저 보여준 뒤, 고가치 행동(찜, 공유)에서 자연스럽게 인증을 유도합니다.",
      mockup: (
        <div style={{ background: "#0c0f1a", borderRadius: 16, padding: 24, border: "1px solid #1e293b" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 4 }}>분석 결과가 준비되었어요!</div>
            <h3 style={{ color: "#f8fafc", fontSize: 17, margin: 0 }}>관심 단지를 저장하시겠어요?</h3>
          </div>

          <div style={{
            background: "#1e293b",
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600 }}>래미안 블레스티지</span>
              <span style={{ color: "#fb923c", fontSize: 13, fontWeight: 600 }}>종합 87점</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ background: "#0f172a", padding: "4px 10px", borderRadius: 6, color: "#94a3b8", fontSize: 11 }}>통근 A 32분</span>
              <span style={{ background: "#0f172a", padding: "4px 10px", borderRadius: 6, color: "#94a3b8", fontSize: 11 }}>통근 B 28분</span>
              <span style={{ background: "#0f172a", padding: "4px 10px", borderRadius: 6, color: "#94a3b8", fontSize: 11 }}>어린이집 3곳</span>
            </div>
          </div>

          <button style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: "#FEE500",
            color: "#191919",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}>
            <span>💬</span> 카카오로 3초 만에 시작하기
          </button>
          <button style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "1px solid #334155",
            background: "transparent",
            color: "#94a3b8",
            fontSize: 13,
            cursor: "pointer",
          }}>
            로그인 없이 계속 둘러보기
          </button>
        </div>
      ),
      designNote: "핵심 패턴: Progressive Commitment. '로그인 없이 계속'을 항상 제공하여 이탈을 방지합니다. 카카오 로그인은 찜하기·파트너 공유 등 고가치 행동 시점에서만 노출합니다.",
    },
  ];

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
        개인정보보호법·위치정보법 요건을 충족하면서 온보딩 이탈률을 최소화하는 동의 수집 플로우입니다.
        각 단계를 클릭하여 목업과 디자인 노트를 확인하세요.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto" }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: step === i ? "1.5px solid #f97316" : "1px solid #1e293b",
              background: step === i ? "rgba(249,115,22,0.1)" : "transparent",
              color: step === i ? "#fb923c" : "#64748b",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ color: "#f8fafc", fontSize: 16, margin: "0 0 4px" }}>{steps[step].title}</h3>
        <p style={{ color: "#fb923c", fontSize: 13, margin: "0 0 4px" }}>{steps[step].subtitle}</p>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px" }}>{steps[step].description}</p>
      </div>

      {steps[step].mockup}

      <div style={{
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.15)",
      }}>
        <p style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>디자인 노트</p>
        <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7, margin: 0 }}>{steps[step].designNote}</p>
      </div>
    </div>
  );
}

// ─── 3. TRUST UI ───
function TrustUI() {
  const [expanded, setExpanded] = useState(null);

  const patterns = [
    {
      id: "badge",
      title: "인라인 보안 메시지",
      desc: "데이터 비저장을 입력 맥락에서 자연스럽게 전달",
      mockup: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
            background: "rgba(34,197,94,0.06)", borderRadius: 10, border: "1px solid rgba(34,197,94,0.12)"
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🔒</div>
            <div>
              <p style={{ color: "#86efac", fontSize: 13, fontWeight: 600, margin: 0 }}>입력 정보 비저장</p>
              <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>분석 후 즉시 삭제 · 서버에 금융 정보를 보관하지 않아요</p>
            </div>
          </div>
          <p style={{ color: "#475569", fontSize: 11, margin: 0, padding: "0 4px" }}>
            ✓ 배치 위치: 금융 정보 입력 폼 상단<br/>
            ✓ 반복 노출: 각 입력 화면 하단에 축약형(🔒 아이콘+한줄)으로 리마인드
          </p>
        </div>
      ),
    },
    {
      id: "source",
      title: "데이터 출처 인라인 태그",
      desc: "결과 카드마다 출처·기준일을 매끄럽게 통합",
      mockup: (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600 }}>래미안 블레스티지</span>
            <span style={{ color: "#fb923c", fontSize: 20, fontWeight: 700 }}>87</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ background: "#0f172a", padding: "3px 8px", borderRadius: 4, color: "#94a3b8", fontSize: 10 }}>
              📊 국토교통부 실거래가 · 2026.02
            </span>
            <span style={{ background: "#0f172a", padding: "3px 8px", borderRadius: 4, color: "#94a3b8", fontSize: 10 }}>
              🚇 ODsay 경로 API
            </span>
            <span style={{ background: "#0f172a", padding: "3px 8px", borderRadius: 4, color: "#94a3b8", fontSize: 10 }}>
              🏫 공공데이터포털 보육시설
            </span>
          </div>
          <p style={{ color: "#475569", fontSize: 10, margin: 0 }}>
            데이터 기준일: 2026.02.01 · 실거래 반영까지 최대 30일 소요
          </p>
        </div>
      ),
    },
    {
      id: "method",
      title: "점수 방법론 계층적 공개",
      desc: "ⓘ → 1줄 요약 → 전체 방법론의 3단계 공개",
      mockup: (
        <div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: 14, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>통근 편의</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>82</span>
                <span style={{ color: "#475569", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>ⓘ</span>
              </div>
            </div>
            <div style={{ background: "#0f172a", height: 6, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
              <div style={{ width: "82%", height: "100%", background: "linear-gradient(90deg, #f97316, #fb923c)", borderRadius: 3 }} />
            </div>
          </div>
          <div style={{
            background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)",
            borderRadius: 10, padding: 12,
          }}>
            <p style={{ color: "#fb923c", fontSize: 11, fontWeight: 600, margin: "0 0 6px" }}>통근 편의 점수 산출 근거</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>🚇 지하철 도보 5분</span>
                <span style={{ color: "#22c55e", fontSize: 11 }}>+15</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>🔄 배우자 직장 환승 1회</span>
                <span style={{ color: "#22c55e", fontSize: 11 }}>+12</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>⏰ 출근 시간대 혼잡</span>
                <span style={{ color: "#ef4444", fontSize: 11 }}>-8</span>
              </div>
            </div>
            <p style={{ color: "#475569", fontSize: 10, margin: "8px 0 0", textDecoration: "underline", cursor: "pointer" }}>
              전체 방법론 보기 →
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "disclaimer-inline",
      title: "비단정 문구 패턴",
      desc: "결과 화면에 자연스럽게 녹인 면책 메시지",
      mockup: (
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 16 }}>
          <p style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>예상 대출 범위</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, padding: 10, borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: 10, margin: "0 0 2px" }}>안정적</p>
              <p style={{ color: "#86efac", fontSize: 16, fontWeight: 700, margin: 0 }}>2.1억</p>
            </div>
            <div style={{ flex: 1, padding: 10, borderRadius: 8, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: 10, margin: "0 0 2px" }}>다소 부담</p>
              <p style={{ color: "#fb923c", fontSize: 16, fontWeight: 700, margin: 0 }}>2.8억</p>
            </div>
            <div style={{ flex: 1, padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: 10, margin: "0 0 2px" }}>적극적</p>
              <p style={{ color: "#fca5a5", fontSize: 16, fontWeight: 700, margin: 0 }}>3.5억</p>
            </div>
          </div>
          <div style={{
            padding: "8px 12px", borderRadius: 8,
            background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.12)"
          }}>
            <p style={{ color: "#64748b", fontSize: 10, margin: 0, lineHeight: 1.6 }}>
              ℹ️ 참고용 시뮬레이션이며 실제 대출 승인 금액과 다를 수 있습니다.
              정확한 한도는 금융기관에서 확인해주세요.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
        "신뢰 신호는 적지만 깊게" 원칙에 따라, 과도한 배지 나열 대신 콘텐츠에 유기적으로 통합된 신뢰 패턴입니다.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {patterns.map(p => (
          <div key={p.id} style={{
            borderRadius: 12, border: "1px solid #1e293b",
            background: expanded === p.id ? "rgba(15,23,42,0.6)" : "transparent",
            transition: "all 0.2s",
          }}>
            <button
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              style={{
                width: "100%", padding: "14px 16px",
                background: "transparent", border: "none",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <p style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600, margin: 0 }}>{p.title}</p>
                <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{p.desc}</p>
              </div>
              <span style={{ color: "#475569", fontSize: 18, transform: expanded === p.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
            </button>
            {expanded === p.id && (
              <div style={{ padding: "0 16px 16px" }}>
                {p.mockup}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. SAFETY SCORE ───
function SafetyScore() {
  const [tab, setTab] = useState("good");

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
        치안 데이터를 부정적 표현 없이 효과적으로 전달하는 "안전 편의시설 현황" 프레이밍입니다.
        Good/Bad 비교로 차이를 확인하세요.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab("good")} style={{
          flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
          background: tab === "good" ? "rgba(34,197,94,0.12)" : "#1e293b",
          color: tab === "good" ? "#86efac" : "#64748b", fontSize: 13, fontWeight: 600,
        }}>
          ✓ Good Example
        </button>
        <button onClick={() => setTab("bad")} style={{
          flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
          background: tab === "bad" ? "rgba(239,68,68,0.12)" : "#1e293b",
          color: tab === "bad" ? "#fca5a5" : "#64748b", fontSize: 13, fontWeight: 600,
        }}>
          ✕ Bad Example
        </button>
      </div>

      {tab === "good" ? (
        <div style={{ background: "#0c0f1a", borderRadius: 16, padding: 20, border: "1px solid #1e293b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#f8fafc", fontSize: 15, fontWeight: 700, margin: 0 }}>안전 편의시설 현황</h3>
            <span style={{ color: "#64748b", fontSize: 11 }}>서울시 평균 대비</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {[
              { icon: "📹", label: "CCTV", value: 23, unit: "대", avg: 15, pct: 85 },
              { icon: "💡", label: "가로등 밀집도", value: null, unit: null, avg: null, pct: 72, text: "상위 28%" },
              { icon: "🏥", label: "가장 가까운 경찰서", value: 450, unit: "m", avg: 800, pct: 90 },
              { icon: "🚨", label: "비상벨", value: 8, unit: "개", avg: 5, pct: 68 },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ color: "#e2e8f0", fontSize: 13 }}>{item.icon} {item.label}</span>
                  <span style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600 }}>
                    {item.value !== null ? `${item.value}${item.unit}` : item.text}
                    {item.avg !== null && (
                      <span style={{ color: "#64748b", fontSize: 10, marginLeft: 6 }}>평균 {item.avg}{item.unit}</span>
                    )}
                  </span>
                </div>
                <div style={{ background: "#1e293b", height: 6, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${item.pct}%`, height: "100%", borderRadius: 3,
                    background: item.pct >= 80 ? "linear-gradient(90deg, #22c55e, #4ade80)"
                      : item.pct >= 60 ? "linear-gradient(90deg, #f97316, #fb923c)"
                      : "linear-gradient(90deg, #64748b, #94a3b8)",
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
          }}>
            <p style={{ color: "#86efac", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>
              안전 인프라 종합 — 수도권 상위 18%
            </p>
            <p style={{ color: "#64748b", fontSize: 10, margin: 0 }}>
              출처: 경찰청 생활안전지도 · 서울시 안전환경 데이터 · 기준일 2026.01
            </p>
          </div>

          <div style={{ marginTop: 12, padding: "0 4px" }}>
            <p style={{ color: "#22c55e", fontSize: 11, margin: "0 0 4px" }}>✓ 이 디자인이 좋은 이유:</p>
            <p style={{ color: "#475569", fontSize: 11, lineHeight: 1.7, margin: 0 }}>
              • 모든 지표가 긍정적 프레이밍 (시설 수, 거리, 밀집도)<br/>
              • 부정적 표현 없이 "서울시 평균 대비"로 상대적 위치 전달<br/>
              • 색상이 시설 충분도를 표현 (부족 = 회색, 나쁨이 아님)<br/>
              • 출처와 기준일 명시로 신뢰 확보
            </p>
          </div>
        </div>
      ) : (
        <div style={{ background: "#0c0f1a", borderRadius: 16, padding: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#fca5a5", fontSize: 15, fontWeight: 700, margin: 0, textDecoration: "line-through" }}>
              치안 위험도
            </h3>
            <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 700 }}>위험!</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
            {[
              { label: "🔴 범죄 발생률", value: "높음", issue: "부정적 단정 표현" },
              { label: "⚠️ 야간 위험도", value: "위험 지역", issue: "지역 비하" },
              { label: "📉 치안 등급", value: "D (하위 20%)", issue: "순위형 비하" },
              { label: "🚨 범죄 빈도", value: "월 평균 12건", issue: "원시 범죄 데이터 직접 노출" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>{item.label}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#fca5a5", fontSize: 13, fontWeight: 600, textDecoration: "line-through" }}>{item.value}</span>
                  <span style={{ display: "block", color: "#ef4444", fontSize: 10 }}>⚠ {item.issue}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
          }}>
            <p style={{ color: "#fca5a5", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>
              ✕ 이 디자인의 문제점:
            </p>
            <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.7, margin: 0 }}>
              • "범죄", "위험", "열악" 등 부정적 표현 직접 사용<br/>
              • 특정 지역을 비하하는 인상 → 명예훼손·부동산가치 훼손 소지<br/>
              • 원시 범죄 데이터 노출 → 표현 방식의 법적 리스크<br/>
              • 생활안전지도 이용약관 위반 가능성
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 5. EXTERNAL LINK CTA ───
function ExternalCTA() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
        외부 매물 페이지로의 이동을 명시하면서도 자연스러운 행동을 유도하는 CTA 패턴입니다.
        공인중개사법상 "직접 중개 연결"이 아닌 "외부 정보 링크"임을 명확히 합니다.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Pattern A: Primary CTA */}
        <div>
          <p style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>PATTERN A — 결과 카드 내 CTA</p>
          <div style={{ background: "#0c0f1a", borderRadius: 12, padding: 16, border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <p style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>래미안 블레스티지 84㎡</p>
                <p style={{ color: "#fb923c", fontSize: 16, fontWeight: 700, margin: 0 }}>전세 5억 2,000만</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ background: "#0f172a", padding: "3px 8px", borderRadius: 4, color: "#94a3b8", fontSize: 10 }}>실거래 5억 1,500만 (2026.01)</span>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                border: "1px solid #334155", background: "rgba(255,255,255,0.03)",
                color: "#e2e8f0", fontSize: 13, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <span>외부 매물 보러가기</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>↗ 네이버 부동산</span>
            </button>
          </div>
        </div>

        {/* Pattern B: Multiple links */}
        <div>
          <p style={{ color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>PATTERN B — 복수 외부 플랫폼 선택</p>
          <div style={{ background: "#0c0f1a", borderRadius: 12, padding: 16, border: "1px solid #1e293b" }}>
            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>이 단지의 매물을 확인할 수 있는 외부 사이트:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "네이버 부동산", desc: "매물 12건", color: "#22c55e" },
                { name: "직방", desc: "매물 8건", color: "#3b82f6" },
              ].map((site, i) => (
                <button
                  key={i}
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "12px 14px", borderRadius: 8, border: "1px solid #1e293b",
                    background: "transparent", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: site.color }} />
                    <span style={{ color: "#e2e8f0", fontSize: 13 }}>{site.name}</span>
                    <span style={{ color: "#64748b", fontSize: 11 }}>{site.desc}</span>
                  </div>
                  <span style={{ color: "#475569", fontSize: 13 }}>↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pattern C: Bad Examples */}
        <div>
          <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>✕ 금지 패턴</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { text: "매물 문의하기", reason: "서비스가 문의 주체로 오인" },
              { text: "중개사에게 연락", reason: "3자 연결 = 알선 행위" },
              { text: "지금 바로 계약 상담!", reason: "계약/중개 행위 유도" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)",
              }}>
                <span style={{ color: "#fca5a5", fontSize: 13, textDecoration: "line-through" }}>{item.text}</span>
                <span style={{ color: "#ef4444", fontSize: 11 }}>{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: "#1e293b", borderRadius: "16px 16px 0 0", padding: 24,
            width: "100%", maxWidth: 420,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#334155", margin: "0 auto 20px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>↗</span>
              <h3 style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, margin: 0 }}>외부 사이트로 이동합니다</h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, margin: "0 0 16px" }}>
              <strong style={{ color: "#e2e8f0" }}>네이버 부동산</strong>의 매물 상세 페이지로 이동합니다.
              해당 페이지의 정보는 네이버 부동산이 제공하며, 본 서비스와 무관합니다.
            </p>
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 16,
              background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.12)",
            }}>
              <p style={{ color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.6 }}>
                본 서비스는 정보 분석 플랫폼이며 부동산 중개 서비스가 아닙니다.
                매물 정보의 정확성은 해당 외부 사이트에서 확인해주세요.
              </p>
            </div>
            <button onClick={() => setShowModal(false)} style={{
              width: "100%", padding: "14px", borderRadius: 10,
              border: "none", background: "#f97316", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 8,
            }}>
              네이버 부동산으로 이동 ↗
            </button>
            <button onClick={() => setShowModal(false)} style={{
              width: "100%", padding: "12px", borderRadius: 10,
              border: "1px solid #334155", background: "transparent",
              color: "#94a3b8", fontSize: 13, cursor: "pointer",
            }}>
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 6. DISCLAIMER PLACEMENT ───
function DisclaimerPlacement() {
  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
        "본 서비스는 부동산 중개 서비스가 아닌 정보 분석 서비스입니다"를 사용자 여정의 5개 접점에 배치하는 전략입니다.
        과도한 반복은 오히려 불신을 유발하므로, 맥락에 맞는 톤과 강도를 조절합니다.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          {
            where: "① 랜딩 페이지 하단 (상시 노출)",
            level: "톤: 소프트",
            mockup: (
              <div style={{ background: "#0c0f1a", borderRadius: 10, padding: 14, borderTop: "1px solid #1e293b" }}>
                <p style={{ color: "#475569", fontSize: 11, lineHeight: 1.7, margin: 0, textAlign: "center" }}>
                  본 서비스는 공공데이터 기반 정보 분석 플랫폼입니다 · 부동산 중개·알선·자문 서비스가 아닙니다<br/>
                  <span style={{ color: "#334155" }}>© 2026 서비스명 · 이용약관 · 개인정보처리방침 · 위치정보이용약관</span>
                </p>
              </div>
            ),
            note: "페이지 하단에 항상 고정. 주요 법적 링크(약관, 처리방침)와 함께 배치하여 법적 근거를 완결.",
          },
          {
            where: "② 입력 플로우 시작 시 (1회)",
            level: "톤: 중립",
            mockup: (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: "rgba(99,102,241,0.06)", borderRadius: 8, border: "1px solid rgba(99,102,241,0.12)",
              }}>
                <span style={{ fontSize: 14 }}>ℹ️</span>
                <p style={{ color: "#94a3b8", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                  입력하신 정보는 <strong style={{ color: "#e2e8f0" }}>분석 목적으로만</strong> 사용되며 거래 연결에 사용되지 않습니다
                </p>
              </div>
            ),
            note: "정보 입력을 시작하는 시점에서 '분석 도구'라는 서비스 성격을 자연스럽게 전달.",
          },
          {
            where: "③ 결과 페이지 상단 (점수 옆)",
            level: "톤: 컨텍스트 내장형",
            mockup: (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ background: "#1e293b", padding: "4px 10px", borderRadius: 6, color: "#64748b", fontSize: 10 }}>
                  📊 공공데이터 기반 분석 결과
                </span>
                <span style={{ background: "#1e293b", padding: "4px 10px", borderRadius: 6, color: "#64748b", fontSize: 10 }}>
                  기준일 2026.02.01
                </span>
                <span style={{ background: "#1e293b", padding: "4px 10px", borderRadius: 6, color: "#64748b", fontSize: 10 }}>
                  참고용 정보
                </span>
              </div>
            ),
            note: "별도 면책 문구 대신, 결과 메타 정보의 일부로 자연스럽게 배치. '공공데이터 기반 분석 결과'가 곧 면책.",
          },
          {
            where: "④ 외부 링크 클릭 모달 (매 클릭)",
            level: "톤: 명시적",
            mockup: (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.12)",
              }}>
                <p style={{ color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.6 }}>
                  본 서비스는 정보 분석 플랫폼이며 부동산 중개 서비스가 아닙니다.
                  매물 정보의 정확성은 해당 외부 사이트에서 확인해주세요.
                </p>
              </div>
            ),
            note: "외부 이동은 법적으로 가장 민감한 순간. 모달 내에 면책을 명시적으로 포함하되, 회색 톤으로 시각적 부담 최소화.",
          },
          {
            where: "⑤ 이용약관 (법적 구속력)",
            level: "톤: 법률 문서",
            mockup: (
              <div style={{ background: "#0c0f1a", borderRadius: 10, padding: 14, border: "1px solid #1e293b" }}>
                <p style={{ color: "#f8fafc", fontSize: 12, fontWeight: 600, margin: "0 0 8px" }}>제2조 (서비스의 성격)</p>
                <p style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.8, margin: 0 }}>
                  ① 본 서비스는 공공데이터 및 허가된 API를 기반으로 부동산 관련 정보를 분석·제공하는 정보 분석 플랫폼입니다.<br/>
                  ② 본 서비스는 「공인중개사법」 제2조에 따른 중개행위를 수행하지 않으며, 부동산 거래의 알선·중개·자문을 제공하지 않습니다.<br/>
                  ③ 본 서비스가 제공하는 분석 결과, 점수, 시뮬레이션은 참고용 정보이며 거래 의사결정의 최종 근거로 사용될 수 없습니다.
                </p>
              </div>
            ),
            note: "법적 구속력 있는 약관에 서비스 성격을 가장 명확하게 정의. 공인중개사법 조항 직접 인용으로 법적 방어력 확보.",
          },
        ].map((item, i) => (
          <div key={i} style={{ borderRadius: 12, border: "1px solid #1e293b", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600 }}>{item.where}</span>
              <span style={{ color: "#fb923c", fontSize: 11 }}>{item.level}</span>
            </div>
            <div style={{ padding: 16 }}>
              {item.mockup}
              <p style={{ color: "#475569", fontSize: 11, margin: "10px 0 0", lineHeight: 1.6 }}>💡 {item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ───
export default function ComplianceUXGuide() {
  const [section, setSection] = useState("terms");

  const renderSection = () => {
    switch (section) {
      case "terms": return <TerminologyGuide />;
      case "consent": return <ConsentFlow />;
      case "trust": return <TrustUI />;
      case "safety": return <SafetyScore />;
      case "cta": return <ExternalCTA />;
      case "disclaimer": return <DisclaimerPlacement />;
      default: return null;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e1a",
      color: "#e2e8f0",
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "24px 20px 16px",
        borderBottom: "1px solid #1e293b",
        background: "linear-gradient(180deg, rgba(249,115,22,0.04) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 14 }}>⚖️</span>
          <span style={{ color: "#fb923c", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Compliance UX Design Guide
          </span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#f8fafc" }}>
          규제 준수 UX 설계 가이드
        </h1>
        <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
          공인중개사법 · 개인정보보호법 · 위치정보법 · 표시광고법 대응
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        display: "flex", gap: 4, padding: "12px 16px",
        overflowX: "auto", borderBottom: "1px solid #1e293b",
        background: "#0a0e1a",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: section === s.id ? "1.5px solid #f97316" : "1px solid transparent",
              background: section === s.id ? "rgba(249,115,22,0.1)" : "transparent",
              color: section === s.id ? "#fb923c" : "#64748b",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 40px", maxWidth: 520, margin: "0 auto" }}>
        {renderSection()}
      </div>
    </div>
  );
}
