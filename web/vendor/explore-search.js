import {
  matchesSearchSelection,
  parseSearchDraft,
  pluginSearchContext,
  repositoryPublisher,
} from "./search.js";

export { repositoryPublisher };

export function createExplorerSearchMatcher(value) {
  const draftTerms = parseSearchDraft(value);
  if (!draftTerms.length) return () => false;
  return (node) => matchesSearchSelection(pluginSearchContext(node), { draftTerms });
}

export function matchesExplorerSearch(value, node) {
  return createExplorerSearchMatcher(value)(node);
}
