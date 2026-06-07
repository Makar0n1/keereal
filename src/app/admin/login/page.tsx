"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
    >
      {pending ? "Вход…" : "Войти"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  const inputCls =
    "w-full rounded-lg border border-bg-border bg-bg-soft px-4 py-2.5 text-fg outline-none transition focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-fg-faint";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-fg">
          Админ-панель
        </h1>
        <p className="mb-8 text-center text-sm text-fg-faint">Вход в управление сайтом</p>

        <form action={formAction} className="space-y-3">
          <input name="email" type="email" placeholder="Email" autoComplete="username" required className={inputCls} />
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            required
            className={inputCls}
          />
          {state.error ? (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
          ) : null}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
