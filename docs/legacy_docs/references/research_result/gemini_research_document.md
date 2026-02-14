# **신혼부부 맞춤형 주거 추천 서비스: 시장성 검증, 데이터 타당성 및 MVP 구축 전략 보고서**

## **1\. 서론: 프롭테크 시장의 구조적 변화와 신혼부부 세그먼트의 재발견**

2025년 현재 대한민국 부동산 시장은 거시경제적 변동성과 인구통계학적 변화가 맞물려 새로운 국면에 접어들었다. 과거의 부동산 서비스가 단순한 매물 정보의 비대칭성을 해소하는 데 주력했다면, 이제는 범람하는 정보 속에서 사용자의 맥락(Context)에 부합하는 최적의 의사결정을 지원하는 큐레이션(Curation) 단계로 진화하고 있다. 특히 신혼부부 계층은 생애 최초 주택 마련(First-time Home Buyer)이나 첫 독립 가구 형성이라는 중대한 전환점에 서 있음에도 불구하고, 기존의 범용 프롭테크 플랫폼에서 겪는 정보 탐색 비용과 의사결정의 비효율이 극심한 상황이다. 본 보고서는 서울 및 수도권 아파트 시장을 타겟으로 하는 '신혼부부 맞춤형 주거 추천 서비스'의 시장 진입 타당성을 검증하고, 경쟁 우위를 확보하기 위한 데이터 전략과 MVP(Minimum Viable Product) 실행 계획을 상세히 기술한다.

### **1.1. 거시적 주거 환경 분석**

통계청과 국토교통부의 최신 주거실태조사 결과에 따르면, 2024년 기준 수도권의 자가 보유율은 61.4%로 소폭 상승하였으나, 소득 대비 주택 가격 비율(PIR, Price to Income Ratio)은 8.7배를 기록하며 여전히 높은 수준을 유지하고 있다.1 이는 수도권 거주자가 소득을 한 푼도 쓰지 않고 8.7년을 모아야 집을 살 수 있다는 의미로, 자산 축적 기간이 짧은 신혼부부에게는 진입 장벽이 매우 높음을 시사한다. 더욱이 서울의 경우 자가 거주 가구의 평균 거주 기간은 11.6년인 반면, 임차 가구는 3.7년에 불과해 주거 안정성의 격차가 심화되고 있다.2 이러한 잦은 이주는 신혼부부에게 매몰 비용(중개수수료, 이사비용)과 심리적 불안정을 야기하며, '실패하지 않는 한 번의 선택'에 대한 강박을 강화하는 요인으로 작용한다.

또한, 최근 전세 사기 이슈와 역전세난 등으로 인해 보증금 미반환 위험이 사회적 문제로 대두되면서, 신혼부부들은 단순한 '가격' 정보 외에 '자산 안전성'과 '권리 분석'에 대한 니즈가 급증하고 있다. 기존 플랫폼들이 제공하는 단순 시세 정보만으로는 이러한 불안을 해소하기에 역부족이며, 사용자의 재무 상태와 대출 가능 한도(DSR, LTV)를 종합적으로 고려한 '금융 결합형 주거 추천'이 필수적인 시점이다.

### **1.2. 신혼부부 페르소나와 페인 포인트(Pain Point) 심층 진단**

신혼부부 주거 탐색 과정에서의 핵심적인 문제는 '이중 제약 조건(Double Constraint)'의 충돌에서 발생한다.

첫째, **이중 통근(Dual Commute)의 딜레마**이다. 맞벌이 부부가 보편화됨에 따라 두 직장 간의 물리적 거리와 통근 시간을 동시에 만족시키는 입지를 찾는 것은 고차 방정식과 같다. 기존 앱들은 단일 위치 기준의 필터링에 최적화되어 있어, 두 지점의 '중간 지점' 혹은 '통근 시간 합의 최소화 지점'을 직관적으로 탐색하기 어렵다.3 둘째, \*\*예산의 불확실성(Financial Uncertainty)\*\*이다. 부부 합산 소득과 보유 자산, 그리고 정부 지원 대출(신생아 특례, 디딤돌 등)의 적용 여부에 따라 가용 예산은 천차만별이다. 그러나 대부분의 플랫폼은 '매매가/전세가'라는 절대 수치로만 매물을 분류하여, 실제 구매력(Purchasing Power) 기반의 탐색을 저해한다. 셋째, \*\*정성적 요인의 비가시성(Invisibility of Qualitative Factors)\*\*이다. 치안, 학군, 동네 분위기 등은 데이터화하기 어려운 정성적 요소이나, 예비 부부에게는 가격만큼이나 중요한 결정 기준이다. 특히 여성 1인 가구 경험이 있는 배우자의 경우 치안 데이터에 민감하며, 이는 최근 수도권에서 빈번한 카메라 이용 촬영 범죄 등의 통계와도 연결된다.4

## ---

**2\. 경쟁사 분석 (Competitive Landscape Analysis)**

국내 프롭테크 시장은 이미 성숙기에 진입하여 다수의 플레이어가 경쟁하고 있으나, 각 서비스의 지향점과 타겟 유저가 명확히 구분된다. 본 서비스의 차별화 전략 수립을 위해 주요 경쟁사 8곳을 4가지 카테고리로 분류하여 심층 분석한다.

### **2.1. 시장 지배적 범용 플랫폼 (Market Dominant Generalists)**

#### **① 네이버 부동산 (Naver Real Estate)**

네이버 부동산은 국내 부동산 시장의 가장 거대한 데이터 댐이자, 사실상의 표준(De-facto Standard)이다.

* **강점:** 압도적인 매물 데이터베이스(DB)와 검색 트래픽을 보유하고 있다. 공인중개사들이 매물을 등록하는 1차 채널이므로 매물의 신선도와 커버리지가 가장 높다. 학군 배정 정보, 단지 정보 등 기초 데이터가 탄탄하다.  
* **약점:** 사용자 경험(UX)이 공급자(중개사) 중심이다. 리스트 형태의 나열식 정보 제공으로 인해, 사용자가 직접 수많은 매물을 클릭하고 비교해야 하는 수고가 든다. 개인화된 추천 알고리즘이나 큐레이션 기능은 전무하다시피 하다.5  
* **신혼부부 관점의 한계:** "어디에 살아야 할지"를 모르는 초기 단계의 신혼부부에게는 네이버 부동산의 방대한 데이터가 오히려 정보 과부하(Information Overload)를 유발한다.

#### **② 직방 (Zigbang)**

모바일 기반 부동산 정보 서비스의 선구자로, 원룸/오피스텔에서 시작해 아파트, 빌라로 영역을 확장했다.

* **강점:** '3D 단지 투어', 'VR 홈투어' 등 시각적 기술력에 강점이 있다. 모바일 친화적인 UI/UX를 갖추고 있으며, 최근에는 '우리집 내놓기' 등 중개 시장 직접 진출을 시도하고 있다. ODsay API 등을 활용한 대중교통 길찾기 연동이 잘 되어 있다.6  
* **약점:** 아파트보다는 원룸/오피스텔 이미지가 여전히 강하며, 허위 매물 이슈에서 자유롭지 못하다. 추천 로직이 단순 필터링 수준에 머물러 있어 복합적인 조건(직장 2곳, 육아 환경 등)을 반영하지 못한다.  
* **신혼부부 관점의 한계:** 아파트 매매/전세를 고려하는 신혼부부에게는 정보의 깊이(Depth)가 부족하다. 특히 자산 설계를 포함한 컨설팅 기능이 약하다.

#### **③ 호갱노노 (Hogangnono)**

실거래가 기반의 아파트 정보 제공으로 급성장한 서비스이다.

* **강점:** 가장 직관적인 지도 기반 UI를 제공한다. '실시간 인기 아파트', '이야기(입주민 커뮤니티)' 기능이 강력하여 단지의 실질적인 장단점을 파악하기 좋다. 출근 시간 필터 기능을 제공하나, 단일 목적지 기준이다.3  
* **약점:** 매물 리스팅 기능이 네이버 부동산에 비해 약하다. 커뮤니티 정보는 주관적 의견이 많아 데이터의 객관성을 담보하기 어렵다. 필터링 조건이 '가격', '평형', '입주년차' 등 물리적 속성에 집중되어 있다.  
* **신혼부부 관점의 한계:** 맞벌이 부부를 위한 '중간 지점 찾기' 기능이 부재하며, 대출 규제 등을 반영한 실질 예산 기반 검색이 어렵다.

#### **④ KB부동산 (KB Real Estate)**

금융권(KB국민은행)이 운영하는 플랫폼으로, 시세 데이터의 공신력이 높다.

