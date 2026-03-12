// Design: Dark Fintech Minimal — Subsidy list with filter sidebar and card grid
import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Search, ChevronRight, Filter, X } from "lucide-react";
import type { SubsidyCategory } from "@shared/subsidy";
import Navigation from "@/components/Navigation";
import {
  categories,
  categoryColors,
} from "@/lib/subsidyData";
import { usePrograms } from "@/hooks/usePrograms";

export default function SubsidyList() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialCategory = params.get("category") as SubsidyCategory | null;
  const { programs } = usePrograms();

  const [selectedCategory, setSelectedCategory] = useState<SubsidyCategory | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    return programs.filter((entry) => {
      const s = entry.program;
      const matchCat = !selectedCategory || s.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [programs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      {/* Header */}
      <div
        className="pt-24 pb-12"
        style={{
          background: "linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm font-semibold mb-2" style={{ color: "#60A5FA" }}>
              2026년도 고용장려금
            </div>
            <h1
              className="text-3xl md:text-4xl font-black mb-4"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
              전체 지원금 안내
            </h1>
            <p className="text-base" style={{ color: "rgba(248,250,252,0.55)" }}>
              총 {programs.length}개 고용장려금 제도를 확인하세요.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="lg:w-56 flex-shrink-0">
            {/* Mobile filter toggle */}
            <button
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-xl mb-4 text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F8FAFC",
              }}
              onClick={() => setShowFilter(!showFilter)}
            >
              <span className="flex items-center gap-2">
                <Filter size={16} /> 카테고리 필터
              </span>
              {showFilter ? <X size={16} /> : <ChevronRight size={16} />}
            </button>

            <div className={`${showFilter ? "block" : "hidden"} lg:block`}>
              <div className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "rgba(248,250,252,0.35)" }}>
                카테고리
              </div>
              <div className="flex flex-col gap-1">
                <button
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: !selectedCategory ? "rgba(59,130,246,0.15)" : "transparent",
                    color: !selectedCategory ? "#93C5FD" : "rgba(248,250,252,0.55)",
                    border: !selectedCategory ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                  }}
                  onClick={() => setSelectedCategory(null)}
                >
                  전체 ({programs.length})
                </button>
                {categories.map((cat) => {
                  const color = categoryColors[cat];
                  const count = programs.filter((entry) => entry.program.category === cat).length;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      className="text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: isActive ? color.bg : "transparent",
                        color: isActive ? color.text : "rgba(248,250,252,0.55)",
                        border: isActive ? `1px solid ${color.border}` : "1px solid transparent",
                      }}
                      onClick={() => setSelectedCategory(isActive ? null : cat)}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(248,250,252,0.3)" }}
              />
              <input
                type="text"
                placeholder="지원금명, 키워드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#F8FAFC",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(59,130,246,0.4)";
                  e.target.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </div>

            {/* Results count */}
            <div className="text-sm mb-5" style={{ color: "rgba(248,250,252,0.4)" }}>
              {filtered.length}개 지원금
              {selectedCategory && (
                <span> · <span style={{ color: categoryColors[selectedCategory].text }}>{selectedCategory}</span></span>
              )}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filtered.map((subsidy, i) => {
                const program = subsidy.program;
                const color = categoryColors[program.category];
                return (
                  <motion.div
                    key={program.legacyId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                  >
                    <Link href={`/subsidies/${program.legacyId}`}>
                      <div
                        className="group p-5 rounded-2xl cursor-pointer transition-all duration-300 h-full flex flex-col"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = color.border;
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                        }}
                      >
                        {/* Category badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{
                              background: color.bg,
                              border: `1px solid ${color.border}`,
                              color: color.text,
                            }}
                          >
                            {program.category}
                          </span>
                          {program.highlight && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(252,211,77,0.1)",
                                border: "1px solid rgba(252,211,77,0.3)",
                                color: "#FCD34D",
                              }}
                            >
                              주요
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold mb-0.5" style={{ color: "#F8FAFC" }}>
                          {program.name}
                        </h3>
                        {program.subName && (
                          <div className="text-xs mb-2" style={{ color: color.text }}>
                            {program.subName}
                          </div>
                        )}

                        {/* Description */}
                        <p
                          className="text-sm leading-relaxed flex-1 mb-4"
                          style={{ color: "rgba(248,250,252,0.5)" }}
                        >
                          {program.summary.length > 90
                            ? program.summary.slice(0, 90) + "..."
                            : program.summary}
                        </p>

                        {/* Footer */}
                        <div
                          className="flex items-center justify-between pt-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div>
                            <div className="text-xs mb-0.5" style={{ color: "rgba(248,250,252,0.35)" }}>
                              지원 금액
                            </div>
                            <div className="text-sm font-bold" style={{ color: color.text }}>
                              {program.amountLabel}
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            style={{ color: "rgba(248,250,252,0.25)" }}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20" style={{ color: "rgba(248,250,252,0.35)" }}>
                <Search size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-base">검색 결과가 없습니다.</p>
                <p className="text-sm mt-1">다른 키워드로 검색해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-8 mt-16"
        style={{
          background: "rgba(5,8,15,0.9)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container text-center text-xs" style={{ color: "rgba(248,250,252,0.25)" }}>
          본 사이트의 정보는 참고용이며, 실제 지원금 신청 시 관할 고용센터 또는 전문 노무사와 상담하시기 바랍니다.
        </div>
      </footer>
    </div>
  );
}
