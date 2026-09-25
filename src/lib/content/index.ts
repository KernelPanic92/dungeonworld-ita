import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import {
  ReaderRuleSetRepository,
  type RuleSetRepository,
} from "./rule-set-repository";
import { CachedRuleSetRepository } from "./cached-rule-set-repository";
import { DraftModeInterceptorRuleSetRepository } from "./draft-rule-set-repository";

// Composition of the singleton: the concrete repository bound to the local
// reader gets per-request caching (local content only — see the cache
// decorator), and the draft interceptor sits on top so Keystatic previews
// bypass the cache and read their branch uncached.
const localReader = createReader(".", config);
let repository: RuleSetRepository = new ReaderRuleSetRepository(localReader);
repository = new CachedRuleSetRepository(repository);
repository = new DraftModeInterceptorRuleSetRepository(repository);

const ruleSetRepository = repository;
export default ruleSetRepository;

export { manualBaseUrl } from "./rule-set-repository";
export type { ManualNavPage, RuleSetRepository } from "./rule-set-repository";