* **강점:** KB시세는 주택담보대출의 기준이 되므로, 예산 수립 단계에서 필수적인 앱이다. 대출 계산기, 세금 계산기 등 금융 유틸리티 기능이 강력하다.7  
* **약점:** 앱의 구동 속도가 느리고 UI/UX가 보수적이다. MZ세대 신혼부부가 선호하는 직관적이고 감성적인 인터페이스와는 거리가 있다.  
* **신혼부부 관점의 한계:** '금융'에는 강하지만 '생활'에는 약하다. 치안, 맛집, 학군 등 정성적 생활 정보와의 결합이 부족하다.

### **2.2. 데이터 분석 특화 플랫폼 (Data Analytics Specialists)**

#### **⑤ 리치고 (Richgo)**

빅데이터 기반의 부동산 투자 분석 플랫폼이다.

* **강점:** '거주 점수'와 '투자 점수'를 분리하여 제공하는 독창적인 모델을 보유하고 있다. 플라, 전세가율, 공급 물량 등 다양한 시장 지표를 시각화하여 보여준다.8  
* **약점:** 초보자가 해석하기에는 데이터가 너무 전문적이고 방대하다. '매물' 추천보다는 '지역/단지' 분석에 초점이 맞춰져 있어, 실제 거래 가능한 매물을 찾는 단계에서는 효용성이 떨어진다.  
* **신혼부부 관점의 한계:** 실거주 목적이 강한 신혼부부에게 '향후 4년 뒤 가격 예측' 등의 투자 지표는 우선순위가 낮을 수 있다.

#### **⑥ 아실 (Asil \- 아파트실거래가)**

갭투자자, 다주택자 등 전문 투자자들이 애용하는 앱이다.

* **강점:** 여러 단지의 가격 추이를 한 화면에서 비교하거나, 등기부등본 변동 사항을 추적하는 등 비교 분석 기능이 탁월하다. 학군(특목고 진학률) 데이터가 상세하다.  
* **약점:** 철저히 투자자 중심의 UI로 구성되어 있다. 생활 편의성보다는 자산 가치 상승 가능성에 초점이 맞춰져 있다.  
* **신혼부부 관점의 한계:** "살기 좋은 곳인가?"에 대한 답을 얻기보다는 "오를 곳인가?"에 대한 답을 주는 서비스이다.

### **2.3. 니치 마켓 및 신규 플레이어 (Niche & Emerging Players)**

#### **⑦ 내집찾기 (Find My House) 및 유사 스타트업**

개인화된 중개사 매칭이나 AI 추천을 표방하는 초기 단계 스타트업들이다.

* **강점:** 사용자의 구체적인 니즈(반려동물 가능, 남향 필수 등)를 입력받아 맞춤형 매물을 제안한다.10  
* **약점:** 데이터 커버리지가 서울 강남권 등 특정 지역에 국한되는 경우가 많다. 자동화된 알고리즘보다는 인력 기반의 운영(Concierge)에 의존하는 모델이 많아 확장성(Scalability)에 한계가 있다.

#### **⑧ 다방 (Dabang)**

원룸/투룸 전월세 시장의 강자이다.

* **강점:** 대학생, 사회초년생 등 1인 가구 타겟 마케팅에 능하다.  
* **약점:** 아파트 매물 데이터가 상대적으로 빈약하다. 신혼부부의 주거 형태 선호도(아파트 50% 이상)와 괴리가 있다.

| 경쟁사 | 포지셔닝 | 타겟 사용자 | 신혼부부 적합도 | 핵심 결핍 요인 (Gap) |
| :---- | :---- | :---- | :---- | :---- |
| **네이버 부동산** | Data Repository | 전 국민/중개사 | 하 | 개인화 부재, 능동적 탐색 요구 |
| **직방** | Mobile Portal | 1-2인 가구 | 중 | 아파트 심층 정보 부족, 단순 필터 |
| **호갱노노** | Community Map | 실거주자 | 중 | 이중 통근 알고리즘 부재 |
| **KB부동산** | Finance Tool | 대출 필요자 | 상 | UX 낙후, 생활/안전 정보 미흡 |
| **리치고** | AI Analyst | 투자자 | 중 | 높은 진입 장벽, 매물 연동 약함 |
| **아실** | Investor Tool | 갭투자자 | 하 | 실거주 감성 데이터 부재 |
| **내집찾기** | Concierge | 고관여 수요층 | 상(잠재) | 지역 확장성 한계 |

## ---

**3\. 데이터 소스 타당성 및 기술적 아키텍처 (Data Strategy)**

성공적인 추천 모델은 신뢰할 수 있는 데이터의 확보와 효율적인 처리에서 시작된다. 본 서비스는 공공 데이터의 광범위한 커버리지와 민간 API의 정밀함을 결합하는 하이브리드 전략을 채택한다.

### **3.1. 매물 및 시세 데이터: 실시간성과 신뢰도의 균형**

* **소스:** 국토교통부 실거래가 Open API 5, 공공데이터포털 건축물대장, KB시세(제휴 필요).  
* **타당성 분석:** 국토교통부 데이터는 법적 효력이 있는 실거래 정보를 제공하며, 아파트/연립/다세대의 지번 정보까지 포함하여 정확한 위치 매핑이 가능하다.5 그러나 실거래 신고 기한(계약 후 30일)으로 인해 시차(Time-lag)가 발생하며, 현재 시장에 나와 있는 '호가'를 반영하지 못한다.  
* **전략:**  
  1. **기준 가격 설정:** 국토부 실거래가(최근 3개월 평균)와 KB시세(대출 기준)를 혼합하여 해당 단지의 '적정 시세 범위'를 산출한다.  
  2. **매물 연동:** 직접 크롤링은 네이버 등의 약관 위반 소지가 있으므로, 사용자가 특정 단지를 선택했을 때 해당 단지의 네이버 부동산 매물 리스트 페이지로 아웃링크(Deep Link)를 제공하는 방식을 채택하여 법적 리스크를 회피하고 데이터 관리 비용을 절감한다.

### **3.2. 교통 및 통근 데이터: 다대다(N:M) 매칭의 최적화**

* **소스:** ODsay(대중교통) 6, SK Tmap / Kakao Mobility API(자차).  
* **타당성 분석:** ODsay는 국내 대중교통 노선, 정류장, 환승 정보를 망라하는 표준 API로, 직방 등 주요 프롭테크 기업에서도 활용 중이다.6 정확도는 높으나, 매 요청 시 비용이 발생하는 구조적 문제가 있다.  
* **기술적 이슈:** 사용자 A(직장 X)와 사용자 B(직장 Y)가 접속할 때마다 수만 개의 아파트 단지와의 경로를 실시간 계산하면 막대한 Latency와 비용이 발생한다.  
* **해결 전략 (Pre-calculation):** 서울 및 수도권을 약 500개 주요 권역(Hexagon Grid)으로 나누고, 주요 업무 지구(GBD, YBD, CBD, 판교, 마곡 등)와의 통근 시간을 미리 계산하여 데이터베이스에 적재한다. 실시간 요청 시에는 정확한 좌표 계산 대신 그리드 기반의 근사치를 먼저 제시하고, 상세 조회 시에만 정밀 API를 호출한다.

### **3.3. 치안 및 안전 데이터: 정량 지표와 체감 안전의 결합**

* **소스:** 생활안전지도 API 11, 경찰청 범죄 발생 통계 4, 지자체 CCTV 설치 현황(공공데이터포털).12  
* **타당성 분석:**  
  * **CCTV:** 계룡시 등 지자체별로 개방된 CCTV 데이터를 활용하면 위도/경도, 화소 수, 설치 목적(방범/교통) 파악이 가능하다.12  
  * **범죄 통계:** 경찰청 데이터는 시/군/구 단위로 제공되며, 특히 수도권에서 급증하는 카메라 이용 촬영 범죄 등의 유형별 분석이 가능하다.4  
  * **생활안전지도:** 여성 인구 비율, 1인 가구 밀도 등을 변수로 한 회귀 분석을 통해 산출된 가중치 데이터를 활용할 수 있다.13  
* **전략:** 단순히 범죄 발생 건수만 보여주는 것은 인구 밀도가 높은 지역(강남 등)을 위험 지역으로 오인하게 만든다. 따라서 \*\*'인구 10만 명당 5대 범죄 발생률'\*\*로 정규화(Normalization)하고, CCTV 밀도와 가로등 조도(가능 시)를 '안전 인프라 점수'로 가산하여 \*\*\[범죄 위험도 \- 안전 인프라 \= 최종 안전 지수\]\*\*를 산출한다.

### **3.4. 학군 및 보육 데이터: 신혼부부 맞춤형 필터링**

* **소스:** 학교알리미(교육부), 유치원 알리미, 어린이집 정보공개 포털.14  
* **타당성 분석:** 학교/유치원의 위치, 학생 수, 교원 현황 데이터는 무료로 접근 가능하다.  
* **전략:** 신혼부부에게는 '서울대 진학률'보다 **'국공립 어린이집 대기 기간'**, **'단지 내 가정 어린이집 유무'**, **'초품아(초등학교를 품은 아파트)'** 여부가 훨씬 중요한 결정 요인이다. 따라서 데이터를 가공할 때 보육 시설의 '접근성(도보 거리)'과 '수용력(정원 충족률)'에 가중치를 둔다.

