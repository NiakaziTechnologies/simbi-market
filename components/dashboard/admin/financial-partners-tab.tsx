"use client"

import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { JsonSchemaJsonField } from "@/components/dashboard/admin/json-schema-example"
import {
  FP_FIELD_DEFINITIONS_EXAMPLE,
  FP_INTEGRATION_CONFIG_EXAMPLE,
  FP_SECRETS_MERGE_EXAMPLE,
} from "@/lib/admin/financial-partner-json-examples"
import {
  createFinancialPartner,
  deleteFinancialPartner,
  listFinancialPartners,
  updateFinancialPartner,
  updateFinancialPartnerSecrets,
  type CreateFinancialPartnerBody,
  type FinancialPartnerSummary,
  type IntegrationConfigJson,
  type PartnerFieldDefinition,
} from "@/lib/api/admin-financial-partners"
import { Loader2, Pencil, Plus, Trash2, KeyRound, Eye, EyeOff } from "lucide-react"

function parseJsonField<T>(raw: string, label: string): T {
  const t = raw.trim()
  if (!t) throw new Error(`${label}: empty`)
  return JSON.parse(t) as T
}

function validateFieldDefinitions(arr: unknown): PartnerFieldDefinition[] {
  if (!Array.isArray(arr)) throw new Error("fieldDefinitionsJson must be a JSON array")
  return arr.map((row, i) => {
    if (!row || typeof row !== "object") throw new Error(`Row ${i + 1}: invalid object`)
    const o = row as Record<string, unknown>
    if (!o.key || typeof o.key !== "string") throw new Error(`Row ${i + 1}: missing key`)
    if (!o.label || typeof o.label !== "string") throw new Error(`Row ${i + 1}: missing label`)
    if (!o.type || typeof o.type !== "string") throw new Error(`Row ${i + 1}: missing type`)
    return {
      key: o.key,
      label: o.label,
      type: o.type,
      required: Boolean(o.required),
    }
  })
}

function normalizePartner(p: FinancialPartnerSummary): FinancialPartnerSummary {
  const fd = p.fieldDefinitionsJson
  const ic = p.integrationConfigJson
  return {
    ...p,
    fieldDefinitionsJson: Array.isArray(fd) ? fd : [],
    integrationConfigJson:
      ic && typeof ic === "object" ? (ic as IntegrationConfigJson) : {},
  }
}

const emptyCreate: CreateFinancialPartnerBody = {
  name: "",
  slug: "",
  description: "",
  minAmount: null,
  maxAmount: null,
  interestRate: null,
  termMonths: null,
  logo: "",
  contactEmail: "",
  feesAndTermsSummary: "",
  isActive: true,
  fieldDefinitionsJson: [],
  integrationConfigJson: {},
  apiEndpoint: null,
  apiKey: null,
  webhookUrl: null,
}

