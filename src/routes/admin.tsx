import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  // O Outlet é obrigatório para que as rotas filhas (como /admin/especialidades) apareçam no ecrã
  return <Outlet />;
}