## ---

**4\. 점수화 모델(Scoring Model) 상세 설계**

사용자의 입력 조건에 따라 각 아파트 단지에 개인화된 점수를 부여하는 다면 평가 모델을 설계한다. 이 모델의 핵심은 사용자가 중요하게 생각하는 가치(예: 통근이 제일 중요 vs 예산 방어가 제일 중요)에 따라 가중치(![][image1])가 동적으로 변화한다는 점이다.

![][image2]  
여기서 ![][image3] 이다.

### **4.1. ![][image4]: 자산 효율성 점수 (Financial Efficiency)**

단순히 저렴한 집이 아니라, 사용자의 가용 자산(Equity \+ Debt)을 최대한 효율적으로 활용할 수 있는 매물을 찾는다.

* **Input:** 부부 합산 연봉, 보유 현금, 예상 대출 금리(COFIX 연동).  
* **Algorithm:**  
  1. **DSR 계산:** 연봉 기반 DSR 40% 한도 내 최대 대출 가능액(![][image5]) 산출.  
  2. **최대 예산 설정:** Budget ![][image6].  
  3. **구간 점수화:**  
     * 단지 시세(![][image7])가 ![][image8] 초과 시: Score \= 0 (Hard Filter).  
     * ![][image9]: Score \= 100 (레버리지 효과 극대화 및 상급지 진입).  
     * ![][image10]: Score \= ![][image11] (너무 저렴하면 주거 환경이 열악할 가능성 반영).

### **4.2. ![][image12]: 이중 통근 균형 점수 (Commute Balance)**

두 사람 모두의 고통을 최소화하는 지점을 찾는다. 통근 시간의 고통은 선형적이지 않고 지수적으로 증가함(30분은 쾌적, 60분은 피곤, 90분은 지옥)을 반영한다.

* **Input:** 직장 A, B 위치, 선호 수단(대중교통/자차).  
* **Algorithm:**  
  * **![][image13]**: 각 직장까지의 소요 시간 (분).  
  * **Penalty Function:** ![][image14] (시간이 늘어날수록 페널티가 급격히 증가).  
  * **Score Formula:**  
    ![][image15]  
    * ![][image16]: 총 통근 고통의 합을 줄이는 계수.  
    * ![][image17]: 두 사람 간의 통근 시간 격차(불공평)를 줄이는 계수. (독박 통근 방지).

### **4.3. ![][image18]: 안심 주거 점수 (Safety Index)**

* **Input:** 성별, 자녀 유무 (가중치 조절용).  
* **Algorithm:**  
  * **Base Score:** 100점.  
  * **감점 요인:** 지역구 5대 범죄율 상위 20% (-10점), 유해 시설(유흥주점 등) 반경 500m 내 존재 (-5점/개).  
  * **가산 요인:** CCTV 밀도 상위 20% (+5점), 파출소/지구대 반경 500m 내 (+5점), 단지 내 보안 시스템(경비원, 현관 보안 등 \- 크롤링 데이터) 유무.  
  * **생활안전지도 연동:** 생활안전지도의 범죄주의구간 등급(1\~5등급)을 역산하여 1등급 지역에 가산점 부여.13

### **4.4. ![][image19]: 생활/육아 편의 점수**

* **Logarithmic Scaling:** 편의점 개수가 1개에서 2개 될 때의 효용이 10개에서 11개 될 때보다 큼을 반영하여 로그 함수 적용.  
* **육아 가중치:** '예비 부부' 또는 '자녀 있음' 선택 시, 국공립 어린이집 및 소아과 접근성 점수의 비중을 2배로 상향.

## ---

**5\. 수요 검증 설계 (Demand Verification Strategy)**

서비스 개발 전, 가설("신혼부부는 기존 앱에 만족하지 못하며, 맞춤형 추천에 지불 용의 혹은 사용 의지가 있다")을 검증한다.

### **5.1. 정성적 검증: 심층 인터뷰 (In-depth Interview)**

* **대상:** 결혼 예정이거나 결혼 2년 차 이내의 신혼부부 10쌍 (맞벌이 7쌍, 외벌이 3쌍).  
* **Recruiting:** 웨딩 관련 커뮤니티(다이렉트 결혼준비 등) 및 사내 게시판 활용.  
* **Key Questions & Hypothesis:**  
  1. "신혼집을 구할 때 배우자와 가장 많이 다툰 이유는 무엇인가?" \-\> *가설: 통근 거리 불균형과 예산 현실성 문제.*  
  2. "네이버 부동산/직방을 보면서 엑셀을 따로 만들었는가? 만들었다면 어떤 항목을 적었는가?" \-\> *가설: 기존 앱이 제공하지 않는 '실제 대출 이자', '도어-투-도어 통근 시간' 등을 수기로 계산하고 있을 것이다.*  
  3. "치안 정보를 확인하기 위해 밤에 해당 동네를 가보았는가?" \-\> *가설: 정량적 데이터 부족으로 인한 발품의 비효율 발생.*

### **5.2. 정량적 검증: 랜딩 페이지 스모크 테스트 (Smoke Test)**

* **Channel:** 인스타그램/페이스북 타겟 광고 (관심사: 웨딩, 인테리어, 신혼여행).  
* **A/B Test Variables:**  
  * **A안 (편의성 소구):** "두 사람 직장의 딱 중간, 3초 만에 찾아드립니다."  
  * **B안 (불안 소구):** "신혼집 잘못 구하면 2년이 괴롭습니다. 치안/전세사기 걱정 없는 안전한 집 추천."  
* **Landing Page Structure:**  
  * Hero Section: 핵심 카피.  
  * Input: 직장 위치 2곳, 예산 범위 (간략).  
  * CTA (Call to Action): "무료 추천 리포트 받기" (이메일 입력).  
* **Success Metrics:**  
  * **CTR (Click Through Rate):** 2.0% 이상 (평균 상회 기준).  
  * **CVR (Conversion Rate):** 랜딩 방문자 중 이메일 제출 비율 15% 이상.  
  * **CAC (Customer Acquisition Cost):** DB 1건당 획득 비용 5,000원 이하.

## ---

**6\. MVP 범위 및 구축 로드맵 (Scope & Roadmap)**

한정된 자원(리소스)과 시간(8-12주) 내에 시장 진입을 위한 최소 기능을 구현한다. 핵심은 '자동화'와 '수동화'의 적절한 배합이다.

### **6.1. MVP Feature Scope (선택과 집중)**

| 구분 | 포함 (In-Scope) | 제외 (Out-of-Scope) | 이유 |
| :---- | :---- | :---- | :---- |
| **지역** | 서울 전체 \+ 성남(분당), 과천, 하남 | 수도권 전체 | 데이터 정제 및 통근 계산 부하 최소화 |
| **대상** | 아파트 (100세대 이상) | 빌라, 오피스텔, 단독주택 | 데이터 표준화 용이성, 신혼부부 선호도 |
| **통근** | 대중교통 시간 (ODsay), 자차 거리 | 실시간 교통 체증 반영 | 기술적 복잡도 높음, MVP 단계 불필요 |
| **시세** | 국토부 실거래가 \+ KB시세 | 실시간 호가 크롤링 | 법적 이슈 및 개발 공수 과다 |
| **결과** | 추천 단지 리스트 \+ 상세 스코어 | AI 챗봇 상담, 등기부등본 발급 | 핵심 가치(추천)에 집중 |

### **6.2. 12주 실행 로드맵 (Weekly Roadmap)**

* **Phase 1: 기획 및 데이터 파이프라인 (Week 1-4)**  
  * Week 1: 요구사항 정의서(PRD) 확정, UI 와이어프레임 설계.  
  * Week 2: 데이터베이스 스키마 설계 (User, Apartment, Commute\_Grid).  
  * Week 3: 공공 데이터(국토부, 안전지도, 학교) 수집 및 ETL(Extract, Transform, Load) 구축.  
  * Week 4: 주요 업무 지구(강남, 여의도, 광화문 등 30개 스팟) 기준 통근 시간 프리셋(Preset) 데이터 생성.  
* **Phase 2: 핵심 로직 개발 및 프론트엔드 (Week 5-9)**  
  * Week 5: 스코어링 알고리즘(![][image20]) 구현 및 파라미터 튜닝.  
  * Week 6: 프론트엔드 지도 연동 (Kakao Map SDK 활용) 및 필터 UI 개발.  
  * Week 7: 결과 리포트 페이지 개발 (차트 라이브러리 활용 시각화).  
  * Week 8: 로그인/회원가입 및 사용자 입력 폼 개발.  
  * Week 9: 통합 테스트 및 버그 수정.  
