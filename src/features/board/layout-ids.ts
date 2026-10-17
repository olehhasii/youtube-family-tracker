// Shared layout ids let a MemberRow grow into its DetailCard. Reduced motion turns the morph off.
export const memberLayoutId = (memberId: string, part: '' | '-avatar' | '-name', reduce: boolean | null) =>
  reduce ? undefined : `member${part}-${memberId}`
