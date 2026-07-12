<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
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
