/**
 * DARUMIX — prescription & consultation service.
 *
 * The upload UI is real (file picker, drag & drop, preview list) but files are
 * never transmitted: only their metadata is kept in localStorage. This is the
 * frontend shape a real "upload to API" implementation would plug into.
 */

import { slices, commit } from "../core/store.js";
import { referenceCode } from "../core/format.js";
import { seedPrescriptions, seedConsultations } from "../data/seed-records.js";
import { CONSULTATION_SLOTS } from "../data/statuses.js";
import * as account from "./account.js";

/* ---------------------------------------------------------------------------
   Uploads (metadata only — nothing leaves the browser)
   --------------------------------------------------------------------------- */

export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

/**
 * Validate a File before adding it to the upload list.
 * @returns {{ok: boolean, reason?: string}}
 */
export function validateFile(file, existingCount = 0) {
  if (!file) return { ok: false, reason: "فایلی انتخاب نشده است." };

  if (existingCount >= MAX_FILES) {
    return {
      ok: false,
      reason: `حداکثر ${MAX_FILES} فایل می‌توانید بارگذاری کنید.`,
    };
  }

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      ok: false,
      reason: "فقط تصویر (JPG، PNG، WebP) یا PDF پذیرفته می‌شود.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, reason: "حجم هر فایل باید کمتر از ۸ مگابایت باشد." };
  }

  return { ok: true };
}

/** Read a File into the lightweight descriptor kept in state. */
export function describeFile(file) {
  return {
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

/* ---------------------------------------------------------------------------
   Prescriptions
   --------------------------------------------------------------------------- */

export function ownPrescriptions() {
  const own = slices.prescriptions.get();
  return Array.isArray(own) ? own : [];
}

/** Own prescriptions first, then a slice of the demo pipeline. */
export function prescriptionHistory(limit = 10) {
  const own = ownPrescriptions();
  const demo = seedPrescriptions
    .slice(0, limit)
    .map((item) => ({ ...item, demo: true }));
  return [...own, ...demo].slice(0, limit);
}

export function prescriptionById(id) {
  const own = ownPrescriptions().find((item) => item.id === id);
  if (own) return own;
  const demo = seedPrescriptions.find((item) => item.id === id);
  return demo ? { ...demo, demo: true } : null;
}

export function countPrescriptions() {
  return ownPrescriptions().length;
}

/** Status summary used by the account dashboard. */
export function prescriptionStats() {
  const all = [...ownPrescriptions(), ...seedPrescriptions];
  return {
    total: all.length,
    inReview: all.filter(
      (item) => item.status === "in-review" || item.status === "submitted",
    ).length,
    approved: all.filter((item) => item.status === "approved").length,
    ready: all.filter((item) => item.status === "ready").length,
    delivered: all.filter((item) => item.status === "delivered").length,
  };
}

/**
 * Submit a prescription request.
 * @param {{files: object[], note?: string, doctorName?: string, insurance?: string, medicineCount?: number, address?: string, phone?: string}} payload
 */
export function submitPrescription(payload) {
  const files = payload.files || [];

  if (files.length === 0) {
    return { ok: false, reason: "حداقل یک تصویر از نسخه را بارگذاری کنید." };
  }

  const profile = account.ensureProfile();

  const prescription = {
    id: referenceCode("RX"),
    customerId: "me",
    customerName: profile.name,
    customerPhone: payload.phone || profile.phone,
    doctorName: payload.doctorName || "",
    insuranceProvider: payload.insurance || "بدون بیمه",
    medicineCount: Number(payload.medicineCount) || files.length,
    files,
    note: payload.note || "",
    status: "submitted",
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    pharmacistName: null,
    estimatedTotal: 0,
    deliveryAddress: payload.address || account.defaultAddress()?.line1 || "",
    mine: true,
    timeline: [
      {
        status: "submitted",
        label: "نسخه ثبت شد",
        at: new Date().toISOString(),
      },
      { status: "in-review", label: "در انتظار بررسی داروساز", at: null },
    ],
  };

  slices.prescriptions.set([prescription, ...ownPrescriptions()]);
  commit("prescriptions");

  account.pushNotification({
    type: "prescription",
    title: "نسخه شما ثبت شد",
    text: "کارشناسان دارومیکس نسخه ارسالی را بررسی می‌کنند و نتیجه را به شما اطلاع می‌دهند.",
    href: "#/account/prescriptions",
  });

  return { ok: true, prescription };
}

export function cancelPrescription(id) {
  const next = ownPrescriptions().filter((item) => item.id !== id);
  slices.prescriptions.set(next);
  commit("prescriptions");
}

/** Admin: advance a prescription through its pipeline. */
export function setPrescriptionStatus(id, status, pharmacistName) {
  const own = ownPrescriptions().map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          reviewedAt: new Date().toISOString(),
          pharmacistName: pharmacistName || item.pharmacistName,
        }
      : item,
  );

  slices.prescriptions.set(own);
  commit("prescriptions");
  return own;
}

