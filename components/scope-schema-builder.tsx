"use client";

import { Button, Input, Label } from "@/components/ui";
import type { ScopeFieldDefinition, ScopeFieldType } from "@/types/job";

const TYPE_OPTIONS: { value: ScopeFieldType; label: string }[] = [
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multiselect" },
  { value: "text", label: "Text" },
];

function emptyField(): ScopeFieldDefinition {
  return {
    key: "",
    label: "",
    type: "number",
    required: true,
    affects_price: false,
    unit_size: 1,
    options: [],
  };
}

export function ScopeSchemaBuilder({
  value,
  onChange,
}: {
  value: ScopeFieldDefinition[];
  onChange: (next: ScopeFieldDefinition[]) => void;
}) {
  const update = (index: number, patch: Partial<ScopeFieldDefinition>) => {
    const next = value.map((field, i) => (i === index ? { ...field, ...patch } : field));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>Scope fields</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => onChange([...value, emptyField()])}
        >
          Add field
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="text-xs text-muted">
          Optional. Add fields like area (sq ft) or word count. Mark number fields as
          &quot;Affects price&quot; to drive Suggested Price scaling.
        </p>
      ) : (
        value.map((field, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Key</Label>
                <Input
                  value={field.key}
                  placeholder="area_sqft"
                  onChange={(e) =>
                    update(index, {
                      key: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Label</Label>
                <Input
                  value={field.label}
                  placeholder="Area (sq ft)"
                  onChange={(e) => update(index, { label: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                  value={field.type}
                  onChange={(e) => {
                    const type = e.target.value as ScopeFieldType;
                    update(index, {
                      type,
                      affects_price: type === "number" ? Boolean(field.affects_price) : false,
                      unit_size: type === "number" ? field.unit_size ?? 1 : undefined,
                    });
                  }}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Unit (optional)</Label>
                <Input
                  value={field.unit || ""}
                  placeholder="sq ft"
                  onChange={(e) => update(index, { unit: e.target.value })}
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={field.required !== false}
                    onChange={(e) => update(index, { required: e.target.checked })}
                  />
                  Required
                </label>
              </div>
            </div>
            {field.type === "number" && (
              <div className="grid gap-2 rounded-lg border border-border/60 bg-background/50 p-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={Boolean(field.affects_price)}
                    onChange={(e) => update(index, { affects_price: e.target.checked })}
                  />
                  Affects price?
                </label>
                <div className="space-y-1">
                  <Label>Unit size</Label>
                  <Input
                    type="number"
                    min="0.0001"
                    step="any"
                    disabled={!field.affects_price}
                    value={field.unit_size ?? 1}
                    onChange={(e) =>
                      update(index, {
                        unit_size: e.target.value === "" ? 1 : Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 100"
                  />
                  <p className="text-[11px] text-muted">
                    Price scales by value ÷ unit size (e.g. 1000 words ÷ 100 = 10×).
                  </p>
                </div>
              </div>
            )}
            {(field.type === "select" || field.type === "multiselect") && (
              <div className="space-y-1">
                <Label>Options (comma-separated)</Label>
                <Input
                  value={(field.options || []).join(", ")}
                  placeholder="Portfolio, Blog/CMS, E-commerce"
                  onChange={(e) =>
                    update(index, {
                      options: e.target.value
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
