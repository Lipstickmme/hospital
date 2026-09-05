import { useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";

import { isSupabaseConfigured } from "@/lib/supabase";
import { submitForm } from "@/lib/api/submit-form";

export type SubmitState = "idle" | "sending" | "sent" | "error";

type Options = {
  kind: "enquiry" | "booking";
  /** Fields not present in the form itself. */
  extra?: Record<string, string>;
};

/**
 * Posts a form via the submitForm server function, which writes with the
 * service role and mails the notification.
 *
 * With no backend configured it falls back to reporting success without
 * sending anything, so the site is never broken by missing config.
 */
export function useFormSubmit({ kind, extra }: Options) {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);
  const submitFn = useServerFn(submitForm);

  // Read through a ref: `extra` is rebuilt every render, and the handler is
  // attached to the form long before submit happens.
  const extraRef = useRef(extra);
  extraRef.current = extra;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;

    const form = event.currentTarget;
    setState("sending");
    setError(null);

    if (!isSupabaseConfigured()) {
      window.setTimeout(() => setState("sent"), 900);
      return;
    }

    const payload: Record<string, string> = { ...extraRef.current };
    new FormData(form).forEach((value, key) => {
      if (typeof value === "string") payload[key] = value;
    });

    try {
      const result = await submitFn({ data: { kind, payload } as never });
      if (!result?.ok) {
        throw new Error("We could not send that just now.");
      }
      form.reset();
      setState("sent");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not send that just now.");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setError(null);
  };

  return { state, error, submit, reset };
}
