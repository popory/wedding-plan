export const dashboardMetrics = {
  "updatedAt": "2026. 7. 29.",
  "progress": 31,
  "totalTasks": 78,
  "completedTasks": 24,
  "ongoingTasks": 17,
  "undecidedTasks": 37,
  "expectedBudget": 58778000,
  "actualBudget": 32988000,
  "remainingBudget": 21222000,
  "highIncomplete": 26,
  "targetBudget": 80000000,
  "homeBudget": 766530000,
  "furnishingsBudget": 19232000
};

export const budgetCategories = [
  {
    "label": "예식장·식사",
    "amount": 24640000,
    "color": "coral"
  },
  {
    "label": "스드메·기록",
    "amount": 10460000,
    "color": "blue"
  },
  {
    "label": "신혼여행",
    "amount": 7500000,
    "color": "green"
  },
  {
    "label": "예물",
    "amount": 4578000,
    "color": "gold"
  },
  {
    "label": "가족·감사",
    "amount": 4100000,
    "color": "plum"
  },
  {
    "label": "예비비",
    "amount": 3500000,
    "color": "gray"
  },
  {
    "label": "청첩장·소품",
    "amount": 2200000,
    "color": "mint"
  },
  {
    "label": "교통·행정",
    "amount": 1000000,
    "color": "navy"
  },
  {
    "label": "의상·뷰티",
    "amount": 800000,
    "color": "pink"
  }
];

export const priorityTasks = [
  {
    "date": "7월 28일",
    "title": "원규 스튜디오 촬영 준비/별도비용 확인",
    "detail": "헬퍼비 25만원 현금, 6시간 초과 5만원. 헤어변형 5.5만원, 헤어피스·드레스 추가/프리미엄 각 11만원, 야간 로드씬 22만원, 한복씬 11만~22만원 확인",
    "type": "확인",
    "priority": "중간"
  },
  {
    "date": "8월 2일",
    "title": "슈트패브릭 스튜디오 촬영 의상 셀렉·사이즈 확정",
    "detail": "원규 기본 블랙 턱시도 외 촬영용 컬러/패턴 슈트 셀렉. 기본 패키지 3벌+셔츠+액세서리, 사이즈·기장 수선과 촬영 전 픽업·촬영 후 반납 일정 확인",
    "type": "결정",
    "priority": "높음"
  },
  {
    "date": "8월 2일",
    "title": "슈트패브릭 렌탈센터 방문 상담",
    "detail": "본식 턱시도와 스튜디오 촬영용 의상을 함께 상담. 3벌+셔츠+액세서리 기본 패키지, 스탠다드/프리미엄 차액, 수선·픽업·반납 일정과 총 견적 확인",
    "type": "결정",
    "priority": "높음"
  },
  {
    "date": "8월 2일",
    "title": "슈트패브릭 본식 턱시도 구성·비용 확정",
    "detail": "본식용 블랙 턱시도, 셔츠, 커프스링크, 키높이 구두 등 올인원 포함 범위와 수선·픽업·반납 지점을 결정",
    "type": "결정",
    "priority": "높음"
  }
];

export const vendors = [
  {
    "name": "더채플앳 청담",
    "category": "예식장",
    "status": "계약 완료",
    "total": "2,464만원",
    "next": "시식 4인·트리스스파 2회 예약 후 최종 보증인원 확정",
    "date": "2026. 11. 1. 13:00"
  },
  {
    "name": "원규 스튜디오",
    "category": "스튜디오",
    "status": "촬영 준비",
    "total": "169만원",
    "next": "8/2 슈트패브릭 의상 상담 후 포트폴리오·소품 준비",
    "date": "2026. 8. 28. 14:00"
  },
  {
    "name": "아델라인스냅",
    "category": "본식 스냅",
    "status": "예약 완료",
    "total": "150만원",
    "next": "포트폴리오/필수 컷 전달 후 예식 5일 전 잔금",
    "date": "대표 + 실장 2인 촬영"
  },
  {
    "name": "류필름",
    "category": "본식 영상",
    "status": "촬영 준비",
    "total": "152만원",
    "next": "식순·축가·MR·플라워샤워 순서 전달",
    "date": "다큐멘터리 풀스토리형"
  }
];

export const studioPlan = {
  "vendor": "슈트패브릭 렌탈센터",
  "visit": "2026-08-02 14:00",
  "detail": "본식 턱시도와 스튜디오 촬영용 의상을 함께 상담. 3벌+셔츠+액세서리 기본 패키지, 스탠다드/프리미엄 차액, 수선·픽업·반납 일정과 총 견적 확인",
  "budget": "130만원 임시예산",
  "url": "https://xn--sm2b21oe3m6la.com/default/"
};

