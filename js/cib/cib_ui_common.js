window.addEventListener('load', function () {
	fnSkipNavigation(); // skip Navigation
	fnLNB(); // LNB
	fnHeader(); // header
	fnBoxAccordion(); // Accordion
	fnBtnAnchor(); // Anchor
	fnSelectColorChange(); // select 태그 class 추가
	fnInputClear(); // 기본 검색
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

	$btnsSkipNav.forEach(function ($btn) {
		// $btn.addEventListener('focus', function () {
		// 	this.classList.add("is-open");
		// });

		$btn.addEventListener('blur', function () {
			this.classList.remove("is-open");
		});
	});
}
// header
function fnHeader() {
	var $header = document.querySelector(".header");
	var $gnb = document.querySelector(".header-bottom");

	var $items = document.querySelectorAll(".gnb-item");
	var $links = document.querySelectorAll(".gnb-link");
	var $menus = document.querySelectorAll(".mega-menu");

	var $selectButtons = document.querySelectorAll(".util-menu .btn-select");
	var $menuToggleButtons = document.querySelectorAll(".menu-toggle");
	var $hasDepthItems = document.querySelectorAll(".menu-item.has-depth");

	// 서치 레이어 관련 요소
	var $searchLayer = document.querySelector(".search-layer");
	var $btnSearch = document.querySelector(".btn-search");
	var $input = document.querySelector(".search-input, .box-input-search .input");
	var $dropdown = document.querySelector(".search-dropdown");
	var $btnSearchClose = document.querySelector(".btn-search-close");

	const focusInput = document.querySelector("#headerSearch");
	const autoBox = document.querySelector(".search-autocomplete");
	const list = document.querySelector(".autocomplete-list");
	const searchArea = document.querySelector(".search-area");

	// 검색패널
	const historyBox = document.querySelector(".autocomplete-history");
	const keywordBox = document.querySelector(".autocomplete-keyword");
	const noResultBox = document.querySelector(".autocomplete-no-result");
	const historyWrap = document.querySelector(".history-wrap");
	const historyList = historyWrap.querySelector(".history-list");

	const hasHistory = historyList.children.length > 0;
	const historyEmpty = document.querySelector(".history-empty");
	const btnDeleteAll = document.querySelector(".btn-delete-all");
	const btnPannelClose = document.querySelector(".btn-pannel-close");

	// 유틸 메뉴 셀렉트 버튼 토글
	if ($selectButtons.length > 0) {
		$selectButtons.forEach(function ($button) {
			$button.addEventListener("click", function () {
				this.classList.toggle("active");
			});
		});
	}
	// GNB 메가메뉴 Hover
	if ($links.length > 0 && $header) {
		$links.forEach(function ($link) {
			$link.addEventListener("mouseenter", function () {
				$header.classList.add("is-open");

				$items.forEach(function ($item) { $item.classList.remove("is-active"); });
				$menus.forEach(function ($menu) { $menu.classList.remove("is-active"); });

				var $currentItem = this.closest(".gnb-item");
				if ($currentItem) {
					$currentItem.classList.add("is-active");

					var $targetMegaMenu = $currentItem.querySelector(".mega-menu");
					if ($targetMegaMenu) $targetMegaMenu.classList.add("is-active");
				}
			});
		});

		$header.addEventListener("mouseleave", function () {
			$header.classList.remove("is-open");
			$items.forEach(function ($item) { $item.classList.remove("is-active"); });
			$menus.forEach(function ($menu) { $menu.classList.remove("is-active"); });
		});
	}
	// 스크롤에 따른 GNB 고정 (is-fixed)
	
	if ($gnb) {
		let timer;
		window.addEventListener("scroll", function () {
			clearTimeout(timer);
			if (window.scrollY > 64) {
				$gnb.classList.add("is-fixed");
			} else {
				$gnb.classList.remove("is-fixed");
			}
		});
	}
	//  사이드/전체 메뉴 토글 버튼 및 뎁스 분류 스타일링
	if ($menuToggleButtons.length > 0) {
		$menuToggleButtons.forEach(function ($button) {
			$button.addEventListener("click", function () {
				var $item = this.closest(".menu-item");
				if ($item) {
					$item.classList.toggle("is-open");
					this.setAttribute("aria-expanded", $item.classList.contains("is-open"));
				}
			});
		});
	}

	if ($hasDepthItems.length > 0) {
		$hasDepthItems.forEach(function ($item) {
			var depthCount = $item.querySelectorAll(".depth-list > li").length;
			if (depthCount >= 2) {
				$item.classList.add("is-toggle");
			} else {
				$item.classList.add("is-single");
			}
		});
	}

	//  검색 레이어 팝업 및 드롭다운 연동 인터랙션
	if ($btnSearch && $searchLayer) {
		$btnSearch.addEventListener("click", function (event) {
			event.preventDefault();

			if ($header) $header.classList.remove("is-open");
			$items.forEach(function ($item) { $item.classList.remove("is-active"); });
			$menus.forEach(function ($menu) { $menu.classList.remove("is-active"); });

			$searchLayer.classList.add("is-search-open");
		});

		if ($input && $dropdown) {
			$input.addEventListener("blur", function () {
				setTimeout(function () {
					$dropdown.classList.remove("is-search-open");
				}, 100);
			});
		}

		if ($links.length > 0) {
			$links.forEach(function ($link) {
				$link.addEventListener("mouseenter", function () {
					$searchLayer.classList.remove("is-search-open");
					if ($dropdown) $dropdown.classList.remove("is-search-open");
				});
			});
		}

		if ($btnSearchClose) {
			$btnSearchClose.addEventListener("click", function (event) {
				event.preventDefault();
				$searchLayer.classList.remove("is-search-open");
				if ($dropdown) $dropdown.classList.remove("is-search-open");
				if ($input) $input.value = "";
				$btnSearch.focus();
			});
		}
	}
	historyWrap.classList.toggle("is-empty", !hasHistory);

	// 검색어
	const items = document.querySelectorAll(".autocomplete-list .typeMd");

	// 원본 검색어 저장
	items.forEach((item) => {
		item.dataset.keyword = item.textContent.trim();
	});

	// 자동완성 열기
	function openAutocomplete() {
		autoBox.classList.add("is-active");
		searchArea.classList.add("is-active");
	}

	// 자동완성 닫기
	function closeAutocomplete() {
		autoBox.classList.remove("is-active");
		searchArea.classList.remove("is-active");

		document.querySelectorAll(".autocomplete-panel").forEach((panel) => {
			panel.classList.remove("is-active");
		});
	}
	btnPannelClose.addEventListener("click", () => {
		closeAutocomplete();
	});
	// 패널 전환
	function showPanel(panel) {
		document.querySelectorAll(".autocomplete-panel").forEach((item) => {
			item.classList.remove("is-active");
		});

		if (panel) {
			panel.classList.add("is-active");
		}
	}

	// 포커스
	focusInput.addEventListener("focus", () => {
		openAutocomplete();
		const hasHistory = true; // 나중에 실제 데이터로 변경

		showPanel(hasHistory ? historyBox : "");
	});

	focusInput.addEventListener("input", () => {
		const value = focusInput.value.trim();

		// 입력 없으면 최근검색어
		if (!value) {
			items.forEach((textEl) => {
				const li = textEl.closest("li");

				li.style.display = "";
				textEl.textContent = textEl.dataset.keyword;
			});

			const hasHistory = true;
			showPanel(hasHistory ? historyBox : "");
			return;
		}

		let hasResult = false;

		items.forEach((textEl) => {
			const keyword = textEl.dataset.keyword;
			const li = textEl.closest("li");

			if (keyword.includes(value)) {
				li.style.display = "";
				hasResult = true;

				textEl.innerHTML = keyword.replace(
					new RegExp(value, "g"),
					`<strong>${value}</strong>`,
				);
			} else {
				li.style.display = "none";
				textEl.textContent = keyword;
			}
		});

		if (hasResult) {
			showPanel(keywordBox);
		} else {
			showPanel(noResultBox);
		}

		openAutocomplete();
	});

	// 키워드 클릭
	list.addEventListener("click", (e) => {
		const link = e.target.closest(".keyword-btn");
		if (!link) return;
		e.preventDefault();
		focusInput.value = link.querySelector(".text").textContent.trim();
		closeAutocomplete();
	});

	// 바깥 클릭
	document.addEventListener("click", (e) => {
		if (!e.target.closest(".search-area")) {
			closeAutocomplete();
		}
	});


	function updateHistoryState() {
		const hasHistory = historyList.children.length > 0;

		historyList.style.display = hasHistory ? "" : "none";
		historyEmpty.style.display = hasHistory ? "none" : "flex";
		btnDeleteAll.style.display = hasHistory ? "" : "none";
	}
	historyList.addEventListener("click", (e) => {
		const btn = e.target.closest(".btn-delete-item");

		if (!btn) return;

		btn.closest("li").remove();
		e.preventDefault();
		e.stopPropagation();

		btn.closest("li").remove();
		updateHistoryState();
	});
	btnDeleteAll.addEventListener("click", () => {
		historyList.innerHTML = "";

		updateHistoryState();
	});
}
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
function fnBtnAnchor() {
	const $BtnsAnchor = document.querySelectorAll('.btn-anchor');
	$BtnsAnchor.forEach(function ($btnAnchor) {
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
function fnSelectColorChange() {
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
// 기본 검색
function fnInputClear() {
	var classSearchContainer = "box-input-search";
	var classInput = "input";
	var classButtonDelete = "btn-delete";

	var $searchWrappers = document.querySelectorAll("." + classSearchContainer);
	if ($searchWrappers.length === 0) return;

	$searchWrappers.forEach(function ($wrapper) {
		var $input = $wrapper.querySelector("." + classInput);
		var $btnDelete = $wrapper.querySelector("." + classButtonDelete);

		if (!$input || !$btnDelete) return;

		function toggleDeleteButton() {
			var hasText = $input.value.trim().length > 0;

			if (hasText) {
				$btnDelete.style.display = "block";
			} else {
				$btnDelete.style.display = "none";
			}
		}

		$input.addEventListener("input", toggleDeleteButton);
		$input.addEventListener("keyup", toggleDeleteButton);
		$input.addEventListener("paste", function () {
			setTimeout(toggleDeleteButton, 0);
		});

		$btnDelete.addEventListener("click", function (event) {
			event.preventDefault();

			$input.value = "";

			this.style.display = "none";

			$input.focus();
		});

		toggleDeleteButton();
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
function fnTab(initialActiveIndex) {
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
function fnBoxTooltip() {
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
