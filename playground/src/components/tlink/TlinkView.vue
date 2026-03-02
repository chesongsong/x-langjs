<template>
  <a :href="url" target="_blank" rel="noopener noreferrer" class="xlang-tlink">
    {{ text }}
  </a>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  url: string;
}>();
</script>
