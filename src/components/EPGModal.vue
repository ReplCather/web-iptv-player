<template>
  <div class="epg-modal" v-if="isOpen" @click.self="close">
    <div class="epg-container">
      <div class="epg-header">
        <h2 class="epg-title">{{ t('programGuide') }}</h2>
        <button class="epg-close" @click="close">&times;</button>
      </div>
      
      <div class="epg-date-nav">
        <button class="epg-prev" @click="prevDay">&lt;</button>
        <span class="epg-current-date">{{ formattedDate }}</span>
        <button class="epg-next" @click="nextDay">&gt;</button>
      </div>

      <div class="epg-loading" v-if="loading">
        <span class="spinner"></span>
        {{ t('loading') }}
      </div>

      <div class="epg-empty" v-else-if="programs.length === 0">
        {{ t('noPrograms') }}
      </div>

      <div class="epg-list" v-else>
        <div 
          class="epg-program" 
          v-for="program in programs" 
          :key="program.start"
          :class="{ 'epg-current': program.isCurrent }"
        >
          <div class="epg-time">
            <span class="epg-start">{{ formatTime(program.start) }}</span>
            <span class="epg-duration">{{ program.duration }}</span>
          </div>
          <div class="epg-info">
            <span class="epg-name">{{ program.title }}</span>
            <span class="epg-desc" v-if="program.description">{{ truncate(program.description, 100) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "../i18n/index.js";
import { getChannelGuide, fetchXMLGuide } from "../services/epgService.js";

const { t } = useI18n();

const props = defineProps({
  isOpen: Boolean,
  channelName: String
});

const emit = defineEmits(["close"]);

const loading = ref(false);
const programs = ref([]);
const currentDate = ref(new Date());

const formattedDate = computed(() => {
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  return currentDate.value.toLocaleDateString(undefined, options);
});

watch(() => props.isOpen, async (open) => {
  if (open && props.channelName) {
    await loadPrograms();
  }
});

watch(() => props.channelName, async () => {
  if (props.isOpen && props.channelName) {
    await loadPrograms();
  }
});

async function loadPrograms() {
  loading.value = true;
  programs.value = [];

  try {
    const guideInfo = await getChannelGuide(props.channelName);
    
    if (!guideInfo || !guideInfo.url) {
      loading.value = false;
      return;
    }

    const xmlData = await fetchXMLGuide(guideInfo.url);
    
    if (xmlData) {
      programs.value = parseEPG(xmlData, guideInfo.siteId);
    }
  } catch (error) {
    console.error('Failed to load EPG:', error);
  } finally {
    loading.value = false;
  }
}

function parseEPG(xmlString, siteId) {
  const programs = [];
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    const channel = doc.querySelector(`channel[id*="${siteId}"]`);
    
    if (!channel) return [];

    const programElements = channel.querySelectorAll("programme");
    const now = new Date();

    programElements.forEach((prog) => {
      const start = new Date(prog.getAttribute("start"));
      const end = new Date(prog.getAttribute("stop"));
      const title = prog.querySelector("title")?.textContent || "Unknown";
      const desc = prog.querySelector("desc")?.textContent || "";
      
      const isCurrent = start <= now && end > now;
      const duration = formatDuration(start, end);

      programs.push({
        start,
        end,
        title,
        description: desc,
        duration,
        isCurrent
      });
    });

    const dateStr = currentDate.value.toISOString().split('T')[0];
    programs.sort((a, b) => a.start - b.start);
    
    return programs.filter(p => {
      const pDate = p.start.toISOString().split('T')[0];
      return pDate === dateStr;
    });
  } catch (error) {
    console.error('Failed to parse EPG:', error);
    return [];
  }
}

function formatTime(date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(start, end) {
  const diff = (end - start) / 1000 / 60;
  const hours = Math.floor(diff / 60);
  const mins = Math.round(diff % 60);
  if (hours > 0) {
    return `${hours}h${mins > 0 ? mins + 'min' : ''}`;
  }
  return `${mins}min`;
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

function prevDay() {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() - 1);
  currentDate.value = d;
  loadPrograms();
}

function nextDay() {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() + 1);
  currentDate.value = d;
  loadPrograms();
}

function close() {
  emit("close");
}
</script>

<style scoped lang="less">
.epg-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.epg-container {
  background: linear-gradient(180deg, rgba(10, 10, 20, 0.98) 0%, rgba(15, 10, 25, 0.96) 100%);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 217, 255, 0.15), 0 0 40px rgba(0, 0, 0, 0.8);
}

.epg-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.epg-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-neon);
}

.epg-close {
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid var(--border-color);
  color: var(--primary-neon);
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    background: var(--primary-neon);
    color: var(--bg-darker);
  }
}

.epg-date-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(0, 217, 255, 0.05);
  border-bottom: 1px solid var(--border-light);
}

.epg-prev, .epg-next {
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid var(--border-color);
  color: var(--primary-neon);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s;
  
  &:hover {
    background: var(--primary-neon);
    color: var(--bg-darker);
  }
}

.epg-current-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.epg-loading, .epg-empty {
  padding: 3rem;
  text-align: center;
  color: var(--text-tertiary);
}

.spinner {
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid var(--border-light);
  border-top-color: var(--primary-neon);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.epg-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
}

.epg-program {
  display: flex;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border-light);
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0, 217, 255, 0.08);
  }
  
  &.epg-current {
    background: rgba(0, 217, 255, 0.15);
    border-left: 3px solid var(--primary-neon);
  }
}

.epg-time {
  display: flex;
  flex-direction: column;
  min-width: 80px;
  margin-right: 1rem;
}

.epg-start {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-neon);
}

.epg-duration {
  font-size: 0.7rem;
  color: var(--text-tertiary);
}

.epg-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.epg-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.epg-desc {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.4;
}
</style>