"use client";
import React, { useState } from "react";
import { FileDown, SquarePen, Presentation, Sliders } from "lucide-react";
import AdminView from "./_components/AdminView";
import ReportsView from "./_components/ReportsView";
import SettingsView from "./_components/SettingsView";

export default function BehaviorsPage() {
  const [activeTab, setActiveTab] = useState<"admin" | "reports" | "settings">("admin");

  return (
    <div className="min-h-screen p-6 font-cairo">
      {/* <header className="mb-10 flex items-center justify-between rounded-2xl border border-white/50 bg-white/70 px-8 py-5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-lg font-extrabold text-white shadow-lg shadow-violet-500/30">
            AD
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-800">
              مدير النظام
            </h4>
            <p className="text-xs font-semibold text-slate-500">
              كامل الصلاحيات المركزية
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50">
            <i className="fa-solid fa-bell"></i>
          </button>
        </div>
      </header> */}

      <section id="behavior-evaluation">
        <div className="mb-9 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">لوحة السلوك والتقييم</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">تتبع تقارير أداء المعلمين اليومية وسلوك التلاميذ.</p>
          </div>
          <div className="flex gap-4">
            <button
              className="group flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-1 hover:shadow-violet-500/40"
              onClick={() => window.print()}>
              <FileDown size={18} />
              تصدير البيانات
            </button>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="mb-4 flex w-fit gap-4 rounded-3xl border border-slate-200 bg-white/50 p-2.5 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
              activeTab === "admin" ? "bg-white text-violet-600 shadow-md shadow-violet-500/10" : "text-slate-500 hover:bg-violet-500/5 hover:text-violet-600"
            }`}>
            <SquarePen size={20} /> تسجيل السلوك
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
              activeTab === "reports" ? "bg-white text-violet-600 shadow-md shadow-violet-500/10" : "text-slate-500 hover:bg-violet-500/5 hover:text-violet-600"
            }`}>
            <Presentation size={20} /> تقارير المعلمين
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
              activeTab === "settings" ? "bg-white text-violet-600 shadow-md shadow-violet-500/10" : "text-slate-500 hover:bg-violet-500/5 hover:text-violet-600"
            }`}>
            <Sliders size={20} /> معايير التقييم
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-fadeIn">
          {activeTab === "admin" && <AdminView />}
          {activeTab === "reports" && <ReportsView />}
          {activeTab === "settings" && <SettingsView />}
        </div>
      </section>
    </div>
  );
}
