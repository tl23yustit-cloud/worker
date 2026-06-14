window.addEventListener('load', function () {
	fnSelectColorChange();
    fnBoxSearchDetail();
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
function fnBoxSearchDetail() {
    const $boxesSearchDetail = document.querySelectorAll('.box-search-detail');

    $boxesSearchDetail.forEach(function ($boxSearchDetail) {
        const $toggleBtn = $boxSearchDetail.querySelector('.box-top-visual .btn');
        const $hiddenPanel = $boxSearchDetail.querySelector('.box-bottom-hidden');
        const $blindText = $toggleBtn.querySelector('.btn .blind');
        if (!$toggleBtn || !$hiddenPanel) return;
        $toggleBtn.addEventListener('click', function () {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                $boxSearchDetail.classList.remove('active');
                if ($blindText) $blindText.textContent = '펼침';
                $hiddenPanel.setAttribute('aria-hidden', 'true'); 
            } else {
                this.setAttribute('aria-expanded', 'true');
                $boxSearchDetail.classList.add('active'); 
                if ($blindText) $blindText.textContent = '접힘';
                $hiddenPanel.removeAttribute('aria-hidden');
            }
        });
    });
}