/* ---------------------------------------------------------------------------
   Consultations
   --------------------------------------------------------------------------- */

export function ownConsultations() {
  const own = slices.consultations.get();
  return Array.isArray(own) ? own : [];
}

export function consultationHistory(limit = 10) {
  const own = ownConsultations();
  const demo = seedConsultations
    .slice(0, limit)
    .map((item) => ({ ...item, demo: true }));
  return [...own, ...demo].slice(0, limit);
}

export function countConsultations() {
  return ownConsultations().length;
}

/**
 * Which slots are still free on a given date.
 * Deterministic per date so the UI does not "change its mind" between renders.
 */
export function availableSlots(dateKey) {
  const seed = String(dateKey || "today");
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);

  return CONSULTATION_SLOTS.map((slot, index) => ({
    slot,
    taken: (hash + index * 7) % 5 === 0,
  }));
}

/** Book a consultation. */
export function bookConsultation(payload) {
  if (!payload.topic)
    return { ok: false, reason: "موضوع مشاوره را انتخاب کنید." };
  if (!payload.date)
    return { ok: false, reason: "تاریخ مشاوره را انتخاب کنید." };
  if (!payload.slot)
    return { ok: false, reason: "ساعت مشاوره را انتخاب کنید." };

  const profile = account.ensureProfile();

  const consultation = {
    id: referenceCode("CS"),
    customerId: "me",
    customerName: profile.name,
    customerPhone: payload.phone || profile.phone,
    topic: payload.topic,
    question: payload.question || "",
    pharmacistName: payload.pharmacistName || "داروساز دارومیکس",
    date: payload.date,
    slot: payload.slot,
    mode: payload.mode || "phone",
    status: "requested",
    durationMinutes: 15,
    createdAt: new Date().toISOString(),
    mine: true,
  };

  slices.consultations.set([consultation, ...ownConsultations()]);
  commit("consultations");

  account.pushNotification({
    type: "consultation",
    title: "درخواست مشاوره ثبت شد",
    text: `درخواست مشاوره «${payload.topic}» ثبت شد. نتیجه زمان‌بندی به شما اطلاع داده می‌شود.`,
    href: "#/consultation",
  });

  return { ok: true, consultation };
}

export function cancelConsultation(id) {
  const next = ownConsultations().map((item) =>
    item.id === id ? { ...item, status: "cancelled" } : item,
  );

  slices.consultations.set(next);
  commit("consultations");
}

/** Admin: change a consultation's status. */
export function setConsultationStatus(id, status) {
  const next = ownConsultations().map((item) =>
    item.id === id ? { ...item, status } : item,
  );
  slices.consultations.set(next);
  commit("consultations");
  return next;
}

/** Pharmacists available for booking — static demo roster. */
export const PHARMACISTS = [
  {
    id: "ph-1",
    name: "دکتر زهرا موسوی",
    specialty: "داروسازی بالینی",
    rating: 4.9,
    years: 12,
  },
  {
    id: "ph-2",
    name: "دکتر امیر رضایی",
    specialty: "داروسازی عمومی",
    rating: 4.8,
    years: 8,
  },
  {
    id: "ph-3",
    name: "دکتر لیلا حسینی",
    specialty: "مکمل و تغذیه",
    rating: 4.9,
    years: 10,
  },
  {
    id: "ph-4",
    name: "دکتر کامران طاهری",
    specialty: "داروسازی بالینی",
    rating: 4.7,
    years: 15,
  },
];

export default {
  MAX_FILES,
  MAX_FILE_SIZE,
  ACCEPTED_TYPES,
  validateFile,
  describeFile,
  ownPrescriptions,
  prescriptionHistory,
  prescriptionById,
  countPrescriptions,
  prescriptionStats,
  submitPrescription,
  cancelPrescription,
  setPrescriptionStatus,
  ownConsultations,
  consultationHistory,
  countConsultations,
  availableSlots,
  bookConsultation,
  cancelConsultation,
  setConsultationStatus,
  PHARMACISTS,
};
