import crypto from "crypto";

// ============================================================
// 카카오 알림톡 발송 (Solapi 라는 문자/알림톡 발송 회사 이용)
//
// 아직 알림톡 준비가 안 됐다면 그냥 두세요 —
// 환경변수가 비어 있으면 발송을 건너뛰고,
// 관리자 화면에서 "링크 복사" 버튼으로 직접 카톡을 보내면 됩니다.
// ============================================================

export type AlimtalkParams = {
  phone: string; // 받는 사람 번호 (예: 01012345678)
  receiptNo: string; // 접수번호
  diagnosis: string; // 한 줄 진단
  link: string; // 피드백 열람 링크
  expireDate: string; // 열람 기한 (예: 8/25)
};

export function isAlimtalkConfigured() {
  return Boolean(
    process.env.SOLAPI_API_KEY &&
      process.env.SOLAPI_API_SECRET &&
      process.env.SOLAPI_PF_ID &&
      process.env.SOLAPI_TEMPLATE_ID &&
      process.env.SOLAPI_SENDER_PHONE
  );
}

export async function sendAlimtalk(params: AlimtalkParams): Promise<{ ok: boolean; detail: string }> {
  if (!isAlimtalkConfigured()) {
    return { ok: false, detail: "알림톡 설정이 아직 없어요. 링크를 복사해서 직접 카톡으로 보내주세요." };
  }

  const apiKey = process.env.SOLAPI_API_KEY!;
  const apiSecret = process.env.SOLAPI_API_SECRET!;
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");

  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({
      message: {
        to: params.phone.replace(/[^0-9]/g, ""),
        from: process.env.SOLAPI_SENDER_PHONE,
        kakaoOptions: {
          pfId: process.env.SOLAPI_PF_ID,
          templateId: process.env.SOLAPI_TEMPLATE_ID,
          // 템플릿 안의 #{변수} 자리에 들어갈 값들
          variables: {
            "#{접수번호}": params.receiptNo,
            "#{진단}": params.diagnosis,
            "#{링크}": params.link,
            "#{기한}": params.expireDate,
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, detail: `알림톡 발송 실패: ${text}` };
  }
  return { ok: true, detail: "알림톡을 보냈어요." };
}