export function FinancialPartnersTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [partners, setPartners] = useState<FinancialPartnerSummary[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FinancialPartnerSummary | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreateFinancialPartnerBody>(emptyCreate)
  const [fieldsJson, setFieldsJson] = useState("[]")
  const [integrationJson, setIntegrationJson] = useState("{}")
  const [secretsJson, setSecretsJson] = useState("{}")
  const [secretsDialogOpen, setSecretsDialogOpen] = useState(false)
  const [secretsPartner, setSecretsPartner] = useState<FinancialPartnerSummary | null>(null)
  const [secretsBody, setSecretsBody] = useState("{}")
  const [showCreateSecrets, setShowCreateSecrets] = useState(false)
  const [showEditSecrets, setShowEditSecrets] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FinancialPartnerSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listFinancialPartners()
      if (!res.success || !Array.isArray(res.data)) {
        throw new Error(res.message || "Invalid response")
      }
      setPartners(res.data.map(normalizePartner))
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast({
        title: "Could not load partners",
        description: err.message || "Check admin API /api/admin/financial-partners",
        variant: "destructive",
      })
      setPartners([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyCreate })
    setFieldsJson(JSON.stringify(emptyCreate.fieldDefinitionsJson, null, 2))
    setIntegrationJson(JSON.stringify(emptyCreate.integrationConfigJson, null, 2))
    setSecretsJson("{}")
    setShowCreateSecrets(false)
    setDialogOpen(true)
  }

  const openEdit = (p: FinancialPartnerSummary) => {
    const n = normalizePartner(p)
    setEditing(n)
    setForm({
      name: n.name,
      slug: n.slug,
      description: n.description ?? "",
      minAmount: n.minAmount ?? null,
      maxAmount: n.maxAmount ?? null,
      interestRate: n.interestRate ?? null,
      termMonths: n.termMonths ?? null,
      logo: n.logo ?? "",
      contactEmail: n.contactEmail ?? "",
      feesAndTermsSummary: n.feesAndTermsSummary ?? "",
      isActive: n.isActive,
      fieldDefinitionsJson: n.fieldDefinitionsJson,
      integrationConfigJson: n.integrationConfigJson,
      apiEndpoint: n.apiEndpoint ?? null,
      apiKey: n.apiKey ?? null,
      webhookUrl: n.webhookUrl ?? null,
    })
    setFieldsJson(JSON.stringify(n.fieldDefinitionsJson, null, 2))
    setIntegrationJson(JSON.stringify(n.integrationConfigJson, null, 2))
    setSecretsJson("{}")
    setDialogOpen(true)
  }

  const openSecrets = (p: FinancialPartnerSummary) => {
    setSecretsPartner(p)
    setSecretsBody("{}")
    setShowEditSecrets(false)
    setSecretsDialogOpen(true)
  }

  const handleSavePartner = async () => {
    let fieldDefinitionsJson: PartnerFieldDefinition[]
    let integrationConfigJson: IntegrationConfigJson
    try {
      fieldDefinitionsJson = validateFieldDefinitions(parseJsonField(fieldsJson, "Seller fields"))
      integrationConfigJson = parseJsonField<IntegrationConfigJson>(
        integrationJson,
        "Integration config"
      )
    } catch (e: unknown) {
      const err = e as Error
      toast({ title: "Invalid JSON", description: err.message, variant: "destructive" })
      return
    }

    let integrationSecretsJson: Record<string, string> | undefined
    if (!editing && secretsJson.trim() && secretsJson.trim() !== "{}") {
      try {
        const s = parseJsonField<Record<string, string>>(secretsJson, "Secrets")
        integrationSecretsJson = s
      } catch (e: unknown) {
        const err = e as Error
        toast({ title: "Invalid secrets JSON", description: err.message, variant: "destructive" })
        return
      }
    }

    const payload: CreateFinancialPartnerBody = {
      ...form,
      fieldDefinitionsJson,
      integrationConfigJson,
      ...(integrationSecretsJson ? { integrationSecretsJson } : {}),
    }

    setSaving(true)
    try {
      if (editing) {
        const res = await updateFinancialPartner(editing.id, {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          minAmount: payload.minAmount,
          maxAmount: payload.maxAmount,
          interestRate: payload.interestRate,
          termMonths: payload.termMonths,
          logo: payload.logo,
          contactEmail: payload.contactEmail,
          feesAndTermsSummary: payload.feesAndTermsSummary,
          isActive: payload.isActive,
          fieldDefinitionsJson,
          integrationConfigJson,
          apiEndpoint: payload.apiEndpoint,
          apiKey: payload.apiKey,
          webhookUrl: payload.webhookUrl,
        })
        if (!res.success) throw new Error(res.message || "Update failed")
        toast({ title: "Partner updated" })
      } else {
        const res = await createFinancialPartner(payload)
        if (!res.success) throw new Error(res.message || "Create failed")
        toast({ title: "Partner created" })
      }
      setDialogOpen(false)
      await load()
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      if (err.status === 403) {
        toast({
          title: "Permission denied",
          description: "Super admin required for partner changes.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Save failed",
          description: err.message || "Request failed",
          variant: "destructive",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSecrets = async () => {
    if (!secretsPartner) return
    let obj: Record<string, string | null>
    try {
      obj = parseJsonField<Record<string, string | null>>(secretsBody, "Secrets")
    } catch (e: unknown) {
      toast({
        title: "Invalid JSON",
        description: (e as Error).message,
        variant: "destructive",
      })
      return
    }
    const normalized: Record<string, string | null | undefined> = {}
    for (const [k, v] of Object.entries(obj)) {
      normalized[k] = v === "" || v == null ? null : v
    }
    setSaving(true)
    try {
      await updateFinancialPartnerSecrets(secretsPartner.id, normalized)
      toast({ title: "Secrets updated" })
      setSecretsDialogOpen(false)
      await load()
    } catch (e: unknown) {
      const err = e as { message?: string; status?: number }
      toast({
        title: err.status === 403 ? "Permission denied" : "Failed",
        description: err.message || "Could not update secrets",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteFinancialPartner(deleteTarget.id)
      toast({ title: "Partner deleted" })
      setDeleteTarget(null)
      await load()
    } catch (e: unknown) {
      const err = e as { message?: string; data?: { message?: string } }
      toast({
        title: "Delete failed",
        description:
          err.data?.message ||
          err.message ||
          "Partner may have loan applications — deactivate instead.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground font-light max-w-xl">
          Lending partners, seller form fields, and outbound HTTP config. Secrets are stored via
          &quot;Secrets&quot; only and never shown in list/detail.
        </p>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add partner
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading partners…
        </div>
      ) : partners.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">No financial partners yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Secrets</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                <TableCell>{p.isActive ? "Yes" : "No"}</TableCell>
                <TableCell>{p.hasIntegrationSecrets ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openSecrets(p)}>
                    <KeyRound className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[98vw] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit partner" : "New partner"}</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-zinc-400">
              Super admin only on save. JSON fields are validated before submit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="fp-name">Name</Label>
              <Input
                id="fp-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fp-slug">Slug</Label>
              <Input
                id="fp-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fp-desc">Description</Label>
              <Textarea
                id="fp-desc"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Min amount</Label>
                <Input
                  type="number"
                  value={form.minAmount ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minAmount: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Max amount</Label>
                <Input
                  type="number"
                  value={form.maxAmount ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxAmount: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Interest rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.interestRate ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      interestRate: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Term (months)</Label>
                <Input
                  type="number"
                  value={form.termMonths ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      termMonths: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Logo URL</Label>
              <Input
                value={form.logo ?? ""}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact email</Label>
              <Input
                type="email"
                value={form.contactEmail ?? ""}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fees & terms summary</Label>
              <Textarea
                value={form.feesAndTermsSummary ?? ""}
                onChange={(e) => setForm({ ...form, feesAndTermsSummary: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="fp-active"
                checked={form.isActive ?? true}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label htmlFor="fp-active">Active</Label>
            </div>
            <div className="grid gap-2">
              <Label>Legacy API endpoint (optional)</Label>
              <Input
                value={form.apiEndpoint ?? ""}
                onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value || null })}
                placeholder="Full URL if not using integrationConfigJson"
              />
            </div>
            <JsonSchemaJsonField
              label="fieldDefinitionsJson (seller form)"
              description="JSON array of field definitions shown to sellers on the loan application form."
              example={FP_FIELD_DEFINITIONS_EXAMPLE}
            >
              <Textarea value={fieldsJson} onChange={(e) => setFieldsJson(e.target.value)} rows={10} spellCheck={false} />
            </JsonSchemaJsonField>
            <JsonSchemaJsonField
              label="integrationConfigJson (non-secret)"
              description="HTTP integration used by background jobs: base URL, submit/status paths and methods. Do not put secrets here."
              example={FP_INTEGRATION_CONFIG_EXAMPLE}
            >
              <Textarea
                value={integrationJson}
                onChange={(e) => setIntegrationJson(e.target.value)}
                rows={12}
                spellCheck={false}
              />
            </JsonSchemaJsonField>
            {!editing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-semibold text-foreground dark:text-zinc-100">
                    integrationSecretsJson (create only)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateSecrets((v) => !v)}
                    className="h-8 shrink-0 gap-1.5"
                  >
                    {showCreateSecrets ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Show
                      </>
                    )}
                  </Button>
                </div>
                <JsonSchemaJsonField
                  description="Create-only merge. Keys are stored as integrationSecretsJson on the server."
                  example={FP_SECRETS_MERGE_EXAMPLE}
                  hint="Shown once when creating a partner. Use the eye control to reveal values while editing."
                >
                  <Textarea
                    value={secretsJson}
                    onChange={(e) => setSecretsJson(e.target.value)}
                    rows={8}
                    spellCheck={false}
                    style={!showCreateSecrets ? { WebkitTextSecurity: "disc" } : undefined}
                  />
                </JsonSchemaJsonField>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleSavePartner()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={secretsDialogOpen} onOpenChange={setSecretsDialogOpen}>
        <DialogContent className="w-[96vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Integration secrets</DialogTitle>
            <DialogDescription className="text-muted-foreground dark:text-zinc-400">
              {secretsPartner?.name} — merge JSON keys. Use null or empty string to remove a key.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEditSecrets((v) => !v)}
              className="h-8 gap-1.5"
            >
              {showEditSecrets ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Show
                </>
              )}
            </Button>
          </div>
          <JsonSchemaJsonField
            description="Merge patch: set new values or use null to remove a key from stored secrets."
            example={FP_SECRETS_MERGE_EXAMPLE}
            hint="Only keys you include are updated; other stored keys are left unchanged unless you set them to null."
          >
            <Textarea
              value={secretsBody}
              onChange={(e) => setSecretsBody(e.target.value)}
              rows={12}
              spellCheck={false}
              style={!showEditSecrets ? { WebkitTextSecurity: "disc" } : undefined}
            />
          </JsonSchemaJsonField>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecretsDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void handleSaveSecrets()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save secrets"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete partner?</AlertDialogTitle>
            <AlertDialogDescription>
              Only allowed if no loan applications reference this partner. Otherwise set inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
