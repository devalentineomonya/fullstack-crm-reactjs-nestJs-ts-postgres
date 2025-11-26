import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/(user)/user/quotations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/(user)/user/quotations"!</div>
}
