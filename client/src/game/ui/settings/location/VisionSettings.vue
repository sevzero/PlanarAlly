<script lang="ts">
import { computed, defineComponent, toRef } from "vue";
import { useI18n } from "vue-i18n";

import { gameStore } from "../../../../store/game";
import { settingsStore } from "../../../../store/settings";
import { LocationOptions } from "../../../models/settings";
import { VisibilityMode, visionState } from "../../../vision/state";

export default defineComponent({
    props: { location: { type: Number, default: -1 } },
    setup(props) {
        const { t } = useI18n();

        const isGlobal = computed(() => props.location < 0);

        const options = computed(() => {
            if (isGlobal.value) {
                return settingsStore.state.defaultLocationOptions!;
            } else {
                return settingsStore.state.locationOptions.get(props.location) ?? {};
            }
        });

        const fakePlayer = computed({
            get() {
                return gameStore.state.isFakePlayer;
            },
            set(isFakePlayer: boolean) {
                gameStore.setFakePlayer(isFakePlayer);
            },
        });

        const location = computed(() => (isGlobal.value ? undefined : props.location));

        const fullFow = computed({
            get() {
                return settingsStore.getLocationOptions("fullFow", location.value);
            },
            set(fullFow: boolean) {
                settingsStore.setFullFow(fullFow, location.value, true);
            },
        });

        const fowLos = computed({
            get() {
                return settingsStore.getLocationOptions("fowLos", location.value);
            },
            set(fowLos: boolean) {
                settingsStore.setLineOfSight(fowLos, location.value, true);
            },
        });

        const fowOpacity = computed({
            get() {
                return settingsStore.getLocationOptions("fowOpacity", location.value);
            },
            set(fowOpacity: number) {
                settingsStore.setFowOpacity(fowOpacity, location.value, true);
            },
        });

        const unitSizeUnit = computed({
            get() {
                return settingsStore.getLocationOptions("unitSizeUnit", location.value);
            },
            set(unitSizeUnit: string) {
                settingsStore.setUnitSizeUnit(unitSizeUnit, location.value, true);
            },
        });

        const visionMinRange = computed({
            get() {
                return settingsStore.getLocationOptions("visionMinRange", location.value);
            },
            set(visionMinRange: number) {
                settingsStore.setVisionRangeMin(visionMinRange, location.value, true);
            },
        });

        const visionMaxRange = computed({
            get() {
                return settingsStore.getLocationOptions("visionMaxRange", location.value);
            },
            set(visionMaxRange: number) {
                settingsStore.setVisionRangeMax(visionMaxRange, location.value, true);
            },
        });

        function reset(key: keyof LocationOptions): void {
            if (isGlobal.value) return;
            settingsStore.reset(key, props.location);
        }

        function changeVisionMode(event: { target: HTMLSelectElement }): void {
            const value = event.target.value;
            let mode: VisibilityMode;
            if (value === t("game.ui.settings.VisionSettings.default")) mode = VisibilityMode.TRIANGLE;
            else if (value === t("game.ui.settings.VisionSettings.experimental"))
                mode = VisibilityMode.TRIANGLE_ITERATIVE;
            else return;
            visionState.setVisionMode(mode, true);
        }

        return {
            isGlobal,
            options,
            reset,
            t,

            fakePlayer,

            visionMode: toRef(visionState.state, "mode"),
            changeVisionMode,

            fullFow,
            fowLos,
            fowOpacity,
            unitSizeUnit,
            visionMinRange,
            visionMaxRange,
        };
    },
});
</script>

