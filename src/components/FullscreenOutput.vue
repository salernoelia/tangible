<template>
    <div
        v-if="isVisible"
        class="fixed inset-0 bg-black z-50 flex items-center justify-center"
        @click="close"
        @keydown.esc="close"
        tabindex="0"
    >
        <canvas
            ref="outputCanvas"
            class="max-w-full max-h-full object-contain"
        ></canvas>

        <div class="absolute top-4 right-4 text-white text-sm opacity-75">
            Press ESC or click to close
        </div>

        <div
            v-if="!outputTexture"
            class="text-white text-center"
        >
            <div class="text-2xl mb-4">No Output Connected</div>
            <div class="text-gray-400">Connect something to an Output node to see it here</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue';
import p5 from 'p5';
import type { MediaResource } from '../utils/MediaManager';

const props = defineProps<{
    isVisible: boolean;
    outputTexture: MediaResource | null;
}>();

const emit = defineEmits<{
    close: [];
}>();

const outputCanvas = ref<HTMLCanvasElement>();
let p5Instance: p5 | null = null;

const close = () => {
    emit('close');
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        close();
    }
};

const setupCanvas = () => {
    if (!outputCanvas.value || !props.outputTexture) return;

    if (p5Instance) {
        p5Instance.remove();
    }

    p5Instance = new p5((p: p5) => {
        p.setup = () => {
            const canvas = p.createCanvas(
                window.innerWidth,
                window.innerHeight
            );
            canvas.parent(outputCanvas.value!.parentElement!);
            outputCanvas.value!.style.display = 'none';
        };

        p.draw = () => {
            p.background(0);

            if (props.outputTexture && props.outputTexture.element) {
                const texture = props.outputTexture;
                const aspectRatio = texture.width / texture.height;
                const screenAspectRatio = p.width / p.height;

                let drawWidth, drawHeight;
                if (aspectRatio > screenAspectRatio) {
                    drawWidth = p.width;
                    drawHeight = p.width / aspectRatio;
                } else {
                    drawWidth = p.height * aspectRatio;
                    drawHeight = p.height;
                }

                const x = (p.width - drawWidth) / 2;
                const y = (p.height - drawHeight) / 2;

                p.image(texture.element as any, x, y, drawWidth, drawHeight);
            }
        };

        p.windowResized = () => {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
        };
    });
};

watch(() => props.isVisible, (visible) => {
    if (visible) {
        nextTick(() => {
            setupCanvas();
        });
        document.addEventListener('keydown', handleKeyDown);
    } else {
        if (p5Instance) {
            p5Instance.remove();
            p5Instance = null;
        }
        document.removeEventListener('keydown', handleKeyDown);
    }
});

watch(() => props.outputTexture, () => {
    if (props.isVisible && props.outputTexture) {
        setupCanvas();
    }
});

onUnmounted(() => {
    if (p5Instance) {
        p5Instance.remove();
    }
    document.removeEventListener('keydown', handleKeyDown);
});
</script>
