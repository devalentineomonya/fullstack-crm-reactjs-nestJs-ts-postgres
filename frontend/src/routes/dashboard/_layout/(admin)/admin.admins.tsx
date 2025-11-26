import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/(admin)/admin/admins')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/(admin)/admin/admins"!</div>
}
