window.addEventListener('load', function () {
    fnBoxAccordion(); // Accordion
    fnBtnAnchor(); // Anchor
	fnSelectColorChange(); // select 태그 class 추가
    fnBoxSearchDetail(); // 상세검색
	fnBoxMultiSelect(); // 멀티 드롭다운
	fnTextareaCounter(); // Textarea
    var defaultTabIndex = 0
    fnTab(0); // Tab
    fnBoxTooltip(); // Tooltip
});
// Accordion
function fnBoxAccordion() {
    var CONFIG = {
        WRAPPER: "box-accordion",
        TRIGGER: "btn-accordion",
        OPEN_CLASS: "is-open",
        BLIND_CLASS: "blind",
        TEXT_OPEN: "상세내용 열기",
        TEXT_CLOSE: "상세내용 닫기"
    };

    var $accordions = document.querySelectorAll("." + CONFIG.WRAPPER);
    if ($accordions.length === 0) return;

    $accordions.forEach(function ($container) {
        var $button = $container.querySelector("." + CONFIG.TRIGGER);
        if (!$button) return;

        var $blindTextSpan = $button.querySelector("." + CONFIG.BLIND_CLASS);
        var isOpen = $container.classList.contains(CONFIG.OPEN_CLASS);

        $button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if ($blindTextSpan) {
            $blindTextSpan.textContent = isOpen ? CONFIG.TEXT_CLOSE : CONFIG.TEXT_OPEN;
        }
    });

    document.addEventListener("click", function (event) {
        var $clickedButton = event.target.closest("." + CONFIG.WRAPPER + " ." + CONFIG.TRIGGER);
        if (!$clickedButton) return;

        var $currentContainer = $clickedButton.closest("." + CONFIG.WRAPPER);
        if (!$currentContainer) return;

        var $blindTextSpan = $clickedButton.querySelector("." + CONFIG.BLIND_CLASS);
        
        var isAlreadyOpen = $currentContainer.classList.contains(CONFIG.OPEN_CLASS);

        if (isAlreadyOpen) {
            $currentContainer.classList.remove(CONFIG.OPEN_CLASS);
            $clickedButton.setAttribute("aria-expanded", "false"); 
            
            if ($blindTextSpan) {
                $blindTextSpan.textContent = CONFIG.TEXT_OPEN; 
            }
        } else {
            $currentContainer.classList.add(CONFIG.OPEN_CLASS);
            $clickedButton.setAttribute("aria-expanded", "true");  
            
            if ($blindTextSpan) {
                $blindTextSpan.textContent = CONFIG.TEXT_CLOSE; 
            }
        }
    });
}

