import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// ============================================================
// 관리자(프로님) 화면 — 신청 목록 (PC 기준 넓은 레이아웃)
// admins 테이블에 등록된 계정으로 로그인해야 목록이 보여요.
// ============================================================
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return (
      <main className="desk">
        <h1 className="desk-title">관리자 페이지</h1>
        <p className="desk-sub" style={{ marginBottom: 20 }}>
          먼저 홈에서 카카오 로그인을 해주세요.
        </p>
        <Link href="/" className="btn-desk-ghost" style={{ display: "inline-block" }}>
          홈으로
        </Link>
      </main>
    );
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!adminRow) {
    return (
      <main className="desk">
        <h1 className="desk-title">접근 권한이 없어요.</h1>
        <p className="desk-sub" style={{ marginBottom: 16, lineHeight: 1.7 }}>
          이 계정은 관리자로 등록되어 있지 않아요.
          <br />
          (내 계정 ID: {userData.user.id})
          <br />
          Supabase의 admins 테이블에 위 ID를 추가하면 관리자가 됩니다.
        </p>
      </main>
    );
  }

  const { data: requests } = await supabase
    .from("requests")
    .select("*, request_files(kind)")
    .order("created_at", { ascending: false });

  const all = requests ?? [];
  const waiting = all.filter((r: any) => r.status !== "done");
  const done = all.filter((r: any) => r.status === "done");

  const filter = searchParams.filter === "done" ? "done" : searchParams.filter === "all" ? "all" : "waiting";
  const shown = filter === "done" ? done : filter === "all" ? all : waiting;

  // 오늘 들어온 신청 수
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = all.filter((r: any) => new Date(r.created_at) >= todayStart).length;

  return (
    <main className="desk">
      <div className="desk-header">
        <div>
          <h1 className="desk-title">신청 관리</h1>
          <p className="desk-sub">받은 스윙 영상을 확인하고 피드백을 보냅니다.</p>
        </div>
        <div className="filter-tabs">
          <Link href="/admin?filter=waiting" className={`filter-tab ${filter === "waiting" ? "on" : ""}`}>
            작업 대기 {waiting.length}
          </Link>
          <Link href="/admin?filter=done" className={`filter-tab ${filter === "done" ? "on" : ""}`}>
            완료 {done.length}
          </Link>
          <Link href="/admin?filter=all" className={`filter-tab ${filter === "all" ? "on" : ""}`}>
            전체 {all.length}
          </Link>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">작업 대기</div>
          <div className="stat-value" style={{ color: waiting.length > 0 ? "#3182f6" : undefined }}>
            {waiting.length}건
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">오늘 들어온 신청</div>
          <div className="stat-value">{todayCount}건</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">피드백 완료</div>
          <div className="stat-value">{done.length}건</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">전체 신청</div>
          <div className="stat-value">{all.length}건</div>
        </div>
      </div>

      <div className="table-wrap">
        {shown.length === 0 ? (
          <div className="empty-box">
            {filter === "waiting"
              ? "작업할 신청이 없어요. 모두 처리하셨습니다 👏"
              : "표시할 신청이 없어요."}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="desk-table">
              <thead>
                <tr>
                  <th style={{ width: 150 }}>접수번호</th>
                  <th style={{ width: 110 }}>상태</th>
                  <th style={{ width: 130 }}>받은 자료</th>
                  <th>고민</th>
                  <th style={{ width: 260 }}>남긴 말</th>
                  <th style={{ width: 130 }}>신청 시각</th>
                  <th style={{ width: 120 }}>연락처</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r: any) => {
                  const v = r.request_files.filter((f: any) => f.kind === "video").length;
                  const p = r.request_files.filter((f: any) => f.kind === "photo").length;
                  const d = new Date(r.created_at);
                  return (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/admin/${r.id}`} className="row-link">
                          {r.receipt_no}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${r.status === "done" ? "done" : "received"}`}>
                          {r.status === "done" ? "피드백 완료" : "작업 대기"}
                        </span>
                      </td>
                      <td className="cell-muted nowrap">
                        영상 {v}개{p > 0 ? ` · 사진 ${p}장` : ""}
                      </td>
                      <td>
                        {r.concerns?.length > 0 ? (
                          r.concerns.map((c: string) => (
                            <span className="concern-tag" key={c}>
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="cell-muted">-</span>
                        )}
                      </td>
                      <td className="cell-muted" style={{ maxWidth: 260 }}>
                        {r.note
                          ? r.note.length > 60
                            ? r.note.slice(0, 60) + "…"
                            : r.note
                          : "-"}
                      </td>
                      <td className="cell-muted nowrap">
                        {d.getMonth() + 1}/{d.getDate()}{" "}
                        {String(d.getHours()).padStart(2, "0")}:
                        {String(d.getMinutes()).padStart(2, "0")}
                      </td>
                      <td className="cell-muted nowrap">{r.phone || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
