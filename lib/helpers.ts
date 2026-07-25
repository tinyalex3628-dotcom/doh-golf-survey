// 접수번호 만들기: SW-260725-014 형식 (SW-년월일-순번)
export function makeReceiptNo(seq: number, now = new Date()) {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `SW-${yy}${mm}${dd}-${String(seq).padStart(3, "0")}`;
}

// 예상 도착 안내: "24시간 내 (7/26 오후)"
export function makeEta(now = new Date()) {
  const eta = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const ampm = eta.getHours() < 12 ? "오전" : "오후";
  return `24시간 내 (${eta.getMonth() + 1}/${eta.getDate()} ${ampm})`;
}

// 링크 열람 기한: 만든 날 + 30일 → "8/25"
export function expireDateLabel(createdAt: string | Date) {
  const d = new Date(createdAt);
  const exp = new Date(d.getTime() + 30 * 24 * 60 * 60 * 1000);
  return `${exp.getMonth() + 1}/${exp.getDate()}`;
}

// 링크가 만료됐는지 확인 (30일)
export function isExpired(createdAt: string | Date) {
  const d = new Date(createdAt);
  return Date.now() - d.getTime() > 30 * 24 * 60 * 60 * 1000;
}

// 전화번호 가운데 가리기: 010-••••-3628
export function maskPhone(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 8) return phone;
  return `${digits.slice(0, 3)}-••••-${digits.slice(-4)}`;
}
