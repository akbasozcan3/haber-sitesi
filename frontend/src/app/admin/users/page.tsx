"use client";

import { useEffect, useState } from "react";
import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import { ApiError, usersApi } from "@/lib/istemci";
import type { User, Id } from "@/types/uygulama";
import {
  PlusCircle, Trash2, Edit3, AlertCircle, Users, X, Loader2,
  ShieldCheck, Mail, User as UserIcon, KeyRound, CheckCircle,
} from "lucide-react";

interface UserForm {
  name: string;
  email: string;
  password: string;
}

const emptyForm: UserForm = { name: "", email: "", password: "" };

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState<Id | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function load() {
    setLoading(true);
    usersApi.list()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(e => setError(e instanceof ApiError ? e.message : "Kullanıcılar yüklenemedi."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, password: "" });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function save() {
    setFormError("");
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Ad ve e-posta zorunludur.");
      return;
    }
    if (!editTarget && !form.password.trim()) {
      setFormError("Yeni kullanıcı için şifre zorunludur.");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const p: Record<string, string> = { name: form.name, email: form.email };
        if (form.password.trim()) p.password = form.password;
        const updated = await usersApi.update(editTarget.id, p);
        setItems(prev => prev.map(u => u.id === updated.id ? updated : u));
        setSuccess("Kullanıcı başarıyla güncellendi.");
      } else {
        const created = await usersApi.create({ name: form.name, email: form.email, password: form.password });
        setItems(prev => [...prev, created]);
        setSuccess("Kullanıcı başarıyla oluşturuldu.");
      }
      closeModal();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(u: User) {
    if (!window.confirm(`"${u.name}" adlı kullanıcıyı silmek istediğinize emin misiniz?`)) return;
    setDeleting(u.id);
    setError("");
    try {
      await usersApi.remove(u.id);
      setItems(prev => prev.filter(x => x.id !== u.id));
      setSuccess("Kullanıcı silindi.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Silinemedi.");
    } finally {
      setDeleting(null);
    }
  }

  function initials(name: string) {
    return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <YonetimKabugu>
      <div className="space-y-6">

        {/* BAŞLIK */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Erişim & Yetkilendirme
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kullanıcı Yönetimi</h1>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              {loading ? "Yükleniyor..." : `${items.length} kayıtlı yönetici hesabı`}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-red-500" />
            <span>Yeni Kullanıcı Ekle</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xs">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto" />
            <p className="mt-3 text-xs text-slate-400">Kullanıcılar yükleniyor...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-xs">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="mt-3 text-sm font-bold text-slate-700">Kullanıcı bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(u => (
              <div
                key={u.id}
                className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
              >
                {/* Avatar & Bilgi */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-red-500 shadow-xs">
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900 text-sm">{u.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <p className="truncate text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </div>

                {/* Rozet */}
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Yönetici</span>
                </div>

                {/* Aksiyonlar */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEdit(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Düzenle</span>
                  </button>

                  <button
                    type="button"
                    disabled={deleting === u.id}
                    onClick={() => remove(u)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 disabled:opacity-40 transition-colors cursor-pointer"
                    title="Sil"
                  >
                    {deleting === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-red-500">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {editTarget ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {editTarget ? `#${editTarget.id} &middot; ${editTarget.email}` : "Yönetim paneli için yeni hesap"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal İçerik */}
            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
                  <UserIcon className="h-3 w-3 text-slate-400" /> Ad Soyad
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
                  <Mail className="h-3 w-3 text-slate-400" /> E-Posta Adresi
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ahmet@zernews.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
                  <KeyRound className="h-3 w-3 text-slate-400" /> Şifre
                  {editTarget && <span className="font-normal text-slate-400 text-[10px] ml-1">(boş bırakılırsa değişmez)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Modal Altbilgi */}
            <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                İptal
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>{editTarget ? "Değişiklikleri Kaydet" : "Kullanıcıyı Oluştur"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </YonetimKabugu>
  );
}
