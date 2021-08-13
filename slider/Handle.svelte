<script>
    import { getContext } from 'svelte';
    import { calcPercentOfRange } from './utils';
    import { tweened } from 'svelte/motion';
    import { sineOut } from 'svelte/easing';

    /**
     * @typedef {import('svelte/store').Writable} Writable
     * @typedef {import('./types').SliderStoreState} SliderStoreState
     */

    /**
     * @type {string}
     */
    export let key;
    /**
     * @type {Writable<SliderStoreState>}
     */
    const sliderState = getContext(key);
    /**
     * @type {number}
     */
    export let tabIndex = 0;
    /**
     * @type {boolean}
     */
    let focus = false;
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

    /**
     * @type {number}
     */
    let initialPosition = calcPercentOfRange({
        ...$sliderState,
        value: $sliderState.initialValue || 0,
    });
    const tween = tweened(initialPosition, { duration: 120, easing: sineOut });

    $: offset = calcPercentOfRange($sliderState);
    $: tween.set(offset);
    $: position =
        $sliderState.orientation === 'vertical' ? `bottom:${$tween}%;` : `left:${$tween}%;`;
    $: disabled = $sliderState.disabled;
</script>

<div
    role="slider"
    class={`handle handle-${$sliderState.orientation}`}
    tabindex={disabled ? null : tabIndex}
    style={position}
    bind:this={handle}
    on:keydown={handleKeyDown}
    on:mousedown|preventDefault={handleMouseDown}
    on:focus={handleFocus}
    on:blur={handleBlur}
    data-handle={1}
    class:handle-focus={focus}
    class:handle-disabled={disabled}
    aria-valuenow={$sliderState.value}
    aria-disabled={disabled}
/>

<style lang="scss">
    @use '_variables';
    $handle: #838de7;

    .handle {
        position: absolute;
        display: block;
        height: 12px;
        width: 12px;
        border-radius: 50%;
        z-index: 2;
        border: 4px solid variables.$main;
        background: #fff;
    }

    .handle-horizontal {
        top: -8px;
        transform: translateX(-50%);
    }

    .handle-vertical {
        left: -8px;
        transform: translateY(+50%);
    }

    .handle:hover {
        cursor: pointer;
        box-shadow: 0px 0px 0px 8px rgb(131, 141, 231, 16%);
    }

    .handle:focus,
    .handle:active {
        outline: none;
        box-shadow: 0px 0px 0px 8px rgb(131, 141, 231, 16%);
    }

    .handle-focus {
        background: variables.$main;
        box-shadow: 0px 0px 0px 8px rgb(131, 141, 231, 16%);
    }

    .handle-disabled,
    .handle-disabled:hover,
    .handle-disabled:active {
        cursor: not-allowed;
        border-color: variables.$disabled;
        box-shadow: none;
    }
</style>
