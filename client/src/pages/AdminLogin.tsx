import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { bootstrapAdmin as bootstrapAdminRequest, loginAdmin as loginAdminRequest } from "@/lib/api";
import { setAdminToken } from "@/lib/adminAuth";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response =
        mode === "bootstrap"
          ? await bootstrapAdminRequest(email, password)
          : await loginAdminRequest(email, password);
      setAdminToken(response.session.accessToken);
      navigate("/admin");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "관리자 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#08111F" }}>
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mb-6">
          <div className="text-xs font-semibold mb-2" style={{ color: "#6EE7B7" }}>
            Hidden Admin
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: "#F8FAFC" }}>
            운영 콘솔 로그인
          </h1>
          <p className="text-sm" style={{ color: "rgba(248,250,252,0.55)" }}>
            문서 기준일, override, publish, DB 규칙엔진을 관리합니다.
          </p>
        </div>

        <div className="flex gap-2 mb-5">
          {(["login", "bootstrap"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-semibold"
              style={{
                background: mode === item ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.04)",
                border: mode === item ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: mode === item ? "#93C5FD" : "rgba(248,250,252,0.65)",
              }}
            >
              {item === "login" ? "로그인" : "초기 관리자 등록"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <div className="text-xs font-semibold mb-2" style={{ color: "rgba(248,250,252,0.5)" }}>
              이메일
            </div>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-transparent"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#F8FAFC" }}
              placeholder="admin@winners.co.kr"
            />
          </label>
          <label className="block">
            <div className="text-xs font-semibold mb-2" style={{ color: "rgba(248,250,252,0.5)" }}>
              비밀번호
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-transparent"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#F8FAFC" }}
              placeholder="비밀번호 입력"
            />
          </label>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #10B981, #2563EB)",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "처리 중..." : mode === "login" ? "관리자 로그인" : "첫 관리자 계정 만들기"}
          </button>
        </form>
      </div>
    </div>
  );
}
