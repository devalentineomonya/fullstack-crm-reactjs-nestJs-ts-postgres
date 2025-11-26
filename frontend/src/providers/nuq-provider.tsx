import { NuqsAdapter } from 'nuqs/adapters/react'

export const TableDataProvider = ({ children }) => {
  return <NuqsAdapter>{children}</NuqsAdapter>;
};
