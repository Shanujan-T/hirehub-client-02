"use client";

import { Button, Input, SelectMenu } from "@/components/ui";
import type { ScopeData, ScopeFieldDefinition } from "@/types/job";

export function JobScopeFields({
  schema,
  value,
  onChange,
}: {
  schema: ScopeFieldDefinition[];
  value: ScopeData;
  onChange: (next: ScopeData) => void;
}) {
  if (!schema.length) return null;

  const setField = (key: string, fieldValue: ScopeData[string]) => {
    onChange({ ...value, [key]: fieldValue });
  };

  const toggleMulti = (key: string, option: string) => {
    const current = Array.isArray(value[key]) ? (value[key] as string[]) : [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setField(key, next);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-3 dark:bg-card/40">
      <p className="text-sm font-semibold text-foreground">Job scope</p>
      {schema.map((field) => {
        const required = field.required !== false;
        const labelId = `scope-label-${field.key}`;
        return (
          <div key={field.key} className="space-y-2">
            <label id={labelId} className="text-sm font-semibold">
              {field.label}
              {required ? " *" : ""}
              {field.unit ? ` (${field.unit})` : ""}
            </label>
            {field.type === "number" && (
              <Input
                id={`scope-${field.key}`}
                type="number"
                min="0"
                step="any"
                value={value[field.key] === undefined ? "" : String(value[field.key])}
                onChange={(e) =>
                  setField(
                    field.key,
                    e.target.value === "" ? ("" as unknown as number) : Number(e.target.value)
                  )
                }
                placeholder={
                  field.affects_price && field.unit_size
                    ? `e.g. ${field.unit_size}`
                    : field.unit
                      ? `e.g. 500`
                      : undefined
                }
                aria-labelledby={labelId}
              />
            )}
            {field.type === "text" && (
              <Input
                id={`scope-${field.key}`}
                type="text"
                value={typeof value[field.key] === "string" ? (value[field.key] as string) : ""}
                onChange={(e) => setField(field.key, e.target.value)}
                aria-labelledby={labelId}
              />
            )}
            {field.type === "select" && (
              <SelectMenu
                id={`scope-${field.key}`}
                aria-labelledby={labelId}
                value={typeof value[field.key] === "string" ? (value[field.key] as string) : ""}
                onChange={(v) => setField(field.key, v)}
                placeholder="Select…"
                options={(field.options || []).map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
              />
            )}
            {field.type === "multiselect" && (
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-labelledby={labelId}
              >
                {(field.options || []).map((opt) => {
                  const selected = Array.isArray(value[field.key])
                    ? (value[field.key] as string[]).includes(opt)
                    : false;
                  return (
                    <Button
                      key={opt}
                      type="button"
                      variant={selected ? "gradient" : "outline"}
                      size="sm"
                      className="rounded-full"
                      aria-pressed={selected}
                      onClick={() => toggleMulti(field.key, opt)}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