* **Phase 3: 검증 및 출시 (Week 10-12)**  
  * Week 10: FGT (Focus Group Test) \- 지인 및 커뮤니티 모집 20명 대상.  
  * Week 11: 피드백 반영 UI 개선 및 데이터 오류 수정.  
  * Week 12: 서비스 런칭, 보도자료 배포, 퍼포먼스 마케팅 시작.

## ---

**7\. 결론 및 제언 (Conclusion)**

본 리서치를 통해 확인된 바, 신혼부부를 위한 주거 추천 서비스는 명확한 시장의 니즈(Unmet Needs)가 존재한다. 기존의 거대 플랫폼들은 '정보의 바다'를 제공하지만, 신혼부부는 그 바다를 항해할 '나침반'을 원한다.

**성공을 위한 핵심 제언:**

1. **데이터의 스토리텔링:** 단순히 "안전 점수 80점"이라고 보여주는 것이 아니라, "이 지역은 최근 1년간 5대 범죄 발생률이 서울 평균 대비 20% 낮으며, 귀갓길 500m 내에 CCTV가 15대 설치되어 있습니다"와 같이 구체적이고 체감 가능한 맥락(Context)을 전달해야 한다.  
2. **금융 컨시어지 강화:** MVP 이후 고도화 단계에서는 주택담보대출 상품 비교 및 특례보금자리론 적용 여부 시뮬레이션을 추가하여, 사용자가 '돈 걱정'을 덜 수 있도록 돕는 핀테크(Fintech) 성격을 강화해야 한다.  
3. **커뮤니티가 아닌 툴(Tool)로서의 접근:** 초기에는 활성화되기 어려운 커뮤니티 기능보다는, 확실한 효용을 주는 '분석 도구'로서의 포지셔닝을 공고히 하여 유틸리티 앱으로서의 리텐션을 확보해야 한다.

이 서비스는 '집을 구하는 과정'의 고통을 '행복한 미래를 그리는 과정'으로 치환해 주는 강력한 솔루션이 될 것이며, 적절한 MVP 실행을 통해 PropTech 시장의 유의미한 버티컬 플레이어(Vertical Player)로 성장할 가능성이 충분하다.

#### **참고 자료**

