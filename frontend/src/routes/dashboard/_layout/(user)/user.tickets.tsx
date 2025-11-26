import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/(user)/user/tickets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/(user)/user/tickets"!</div>
}
