// A small, UI-agnostic command shell: a registry, a tokenizer, tab completion
// and "did you mean". Depends on nothing outside this directory so it can be
// lifted into its own package later.
export { parseFlags, positional, tokenize } from './args'
export { didYouMean, levenshtein } from './fuzzy'
export { createShell, type ShellOptions } from './shell'
export type * from './types'
