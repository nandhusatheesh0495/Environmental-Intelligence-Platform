"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, MapPin, Send, UploadCloud, Camera, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const ENVIRONMENT_OPTIONS = [
  { value: "river", label: "River" },
  { value: "landslide", label: "Landslide" },
  { value: "unknown", label: "Unknown / Other" },
] as const;

const initialForm = {
  environment_type: "river",
  location: "",
  description: "",
  latitude: "",
  longitude: "",
  observation_date: "",
  reporter_name: "",
  reporter_contact: "",
};

export default function CitizenReportPage() {
  const [form, setForm] = React.useState(initialForm);
  const [image, setImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ id?: string; status?: string; message?: string } | null>(null);

  React.useEffect(() => {
    if (!image || typeof window === "undefined") {
      setImagePreview(null);
      return;
    }

    const urlFactory = window.URL;
    const objectUrl = urlFactory.createObjectURL(image);
    setImagePreview(objectUrl);
    return () => urlFactory.revokeObjectURL(objectUrl);
  }, [image]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.environment_type) nextErrors.environment_type = "Environment is required.";
    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (!form.description.trim()) nextErrors.description = "Please describe what you observed.";
    if (form.latitude && (Number(form.latitude) < -90 || Number(form.latitude) > 90)) nextErrors.latitude = "Latitude must be between -90 and 90.";
    if (form.longitude && (Number(form.longitude) < -180 || Number(form.longitude) > 180)) nextErrors.longitude = "Longitude must be between -180 and 180.";
    if (!image) nextErrors.image = "A photo is required.";
    if (form.observation_date && Number.isNaN(new Date(form.observation_date).getTime())) nextErrors.observation_date = "Observation date is invalid.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("environment_type", form.environment_type);
    formData.append("location", form.location);
    formData.append("description", form.description);
    if (form.latitude) formData.append("latitude", form.latitude);
    if (form.longitude) formData.append("longitude", form.longitude);
    if (form.observation_date) formData.append("observation_date", form.observation_date);
    if (form.reporter_name) formData.append("reporter_name", form.reporter_name);
    if (form.reporter_contact) formData.append("reporter_contact", form.reporter_contact);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("http://localhost:8000/api/v1/citizen-reports", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || "Unable to submit report.");
      }
      setResult({ id: payload.id, status: payload.status, message: "Your report has been received and is awaiting review." });
      setForm(initialForm);
      setImage(null);
    } catch (error) {
      setResult({ message: error instanceof Error ? error.message : "Unable to submit report." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700">Citizen Reporting</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Report an Environmental Observation</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Share a visible environmental change or concern. Your report will be reviewed by an environmental officer and is not treated as a verified hazard.
        </p>
      </header>

      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Report submitted</div>
          <p className="mt-2">{result.message}</p>
          {result.id && <p className="mt-2 font-medium">Report ID: {result.id}</p>}
          {result.status && <p className="mt-1">Status: {result.status}</p>}
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setResult(null)}>Submit another report</Button>
            <Link href="/">
              <Button variant="outline" size="sm">Return to dashboard</Button>
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Select
                label="Environment"
                value={form.environment_type}
                onChange={(e) => updateField("environment_type", e.target.value)}
                options={ENVIRONMENT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                error={errors.environment_type}
              />
            </div>

            <div className="md:col-span-2">
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Bridge Pier 4, Aluva"
                error={errors.location}
              />
            </div>

            <Input
              label="Latitude"
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(e) => updateField("latitude", e.target.value)}
              placeholder="10.085"
              error={errors.latitude}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0001"
              value={form.longitude}
              onChange={(e) => updateField("longitude", e.target.value)}
              placeholder="76.315"
              error={errors.longitude}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <UploadCloud className="h-4 w-4" /> Photo evidence
            </div>
            <div className="mt-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Upload photo"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImage(file);
                  if (file) {
                    setErrors((prev) => ({ ...prev, image: "" }));
                  }
                }}
                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded file:border-0 file:bg-accent-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              />
              {errors.image && <p className="mt-2 text-xs text-red-600">{errors.image}</p>}
              {imagePreview && (
                <img src={imagePreview} alt="Citizen report preview" className="mt-3 h-48 w-full rounded-md object-cover border border-slate-200" />
              )}
            </div>
          </div>

          <Textarea
            label="What did you observe?"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe what you saw, where it occurred, and anything unusual about the condition."
            error={errors.description}
            helperText="Your observation will be reviewed by an officer. It is not treated as a verified hazard."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Observation date"
              type="date"
              value={form.observation_date}
              onChange={(e) => updateField("observation_date", e.target.value)}
              error={errors.observation_date}
            />
            <div className="flex items-end">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 w-full">
                <div className="flex items-center gap-2 font-medium"><CalendarDays className="h-4 w-4" /> Optional context</div>
                <p className="mt-1">Date defaults to the actual observation if provided.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Reporter name"
              value={form.reporter_name}
              onChange={(e) => updateField("reporter_name", e.target.value)}
              placeholder="Optional"
            />
            <Input
              label="Contact"
              type="email"
              value={form.reporter_contact}
              onChange={(e) => updateField("reporter_contact", e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg border border-accent-200 bg-accent-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-800">
              <Camera className="h-4 w-4" /> Submission notes
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>Use a clear photo and accurate location if available.</li>
              <li>Reports are reviewed by an officer before action.</li>
              <li>Citizen observations are evidence, not confirmed incidents.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <MapPin className="h-4 w-4" /> Location guidance
            </div>
            <p className="mt-2 text-sm text-slate-600">Coordinates are optional. A written location description is acceptable if the exact map position is not known.</p>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" isLoading={isSubmitting}>
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting Report..." : "Submit Report"}
          </Button>

          {Object.keys(errors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div className="flex items-center gap-2 font-medium"><AlertCircle className="h-4 w-4" /> Please fix the highlighted fields.</div>
            </div>
          )}
        </aside>
      </form>
    </div>
  );
}
