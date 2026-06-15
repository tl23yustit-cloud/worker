window.addEventListener('load', function () {
	fnSelectColorChange(); // select 태그 class 추가
    fnBoxSearchDetail(); // 상세검색
	fnBoxMultiSelect(); // 멀티 드롭다운
	fnTextareaCounter() // Textarea
});
// select 태그 class 추가
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
// 상세검색
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
// 멀티 드롭다운
function fnBoxMultiSelect() {
	const $boxesMultiSelect = document.querySelectorAll('.box-multi-select');

    $boxesMultiSelect.forEach(function ($boxMultiSelect) {
        const $triggerBtn = $boxMultiSelect.querySelector('.select');
        const $blindText = $boxMultiSelect.querySelector('.select .blind');
        const $allCheckbox = $boxMultiSelect.querySelector('.box-list-select-all .form-checkbox');
        const $itemCheckboxes = $boxMultiSelect.querySelectorAll('.list-multi-select .form-checkbox');
        const $resetBtn = $boxMultiSelect.querySelector('.utilities .btn-reset');

        if (!$triggerBtn) return;

        $triggerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            
            const isOpen = this.classList.contains('active');
            closeAllMultiSelects();

            if (!isOpen) {
                this.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
                $boxMultiSelect.classList.add('is-open');
				if ($blindText) $blindText.textContent = '접힘';
            }
        });

        $boxMultiSelect.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        if ($allCheckbox) {
            $allCheckbox.addEventListener('change', function () {
                const isChecked = this.checked;
                
                $itemCheckboxes.forEach(function ($itemCheck) {
                    $itemCheck.checked = isChecked;
                    const $liItem = $itemCheck.closest('.item-mulit-select');
                    if ($liItem) $liItem.setAttribute('aria-selected', isChecked ? 'true' : 'false');
                });

                updateAllCheckboxState($allCheckbox, $itemCheckboxes);
            });
        }

        $itemCheckboxes.forEach(function ($itemCheck) {
            $itemCheck.addEventListener('change', function () {
                const $liItem = this.closest('.item-mulit-select');
                if ($liItem) $liItem.setAttribute('aria-selected', this.checked ? 'true' : 'false');

                if ($allCheckbox) {
                    updateAllCheckboxState($allCheckbox, $itemCheckboxes);
                }
            });
        });

        if ($resetBtn) {
            $resetBtn.addEventListener('click', function () {
                $itemCheckboxes.forEach(function ($itemCheck) {
                    $itemCheck.checked = false;
                    const $liItem = $itemCheck.closest('.item-mulit-select');
                    if ($liItem) $liItem.setAttribute('aria-selected', 'false');
                });
                
                if ($allCheckbox) {
                    $allCheckbox.checked = false;
                    updateAllCheckboxState($allCheckbox, $itemCheckboxes);
                }
            });
        }
    });

	// 드롭다운 바깥 영역 클릭 시 일괄 닫기
    document.addEventListener('click', function () {
        closeAllMultiSelects();
    });
}
function closeAllMultiSelects() {
    const $activeTriggers = document.querySelectorAll('.box-multi-select .select.active');
    const $openComponents = document.querySelectorAll('.box-multi-select.is-open');

    $activeTriggers.forEach(function ($btn) { 
        const $blindText = $btn.querySelector('.blind');
        $btn.classList.remove('active'); 
        $btn.setAttribute('aria-expanded', 'false');
        
        if ($blindText) $blindText.textContent = '펼침';
    });
    $openComponents.forEach(function ($comp) { $comp.classList.remove('is-open'); });
}
function updateAllCheckboxState($allCheck, $items) {
    const totalCount = $items.length;
    let checkedCount = 0;

    $items.forEach(function ($itemCheck) {
        if ($itemCheck.checked) checkedCount++;
    });

    if (checkedCount === 0) {
        $allCheck.checked = false;
        $allCheck.indeterminate = false;
        $allCheck.classList.remove('is-indeterminate');
        $allCheck.removeAttribute('aria-checked');
    } else if (checkedCount === totalCount) {
        $allCheck.checked = true;
        $allCheck.indeterminate = false;
        $allCheck.classList.remove('is-indeterminate');
        $allCheck.removeAttribute('aria-checked');
    } else {
        $allCheck.checked = false;
        $allCheck.indeterminate = true;
        $allCheck.classList.add('is-indeterminate');
        $allCheck.setAttribute('aria-checked', 'mixed');
    }
}
// Textarea
function fnTextareaCounter() {
    const $formTextAreas = document.querySelectorAll('.form-text-area');

    $formTextAreas.forEach(function ($formTextArea) {
        const $textarea = $formTextArea.querySelector('textarea');
        const $currentSpan = $formTextArea.querySelector('.current');
        const $totalSpan = $formTextArea.querySelector('.total');
        const numTotal = $textarea.getAttribute('maxLength');

        if (!$textarea || !$currentSpan) return;

        $textarea.addEventListener('input', function () {
            const currentLength = this.value.length;
            $currentSpan.textContent = currentLength;
        });

        $currentSpan.textContent = $textarea.value.length;
		$totalSpan.textContent = numTotal;
    });
}