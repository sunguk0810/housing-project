# 디자인 시스템 대안 의사결정 스코어카드 종합

## Executive Summary
분석 결과 안내: 입력 4경로 문서 기준 3축 평균 77.0→83.7(Δ+6.7)로 ‘부분 개선’. 브랜드 가이드·현행 팔레트 전체(미지정) 탓에 컬러-브랜드는 보수 산정. 면책: 참고.

## 축별 스코어카드
면책: 내부 QA 전.
|축|안|A11y35|Br25|Cost20|Dark20|총|
|---|---|---:|---:|---:|---:|---:|
|컬러|현|24|18|18|10|70|
|컬러|대|30|20|14|15|79|
|타이포|현|31|19|19|18|87|
|타이포|대|33|21|16|18|88|
|토큰|현|26|20|16|12|74|
|토큰|대|31|22|14|17|84|
컬러 정량(입력 예시 5등급, bg #0F172A): 텍스트 4.5:1 통과 60%(3/5), 비텍스트 3:1 통과 100%(5/5). citeturn0search1turn0search6  
타이포 하한(본문 ≥16px·line-height ≥150%) 유지. citeturn9search0  

## Must 구현 순서
면책: 일정·리소스 미지정.
|순|Must 17|영향|작업|리스크|
|---:|---|---|---|---|
|1|Button|높|낮|낮|
|2|Icon|높|중|중|
|3|Dialog|높|낮|낮|
|4|FormField|높|중|중|
|5|Progress|중|낮|낮|
|6|SelectionCard|중|중|중|
|7|FilterChipBar|높|중|중|
|8|SortChip|중|중|낮|
|9|MetaTagBar|중|중|낮|
|10|MapToggle|높|중|중|
|11|FavoriteBtn|높|중|중|
|12|EmptyState|중|중|낮|
|13|LoginPrompt|중|중|중|
|14|ComparisonTbl|높|높|높|
|15|PriceChart|높|높|높|
|16|CommuteCard|높|높|높|
|17|Footer|중|중|낮|

## 종합 의견, 액션, 리스크
컷오프(미지정→본 문서 정의): Δ≥8 변경, 3–7 부분 개선, <3 유지 → Δ+6.7로 ‘부분 개선’. 면책: 참고. 담당 역할: 미지정(무제한).  
액션: (1) 토큰 SSOT(:root/.dark) 고정 + @theme는 매핑만. citeturn1search3 (2) beforeInteractive는 root layout 제한 → 지도 JS SDK(고정) 로딩 단일화. citeturn10search0turn3search3 (3) 지도 타입은 ROADMAP/SKYVIEW/HYBRID 중심 → ‘지도 다크’ 미지정, 주변 UI만 다크. citeturn8view0 (4) Safety 색상은 빨강 금지, 색상 단독 의미전달 금지(라벨/아이콘 병행)·대비 자동검증(4.5/3). citeturn0search1turn0search6 면책: 정책/법무 문구 5접점 유지.