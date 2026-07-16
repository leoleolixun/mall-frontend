<script>
export default {
  onShow() {
    uni.$emit('mall:app-show')
  }
}
</script>

<style>
	page {
		background: #f8fafc;
		color: #172033;
		font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	view,
	text,
	scroll-view {
		box-sizing: border-box;
	}

	view {
		-webkit-tap-highlight-color: transparent;
	}
</style>
