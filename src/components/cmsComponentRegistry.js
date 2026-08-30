import HomeLanding from "./HomeLanding";
import LoginForm from "./LoginForm";

// Maps a CMS page's linkURL (set in PassVaultpanel's Pages admin screen,
// only meaningful when isLink is true) to a real React component -- for
// pages that are a designed view rather than rich-text content. Same idea
// as cricfeed's components/cmsComponentRegistry.tsx.
export const CMS_COMPONENT_REGISTRY = {
  Home: HomeLanding,
  login: LoginForm,
};
