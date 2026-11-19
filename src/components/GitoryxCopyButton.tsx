import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function GitoryxCopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" className="min-h-11 gap-2" onClick={copy}>
        {status === "copied" ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}
        {label}
      </Button>
      <span role="status" className="text-sm text-muted-foreground">
        {status === "copied" && t("gitoryx.promo.copied")}
        {status === "error" && t("gitoryx.start.copyError")}
      </span>
    </>
  );
}
