import { useState } from "react";
import { Check, Copy, MessageCircle, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function isMobile() {
  return typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function ShareDialog({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `Check out ${name} on Rivnexo`;
  const msg = encodeURIComponent(`${text}: ${url}`);
  const whatsapp = isMobile() ? `whatsapp://send?text=${msg}` : `https://web.whatsapp.com/send?text=${msg}`;
  const canNative = typeof navigator !== "undefined" && !!navigator.share && isMobile();

  const onCopy = async () => {
    if (await copyText(url)) {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } else toast.error("Couldn't copy — please copy the link manually");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline"><Share2 />Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Share {name}</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
          <Button onClick={onCopy} variant="outline">{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy"}</Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" asChild>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"><Send />Telegram</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`https://twitter.com/intent/tweet?text=${msg}`} target="_blank" rel="noopener noreferrer">𝕏 Post</a>
          </Button>
        </div>
        {canNative && (
          <Button variant="ink" onClick={() => navigator.share({ title: name, text, url }).catch(() => {})}>
            <Share2 />More apps…
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