<template>
    <div class="panel restore-panel">
        <div class="spanrow">
            <template v-if="isGlobal">
                <em style="max-width: 40vw">
                    {{ t("game.ui.settings.common.overridden_msg") }}
                </em>
            </template>
            <template v-else>
                <i18n-t keypath="game.ui.settings.common.overridden_highlight_path" tag="span">
                    <span class="overwritten">{{ t("game.ui.settings.common.overridden_highlight") }}</span>
                </i18n-t>
            </template>
        </div>
        <div class="spanrow header" v-t="'game.ui.settings.VisionSettings.core'"></div>
        <div class="row" v-if="isGlobal">
            <label for="fakePlayerInput" v-t="'game.ui.settings.VisionSettings.fake_player'"></label>
            <div>
                <input id="fakePlayerInput" type="checkbox" v-model="fakePlayer" />
            </div>
            <div></div>
        </div>
        <div class="row" :class="{ overwritten: !isGlobal && options.fullFow !== undefined }">
            <label :for="'useFOWInput-' + location" v-t="'game.ui.settings.VisionSettings.fill_fow'"></label>
            <div>
                <input :id="'useFOWInput-' + location" type="checkbox" v-model="fullFow" />
            </div>
            <div
                v-if="!isGlobal && options.fullFow !== undefined"
                @click="reset('fullFow')"
                :title="t('game.ui.settings.common.reset_default')"
            >
                <font-awesome-icon icon="times-circle" />
            </div>
            <div v-else></div>
        </div>
        <div class="row" :class="{ overwritten: !isGlobal && options.fowLos !== undefined }">
            <label :for="'fowLos-' + location" v-t="'game.ui.settings.VisionSettings.only_show_lights_los'"></label>
            <div>
                <input :id="'fowLos-' + location" type="checkbox" v-model="fowLos" />
            </div>
            <div
                v-if="!isGlobal && options.fowLos !== undefined"
                @click="reset('fowLos')"
                :title="t('game.ui.settings.common.reset_default')"
            >
                <font-awesome-icon icon="times-circle" />
            </div>
            <div v-else></div>
        </div>
        <div class="row" :class="{ overwritten: !isGlobal && options.fowOpacity !== undefined }">
            <label :for="'fowOpacity-' + location" v-t="'game.ui.settings.VisionSettings.fow_opacity'"></label>
            <div>
                <input
                    :id="'fowOpacity-' + location"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    v-model.number="fowOpacity"
                />
            </div>
            <div
                v-if="!isGlobal && options.fowOpacity !== undefined"
                @click="reset('fowOpacity')"
                :title="t('game.ui.settings.common.reset_default')"
            >
                <font-awesome-icon icon="times-circle" />
            </div>
            <div v-else></div>
        </div>
        <div class="spanrow header" v-t="'game.ui.settings.VisionSettings.advanced'"></div>
        <div class="row" v-if="isGlobal">
            <label :for="'visionMode-' + location" v-t="'game.ui.settings.VisionSettings.vision_mode'"></label>
            <div>
                <select :id="'visionMode-' + location" @change="changeVisionMode">
                    <option :selected="visionMode === 0" v-t="'game.ui.settings.VisionSettings.default'"></option>
                    <option :selected="visionMode === 1" v-t="'game.ui.settings.VisionSettings.experimental'"></option>
                </select>
            </div>
            <div></div>
        </div>
        <div class="row" :class="{ overwritten: !isGlobal && options.visionMinRange !== undefined }">
            <label :for="'vmininp-' + location">
                {{ t("game.ui.settings.VisionSettings.min_full_vision_UNIT", { unit: unitSizeUnit }) }}
            </label>
            <div>
                <input :id="'vmininp-' + location" type="number" min="0" v-model.lazy.number="visionMinRange" />
            </div>
            <div
                v-if="!isGlobal && options.visionMinRange !== undefined"
                @click="reset('visionMinRange')"
                :title="t('game.ui.settings.common.reset_default')"
            >
                <font-awesome-icon icon="times-circle" />
            </div>
            <div v-else></div>
        </div>
        <div class="row" :class="{ overwritten: !isGlobal && options.visionMaxRange !== undefined }">
            <label :for="'vmaxinp-' + location">
                {{ t("game.ui.settings.VisionSettings.max_vision_UNIT", { unit: unitSizeUnit }) }}
            </label>
            <div>
                <input :id="'vmaxinp-' + location" type="number" min="0" v-model.lazy.number="visionMaxRange" />
            </div>
            <div
                v-if="!isGlobal && options.visionMaxRange !== undefined"
                @click="reset('visionMaxRange')"
                :title="t('game.ui.settings.common.reset_default')"
            >
                <font-awesome-icon icon="times-circle" />
            </div>
            <div v-else></div>
        </div>
    </div>
</template>

<style scoped>
/* Force higher specificity without !important abuse */
.panel.restore-panel {
    grid-template-columns: [setting] 1fr [value] auto [restore] 30px [end];
}

.overwritten,
.restore-panel .row.overwritten * {
    color: #7c253e;
    font-weight: bold;
}
</style>
