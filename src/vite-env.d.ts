
/* This file can be used for auto-completion and typing of custom
    environment variables, provided they start with VITE_
*/

/*
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_FEATURE_X: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
*/

// CSS Imports
declare module "*.css" {}

// If you use CSS Modules
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Image Imports
declare module "*.svg" {}
declare module "*.png" {}
declare module "*.jpg" {}

/*
declare module '*.svg' {
  const content: <SVGElement>
  export default content
}
*/



declare module '*.wgsl?raw' {
  const value: string;
  export default value;
}




//declare const __APP_VERSION__: string
declare const __ENABLE_SCENE_EDITOR__: boolean;
