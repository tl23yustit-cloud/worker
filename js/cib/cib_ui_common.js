window.addEventListener('load', function () {
	fnSkipNavigation() // skip Navigation
	fnLNB() // LNB
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
// skip Navigation
function fnSkipNavigation() {
	const $btnsSkipNav = document.querySelectorAll(".skip-nav .btn-skip-nav");

	$btnsSkipNav.forEach(function($btn) {
		$btn.addEventListener('focus', function(){
			this.classList.add("is-open");
		});

		$btn.addEventListener('blur', function(){
			this.classList.remove("is-open");
		});
	});
}
//GNB
const header = document.querySelector(".header");
  const items = document.querySelectorAll(".gnb-item");
  const links = document.querySelectorAll(".gnb-link");
  const menus = document.querySelectorAll(".mega-menu");
  document.addEventListener("DOMContentLoaded", function () {
    const selectButtons = document.querySelectorAll(".util-menu .btn-select");

    selectButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        this.classList.toggle("active");
      });
    });
  });

  links.forEach((link) => {
    link.addEventListener("mouseenter", function () {
      header.classList.add("is-open");

      items.forEach((item) => item.classList.remove("is-active"));
      menus.forEach((menu) => menu.classList.remove("is-active"));

      const item = this.closest(".gnb-item");
      item.classList.add("is-active");

      item.querySelector(".mega-menu").classList.add("is-active");
    });
  });
  header.addEventListener("mouseleave", () => {
    header.classList.remove("is-open");

    items.forEach((item) => item.classList.remove("is-active"));
    menus.forEach((menu) => menu.classList.remove("is-active"));
  });

  const gnb = document.querySelector(".header-bottom");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      gnb.classList.add("is-fixed");
    } else {
      gnb.classList.remove("is-fixed");
    }
  });

  document.querySelectorAll(".menu-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".menu-item");

      item.classList.toggle("is-open");

      button.setAttribute("aria-expanded", item.classList.contains("is-open"));
    });
  });
  document.querySelectorAll(".menu-item.has-depth").forEach((item) => {
    const depthCount = item.querySelectorAll(".depth-list > li").length;

    if (depthCount >= 2) {
      item.classList.add("is-toggle");
    } else {
      item.classList.add("is-single");
    }
  });
// LNB
function fnLNB() {
    var classLnbContainer = "wrap-left-menu";
    var classTriggerLink = "link";
    var classActiveState = "selected";
    var classBlindText = "blind";
    var classHasNoChild = "none";

    var textOpenGuide = "메뉴 펼침";
    var textCloseGuide = "메뉴 접힘";

    var $lnbWrapper = document.querySelector("." + classLnbContainer);
    if (!$lnbWrapper) return;

    var $links = $lnbWrapper.querySelectorAll("." + classTriggerLink);
    $links.forEach(function ($link) {
        var $li = $link.parentElement;
        if (!$li || $li.classList.contains(classHasNoChild)) return;

        var $subList = $link.nextElementSibling;
        var $blindSpan = $link.querySelector("." + classBlindText);

        if ($link.classList.contains(classActiveState)) {
            if ($blindSpan) $blindSpan.textContent = textOpenGuide;
        } else {
            if ($blindSpan) $blindSpan.textContent = textCloseGuide;
        }
    });

    // [단계 2] 전역 클릭 위임 이벤트
    $lnbWrapper.addEventListener("click", function (event) {
        var $clickedLink = event.target.closest("." + classTriggerLink);
        if (!$clickedLink) return;

        var $currentLi = $clickedLink.parentElement;
        if (!$currentLi) return;

        if ($currentLi.classList.contains(classHasNoChild) || $currentLi.classList.contains("item-depth4")) {
            return; 
        }

        event.preventDefault();

        var $correspondingSubList = $clickedLink.nextElementSibling;
        var $blindTextSpan = $clickedLink.querySelector("." + classBlindText);
        var isAlreadySelected = $clickedLink.classList.contains(classActiveState);

        if (isAlreadySelected) {
            $clickedLink.classList.remove(classActiveState);
            
            if ($blindTextSpan) $blindTextSpan.textContent = textCloseGuide;
        } else {
            $clickedLink.classList.add(classActiveState);
            
            if ($blindTextSpan) $blindTextSpan.textContent = textOpenGuide;
        }
    });
}
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
			
			if ($blindTextSpan) {
				$blindTextSpan.textContent = CONFIG.TEXT_OPEN; 
			}
		} else {
			$currentContainer.classList.add(CONFIG.OPEN_CLASS);
			
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
			if (!this.classList.contains("active")) {
				this.classList.add('active');
				this.setAttribute('title', '선택됨');
			} else {
				this.classList.remove('active');
				this.removeAttribute("title");
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
			const isExpanded = this.classList.contains('active');
			if (isExpanded) {
				$boxSearchDetail.classList.remove('active');
				if ($blindText) $blindText.textContent = '펼침';
			} else {
				$boxSearchDetail.classList.add('active'); 
				if ($blindText) $blindText.textContent = '접힘';
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
				});

				updateAllCheckboxState($allCheckbox, $itemCheckboxes);
			});
		}

		$itemCheckboxes.forEach(function ($itemCheck) {
			$itemCheck.addEventListener('change', function () {
				if ($allCheckbox) {
					updateAllCheckboxState($allCheckbox, $itemCheckboxes);
				}
			});
		});

		if ($resetBtn) {
			$resetBtn.addEventListener('click', function () {
				$itemCheckboxes.forEach(function ($itemCheck) {
					$itemCheck.checked = false;
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
	} else if (checkedCount === totalCount) {
		$allCheck.checked = true;
		$allCheck.indeterminate = false;
		$allCheck.classList.remove('is-indeterminate');
	} else {
		$allCheck.checked = false;
		$allCheck.indeterminate = true;
		$allCheck.classList.add('is-indeterminate');
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
				} else {
					$button.classList.remove(classActiveState);
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
    var classTooltipLayer = "layer-tooltip";
	
    var $tooltipWrappers = document.querySelectorAll("." + classTooltipContainer);
    if ($tooltipWrappers.length === 0) return;

    $tooltipWrappers.forEach(function ($wrapper) {
        var $button = $wrapper.querySelector("." + classTriggerButton);
        var $buttonClose = $wrapper.querySelector("." + classButtonClose);
        if (!$button) return;

        var $layer = $wrapper.querySelector("." + classTooltipLayer);
        if (!$layer) return;

        $button.addEventListener("click", function (event) {
            event.stopPropagation(); 

            var isCurrentlyActive = this.classList.contains(classActiveState);

            fnCloseAllClickTooltips();

            if (!isCurrentlyActive) {
                this.classList.add(classActiveState);
            }
        });

        $layer.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        if ($buttonClose) {
            $buttonClose.addEventListener("click", function (event) {
                event.stopPropagation();
                fnCloseAllClickTooltips();
            });
        }
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
        });
    }
}