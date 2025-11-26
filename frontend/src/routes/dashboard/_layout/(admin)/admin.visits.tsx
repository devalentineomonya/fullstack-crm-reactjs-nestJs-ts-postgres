import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/(admin)/admin/visits')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return  <div>Hello visits</div>
}