// Anchor
function fnBtnAnchor(){
    const $BtnsAnchor = document.querySelectorAll('.btn-anchor');
    $BtnsAnchor.forEach(function($btnAnchor){
        $btnAnchor.addEventListener('click', function () {
            console.log(this.classList)
			if (!this.classList.contains("active")) {
				this.classList.add('active');
			} else {
				this.classList.remove('active');
            }
        });
    });
}
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
// Tab
function fnTab(initialActiveIndex){
    var classTabWrapper = "box-tab";
    var classTabButton = "btn-tab";
    var classTabContent = "box-tab-content";
    var classActiveState = "active";
    var classDisabledState = "disabled";
    var textDisabledGuide = "비활성화됨";

    var $tabWrappers = document.querySelectorAll("." + classTabWrapper);
    if ($tabWrappers.length === 0) return;

    $tabWrappers.forEach(function ($container) {
        var $currentButtons = Array.prototype.filter.call($container.querySelectorAll("." + classTabButton), function ($btn) {
            return $btn.closest("." + classTabWrapper) === $container;
        });
        var $currentContents = Array.prototype.filter.call($container.querySelectorAll("." + classTabContent), function ($content) {
            return $content.closest("." + classTabWrapper) === $container;
        });

        var $disabledButtons = $container.querySelectorAll("." + classDisabledState + " ." + classTabButton + ", ." + classTabButton + "." + classDisabledState);
        $disabledButtons.forEach(function ($button) {
            $button.setAttribute("title", textDisabledGuide);
            $button.setAttribute("disabled", "true"); 
        });

        $currentButtons.forEach(function ($button) {
            var isDisabled = $button.classList.contains(classDisabledState) || $button.hasAttribute("disabled");
            var hasActive = $button.classList.contains(classActiveState);

            if (hasActive) {
                $button.setAttribute("aria-selected", "true");
            } else {
                $button.setAttribute("aria-selected", "false");
            }
        });

        $currentContents.forEach(function ($content) {
            var hasActive = $content.classList.contains(classActiveState);
            if (hasActive) {
                $content.style.display = "block";
            } else {
                $content.style.display = "none";
            }
        });
    });

    document.addEventListener("click", function (event) {
        var $clickedButton = event.target.closest("." + classTabWrapper + " ." + classTabButton);
        if (!$clickedButton) return;

        var $menuWrap = $clickedButton.closest("." + classTabWrapper);
        if (!$menuWrap) return;

        var $scopeButtons = Array.prototype.filter.call($menuWrap.querySelectorAll("." + classTabButton), function ($btn) {
            return $btn.closest("." + classTabWrapper) === $menuWrap;
        });
        var $scopeContents = Array.prototype.filter.call($menuWrap.querySelectorAll("." + classTabContent), function ($content) {
            return $content.closest("." + classTabWrapper) === $menuWrap;
        });

        var targetActiveIndex = $scopeButtons.indexOf($clickedButton);

        var isAlreadyActive = $clickedButton.classList.contains(classActiveState);
        var isDisabledTab = $clickedButton.classList.contains(classDisabledState) || $clickedButton.hasAttribute("disabled");

        if (!isAlreadyActive && !isDisabledTab) {
            
            $scopeButtons.forEach(function ($button, index) {
                var isThisButtonDisabled = $button.classList.contains(classDisabledState) || $button.hasAttribute("disabled");
                if (isThisButtonDisabled) return;

                if (index === targetActiveIndex) {
                    $button.classList.add(classActiveState);
                    $button.setAttribute("aria-selected", "true");
                } else {
                    $button.classList.remove(classActiveState);
                    $button.setAttribute("aria-selected", "false");
                }
            });

            $scopeContents.forEach(function ($content, index) {
                var $matchingButton = $scopeButtons[index];
                var isMatchingButtonDisabled = $matchingButton ? ($matchingButton.classList.contains(classDisabledState) || $matchingButton.hasAttribute("disabled")) : false;
                
                if (isMatchingButtonDisabled) return;

                if (index === targetActiveIndex) {
                    $content.classList.add(classActiveState);
                    $content.style.display = "block";
                } else {
                    $content.classList.remove(classActiveState);
                    $content.style.display = "none";
                }
            });
        }

        var $forcedTargetLists1 = document.querySelectorAll("[id^='tabSingleList']");
        if ($forcedTargetLists1.length > 0) {
            $forcedTargetLists1.forEach(function ($targetItem) {
                $targetItem.classList.add(classActiveState);
            });
        }

        var $forcedTargetLists2 = document.querySelectorAll("[id^='tabSingleList2']");
        if ($forcedTargetLists2.length > 0) {
            $forcedTargetLists2.forEach(function ($targetItem) {
                $targetItem.classList.add(classActiveState);
            });
        }
    });
}
// Tooltip
function fnBoxTooltip(){
    var classTooltipContainer = "box-tooltip";
    var classTriggerButton = "btn";
    var classActiveState = "active";
    var classButtonClose = "btn-close";

    var $tooltipWrappers = document.querySelectorAll("." + classTooltipContainer);
    if ($tooltipWrappers.length === 0) return;

    $tooltipWrappers.forEach(function ($wrapper) {
        var $button = $wrapper.querySelector("." + classTriggerButton);
        if (!$button) return;

        var tooltipTargetId = $button.getAttribute("aria-describedby");
        if (!tooltipTargetId) return;

        var $layer = document.getElementById(tooltipTargetId);
        if (!$layer) return;

        var $buttonClose = $wrapper.querySelector("." + classButtonClose);
        if (!$buttonClose) return

        $button.addEventListener("click", function (event) {
            event.stopPropagation(); 

            var isCurrentlyActive = this.classList.contains(classActiveState);

            fnCloseAllClickTooltips();

            if (!isCurrentlyActive) {
                this.classList.add(classActiveState);
                $layer.setAttribute("aria-hidden", "false");
            }
        });

        $layer.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        $buttonClose.addEventListener("click", function () {
            fnCloseAllClickTooltips();
        });
    });

    document.addEventListener("click", function () {
        fnCloseAllClickTooltips();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" || event.key === "Esc") {
            fnCloseAllClickTooltips();
        }
    });

    function fnCloseAllClickTooltips() {
        var $activeButtons = document.querySelectorAll("." + classTooltipContainer + " ." + classTriggerButton + "." + classActiveState);
        
        $activeButtons.forEach(function ($activeBtn) {
            $activeBtn.classList.remove(classActiveState);
            
            var targetId = $activeBtn.getAttribute("aria-describedby");
            if (targetId) {
                var $targetLayer = document.getElementById(targetId);
                if ($targetLayer) $targetLayer.setAttribute("aria-hidden", "true");
            }
        });
    }
}