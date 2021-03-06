<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs, watchEffect } from "vue";
import { useI18n } from "vue-i18n";

import { DEFAULT_GRID_SIZE } from "../../../store/client";
import { UuidMap } from "../../../store/shapeMap";
import { selectionState } from "../../layers/selection";
import { mapTool } from "../../tools/variants/map";

import { useToolPosition } from "./toolPosition";

export default defineComponent({
    setup() {
        const { t } = useI18n();

        const state = reactive({
            arrow: "0px",
            right: "0px",

            lock: false,
        });

        onMounted(() => {
            ({ right: state.right, arrow: state.arrow } = useToolPosition(mapTool.toolName));
        });

        watchEffect(() => {
            if (state.lock) {
                mapTool.state.aspectRatio = mapTool.shape!.w / mapTool.shape!.h;
            }
        });

        watchEffect(() => {
            const selection = [...selectionState.state.selection].map((s) => UuidMap.get(s)!);
            mapTool.setSelection(selection);
        });

        function apply(): void {
            mapTool.preview(false);
            mapTool.removeRect(false);
        }

        function updateGridX(): void {
            if (state.lock) {
                if (mapTool.state.manualDrag) {
                    mapTool.state.gridY = mapTool.state.gridX / (mapTool.rect!.w / mapTool.rect!.h);
                } else {
                    mapTool.state.gridY = mapTool.state.gridX / mapTool.state.aspectRatio;
                }
                mapTool.state.sizeY = mapTool.state.gridY * DEFAULT_GRID_SIZE;
            }
            mapTool.state.sizeX = mapTool.state.gridX * DEFAULT_GRID_SIZE;
            if (!mapTool.state.manualDrag && mapTool.state.gridX > 0) mapTool.preview(true);
        }

        function updateGridY(): void {
            if (state.lock) {
                if (mapTool.state.manualDrag) {
                    mapTool.state.gridX = mapTool.state.gridY * (mapTool.rect!.w / mapTool.rect!.h);
                } else {
                    mapTool.state.gridX = mapTool.state.gridY * mapTool.state.aspectRatio;
                }
                mapTool.state.sizeX = mapTool.state.gridX * DEFAULT_GRID_SIZE;
            }
            mapTool.state.sizeY = mapTool.state.gridY * DEFAULT_GRID_SIZE;
            if (!mapTool.state.manualDrag && mapTool.state.gridY > 0) mapTool.preview(true);
        }

        function updateSizeX(): void {
            if (state.lock) {
                mapTool.state.sizeY = mapTool.state.sizeX / mapTool.state.aspectRatio;
                mapTool.state.gridY = mapTool.state.sizeY / DEFAULT_GRID_SIZE;
            }
            mapTool.state.gridX = mapTool.state.sizeX / DEFAULT_GRID_SIZE;
            if (mapTool.state.sizeX > 0) mapTool.preview(true);
        }

        function updateSizeY(): void {
            if (state.lock) {
                mapTool.state.sizeX = mapTool.state.sizeY * mapTool.state.aspectRatio;
                mapTool.state.gridX = mapTool.state.sizeX / DEFAULT_GRID_SIZE;
            }
            mapTool.state.gridY = mapTool.state.sizeY / DEFAULT_GRID_SIZE;
            if (mapTool.state.sizeY > 0) mapTool.preview(true);
        }

        return {
            ...toRefs(state),
            ...toRefs(mapTool.state),
            t,
            selected: mapTool.isActiveTool,
            removeRect: () => mapTool.removeRect(),
            skipManualDrag: () => mapTool.skipManualDrag(),
            apply,
            updateGridX,
            updateGridY,
            updateSizeX,
            updateSizeY,
        };
    },
});
</script>
<template>
    <div class="tool-detail map" v-if="selected" :style="{ '--detailRight': right, '--detailArrow': arrow }">
        <template v-if="hasShape">
            <div class="row">{{ error }}</div>
            <template v-if="!hasRect && manualDrag === true">
                <div id="map-selection-choice">
                    <div>{{ t("game.ui.tools.MapTool.drag_to_resize") }}</div>
                    <div id="next" @click="skipManualDrag">
                        Scale full image instead
                        <font-awesome-icon icon="arrow-right" />
                    </div>
                </div>
            </template>
            <template v-else>
                <div id="map-grid">
                    <div class="explanation" v-t="'game.ui.tools.MapTool.set_target_grid_cells'"></div>
                    <div class="map-lock" @click="lock = !lock" title="(Un)lock aspect ratio">
                        <font-awesome-icon v-show="lock" icon="link" />
                        <font-awesome-icon v-show="!lock" icon="unlink" />
                    </div>
                    <label for="map-g-x" v-t="'game.ui.tools.MapTool.horizontal'"></label>
                    <input id="map-g-x" type="number" @input="updateGridX" v-model.number="gridX" class="hinput" />
                    <label for="map-g-y" v-t="'game.ui.tools.MapTool.vertical'"></label>
                    <input id="map-g-y" type="number" @input="updateGridY" v-model.number="gridY" class="vinput" />
                </div>
                <div id="map-separator"></div>
                <div id="map-size" v-show="!manualDrag">
                    <div class="explanation">Set target pixels</div>

                    <div class="map-lock" @click="lock = !lock" title="(Un)lock aspect ratio">
                        <font-awesome-icon v-show="lock" icon="link" />
                        <font-awesome-icon v-show="!lock" icon="unlink" />
                    </div>
                    <label for="map-s-x" v-t="'game.ui.tools.MapTool.horizontal'"></label>
                    <input id="map-s-x" type="number" @input="updateSizeX" v-model.number="sizeX" class="hinput" />
                    <label for="map-s-y" v-t="'game.ui.tools.MapTool.vertical'"></label>
                    <input id="map-s-y" type="number" @input="updateSizeY" v-model.number="sizeY" class="vinput" />
                </div>
                <div id="map-buttons">
                    <div class="button apply" @click="apply" v-t="'game.ui.tools.MapTool.apply'"></div>
                    <div style="width: 25px"></div>
                    <div class="button cancel" @click="removeRect" v-t="'game.ui.tools.MapTool.cancel'"></div>
                </div>
            </template>
        </template>
        <template v-else>{{ t("game.ui.tools.MapTool.select_shape_msg") }}</template>
    </div>
