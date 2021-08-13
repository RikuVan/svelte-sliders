type Mode = 'none' | 'steps' | 'values';
type TickValueMapper = (value: number, i: number) => string | number;
type TickValueFilterer = (value: number, index: number) => boolean;
export type TickConfig =
    | { mode: 'none' }
    | { mode: 'steps'; step: number; filter?: TickValueFilterer; map?: TickValueMapper }
    | {
          mode: 'values';
          values: string[];
          filter?: TickValueFilterer;
          map?: TickValueMapper;
      };
export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderStoreState = {
    initialValue: number;
    value: number;
    min: number;
    max: number;
    disabled: boolean;
    orientation: SliderOrientation;
    step: number;
    ticks: TickConfig;
};
