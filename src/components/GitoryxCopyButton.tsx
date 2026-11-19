import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GitoryxCopyButtonProps {
  value: string;
  label: string;
  inverse?: boolean;
}

export function GitoryxCopyButton({ value, label, inverse = false }: GitoryxCopyButtonProps) {
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "min-h-11 gap-2",
          inverse && "border-slate-500 bg-transparent text-white ring-offset-slate-900 hover:bg-slate-800 hover:text-white focus-visible:ring-white"
        )}
        onClick={copy}
      >
        {status === "copied" ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}
        {label}
      </Button>
      <span role="status" className={cn("text-sm", inverse ? "text-slate-200" : "text-muted-foreground")}>
        {status === "copied" && t("gitoryx.promo.copied")}
        {status === "error" && t("gitoryx.start.copyError")}
      </span>
    </>
  );
}
