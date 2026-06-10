window.addEventListener('load', function () {
	fnSelectColorChange();
});
function fnSelectColorChange(){
	const $selects = document.querySelectorAll('.select');
	$selects.forEach(function ($select) {
		$select.addEventListener('change', function () {
			if (this.selectedIndex > 0) {
				this.classList.add('selected');
			} else {
				this.classList.remove('selected');
			}
		});
	});
}