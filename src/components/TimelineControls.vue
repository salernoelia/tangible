<script
    setup
    lang="ts"
>
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTimeline } from '@/services/TimelineService'
import { computed } from 'vue'

const timeline = useTimeline()

const isPlaying = computed(() => timeline.isPlaying)
const currentTime = computed(() => timeline.currentTime)
const duration = computed(() => timeline.duration)
const progress = computed(() => timeline.progress.value)
const playbackSpeed = computed(() => timeline.playbackSpeed)

const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleSeek = (event: Event) => {
    const target = event.target as HTMLInputElement
    const seekTime = (parseFloat(target.value) / 100) * duration.value
    timeline.seek(seekTime)
}

const handleSpeedChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    timeline.setPlaybackSpeed(parseFloat(target.value))
}

const togglePlayback = () => {
    if (isPlaying.value) {
        timeline.pause()
    } else {
        timeline.play()
    }
}

const stop = () => {
    timeline.stop()
}
</script>

<template>
    <div class="timeline-controls">
        <div class="playback-controls">
            <Button
                variant="outline"
                size="sm"
                @click="togglePlayback"
            >
                <svg
                    v-if="!isPlaying"
                    width="12"
                    height="12"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3.24182 2.32181C3.3919 2.23132 3.5784 2.22601 3.73338 2.30781L12.7334 7.05781C12.8974 7.14436 13 7.31457 13 7.5C13 7.68543 12.8974 7.85564 12.7334 7.94219L3.73338 12.6922C3.5784 12.774 3.3919 12.7687 3.24182 12.6782C3.09175 12.5877 3 12.4252 3 12.25V2.75C3 2.57476 3.09175 2.4123 3.24182 2.32181ZM4 3.57925V11.4207L11.4288 7.5L4 3.57925Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                    />
                </svg>
                <svg
                    v-else
                    width="12"
                    height="12"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6.04995 2.74998C6.04995 2.44623 5.80371 2.19998 5.49995 2.19998C5.19619 2.19998 4.94995 2.44623 4.94995 2.74998V12.25C4.94995 12.5537 5.19619 12.8 5.49995 12.8C5.80371 12.8 6.04995 12.5537 6.04995 12.25V2.74998ZM10.05 2.74998C10.05 2.44623 9.80371 2.19998 9.49995 2.19998C9.19619 2.19998 8.94995 2.44623 8.94995 2.74998V12.25C8.94995 12.5537 9.19619 12.8 9.49995 12.8C9.80371 12.8 10.05 12.5537 10.05 12.25V2.74998Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                    />
                </svg>
            </Button>

            <Button
                variant="outline"
                size="sm"
                @click="stop"
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2 3C2 2.44772 2.44772 2 3 2H12C12.5523 2 13 2.44772 13 3V12C13 12.5523 12.5523 13 12 13H3C2.44772 13 2 12.5523 2 12V3ZM3 3V12H12V3H3Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                    />
                </svg>
            </Button>
        </div>

        <Separator
            orientation="vertical"
            class="h-6"
        />

        <div class="timeline-scrubber">
            <input
                type="range"
                min="0"
                max="100"
                :value="progress * 100"
                class="scrubber"
                @input="handleSeek"
            >

        </div>

        <Separator
            orientation="vertical"
            class="h-6"
        />

        <div class="speed-control">
            <label class="speed-label">Speed:</label>
            <select
                :value="playbackSpeed"
                class="speed-select"
                @change="handleSpeedChange"
            >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
            </select>
        </div>
    </div>
</template>

<style scoped>
.timeline-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
}

.playback-controls {
    display: flex;
    gap: 4px;
}

.timeline-scrubber {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.scrubber {
    width: 100%;
    height: 4px;
    background: #ddd;
    outline: none;
    border-radius: 2px;
    appearance: none;
}

.scrubber::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: #007acc;
    border-radius: 50%;
    cursor: pointer;
}

.scrubber::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #007acc;
    border-radius: 50%;
    cursor: pointer;
    border: none;
}

.time-display {
    font-size: 11px;
    color: #666;
    text-align: center;
    font-family: monospace;
}

.speed-control {
    display: flex;
    align-items: center;
    gap: 6px;
}

.speed-label {
    font-size: 12px;
    color: #666;
}

.speed-select {
    font-size: 12px;
    padding: 2px 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
}
</style>
