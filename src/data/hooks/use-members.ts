import { addMember, deleteMember, updateGroup, updateMember } from '../queries'
import { useBoardMutation } from './use-board-mutation'

export const useUpdateGroup = () => useBoardMutation(updateGroup)
export const useAddMember = () => useBoardMutation(addMember)
export const useUpdateMember = () =>
  useBoardMutation(({ id, changes }: { id: string; changes: Parameters<typeof updateMember>[1] }) => updateMember(id, changes))
export const useDeleteMember = () => useBoardMutation(deleteMember)
