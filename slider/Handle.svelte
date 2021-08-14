<script>
    import { getContext } from 'svelte';
    import { calcPercentOfRange } from './utils';
    import { tweened } from 'svelte/motion';
    import { sineOut } from 'svelte/easing';
    import HandleTooltip from './HandleTooltip.svelte';

    /**
     * @typedef {import('svelte/store').Writable} Writable
     * @typedef {import('./types').SliderStoreState} SliderStoreState
     */

    /**
     * @type {string}
     */
    export let key;
    /**
     * @type {number}
     */
    export let index = 0;
    /**
     * @type {Writable<SliderStoreState>}
     */
    const sliderState = getContext(key);
    /**
     * @type {number}
     */
    export let tabIndex = index;
    /**
     * @type {boolean}
     */
    let focus = false;
    /**
     * @type {boolean}
     */
    let hovered = false;
    /**
     * @type {HTMLDivElement}
     */
    let handle;
    /**
     * focus on keydown
     * @param {Event} e
     */
    function handleKeyDown(e) {
        focus = false;
    }
    /**
     * focus on mousedown
     * @param {Event} e
     */
    function handleMouseDown(e) {
        handle.focus();
    }

    /**
     * when the user focusses the handle of a slider
     * set it to be active
     * @param {Event} e the event from browser
     **/
    function handleFocus(e) {
        if (!disabled) {
            focus = true;
            $sliderState.activeHandle = index;
        }
    }

    /**
     * when the user has unfocussed (blurred) from the
     * slider, deactivated all handles
     * @param {Event} e the event from browser
     **/
    function handleBlur(e) {
        focus = false;
    }

    function handleMouseEnter() {
        hovered = true;
    }

    function handleMouseLeave() {
        hovered = false;
    }

    /**
     * @type {number}
     */
    let initialPosition = calcPercentOfRange(
        {
            ...$sliderState,
            value: $sliderState.initialValue || 0,
        },
        index
    );
    const tween = tweened(initialPosition, { duration: 120, easing: sineOut });

    $: zIndex = `z-index:${$sliderState.activeHandle === index ? 3 : 2};`;
    $: offset = calcPercentOfRange($sliderState, index);
    $: tween.set(offset);
    $: position =
        $sliderState.orientation === 'vertical' ? `bottom:${$tween}%;` : `left:${$tween}%;`;
    $: disabled = $sliderState.disabled;
    $: active = $sliderState.activeHandle === index;
    $: canShowActiveTooltip = (active && focus) || hovered;
    $: withTooltip = $sliderState.tooltips.show
        ? $sliderState.tooltips.show === 'always' ||
          ($sliderState.tooltips.show === 'active' && canShowActiveTooltip)
        : false;
</script>

<div
    role="slider"
    class={`handle handle-${$sliderState.orientation}`}
    tabindex={disabled ? -1 : tabIndex}
    style={position + zIndex}
    bind:this={handle}
    on:keydown={handleKeyDown}
    on:mousedown|preventDefault={handleMouseDown}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:focus={handleFocus}
    on:blur={handleBlur}
    data-handle={index}
    class:handle-active={active}
    class:handle-focus={focus}
    class:handle-disabled={disabled}
    aria-valuenow={$sliderState.value[index]}
    aria-orientation={$sliderState.orientation}
    aria-disabled={disabled}
>
    {#if withTooltip}
        <HandleTooltip orientation={$sliderState.orientation}>
            {#if $sliderState.tooltips.map}
                {$sliderState.tooltips.map($sliderState.value[index])}
            {:else}
                {$sliderState.value[index]}
            {/if}
        </HandleTooltip>
    {/if}
</div>

<style lang="scss">
    @use '_variables';
    @use "sass:math";
    $handle: #838de7;
    $handle-radius: 10px;
    $handle-border-width: 4px;
    $rail-size: 4px;

    .handle {
        position: absolute;
        display: block;
        height: $handle-radius;
        width: $handle-radius;
        border-radius: 50%;
        z-index: 2;
        border: $handle-border-width solid variables.$main;
        background: #fff;
    }

    .handle-horizontal {
        top: -(math.div($handle-radius + $rail-size, 2));
        transform: translateX(-50%);
    }

    .handle-vertical {
        left: -(math.div($handle-radius + $rail-size, 2));
        transform: translateY(+50%);
    }

    .handle:hover {
        cursor: pointer;
        box-shadow: 0px 0px 0px 8px rgb(131, 141, 231, 16%);
    }

    .handle:focus {
        outline: none;
        box-shadow: 0px 0px 0px 8px rgb(131, 141, 231, 16%);
    }

    .handle-active {
        background: variables.$main;
    }

    .handle-disabled,
    .handle-disabled:hover,
    .handle-disabled:active {
        cursor: not-allowed;
        border-color: variables.$disabled;
        box-shadow: none;
        background: white;
    }
</style>
