import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_layout/(user)/user/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/(user)/user/setting"!</div>
}
