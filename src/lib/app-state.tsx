import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Perfil } from "./progressao";

type AppState = {
  perfil: Perfil;
  setPerfil: (p: Perfil) => void;
  jovemId: string | null;
  setJovemId: (id: string | null) => void;
  chefe: string;
  setChefe: (nome: string) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil>("escoteiro");
  const [jovemId, setJovemId] = useState<string | null>(null);
  const [chefe, setChefe] = useState("");

  useEffect(() => {
    const p = localStorage.getItem("perfil") as Perfil | null;
    if (p === "chefe" || p === "escoteiro") setPerfil(p);
    const j = localStorage.getItem("jovemId");
    if (j) setJovemId(j);
    const c = localStorage.getItem("chefe");
    if (c) setChefe(c);
  }, []);

  useEffect(() => {
    localStorage.setItem("perfil", perfil);
  }, [perfil]);
  useEffect(() => {
    if (jovemId) localStorage.setItem("jovemId", jovemId);
  }, [jovemId]);
  useEffect(() => {
    localStorage.setItem("chefe", chefe);
  }, [chefe]);

  const value = useMemo(
    () => ({ perfil, setPerfil, jovemId, setJovemId, chefe, setChefe }),
    [perfil, jovemId, chefe],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState precisa estar dentro de AppStateProvider");
  return ctx;
}
