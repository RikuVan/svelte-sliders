<script>
    /**
     * @type {import("./types").SliderOrientation}
     */
    export let orientation = 'horizontal';
</script>

<div class={`handle-tooltip handle-tooltip-${orientation}`}>
    <div class="handle-tooltip-content">
        <slot />
    </div>
</div>

<style lang="scss">
    @use '_variables';

    .handle-tooltip {
        z-index: 1;
        line-height: 16px;
        font-weight: 600;
        position: absolute;
        border: none;
        border-radius: 0px;
        background: variables.$main;
        color: #fff;
        white-space: nowrap;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 2px 0 rgb(8 11 13 / 25%);
        display: flex;
    }

    .handle-tooltip-horizontal {
        transform: translate(-50%, 0);
        left: 50%;
        top: -40px;
    }

    .handle-tooltip-vertical {
        transform: translate(0, -50%);
        top: 50%;
        right: 24px;
    }

    .handle-tooltip:after {
        content: '';
        position: absolute;
        display: inline-block;
        width: 12px;
        height: 12px;
        z-index: -1;
        transform: rotate(45deg) translateY(50%);
        background: variables.$main;
        box-shadow: 0 1px 2px 0 rgb(8 11 13 / 25%);
    }

    // pointer with box-shadow matching tooltip container
    .handle-tooltip-horizontal:after {
        bottom: -2px;
        left: 46%;
        clip-path: inset(0px -15px -15px 0px);
    }

    .handle-tooltip-vertical:after {
        right: -10px;
        bottom: 45%;
        clip-path: inset(-15px -15px 0px 0px);
    }

    .handle-tooltip-content {
        width: 100%;
        height: 100%;
        background: variables.$main;
        padding: 5px;
        z-index: 2;
        line-height: 16px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }
</style>