export const studioExtras = [
  {
    "kind": "필수",
    "item": "헬퍼비",
    "price": "₩250,000 현금 봉투 준비",
    "status": "진행중",
    "note": "6시간 초과 시 ₩50,000 추가"
  },
  {
    "kind": "선택",
    "item": "전문 헤어변형",
    "price": "₩55,000 / 1회",
    "status": "확인필요",
    "note": "촬영 1개월 전 사전예약 항목이라 즉시 가능 여부 문의"
  },
  {
    "kind": "선택",
    "item": "헤어피스",
    "price": "₩110,000",
    "status": "미정",
    "note": "촬영 드레스와 헤어스타일에 따라 선택"
  },
  {
    "kind": "선택",
    "item": "드레스 추가·프리미엄",
    "price": "1벌당 ₩110,000",
    "status": "미정",
    "note": "기본 화이트 드레스 3벌 외 추가/업그레이드"
  },
  {
    "kind": "선택",
    "item": "신랑 키높이 구두",
    "price": "₩33,000",
    "status": "미정",
    "note": "250~275mm 대여 가능, 개인 정장구두와 비교"
  },
  {
    "kind": "선택",
    "item": "야간 로드씬",
    "price": "₩220,000",
    "status": "미정",
    "note": "세미드레스 대여 선택 시 ₩110,000 추가"
  },
  {
    "kind": "선택",
    "item": "한복씬",
    "price": "₩110,000~₩220,000",
    "status": "미정",
    "note": "한복 구성에 따라 금액 차등"
  },
  {
    "kind": "선택",
    "item": "가족 기념촬영",
    "price": "기준 인원 외 1인당 ₩110,000",
    "status": "미정",
    "note": "추가 인원 의상·메이크업은 별도 준비"
  }
];

export const timeline = [
  {
    "date": "7.28",
    "title": "원규 스튜디오 촬영 준비/별도비용 확인",
    "state": "진행중"
  },
  {
    "date": "8.02",
    "title": "슈트패브릭 스튜디오 촬영 의상 셀렉·사이즈 확정",
    "state": "진행중"
  },
  {
    "date": "8.02",
    "title": "슈트패브릭 렌탈센터 방문 상담",
    "state": "진행중"
  },
  {
    "date": "8.02",
    "title": "슈트패브릭 본식 턱시도 구성·비용 확정",
    "state": "진행중"
  },
  {
    "date": "8.10",
    "title": "모바일·종이 청첩장 문구/디자인/수량 확정",
    "state": "미정"
  },
  {
    "date": "8.14",
    "title": "원규 촬영 신부 드레스 선택/업그레이드 확정",
    "state": "미정"
  },
  {
    "date": "8.14",
    "title": "원규 웹 포트폴리오 샘플 20컷 선택",
    "state": "미정"
  },
  {
    "date": "11.01",
    "title": "더채플앳 청담 예식",
    "state": "확정"
  }
];

export const honeymoonBookings = [
  {
    "kind": "항공편",
    "date": "2026년 11월 2일",
    "title": "인천(ICN) → 오키나와(OKA)",
    "details": [
      {
        "label": "시간",
        "value": "11:30 출발 · 14:00 도착"
      },
      {
        "label": "운항",
        "value": "이스타항공 ZE0631"
      },
      {
        "label": "좌석",
        "value": "일반석 Q"
      },
      {
        "label": "수하물",
        "value": "15kg"
      }
    ]
  },
  {
    "kind": "숙소",
    "date": "2026년 11월 5일 - 11월 7일 · 2박",
    "title": "할레쿨라니 오키나와",
    "details": [
      {
        "label": "객실",
        "value": "디럭스 오션뷰 선셋윙 킹룸"
      },
      {
        "label": "인원",
        "value": "성인 2명"
      },
      {
        "label": "포함",
        "value": "조식 · Wi-Fi"
      },
      {
        "label": "취소",
        "value": "2026년 10월 28일 전 무료"
      },
      {
        "label": "안내",
        "value": "현지 세금 별도 부과 가능"
      }
    ]
  }
];

export const honeymoonRoute = [
  {
    "date": "11/2",
    "city": "오키나와",
    "plan": "인천 11:30 출발 → 오키나와 14:00 도착 → 체크인",
    "state": "확정"
  },
  {
    "date": "11/3",
    "city": "오키나와",
    "plan": "오키나와 적응일: 국제거리, 아메리칸빌리지, 선셋",
    "state": "초안"
  },
  {
    "date": "11/4",
    "city": "오키나와",
    "plan": "오키나와 북부: 츄라우미, 코우리대교, 해변 드라이브",
    "state": "예약필요"
  },
  {
    "date": "11/5",
    "city": "오키나와",
    "plan": "할레쿨라니 오키나와 체크인 → 리조트 휴식",
    "state": "확정"
  },
  {
    "date": "11/6",
    "city": "오키나와",
    "plan": "할레쿨라니 오키나와 리조트 휴식",
    "state": "확정"
  },
  {
    "date": "11/7",
    "city": "삿포로",
    "plan": "할레쿨라니 체크아웃 → 오키나와→삿포로 이동 → 체크인",
    "state": "예약필요"
  },
  {
    "date": "11/8",
    "city": "오타루",
    "plan": "오타루 당일치기: 운하, 사카이마치, 카페·오르골당",
    "state": "초안"
  },
  {
    "date": "11/9",
    "city": "홋카이도 근교",
    "plan": "조잔케이 온천 또는 노보리베츠 당일치기",
    "state": "예약필요"
  },
  {
    "date": "11/10",
    "city": "삿포로",
    "plan": "삿포로 도심·쇼핑: 오도리공원, 니조시장, 맥주박물관, 마지막 식사",
    "state": "초안"
  },
  {
    "date": "11/11",
    "city": "귀국",
    "plan": "삿포로 출발 → 인천 도착",
    "state": "확정"
  }
];