</template>

<style scoped lang="scss">
.map {
    display: grid;
    grid-template-areas:
        "error   error   error"
        "grid    or      size"
        "buttons buttons buttons";

    #map-grid {
        grid-area: grid;
    }

    #map-size {
        grid-area: size;
    }

    #map-grid,
    #map-size {
        display: grid;
        grid-template-areas:
            "text text text"
            "hlabel hinput lock"
            "vlabel vinput lock";

        .explanation {
            grid-area: text;
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid black;
        }

        .map-lock {
            grid-area: lock;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-end;
            position: relative;
            width: 20px;

            &::before {
                content: "";
                position: absolute;
                background-color: transparent;
                border: solid 1px black;
                border-left: none;
                border-radius: 3px;
                right: 7px;
                top: 10px;
                width: 30px;
                height: 30px;
                z-index: -1;
            }

            &::after {
                content: "";
                background-color: white;
                position: absolute;
                right: 16px;
                width: 4px;
                height: 32px;
            }

            svg {
                background-color: white;
                transform: rotate(135deg);
            }
        }
    }

    #map-separator {
        grid-area: or;
    }

    #map-buttons {
        grid-area: buttons;
        justify-self: center;
        align-items: center;
        display: flex;

        .button {
            margin-top: 10px;
            margin-bottom: 5px;
            padding: 5px;
            padding-right: 8px;
            font-size: 15px;
            font-weight: bold;
            text-align: center;
            font-style: italic;
            border: solid 1px black;

            &:hover {
                font-style: normal;
                cursor: pointer;
                margin-top: 8px;
                margin-bottom: 7px;
                box-shadow: 1px 3px;
            }
        }

        .apply {
            font-weight: bold;
            box-shadow: 1px 1px 0px black;
        }

        .cancel {
            color: lightcoral;
            border-color: lightcoral;
            box-shadow: 1px 1px lightcoral;
        }
    }

    #map-selection-choice {
        display: flex;
        flex-direction: column;
        align-items: center;

        #next {
            margin-top: 7px;
            padding: 7px;
            border-radius: 7px;
            border: solid 1px #7c253e;

            &:hover {
                color: white;
                background-color: #7c253e;
                cursor: pointer;
            }
        }
    }
}

.row {
    grid-column: 1 / span 3;
}

label {
    padding: 2px;
}

input[type="number"] {
    width: 75px;
    padding: 2px;
}
</style>
