import { memberSlug } from '../../model/slug'
import type { BoardMember } from '../board'
import { addMember, deleteMember, removeAvatar, saveGroup, updateMember, uploadAvatar } from '../queries'
import { useBoardMutation } from './use-board-mutation'

export const useSaveGroup = () => useBoardMutation((group: Parameters<typeof saveGroup>[0]) => saveGroup(group))

export type MemberDraft = {
  name: string
  exempt: boolean
  /** A new photo, null to remove the current one, undefined to keep it. */
  photo: Blob | null | undefined
}

type SaveMember = {
  /** null adds a new Member. */
  member: BoardMember | null
  draft: MemberDraft
  /** Every Member already on the Board: a new one gets a slug none of them has, and goes last. */
  others: BoardMember[]
}

// an orphaned file costs nothing, so a photo that fails to delete never fails the save
const forget = (path: string | null) => path && removeAvatar(path).catch(() => {})

/** Saves the Member, then their photo. Resolves to false when the Member was saved but the photo wasn't. */
export const useSaveMember = () =>
  useBoardMutation(async ({ member, draft, others }: SaveMember): Promise<boolean> => {
    const { name, exempt, photo } = draft
    const id = member
      ? (await updateMember(member.id, { name, exempt }), member.id)
      : await addMember({ name, exempt, slug: memberSlug(name, others.map((m) => m.slug)), position: others.length })
    if (photo === undefined) return true

    const old = member?.avatarPath ?? null
    try {
      // the old photo goes only once the Member points at the new one (or at none)
      await updateMember(id, { avatar_path: photo && (await uploadAvatar(id, photo)) })
    } catch {
      return false
    }
    await forget(old)
    return true
  })

export const useDeleteMember = () =>
  useBoardMutation(async (member: BoardMember) => {
    await deleteMember(member.id) // their Payments go with them (cascade)
    await forget(member.avatarPath)
  })
