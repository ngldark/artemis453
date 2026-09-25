import { createContext, useContext, type ReactNode } from "react";

export type Membro = {
  id: string;
  nome: string;
  patrulha: string | null;
  perfil: "CHEFE" | "ESCOTEIRO";
  email: string;
};

const Ctx = createContext<Membro | null>(null);

export function MembroProvider({ membro, children }: { membro: Membro; children: ReactNode }) {
  return <Ctx.Provider value={membro}>{children}</Ctx.Provider>;
}

export function useMembro() {
  return useContext(Ctx);
}

export function useEhChefe() {
  return useContext(Ctx)?.perfil === "CHEFE";
}