1. 2024년 주거실태조사…자가보유율 61.4%로 상승, 수도권 PIR 8.7배 '여전히 부담', 2월 13, 2026에 액세스, [https://www.seoulapt.co.kr/news/articleView.html?idxno=1120](https://www.seoulapt.co.kr/news/articleView.html?idxno=1120)  
2. 서울 자가-임차 거주기간 격차 더 벌어졌다…내집 11.6년, 세입자 3.7년 \- 한겨레, 2월 13, 2026에 액세스, [https://www.hani.co.kr/arti/area/capital/1236852.html](https://www.hani.co.kr/arti/area/capital/1236852.html)  
3. 1월 1, 1970에 액세스, [https://m.blog.naver.com/hogangnono\_official/222146524312](https://m.blog.naver.com/hogangnono_official/222146524312)  
4. 경찰청\_카메라등이용촬영범죄 지역별 발생 현황\_20241231 \- 공공데이터포털, 2월 13, 2026에 액세스, [https://www.data.go.kr/data/15066489/fileData.do](https://www.data.go.kr/data/15066489/fileData.do)  
5. 국토교통부 실거래가 정보(API) \- 공공데이터포털, 2월 13, 2026에 액세스, [https://www.data.go.kr/dataset/3050988/openapi.do](https://www.data.go.kr/dataset/3050988/openapi.do)  
6. ODsay, 2월 13, 2026에 액세스, [https://lab.odsay.com/](https://lab.odsay.com/)  
7. 1월 1, 1970에 액세스, [https://m.blog.naver.com/PostView.naver?blogId=the\_real\_estate\&logNo=223215241743](https://m.blog.naver.com/PostView.naver?blogId=the_real_estate&logNo=223215241743)  
8. 1월 1, 1970에 액세스, [https://m.blog.naver.com/PostView.naver?blogId=richgo\_official\&logNo=223123456789](https://m.blog.naver.com/PostView.naver?blogId=richgo_official&logNo=223123456789)  
9. 1월 1, 1970에 액세스, [https://m.blog.naver.com/richgo\_official/223456789012](https://m.blog.naver.com/richgo_official/223456789012)  
10. 1월 1, 1970에 액세스, [https://m.blog.naver.com/pro\_investor/223254123456](https://m.blog.naver.com/pro_investor/223254123456)  
11. 1월 1, 1970에 액세스, [https://www.safemap.go.kr/main/main.do](https://www.safemap.go.kr/main/main.do)  
12. 데이터 \> 공공데이터 \> OpenAPI \> Open API 상세 \- 충청남도 데이터포털 올담, 2월 13, 2026에 액세스, [https://alldam.chungnam.go.kr/index.do;jsessionid=64B62D2CBF24E66FACFBB74D3091C3C0?menuCd=DOM\_000000201001003001\&publicdatapk=15096007](https://alldam.chungnam.go.kr/index.do;jsessionid=64B62D2CBF24E66FACFBB74D3091C3C0?menuCd=DOM_000000201001003001&publicdatapk=15096007)  
13. Current Issue \- Korea Planning Association, 2월 13, 2026에 액세스, [https://www.kpaj.or.kr/\_common/do.php?a=current\&b=11\&bidx=3999\&aidx=44273](https://www.kpaj.or.kr/_common/do.php?a=current&b=11&bidx=3999&aidx=44273)  
14. 유치원 | 공공데이터포털, 2월 13, 2026에 액세스, [https://www.data.go.kr/data/15096279/fileData.do](https://www.data.go.kr/data/15096279/fileData.do)  
15. 1월 1, 1970에 액세스, [https://www.data.go.kr/data/15053225/openapi.do](https://www.data.go.kr/data/15053225/openapi.do)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABK0lEQVR4Xu2UsUpDQRBFB4IhiImgRoQoiI3ib4ggksYPsElhI4qNhVX+ItgqWFj4DVr4CZLCRhC0srNJUNR7M7M4jJunldU7cGBz79sh7FueSAlYgjNwEjbgguvmYR3W4LSZ4PNNOCu6f851cgCf4SccwhPLq7AD+9ZdwW3ryCZ8te4ObrhuRE+0vAk5ORbtchyJdpVYkFQ+xgIcinYTsQDvcD2Gibboxtw/4pEwXw35ruiZjmVN8kPP4JTl/jzJQ/j9A76UOPQaXtqaOV9o4tStC4lDB3DZ1sy735W8uXUhfui+6J313bmtt+CK6wrxQ3k3Pcxv4R58CV0haehFLETzJ3gv+as1ljSUdy/CnOe4E4vfSENbsRDNP2L4F7iR34Ac7BZjWFLyD3wBD31GbFn6voQAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAYCAYAAABtGnqsAAACqElEQVR4Xu2YS6hNYRTHF0opj/IsBghFTCQhhkYkmWAi8n4lb3kzVigGRu6NiIhkIsrAwMDAq7zCRF55FHlH+P9b63O+Vs45+9vndu/u3v2rX6e9/t+37z7r7se3j0hJSRGYCxfARXAxXAKXJtjh2Qv/wIM+cHSGY+F2eEl0Dt0XD3J0h/1hN9gL9rVPMshyZvzsZ/XAANgH9hbdR6H5INoMfqkUronOq8Y02Cw65gncD0dYthJ+tuwr3Gz1wFHL7sDDLmttFsKncJwPArNFD/aq6JmWQq0Gkq6iY+b5QCpn8nkfGMxSj6clWQHPSeVqq9pA8lB00E8f1IFnFP9DteB+d/siuCCa3fQBmAMH+2IrM8w+eXx1G0hCp0/7oEG4z2Ou1gn+sOyjy8gLX2hDMjeQN+tXooNHuqwRuL/rrvYMzrCMxhwRbXBRyNzAwP++VCNwX2+i7YFwPhxtWfy3LsMz0XYWVsE1CfKen0JyA2+ITpjug5xwX/G9tUn0DGMjfQO/w6HRdhZ41byr4lvRf95rG/cS3tZpmUluIAlf7IoPchD2NcS243vsN6k0cC3sGWVFITRwvA9q0UN00lkf5CA0cCp87LJ7lpG7cVAgQgMn+KAWXCTzEmsJwlm2U/RVMSYsZbgGzct90YV6VvNewhN9UIsvvtAAXJLwAD7BLi5rFs1S158xO+CuBJfptMyEBk7yQTV++0KDhFe+iz4A20QzvvMWlVuixzjFBx5ess9FX79SGO4LjiZ4wBeNWfCBLxYEXhV8gvPJTfkUfw9Xx4MCXFbwR4VRPqjDVkmf0y4JT8IUZkq+ee2OyfCQL9ZhDPwlZQP/rfdOwZPwhOiLf/C41bjceGRjY/dIB2c5XAc3wE0mf9zcEslt1jfauPU2h28OJSUlbcJfcK7K/0SMkBEAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAYCAYAAABqWKS5AAAB8UlEQVR4Xu2WzyulURjHH6Hxc8xgI6SYFE0hTTayYcMfIEx2UrIz2dgpymYaG7GZuslmms0sLaRkgYWlZCMbNpRCGsqP79Nzzn2f+9y3XNer3sX91Cfnfs+55z7vOb3HIcqRI1J64T5chhMuGwi640k/vIWzKmuD1/BJZbHkHj7aEPyn8Dw2fCdZ3WbbAabgog3jxCVJ8XW2A4zBTzaME2ckxbM9pi/28Ir74r0PcEUPijOblP4AsT9lwuCz3hf/w/QtwF24B3fgFvwHC/SgFyiyQbas2cAxTVJ8wuTMIcmLrMl0l5ZIFicSDmzg4OK4oK+2g8IL5ew1q/9mSuGVDR3rFF4kY/M8k/G8nnLVZvLNZ88XG4BG2GBDzzzJj1aYvNXlMyZnPlNqoX9ITqZa93kb1pOMGYGnLmdGXa7he1QH7IQbLmuBF8kRRKuqneSOZNWOSSY9hzfwSA8y/CLZlRJYaPoY/3+CH4jpNn918ZPwr2vXUDAfj/lAct9KUPruZUUVyT3nm+0wDMKfNgTjFFz8PpLMxTupKab03YkEPikymZgPgbArhf/ub5Id52uJxj8YXwY1+qabFZXwhKSA6tSuFPzuhMHfLaPg/ZiDXa49BPtc2z8kP+Cwyt8d/sEmGyp4ETR8vLabjOEXOEeOqHgG8RBjEwqF0M4AAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAYCAYAAABnRtT+AAABqUlEQVR4Xu2WvSuFcRTHj3fy/paIiZQsBiVkNhhMymAyKgNWWYxiYyCzyUx5SfEH2MjiP1AGIsL32++cnPvzFLnD89S9n/p0z/M7z73P6Tm/lytSpICpgF2wDdbABtgOe/xNaTMEl+EJ/IRHcAUu+puywpaEIsvjRFaohq8SiswsaxIKvI4TWeJJQpHTcSJLsMBMt5pkvsgxCQV+xAmFe2bq2P64HSeU93ggDazVnXFCwim0Ew+mAQu8iweVQwnTwah1cR+sd9c8WpPgUVsSD4JGF7e6+Ad8CIuci8an4KXmjFvYrWMbOsajcxf2S3jQno4TduEUdsAZyf2tfVgHr+CNhO8mLtwXCfONC8ZabnL8TUKhxoR++jnKQ2BBYxZ65nL+oYPwWONJOKrxAyzT2L/ZvJiFmxpXwmeXu4ADGrP1vsgDOO6ujcS3ly9sTZPGq5L7EIvZ8lJ4npCbl9BqXnOu8v+Cse7if8M55ouyrctgzDfJuUse9XNYc1WwGd5LaPOSfBc5Ir8snr/Ct9PrrrnJ+791XMEsxMO5aLS4mIvJ4C6RtPqLFA5fdoNT32Ma1EgAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAAYCAYAAACMXa24AAAFmUlEQVR4Xu2ad+gcVRDHx96DXdGY/DR2UcFesBewgEhAFALBhohiJYi9N1RQsSskFkQUFQIWDCoq+oeKBY2Kisbeu7G3+ThvcrPvt/fL3f3W3P7O/cCX2515e/d2d/a9ebMn0tDQ0NDQ0NDQEwuphlRrB7E/QTVeNc4b/g85TfW66lHVGsH+TNgeLVzv/VQnqHbKfP2GGFhRtZRq2bQ9FBv0myHViarbVX+rLhe7kGia6tNk3za1H3QWETtfdErah+NVX6suSb6qOEJa1/jMzNdvjlN9J9Y3Pk9XHV1oURMOlfKbsrKY/YPcMaA8Ina+T+cOZVNpBXaVHCb1DF74Serbt3m8Ju1vyn9xw+oIoyDnuV3uCDws1V+LfaXaAGHGrAr6xcxQWyaLdfLF3JHA91duHEA6Pc+qg3dvqTZ4T80NPcJ6iH4dlTvqxMtinTwgdygfivk89xtU1hc7z6dyRwl5gD+YbBw/R2xhk3OOWJsfVReI5c/OHtIK3g1UT6pekeIisRvOyA09coxU/6BWDh1Edyfdp/pF9adqx9CuLuwgtpjoRvPjGult9CM3jjeY6gH7iwfbhao7wv75Ujxmt7TPILJxsk1Jtmu9URd0ew7t+FzGUPDeoLpOdb3qftVc1W2hXV3ghn45grjon4nlah+rPrLDRoRz5xqQ93bDTTL8BrPPIsx5Qorfu46UB2+0edXjzWDrlKqCN+9T7fBqQj4VOvh+y40DyOFi50qpcDR4njg92M5OtodUuwa748F7Z2bH9mtmy1mvRFeW2Fz0r1PK+uQwQ5SlRwsURjE6eXXuSFAiq/XTVyGc5+zcWALlowj56R9i9fJ9xL5nRmwglor5SIaeDb7dk+3mYANsv2e2nK1LxCyS21wL22HzZXOx398wdyS+US2RGxc0fjFXzR0J99eJS1Vvd6lOIL3o5FyvSp8stJix5rRc/8J33Br2p4Zt+ESszfJp36sNpGuRToK3jCrShpnS/lrwTmDn3NgP6CA13jKWEfM/l9lXSp+LSvHJZLFSxpKqSbkx4cf7jeyEvVRndalO2F/sfNfNHQECbaO0fZdY+/z7sbFW8MXWu8EHBDNtmMbBR+uy4GVE75YqgvdbaR+8PHwx/RgK28SM+xYTu/dltLvfscIyPmwPw/Mz6rw5L4n53gg2bip23kIR0D4FMfrcm7bzm8nx3iF8e6btG8VyM/hBtVryb5Ns/eIWsX68mjuUNaV4PVjc0vaKYJuYbIxclNDgPSkGJq/aY2D4S4rpwQbY2gXQSFQRvPzuF5mN9dFXyeewMCWO3pdWZeotsZmH/0ScJMX2pC5zVUurLpLizPK82EKVV9EPiMXN98E/DxYClML8ArmwsVqnxkftM0Kxmi8kWCOxc2zPSNu8B48lotguluB8UbJKsPUT8j0PTEY+qhbkeJfFRom1xCobXDcu+sliKRjHkgMDwXtgsv0sVl7z82dNwfWmKsL3UKI8TyxwsPHbfG839Bq8/EGIxTnnzD0uiw3u1bF+gHKu2OAXH076TnDCxTI8PrzyMkWK13T19OntCeTK8+rYmU1Uj6dtnkBOboW0z8lSFnLicc6RYhegoTp6Dd5eYcHKzOnkweqL04PERmiHWawsfSiLk0pg6ohT6j3SSt5ZSHl9k/IPNVdnC7HjpqV9H5l408Tf7YBUomHsEYONASxWY/AxgL2j2kzsBU30wfbSSmG3lOIa65CwPWp4hRzLakx5/jaJPIeO7pL2eVtH3sO/sciDyGNeSD6m4a3EXpfy1DKCT0i+hrFFDF7qv7PCvo+0DGwE6GNp/2Cx41iUYSf9mi22CPbBcapYUaAyPJdx8vfvrMTjD04M257TAHkhuSVQiei0/thQP5bLDYFxUqw0cZ8ZqJxYjfB2tGFx3NDQ0NDQ0NDQK/8Akd6AY4vDhEkAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAAvElEQVR4XmNgGBaAHYglgVgeiBWhGMSWAmJhIOZAKMUEfUD8Hw/+DcRWcNU4wB4GiOJSNHEuqPg5NHEUAFLwBYhZ0SWA4A0DRB4nAEnuRheEApgXcAKQpAO6IBSA5L6hC8JAHANuk2EByoguAQO3GCAKZgDxNCCeDcTnoWIXkNRhAFAcw/wEClEQPgnEO4BYGUkdVgCyCaRxCboEMQBmqwa6BDGAYDTgA2RpngTEtxkQmkF+F0JRMQpGLAAAhkIzWO2pj3kAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAYCAYAAACMcW/9AAAB2ElEQVR4Xu2WyytFURSHl3chiVLeV4QIUQYMDGRkyIgMTL2KifIXKImZV8bySJIoBooxYYqBmVLIIyHi97PX6W7bvRPkGNyvvs7aa+3rrrPPts8ViRDhg2gYgAWWHOfDbJjsTfSbQjgAF+AbHIb9sA8OwmvNl3gf8JteMQ255IjJH8EEp+YLZxK6UcI85Qr7SoeYRnbdgsLavfyDFT0W00yjWwBXEn6l/xzv0S6qK3AbPsNqa57veI1OwQk4CafhI5yx5vkKz0o2ydULBWu3btIPZsU0w/MzFFzVf7FH2cQLTHELirctfIdN7LlJJV1MfcPJp+k1FpZa+SKYao1tuMVCYefDvq75nmcjzW4B1Iup7Tv5AzEnAm+Onyd8InMaN8FujckDHNeYfy9G4yTYDhPhHVyGp1r7xBN8leCj9WTuHM6L+YHikilft4I9boOjGi/BzmDp07wuvZbBLY0b9Ppr2F9YC9c0joOXEnyDuTfExXHhzdS5yd8gAx5a43VYozHPXq+5CismQ3AE7sAoeAIrnTnhXuHfogWOacw9eqNXsirmi1t1fKFXwrO4R8yezxMzjycNf0N4bFrxj+Hmt8lyxvES/Ich5TBX42IrTwJ6rRKz9yNEIO8FdWlsLpYMPgAAAABJRU5ErkJggg==>

[image9]: <data:image/png;base64,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>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAAAYCAYAAAAf1RgaAAAEG0lEQVR4Xu2ZScgURxTHnyaiEXejcd8xicGFRBGXgwtB8OICigoeFIMRSWJEMYcoEfUoCuK+IaKggURQEIVcYjAHA6LiEonm4CERI0YUcdf3s6q+qX50z3zON3wzSv/gz/T8X3V3dVdX1etqkZycnJycDJqqeqh6qfp6sd1V1Vn1bqHoW0sLSV4/6qPqrequeq+uZA0wQPWt6qDqhWq76hvVUtV3qqeq56qWYYdG5kvVA9UZ1WPV3GS4KH+Iu6Yr/nd8MlzHKNVi1W/iyq0Sdw++Vq1QPfR+l7BDLbBQXKUs9D78n2ygkeDcZ/32R/5/fWinOi+uMWCt6lEhnMoeST/+J+L8k6omJlY1/pL0ygJ+VqwcWlkjA574/cY7qrpovDTS6rtXtciaEezDaJJGuAezbaAaUAkq848NeCrVYENUT8QNP/WBc0423hzvLzG+hTIdjLdbtdx4MeyzyZoeYtetWS3CGM+waPlMXGyaDdQThpDfxR1jqomVgn2GGW+c9/80voWeQjnmvebi6lHsoWsvLt7RBsQNpRynZkjrQWSPE7xfzjBA5vW3lD/39RR37o+Nz5yETzJUitBoaddn2SCuzGHVj6ojqtOqe+ISs5oiXNAO1RZxQ8ct71Hx14XM6l/VPht4DQaKO/+Hxh/p/VINAD9IssE+T0STkNhQZpu4e7BVXMbMg7E+Kld1ukn9b0ApeEr/F/f+1lCYf6hTVg/LSg4CZIXHxSU4s6RwjSPiQh6Ge2JklWkQu2HNarFLXIV+sYEy4FgkLq1toEyo16fGC8N0sTmMOSvtAWR4w7dD3AXvzzB+oFIPdEUIlRljAw1gnbieRo9rCNRruvHme59zZEHvypo72ZcXYusVa5BS8UaFitxXNbOBBtJGXG+j15ULdfvKeCu9H/c8EqQYUn5WRtJg37EpXlaDDBIXY26LibNJXugDfVTvR/9j+lvDE/ZvK24pLBMulMp8bwMV5B3VOUm/UaVYLW5ZqF/kkQSk9ZBn4ubj2LOrEiQRLHXFcOy0BqPevIbgnzAxrgePh+IL7zGn/uy3B6vW+G24rDrltznepCi20f8yXLP0RYY6uhAuwPrcXdUdv80Lrb2YSsOwy4XNtIEisBzERbLicVO1ORl+xTHVPOOFeQxxs/hlfTCGdyub+ofG5yWZbPmDutIF6AU26YkbfKLqgN9mZSVsQ1wuzlrDex7vvTVHJ2u8gcQ3nkz21+j/NSkMizR+PBTangwLJNkjcyoM89el6P8hcSswQDIUGoWh7z+/DazasB9fQmCn374tbs6HZf43p4JMkeSaI4sEDMHAMEqDhaybxgzf066Kezfksw/QE4eLS/qYv0hwWITPqTD222BX85+EJc66+ThKIgL2m9pQ/0vyY7PdnJycnJwkLwHaFf+thGTGpQAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAAcCAYAAADIgpWxAAAFbklEQVR4Xu2cd6gdRRSHj93Ye+9ii/5lb/jEgqJGCFYQ4VmICYjYC6iIERX/UBEsIBoU0ahYkohJrNjFSgKWCEleLIiYWLB3z+fM8M6ezH0leu/du84HP+6cs/tu9s6eaWdnI9IctvKOgqzuHYXeYG3V0c63hWqs8+VYX7Wnd0aeVj0TRXmm6sjKGd3lSdVTEq6PT+zJqi3NOZ+bcqEHIMD+MDbB/ZxqNdUqqk/MMcsaqrdieXnVz+ZYgh7uL9UOxveq6mVjd5txqq+NzUhFfewe7RVVNwweLtSdP1X9xp4r1aH2N1O23Kz6wtg0As/Vqnudj2CmJ6wLr6vONfaqqt9VNxkfjfJsYxdqzJfO5uZZ6KH7nA82Vv2k+lG1kequ6uF/oNfe1tgnqhYau9scIeH3MsIkXok+y2Oqb5yvUFPStCHhb+aAarzzJfaXcH6rXpxjd0fdp3pftULljO5ynVR/b7/qF9XFxgeMRr5eCjVkOdVDzudv3IDqeOeDdSX0ZkxP6L3834H3bZ3x/dfsO4wsNESuZx3Vmu6Y5Rxp/3XXErIC50s+ACyHqo5SbeYPdIEZzvY3bonksx3MM88w9qOqfYx9uOQXlPb7mV+vJKH33jmWaWA2hbih6mHVXsZ3jIS/6VNdYvyjhWt51jsz8G/4emk8b0gIUuAm0PqpcMumEiqGlfPKEoay3E3vJB86mxW97cnsjSSQDorlr1RXmGP9Ul1MUh9nGhvmqB6I5askLMZSI/hBtUssvx0/P5XBDEO6Dua7BD6Nifok5UY2ZrSsJ+E7D/AHMtypWuSdTYZ54UfOt5+E3s3CDWWBYel2yydFZYdbRo3HjT1gygT/i7F8rYQgTCww5Q0kfO+BEtKADOkTJGRUyCIAaT9bF3akuD1+Uje7xvJn8TMxxdmjgQZwkYTvtynFVtDAnvfOJnOe5Ic+H6zeBjIB93hnByFTcY3z0QPSczFtGA4eyJzgnSMk1Qf/zh6xTI/MCEajeCT6mK+fJSErQeeR8ttwafxsJzTEHb1zGGiwjMJDYdOFteIyCRW8nfHxY0hpJcgU5AL6Xcn7OwUpt++9s0NMi59PGN/lxn5PdZuENQlPGmEbCb0z0zWmAu1me9Vh3jlCeGCTrttDvn9z76wTBCUiDcYclDJZhMQt0edhUZLzd5rUGxaq2Ma2LOytesnY5O9pqPbxem1JQY3mu2P3R79nluT9hebAXhdSnJtIiIueCGYWPSyabFAfa463CujZkve3E3uNRaPXssD04wPpkV2NTO5JUyUYVvyPv9LZiZFMOXyFDqWeaP3/Q0j7sXOPBW7taRWQ+E+JZTIBufPekby/0Bx41kDOHEg/2s6vlrQKyNck7HdI5M77VQZX+02ERVFqzCdLyFiwk4089UnmvCZChoRgZsS2kPuudVCzimXzuoV8qQ/gxao7nI9zhtpH0ATGyNJ1Qf7a+5oEefQ3JTyRzEGKl73htYSnYdyc9OiWdN10WToVRo/EHojEqc5uKoeoPnY+HuZ863xNgjd5iIuhsHuuawlDK9OHGyW8wpSDRcEUCfsg0r6IpvOC6jRjz5NmB3OhwdA7M3rReNnbwVSDBwsT7UmFQq/AK1d+rlw2zBd6FrI4Pnh5g8X7CoWegMBlM36CnXT40nbbB6N9uoTMEHNrUnsXSnUvDIvsPtV30d5JQlqMBkMufyD6C4W2wO5Ccs0EaxL2VKkGKrsS7TuJ6WVUFs4J0p3AgpqtnMD2TOB72TFYKNQCgvv6WOb/ArkglglUXpI4OJaBNBePj+m92RsNbC+FSfGzUOgq5OJ58AJ2msGU5LhYnqy6VcKLFOzd3k3CVAWRMWFr7lrx3MK/4G9cQ3+5qBB56wAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAAAYCAYAAAC2odCOAAACyElEQVR4Xu2XWahOURTHlyFzikvGEJJLCkVRukhkKLP7pmt44EEpjxRFJJShPHgxFUV5kBceTInigRKKQilRRGQW/v+71nbWt777Se59+NxzfvVvr2Hvs8+3vr3P2UekoKCgCqiDbkGHoIEWm5Sl88106D2008VuQJ+hny6Waz5JeTF6Q2+biOeSJaKFGBsTYDl0MgbzyAvRIo2ICbAAGhqDeeSJaJGoaSFXYPSVrEhJP6AOvlOByAUpL9QR36GglDrJCrUj5BLXRY8Hz6Fdom/CCSU9WhEnYsBYLVqkcyH+DXocYoR9q5mD0OQY/FsexoCxSPSHT3Wx19BC53uqvUj/fH+doQ8xaPBsdB9q42J/moin9QiPDm2dz2u1M5vb0zMy+KTGWo7x+SHOTgyIgUClex8dA5GtooN7hPgwi3uOQa9CrBJXoGdmb4AaRMfXi173ouVoX4aWmu8LfQc6L/odmQrLN+4Zszl2i9l7oW7QafNJuv/2ogX8AvXL0o1z3jSbc6xzuRL44OW/+0j0oizCO+ip65Ng3+0x2ATrJfshpLvoJw+fccQXn/bV4Cf6ixbFE8ceN5vfnUehOeZzBbLIiVXQNucTjudO4teGL26zeCO6KiIscvpHCCfv6fzd0AGze0EPXI590+G1AdqTpRrxRRklukITX6V0Ht93H7TM+VzVXZw/S3RhtDgToY8xCO5Cg53PN1+l59h+ybYWf/Qll+Nbk1yzlqvhntnklOjRhPBYklbmDGv9PGkFbrY25bjlySDRI0xiNrTS+c2Ck41x/kZovPPJCmim2XOldJnfFl1NZC20yeV4bZ7w55k/X7SoiZdQR7MPQ8OhKVn6dyG6ms2+LIbPnbWWfLeWc/IF1aLfp9wea6DFMeHgNuDB0q8owhdCgg/USB9n++1B+Izy1Er5NcZBnczmSvXw2RhptYffgoL/jF8o5pO3BSBs1wAAAABJRU5ErkJggg==>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAYCAYAAACFms+HAAAB3ElEQVR4Xu2WO0skQRSFj4oaKL4VDAxcDA0UEReM/AduIPgHTAVB8B+YCLqgi89AEBMjNzEURATdwAeaLCxoYCS7gmAmPu7pW71T3uke23FaA+eDw1Sfqrp1p6q6qoEiRT4fpdZIiRZrvIUV0ao1U+JRVGLNfGGwMWumQDN0rILBYO+xVX6gAInXiRZEP6HBlkWLokq/UYHgONSD6Ao6Dp/fxIno2popwQnqsma+cBY46+9BQbckg/VYM4Z76AmUD98Qv787RPuiAyeWd5FjrAbEB7MMQ9syaD4ci26s6TGE7FzaIryA73heUe2VLUvQtre2IgGD0L4T7rkMmpTPEbKTbI/wAtjYT2TdK/swQBM0SGQg5D6NZqD9vrrnEdG/THUAtyHftxBeUsxn0/P+w2CzrnyO+Nvz1P3GJd4N9eOOuENk+jGh36KKTHUA6y+gyW6J1qB7P5JWaAf+0ypTFzLqlf8iOnFyKbqzpoMnCWeOq7tn6kgtNAeuasg4dKwaz3sVk6JGpx3EJ07OrJGQadG88fqgYw0Y/0XKRb+MN4f4xPtFvdZMCGebq+/D1fP3fCK4PNvQJMMLgy/fhvO+OM/njzUSEm5Xfu7WQ4/oKeinAU+j1Om0RpEiH8gTeTFmSRFAtpIAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAYCAYAAAAI94jTAAADoElEQVR4Xu2ZW6gNURjHP3chuUsuhyREiITCzi3KJYUHefAiiXLNA+X64MGLN0RKSbwohBBFrkVJuUQiIYTjUiSO+P7WWud8881as2eXvfeczK/+nbX+3zcza681a2atOUQ5OY2cQawx2vQQyuvIGsVqpQOVYqQ2AizRRkZBh75gtWA1Z72Ohuvx5XWysXOsZrZ8iHXclh0PWU2UF6EpqxerD6ufFco9WN2o4eQhBrL2azNAF9Y1bWaQ+6zfov5TlCW+vKe2/Ia1wJZXUzQPN6isexnAWsM6SiZ5D2sVay1rA6uO9YvV2h0gOE0mHqJGG8wW1iZtZgz0wydRf8maKOoOX57ucNz0H6jhUfeNTH8iD+WiLKf4SUFvMv4RHSDjH9OmBdPbd74OrK/azBhoNzrT8Zw1V9Qdvjz5m1ew3rLOCg9PIuTgyYFyUZ6RvyMBfB2byrqlPMlOih/jwB3TU5sZwtfh80Td4cvz/eZtrBOijpwpoh5kEZlkTEUfvoFB5w5XngTxS9q07GDd0GaGwG/9Ieq1rMGi7vDluX5aKHzg/P6sqzKQxGMyB/pWTePIxGYqXw8UGMHaa4X4RVvWdCYTn6MDFaYtmfZhhXSG1dL6erbLMtpcsGVf3m5RbmPL3W0dHGRNt+U79m8QHKQ7Gqs1PK7gu9WFAz9I50vaU3IcII4FRzFWlihcOw2HKf7ylW0eyrpL5nGNlaoDi6LFoh7Km0VmcXSSzHnxbgV9ycyYVLPGDcw+MiN+gPXeer6Xew0ldzxmV1IcIH5Bmwos1dGOkN6RebliaYo9xCvWpL9HFgfX1zNWt3k8a5ryfITyRrOWUXyfh8HEvicRLOfcwKSlQMn5tyl+N2pwPDZn1eABRduPPsAgYwefGTA70MjzOpDABAoPjJstm3VAgRzc6dUA18bjB8vZ2WT2cpnDzZaxOpBAVwoPDGYLYu77EHb7PpBzU5sKPMqelCi9SPGBay/VZtZAI79QimeeAB0WGpg6isbuibIEOae06QEzrxSFbgQJrj1Dm1T881PFwMoLjdyoAykIDYybgWAYme9EGqxQkKNfvpUCN8tl5c0n83irOng5f2Z9tGV8gCtleqNjh2iTmUxmpYTzbo2G6tlOyV8NKgEG4TuZ31FL/g1ko2Qd64o2U4KboGr/o/gfwN2GjVoptKPoZ4ycMvCIwv+rCLGezDI1p8xg17tLmwHwueS6NnPKR0EbAfCdKScnJ+cf8AcyHf3oChPReQAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARUAAAAcCAYAAABPliueAAAFFUlEQVR4Xu2aR8glRRSFrzkgqKPiQkQQMYCoiGIYFyNGVBQDBhRnVMwJA4ppISZUxLARAyqIqCCCuhBx5ULEjZgWRsaAEXNCxXQPVcXcd/77Xve89zu8N//54PCqTlV19+uuvl1V3WZCCCGEELPA5q6LXRe6jqSyUXzn+sd1OBc4+7ludl3p2pXKVme+df3r2ogL5on1XXeyWcF1uNa1DRcQfeutDFta6QsZ77tOZHMEe1o5h01ixkAHRWe41HWd60HrdyF3tLzeyVb8p1zLXJe7XnYdH+rMCve7NmCzB+e5XmdzQs634TfahtV7xHWO65ea52PvW29cbrRyvZmVDSo4pm3Jw7YX0sNppuEO2pdDXZ+yaWV7a7A5o+C/bMxmDxa7fmBznsDNFq8ZRgg/u84IHjjN9X3I9603CWu7/mDTxgsqzAeuo9gU00l2AfuQBRWMRoYNgRk8dTAE34kLnEPq71auq1271PxmroNdV1npwJHWBh2P21xic9ugfmuTeUusnBtMFZDeufoAQXN3KyO7tp/IqgwqOIfIYxQSaaOSRt96k5JtKwsqW7iucB1I/hIr28AvhOnePq7PXNdUD1NrMcXgAmZD1i6w9vIReS+47iWPOdr1p+t51xGuN60Mw/cIdXBMeDLd4zq35hGsHnVd5rq7epHW5myb2wZPY26DdLaN5t1a03fV9NLqt2nfi66DXB+73qtljb1dv5LHfGgr9hd1Q6yUwEFlOeUj49SblGxbHFQethJ08WB6yEqbU2tZO+/4hTa1Ekwwmnq6etfXumJKWc9WdOhnXYcNFqec6frJdWzw8MTDTXxM8DKwH15v+LH6De6Yj1tZ34hwHc53tWn/OcIe0jz9gcdrELwdAA+jqkVcMCEcVHDOs/2DceoxpyTafqDGILdYGRlGYlB5xebuD32Jzzuj6c8Mso7rGSudD28whnGclYu+nAusPJ0xShgF2vLbotur3+BOhdHCA+RxHc53tUGa27CHdBZU8JYsCh6Cc+QxKyOyd8mfFA4qeILz/2iMU4/ByIm110CNQTDF/J28GFSwr79t8Py9U/1GdjwKKjPMAZZf1AimKhj2441R5C3XTeRF2qhoN/Ivqn6D998VILJ8VxukuQ17SGdBJRMWQiPwMHQfBqZ2TyY6IVZK4KDyGuUj49SbD3h7HFSGqcHtgYLKjJNdVAajjU/Iw3y3a4ES227z5wbWYUZ1qq4AkeW72nBHzjyks6DSxb5WhvSjQHDYIRG+GRoFBxUe5UXGqTcf8PayoDKKrFxBZYbBm43sojLZ2x+AtvuzGUA5Xm2yF6dcvP+uAJHlu9p8SXnAHR5p/l4Ci8pnkccstu7gOi4cVMBLrifIw/9/jry+9SblNiujz0YMKndYOX5el4rw/wOYRp7OpphOcAGxjoLF03ZT4VVpFwgc+KKWwcJk2w6mQ1/XdHurgZviVSvzanwUhzJ8ebtWLQfcqboCRJbvaoM3NDgGfFfxeS1DPta5r+Yx1WtvczCFa4ueX7l+q+kIXkuj7P8gCyoAQQzH9YaV8mFBrW+9SVjXynlpxKACEHSxb6y9fFHT8fuW7P+dZMX/xga3LaaYrdnooI1o8Ip4GBjKj/oQDovDswx/KwO2s3KDXMAFq4hN2BhC33rjkgUGIeztRBGMONB5lpK/kMH5+Mu1JhcsMBRUhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCFWR/4DKHyj6HwE+WMAAAAASUVORK5CYII=>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAaCAYAAACD+r1hAAAArElEQVR4XmNgGAXDAvACcSgQPwfio0DMhSqNCiqA+DcQh0D5zED8H4jPQ/l9UBoMdBkgkujgLwNC/A+yxDkkCWTwmAEizgTEO5ElQILTkQWgAOQPkNwZdAmQYAy6IBDsY4DIfUGXAAnyoAsCwVYGiJwEusQvIG5GE0tnQPjBCYi1kSVLgfgFEDNCcTYQf2CAxAtIUx0QP4GrhgJ2IA5mgJgG0oQMHNH4o4C6AAAptCPz5rS6pgAAAABJRU5ErkJggg==>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAZCAYAAAAFbs/PAAAAyklEQVR4XtWPoQoCQRRFX1DBpBZBzCY/QwQ/wCBis5lNZj/AahSbWNZisthtouAPiMUqGNT72HFZ7r6ZvgcOu3tmhnkrkita8ATPsE9rJi84g3P4pbUMT/oewwO1hIgDWMALR0Xn/nAEN7jiqNzhlFpBAv/wcE+9RTf99TLhAEYSj5RB529zBBXx3LLm4CiJ54AZwUA8a2YEW/jmqFgHNhL3Ii8MYQ8uYd25hztYS+1LuKbem7Cb+jaxxgly5BCiCjscQzRgmWOO+AHBPSWwvxFb9AAAAABJRU5ErkJggg==>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAYCAYAAACvKj4oAAACfklEQVR4Xu2Yy6tOURjGH/eSTgYk98GJASVJMkC5JCnJAOUSIiQDE6EMlDIgY+V6FAbyF5hIGMgliiQxMHBJSsgtt+c579r2+717H8f+dMr+nF89fXs979p7Xfa67Q/opZfasoC6TR2htiZvSR6uL4upD9Q+502l3lE/nFdbvlDfo0k+U9+iWTfWwN7ShBggO6nD0awbb2ANHB0DZAvVFs268QzWQGl2iLUEY5A3MNNX2EraMlxCsZEtsXqWMR95A3eEmND28Zh6Cpu3RxvD3dKHukbdioGe4Ew0ErtgDTwR/BnUJpd+T3106T/hLtVOvY6BLngUjSrci0ZiM6yBk5w3gHrr0uIgtTd43VF16FfN/4shKFY44yKKD84Wo1XOm0mNc2nRjxoYPE98rmc4bAh7Yv7fPbuBA7Cb4z43Ofm7gy/WIZ+fmoceVew5bI6ORbFiio+EnY70O9TFriA/Sa1Iv8ozl7qcrsVNahDyZ49A+QmsEx3PVOgT2A2vYHPqoc/UBbNg9yx3ntK+9z+56wydeU8GbyGsTFVc+/ALFztHzXHpvtRE6mpKH0OxI5tGb8VzCI0HA1/QBmq/S2ech3WO5zq1MnhCR8eyyt+hRqVrxfX189eshfW+Jxauw0HGS9gcv+A8UTacTlHzXFpDtz91GnkZWnlFHPq6XurSTXMcNuempbTmxtk83ElW8DDkwzMWHjtFTIGdmrLh/SD9dsDyq7HbkqeV/D4s7zLYl46fy02jhwmtmHuowS7mmQ6rkBjvA4myNyi08mpLyu7N0JxTLKJ5uB3Vt6geQT2sN6rFYnWIVUVv9Ea6/qe+UxdRG6PZBPr7pINa32j/Z/wEkMSC0VIZUGUAAAAASUVORK5CYII=>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAYCAYAAAC4CK7hAAACE0lEQVR4Xu2XzSunURTHD4Ukicl4yctCUtOsNJNSLCzISlnYyIJiITsLhSU1ySiLaVY2UjZK/gHKS1KEsrC0YEGivBQzzDjHOddznN/9ZfQYPb/6ferbvc/33JfnPr/79gNIkuTdaUJto36gesRrD8LRpwV1gxpUXg3qDPVXeZHnN+rOmsg96tqaUaUT+KuX2gAyihq2ZlS5Av7y+TaADKDSrBlVToF/EVKtiSUU5RAMxInWzLgulCgsQ+xgEmq38tEIwUBoI9DMoVZQi5J+eh5+kVTgers2EJZpawgjwAP5bgPIMarbmv/IPvDg6Xx6U3asIfRD/C05zJQLUzcu2ahzawrrEL9Tn/9B0nRUlQ4YfHXLVb5Q5R0V1rB8A26YBqSpFr/X+AS9pH2ZVdQaahOVIt5FEH6E/GLgW0IRKkf8CVQDcJuTwPe8LInRejqSPJ11tt8nfkl6AFzoBLijPVfAwyzEris6SG0n9pmg+9xP43WhpiAoXyfpZ+UR9G6X6jkUlcCN+35q3WkH+M+gedRXawLX3TAebQq6TcoPqedQzID/S39EbUk+E3Ur+SVJHb66BPnNxlsAPpSJPMlnQOxseDW0mN1Vxi1sRytqTPIlqD/A85v+22jiDYRe0q7TPgjK0/o7lDydcf8Ntzg1BdYAvpj6cBuEjy+S0uZQpgPvTS7wVKtHtZlYwkHz3151kmgeALMic0rTAcw/AAAAAElFTkSuQmCC>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAYCAYAAACFms+HAAACFElEQVR4Xu2WT0gVURTGj5IZSdBfLILIhAwKbCMu+rOzXZsWbtoE9mcTmPvQaNOiRaDVop2KLdoIbUtBImgRiQsliLDaBBYUiRVG5fd1zrx35ryZIJ7ELOYHH3PPd+68OffOvXeeSElJ3ZyCZqE70CXzeqvp4nEa+g5ddV4X9An67bzC8QP6GU1RnwMqJOdEZ3V/2v7DEHQ9mkVhGfoFtcYEGICao1kUlkRnnDoWcoVmn1QLT8S1fct3KiozUlt8oU+TLHqkWvhF87ZC93M0Juu/gV9CH0W/K5mMR8O4Jlr4iMXT0KZKtvZtTIQ4i3ZoMpo57JbaZ6SYi4bRL3pjm8XDLnfEcp4zIc7iAXQ8mjncldpnVNgCfY6m8UTSN7LYhMvQKxeTAyFugXYF7z3UFDwS7yUL8pfCb4gmOQDPUfM561l8gM5G0zgPfYMaRffFc2gbtEf0N3ltsL47oSlrx8OA7dsuTrFq1zeiHXmer0DzSYcc8mZis2jukPN836+uTWKhj1zMD2J8Y3XB2corfBS66eK9orNPeDoNulzyBhLYPmlt7hf+O11XrkCvo2lcgPpc/Faqy/Cd6KnUaTGXEk8qcgJ6am0O8IXoqdJtXl1wvR6Enok+kOs2wo33GNog+pr9ADkIwv/6CV/suij6PdgI7YAeiv7WPcv/F1h0h+h6j9CPHLYrl9V25/OASDZxScm/sgZ6mm9aQgnUawAAAABJRU5ErkJggg==>