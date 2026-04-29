# 📄 Product Requirements Document (PRD)

**프로젝트명:** Portfolio-Analyzer (개인화 포트폴리오 백테스트 웹 애플리케이션)

---

## 1. 프로젝트 배경 및 목적

- **배경:** 기존 포트폴리오 백테스트 툴은 UI/UX가 직관적이지 않고, 개인화된 분석 지표나 커스텀 로직을 추가하기 어려움.
- **목적:** 트렌디하고 직관적인 UI를 제공하며, 사용자가 원하는 맞춤형 자산군과 백테스트 로직을 자유롭게 확장하고 테스트할 수 있는 개인화된 분석 환경 구축.

---

## 2. 타겟 사용자 및 개발자 컨텍스트

- **타겟 사용자:** 데이터 기반 투자를 지향하는 개인 투자자
- **개발자 프로필:** 코딩 초보자, AI 에이전트 보조(Vibe Coding) 방식으로 개발
- **AI 에이전트 행동 지침:**
  1. 파일 경로와 함께 전체 코드 블록 제공
  2. 복잡한 개념은 직관적인 비유로 단계별 설명
  3. 모듈화 코드, 하드코딩 지양

---

## 3. 기능 요구사항

### 3.1 포트폴리오 설정

| 기능 | 상태 |
|---|---|
| 자산별 비중(%) 입력 — 합계 100% 검증, 최소 단위 1 | ✅ 구현 |
| 초기 투자금 설정 | ✅ 구현 |
| 리밸런싱 주기 설정 (월/분기/연) | ✅ 구현 |
| 벤치마크 티커 설정 | ✅ 구현 |
| 포트폴리오 JSON 파일 저장/불러오기 | ✅ 구현 |
| 티커 검색 자동완성 | ⏳ Phase 2 |
| 배당 재투자 여부 설정 | ⏳ Phase 2 |

### 3.2 백테스트 엔진

| 기능 | 상태 |
|---|---|
| CAGR (연평균 복합 성장률) | ✅ 구현 |
| MDD (최대 낙폭) | ✅ 구현 |
| Sharpe Ratio (위험 조정 수익률) | ✅ 구현 |
| Volatility (연간 변동성) | ✅ 구현 |
| Best / Worst Year | ✅ 구현 |
| Alpha (시장 초과 수익률) | ✅ 구현 |
| Beta (시장 민감도) | ✅ 구현 |
| 벤치마크 CAGR 비교 | ✅ 구현 |
| 리밸런싱 시뮬레이션 (월/분기/연) | ✅ 구현 |
| 자산별 일별 가치 시계열 | ✅ 구현 |
| 상관계수 매트릭스 (Correlation Matrix) | ✅ 구현 |

### 3.3 대시보드 / 데이터 시각화

| 컴포넌트 | 상태 |
|---|---|
| 8-카드 KPI 벤토 그리드 (CAGR·MDD·Sharpe·Volatility·Best·Worst·Alpha·Beta) | ✅ 구현 |
| 포트폴리오 합산 성장 AreaChart | ✅ 구현 |
| 자산별 개별 성과 라인 차트 (범례 토글) | ✅ 구현 |
| 낙폭 AreaChart | ✅ 구현 |
| 자산 배분 도넛 파이 차트 | ✅ 구현 |
| 상관계수 히트맵 (자산 간 매트릭스) | ✅ 구현 |

---

## 4. 기술 스택

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + Tailwind CSS v3 + Recharts + Shadcn UI |
| Backend | FastAPI (Python 3.12, async) |
| Database | TimescaleDB (time-series optimized) |
| Data | yfinance |
| Infrastructure | Docker + WSL2 |

---

## 5. 소프트웨어 아키텍처 (Clean Architecture)

의존성 규칙: `Presentation → Application → Domain ← Infrastructure`

```
backend/
├── domain/          # 순수 비즈니스 로직 (계산 함수, 엔티티)
├── application/     # 유스케이스 + Repository 인터페이스
├── infrastructure/  # yfinance 어댑터, DB 어댑터
└── presentation/    # FastAPI 라우터 + Pydantic 스키마

frontend/
└── src/
    ├── app/         # Next.js App Router 페이지
    ├── components/  # PortfolioForm, BacktestCharts
    └── lib/api.ts   # 타입 정의 + API 클라이언트
```

---

## 6. 디자인 시스템 — Midnight Forest

> 깊은 숲 속 새벽을 시각화한다

| 의미 | 색상 |
|---|---|
| 수익 · 성장 | Emerald `#10b981 / #34d399` |
| 리스크 · 손실 | Rose `#fb7185 / #f43f5e` |
| 안정 · 중립 | Amber `#fbbf24 / #f59e0b` |
| 배경 | Slate-950 `#020617` |
| 카드 | `rgba(15,23,42,0.6)` + `backdrop-blur` |

**원칙:** Depth over Flatness · Signal over Noise · Calm Confidence · Breathing Room

---

## 7. Phase 2 (향후 확장)

- 티커 자동완성 검색
- 배당 재투자 시뮬레이션
- 매크로 경제 지표(금리, 환율) 연동3
- 백테스트 결과 기반 LLM 인사이트 리포트
- 다중 포트폴리오 동시 비교
- 클라우드 포트폴리오 저장 (로그인 연동)
