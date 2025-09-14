import { ComponentPublicInstance } from "vue";

// We need these declarations to fix our build errors:
// "error TS9006: Declaration emit for this file requires using private name ... from
// module .../node_modules/vuetify/... An explicit type annotation may unblock declaration emit."
declare module "vuetify" {
  declare function useGoTo(_options?: GoToOptions): {
    (
      _target: ComponentPublicInstance | HTMLElement | string | number,
      _options?: Partial<GoToOptions>
    ): Promise<unknown>;
    horizontal(
      _target: ComponentPublicInstance | HTMLElement | string | number,
      _options?: Partial<GoToOptions>
    ): Promise<unknown>;
  };
}

/**
 * Vuetify form inputs have a `rules` prop that accepts an array of validation rules -
 * functions, each returning `true` if the value is valid,
 * or a string with an error message if it is invalid.
 */
export type Rule<T> = (value: T) => true | string;
