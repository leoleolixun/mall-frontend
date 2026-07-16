<template>
  <MobilePage ref="mobilePage" page-key="orders" />
</template>

<script>
import MobilePage from '@/components/MobilePage/MobilePage.vue'

export default {
  components: { MobilePage },
  onShow() {
    this.$nextTick(() => {
      if (this.$refs.mobilePage && this.$refs.mobilePage.hasLoaded) this.$refs.mobilePage.refresh()
    })
  }
}
</script>
