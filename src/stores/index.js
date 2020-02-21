import { writable } from 'svelte/store';
export {page} from './page'
export {publication, contents} from './publication'

export {library, refreshDate, searchStore} from './library'
export {collections, workspaces, tags, refreshCollections, addingWorkspace, addedCollections, addedWorkspaces} from './collections'

export const selectedItems = writable(new Set())

export function addSelected (item) {
  selectedItems.update(set => {
    return set.add(item)
  })
}
export function removeSelected (item) {
  selectedItems.update(set => {
    set.delete(item)
    return set
  })
}
export function clearSelected () {
  selectedItems.set(new Set())
}