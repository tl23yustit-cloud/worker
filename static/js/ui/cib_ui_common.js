/**
 * ============================================================================
 * [개발팀 연동 가이드] 동적 DOM 생성 시 UI 컴포넌트 초기화 함수
 * ============================================================================
 * 
 * AJAX 통신, 모달 오픈, 탭 변경 등 화면에 HTML을 동적으로 렌더링한 직후 호출해 주세요.
 * 스와이퍼(Swiper), 체크박스 테이블, 프로그래스바 등 인스턴스/상태 기반 UI를 찾아 실행합니다.
 * (아코디언, 드롭다운 등 단순 클릭/토글 UI는 자동 적용되므로 신경 쓰지 않으셔도 됩니다.)
 * 
 * @param {HTMLElement} context - (옵션) 새로 생성된 요소를 감싸는 부모 DOM 요소
 *                                지정 시 해당 영역 안에서만 탐색하므로 성능에 좋습니다.
 *                                생략 시 문서 전체(document)를 스캔합니다. (중복 방지 처리됨)
 * 
 * @example
 * // 1. innerHTML로 특정 영역 내용을 갈아끼울 때 (추천)
 * const $list = document.getElementById('list-container');
 * $list.innerHTML = '<div class="swiper">...</div>';
 * window.initDynamicUI($list);
 * 
 * @example
 * // 2. createElement로 새 요소를 덧붙일 때
 * const $newItem = document.createElement('div');
 * $newItem.innerHTML = '<table class="js-check-table">...</table>';
 * document.querySelector('.content-area').appendChild($newItem);
 * window.initDynamicUI($newItem);
 * 
 * @example
 * // 3. 부모 요소를 특정하기 어렵거나 화면 전체가 크게 바뀐 경우 (전체 스캔)
 * // HTML 렌더링을 마친 후 괄호를 비우고 호출합니다.
 * window.initDynamicUI();
 */

if (!window._isUICommonDelegated) {
	window._isUICommonDelegated = true;
	
	window.addEventListener('load', function () {
		fnHeader(); // Header
		fnSkipNavigation(); // Skip Nav
		
		setupDelegatedEvents(); 
		initDynamicUI();
	});
}

// 동적 DOM 생성 시 재호출 함수
window.initDynamicUI = function(context = document) {
	fnSwiperHtmlControl(context);
	initTableCheckbox(context);
	initAutoTableCaptions(context);
	initPaginationButtonState(context);
	initCurrencyFormat(context);
	initRateRange(context);
	fnInitTextareaLength(context); 
};


function setupDelegatedEvents() {
	
	// LNB
	document.addEventListener('click', function (e) {
		const $lnbWrapper = e.target.closest('.wrap-left-menu');
		if (!$lnbWrapper) return;
		
		const $clickedLink = e.target.closest('.link');
		if (!$clickedLink) return;

		const $currentLi = $clickedLink.parentElement;
		if (!$currentLi || $currentLi.classList.contains("none") || $currentLi.classList.contains("item-depth4")) return;

		e.preventDefault();
		const $blindTextSpan = $clickedLink.querySelector(".blind");
		const isAlreadySelected = $clickedLink.classList.contains("selected");

		if (isAlreadySelected) {
			$clickedLink.classList.remove("selected");
			if ($blindTextSpan) $blindTextSpan.textContent = "메뉴 접힘";
		} else {
			$clickedLink.classList.add("selected");
			if ($blindTextSpan) $blindTextSpan.textContent = "메뉴 펼침";
		}
	});

	// Accordion
	document.addEventListener('click', function (e) {
		const $clickedButton = e.target.closest(".box-accordion .box-item-list");
		if (!$clickedButton) return;

		const $currentContainer = $clickedButton.closest(".box-accordion");
		if (!$currentContainer) return;

		const $blindTextSpan = $clickedButton.querySelector(".blind");
		const isAlreadyOpen = $currentContainer.classList.contains("is-open");

		if (isAlreadyOpen) {
			$currentContainer.classList.remove("is-open");
			if ($blindTextSpan) $blindTextSpan.textContent = "상세내용 열기";
		} else {
			$currentContainer.classList.add("is-open");
			if ($blindTextSpan) $blindTextSpan.textContent = "상세내용 닫기";
		}
	});

	// Anchor
	document.addEventListener('click', function(e) {
		const $btnAnchor = e.target.closest('.btn-anchor');
		if ($btnAnchor) {
			if (!$btnAnchor.classList.contains("active")) {
				$btnAnchor.classList.add('active');
				$btnAnchor.setAttribute('title', '선택됨');
			} else {
				$btnAnchor.classList.remove('active');
				$btnAnchor.removeAttribute("title");
			}
		}
	});

	// Select 태그 class 추가
	document.addEventListener('change', function(e) {
		const $select = e.target.closest('select.select');
		if ($select) {
			if ($select.selectedIndex > 0) $select.classList.add('selected');
			else $select.classList.remove('selected');
		}
	});

	// 기본 검색 (Input Clear)
	document.addEventListener('input', function(e) {
		const $input = e.target.closest('.box-input-search .input');
		if ($input) toggleInputDeleteButton($input);
	});
	document.addEventListener('click', function(e) {
		const $btnDelete = e.target.closest('.box-input-search .btn-delete');
		if ($btnDelete) {
			e.preventDefault();
			const $input = $btnDelete.closest('.box-input-search').querySelector('.input');
			if ($input) {
				$input.value = "";
				$input.focus();
				toggleInputDeleteButton($input);
			}
		}
	});
	function toggleInputDeleteButton($input) {
		const $btnDelete = $input.closest('.box-input-search').querySelector('.btn-delete');
		if ($btnDelete) {
			$btnDelete.style.display = $input.value.trim().length > 0 ? "block" : "none";
		}
	}

	// 상세검색
	document.addEventListener('click', function(e) {
		const $toggleBtn = e.target.closest('.box-search-detail .box-top-visual .btn');
		if ($toggleBtn) {
			const $boxSearchDetail = $toggleBtn.closest('.box-search-detail');
			const $blindText = $toggleBtn.querySelector('.blind');
			const isExpanded = $boxSearchDetail.classList.contains('active');

			if (isExpanded) {
				$boxSearchDetail.classList.remove('active');
				$toggleBtn.classList.remove('active');
				$toggleBtn.setAttribute('aria-expanded', 'false');
				if ($blindText) $blindText.textContent = '펼침';
			} else {
				$boxSearchDetail.classList.add('active');
				$toggleBtn.classList.add('active');
				$toggleBtn.setAttribute('aria-expanded', 'true');
				if ($blindText) $blindText.textContent = '접힘';
			}
		}
	});

	// 기본 드롭다운
	document.addEventListener('click', function(e) {
		const $boxSelectTrigger = e.target.closest('.box-select .select');
		const $boxSelectItem = e.target.closest('.box-select .item-select');
		
		if ($boxSelectTrigger) {
			e.stopPropagation();
			const $boxSelect = $boxSelectTrigger.closest('.box-select');
			const isOpen = $boxSelectTrigger.classList.contains('active');
			const $blindText = $boxSelectTrigger.querySelector('.blind');
			
			closeAllSelects();
			
			if (!isOpen) {
				$boxSelectTrigger.classList.add('active');
				$boxSelect.classList.add('is-open');
				if ($blindText) $blindText.textContent = '접힘';
			}
			return;
		}

		if ($boxSelectItem) {
			e.stopPropagation();
			const $boxSelect = $boxSelectItem.closest('.box-select');
			const $triggerBtn = $boxSelect.querySelector('.select');
			const $blindText = $triggerBtn.querySelector('.blind');
			const selectedText = $boxSelectItem.textContent.trim();
			
			const $textSpan = $triggerBtn.querySelector('.text');
			if ($textSpan) {
				$textSpan.textContent = selectedText;
			} else {
				const blindContent = $blindText ? $blindText.outerHTML : '';
				$triggerBtn.innerHTML = selectedText + blindContent;
			}

			$boxSelect.querySelectorAll('.item-select').forEach(function(el) {
				el.classList.remove('selected');
			});
			$boxSelectItem.classList.add('selected');
			
			closeAllSelects();
			return;
		}

		if (!e.target.closest('.box-select')) {
			closeAllSelects();
		}
	});

	function closeAllSelects() {
		document.querySelectorAll('.box-select .select.active').forEach($btn => {
			$btn.classList.remove('active');
			const $blindText = $btn.querySelector('.blind');
			if ($blindText) $blindText.textContent = '펼침';
		});
		document.querySelectorAll('.box-select.is-open').forEach($comp => {
			$comp.classList.remove('is-open');
		});
	}

	// 멀티 드롭다운
	document.addEventListener('click', function(e) {
		const $triggerBtn = e.target.closest('.box-multi-select .select');
		const $resetBtn = e.target.closest('.box-multi-select .utilities .btn-reset');

		if ($triggerBtn) {
			e.stopPropagation();
			const $boxMultiSelect = $triggerBtn.closest('.box-multi-select');
			const isOpen = $triggerBtn.classList.contains('active');
			const $blindText = $triggerBtn.querySelector('.blind');
			
			closeAllMultiSelects();

			if (!isOpen) {
				$triggerBtn.classList.add('active');
				$boxMultiSelect.classList.add('is-open');
				if ($blindText) $blindText.textContent = '접힘';
			}
			return;
		}

		if ($resetBtn) {
			const $boxMultiSelect = $resetBtn.closest('.box-multi-select');
			const $allCheck = $boxMultiSelect.querySelector('.box-list-select-all .form-checkbox');
			const $itemChecks = $boxMultiSelect.querySelectorAll('.list-select .form-checkbox');
			
			$itemChecks.forEach(item => item.checked = false);
			if ($allCheck) {
				$allCheck.checked = false;
				updateAllCheckboxState($allCheck, $itemChecks);
			}
			return;
		}

		if (!e.target.closest('.box-multi-select')) {
			closeAllMultiSelects();
		}
	});

	document.addEventListener('change', function(e) {
		const $boxMultiSelect = e.target.closest('.box-multi-select');
		if (!$boxMultiSelect) return;

		const $allCheck = $boxMultiSelect.querySelector('.box-list-select-all .form-checkbox');
		const $itemChecks = Array.from($boxMultiSelect.querySelectorAll('.list-select .form-checkbox'));

		if (e.target === $allCheck) {
			const isChecked = $allCheck.checked;
			$itemChecks.forEach(item => item.checked = isChecked);
			updateAllCheckboxState($allCheck, $itemChecks);
		} else if ($itemChecks.includes(e.target)) {
			if ($allCheck) updateAllCheckboxState($allCheck, $itemChecks);
		}
	});

	function closeAllMultiSelects() {
		document.querySelectorAll('.box-multi-select .select.active').forEach($btn => {
			$btn.classList.remove('active');
			const $blindText = $btn.querySelector('.blind');
			if ($blindText) $blindText.textContent = '펼침';
		});
		document.querySelectorAll('.box-multi-select.is-open').forEach($comp => {
			$comp.classList.remove('is-open');
		});
	}

	function updateAllCheckboxState($allCheck, $items) {
		const totalCount = $items.length;
		let checkedCount = 0;
		$items.forEach(item => { if (item.checked) checkedCount++; });

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

	// Textarea 글자수
	document.addEventListener('input', function(e) {
		const $textarea = e.target.closest('.form-text-area textarea');
		if ($textarea) {
			const $currentSpan = $textarea.closest('.form-text-area').querySelector('.current');
			if ($currentSpan) $currentSpan.textContent = $textarea.value.length;
		}
	});

	// Tab
	document.addEventListener('click', function(e) {
		const classTabWrapper = "box-tab";
		const classTabButton = "btn-tab";
		const classTabContent = "box-tab-content";
		const classActiveState = "active";
		const classDisabledState = "disabled";

		const $clickedButton = e.target.closest("." + classTabWrapper + " ." + classTabButton);
		if (!$clickedButton) return;

		const $menuWrap = $clickedButton.closest("." + classTabWrapper);
		if (!$menuWrap) return;

		const $scopeButtons = Array.prototype.filter.call($menuWrap.querySelectorAll("." + classTabButton), btn => btn.closest("." + classTabWrapper) === $menuWrap);
		const $scopeContents = Array.prototype.filter.call($menuWrap.querySelectorAll("." + classTabContent), content => content.closest("." + classTabWrapper) === $menuWrap);

		const targetActiveIndex = $scopeButtons.indexOf($clickedButton);
		const isAlreadyActive = $clickedButton.classList.contains(classActiveState);
		const isDisabledTab = $clickedButton.classList.contains(classDisabledState) || $clickedButton.hasAttribute("disabled");

		if (!isAlreadyActive && !isDisabledTab) {
			$scopeButtons.forEach(($button, index) => {
				const isThisButtonDisabled = $button.classList.contains(classDisabledState) || $button.hasAttribute("disabled");
				if (isThisButtonDisabled) return;

				if (index === targetActiveIndex) $button.classList.add(classActiveState);
				else $button.classList.remove(classActiveState);
			});

			$scopeContents.forEach(($content, index) => {
				const $matchingButton = $scopeButtons[index];
				const isMatchingButtonDisabled = $matchingButton ? ($matchingButton.classList.contains(classDisabledState) || $matchingButton.hasAttribute("disabled")) : false;
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
		
		document.querySelectorAll("[id^='tabSingleList'], [id^='tabSingleList2']").forEach($targetItem => {
			$targetItem.classList.add(classActiveState);
		});
	});

	// Pagination 버튼 선택 상태
	document.addEventListener('click', function(e) {
		const $pageButton = e.target.closest('.list-pagination .btn-page');
		if (!$pageButton) return;

		const $pageList = $pageButton.closest('.list-pagination');
		if (!$pageList) return;

		$pageList.querySelectorAll('.btn-page').forEach(($btn) => {
			const isActive = $btn === $pageButton;
			$btn.classList.toggle('active', isActive);
			if (isActive) {
				$btn.setAttribute('aria-current', 'page');
				$btn.setAttribute('title', '현재 페이지');
			} else {
				$btn.removeAttribute('aria-current');
				$btn.removeAttribute('title');
			}
		});
	});

	// Tooltip
	document.addEventListener('click', function(e) {
		const classActiveState = "active";
		const $triggerBtn = e.target.closest('.box-tooltip .btn');
		const $closeBtn = e.target.closest('.box-tooltip .btn-close');
		
		if ($triggerBtn) {
			e.stopPropagation();
			const targetId = $triggerBtn.getAttribute("aria-describedby");
			const $layer = targetId ? document.getElementById(targetId) : null;
			const isCurrentlyActive = $triggerBtn.classList.contains(classActiveState);
			
			closeAllTooltips();
			if (!isCurrentlyActive && $layer) {
				$triggerBtn.classList.add(classActiveState);
				$layer.setAttribute("aria-hidden", "false");
			}
			return;
		}

		if ($closeBtn || !e.target.closest('.box-tooltip')) {
			closeAllTooltips();
		}
	});

	document.addEventListener("keydown", function(e) {
		if (e.key === "Escape" || e.key === "Esc") closeAllTooltips();
	});

	function closeAllTooltips() {
		document.querySelectorAll(".box-tooltip .btn.active").forEach($activeBtn => {
			$activeBtn.classList.remove("active");
			const targetId = $activeBtn.getAttribute("aria-describedby");
			if (targetId) {
				const $targetLayer = document.getElementById(targetId);
				if ($targetLayer) $targetLayer.setAttribute("aria-hidden", "true");
			}
		});
	}

	// Modal
	let lastFocusedElement;
	const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;
	const updateBodyScroll = () => {
		const hasActive = document.querySelector('.modal.is-active, .alert.is-active');
		if (hasActive) {
			const scrollbarWidth = getScrollbarWidth();
			if (scrollbarWidth > 0) document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
			document.body.classList.add('is-scroll-locked');
		} else {
			document.body.classList.remove('is-scroll-locked');
			document.documentElement.style.removeProperty('--scrollbar-width');
		}
	};

	document.addEventListener('click', (e) => {
		const openBtn = e.target.closest('.btn-modal, .btn-alert');
		if (openBtn) {
			const targetId = openBtn.dataset.target;
			const targetEl = document.getElementById(targetId);
			if (targetEl) {
				lastFocusedElement = document.activeElement;
				targetEl.classList.add('is-active');
				updateBodyScroll();
				const firstFocusable = targetEl.querySelector('button, [href], input, select, textarea');
				if (firstFocusable) firstFocusable.focus();
			}
		}

		const closeBtn = e.target.closest('.btn-close');
		if (closeBtn) {
			const container = closeBtn.closest('.modal, .alert');
			if (container) {
				container.classList.remove('is-active');
				updateBodyScroll();
				if (lastFocusedElement) lastFocusedElement.focus();
			}
		}

		if (e.target.classList.contains('modal') || e.target.classList.contains('alert')) {
			if (e.target.dataset.backdropClose !== "false") {
				e.target.classList.remove('is-active');
				updateBodyScroll();
				if (lastFocusedElement) lastFocusedElement.focus();
			}
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			const activeEl = document.querySelector('.modal.is-active, .alert.is-active');
			if (activeEl) {
				activeEl.classList.remove('is-active');
				updateBodyScroll();
				if (lastFocusedElement) lastFocusedElement.focus();
			}
		}
	});

	// 정렬 버튼
	document.addEventListener('click', function(e) {
		const $button = e.target.closest('.sort-btn-wrapper .btn');
		if ($button) {
			const wrapper = $button.closest('.sort-btn-wrapper');
			const buttons = wrapper.querySelectorAll('.btn');
			const isCurrentlyPressed = $button.getAttribute('aria-pressed') === 'true';

			buttons.forEach(btn => {
				btn.setAttribute('aria-pressed', 'false');
				btn.classList.remove('type-bg-neutral');
				btn.classList.add('type-line-neutral');
			});

			if (!isCurrentlyPressed) {
				$button.setAttribute('aria-pressed', 'true');
				$button.classList.remove('type-line-neutral');
				$button.classList.add('type-bg-neutral');
			}
		}
	});

	// 뷰셀렉터
	document.addEventListener('click', function(e) {
		const $button = e.target.closest('.view-selector button');
		if ($button) {
			e.preventDefault();
			const selector = $button.closest('.view-selector');
			const buttons = Array.from(selector.querySelectorAll('button'));
			const index = buttons.indexOf($button);

			buttons.forEach(btn => {
				btn.classList.remove('active');
				const icon = btn.querySelector('i');
				if (icon) {
					icon.classList.remove('color-fg-primary');
					icon.classList.add('color-fg-netral');
				}
			});

			$button.classList.add('active');
			const currentIcon = $button.querySelector('i');
			if (currentIcon) {
				currentIcon.classList.remove('color-fg-netral');
				currentIcon.classList.add('color-fg-primary');
			}

			const parentTabContent = selector.closest('.box-tab-content') || selector.closest('.content');
			if (!parentTabContent) return;

			const cardContainer = parentTabContent.querySelector('.card-swiper-container');
			const listContainer = parentTabContent.querySelector('.list-view-container');

			if (index === 0) {
				if (cardContainer) cardContainer.style.display = 'block';
				if (listContainer) listContainer.style.display = 'none';
			} else if (index === 1) {
				if (cardContainer) cardContainer.style.display = 'none';
				if (listContainer) listContainer.style.display = 'block';
			}
		}
	});

	// 드롭박스
	document.addEventListener('click', function(e) {
		const toggle = e.target.closest('.drop-box-toggle');
		if (toggle) {
			const dropBox = toggle.closest('.drop-box');
			if (dropBox) dropBox.classList.toggle('is-open');
		}
	});

	// 캘린더
	document.addEventListener('click', function(e) {
		const toggleBtn = e.target.closest('.calendar-wrap .input-box .btn');
		const calendarLayer = e.target.closest('.calendarLayer_wrap');
		const applyBtn = e.target.closest('.calendarLayer_wrap .btn_apply');

		if (toggleBtn) {
			e.stopPropagation();
			const calendarWrap = toggleBtn.closest('.calendar-wrap');
			const layer = calendarWrap.querySelector('.calendarLayer_wrap');
			if (!layer) return;

			const btns = Array.from(calendarWrap.querySelectorAll('.input-box .btn'));
			const index = btns.indexOf(toggleBtn);
			const isActive = layer.classList.contains('is-active');
			const currentActiveIndex = layer.dataset.activeIndex;

			if (isActive && currentActiveIndex == index) {
				layer.classList.remove('is-active');
				return;
			}
			if (index > 0) layer.classList.add('align-right');
			else layer.classList.remove('align-right');

			layer.dataset.activeIndex = index;
			layer.classList.add('is-active');
			return;
		}

		if (applyBtn) {
			applyBtn.closest('.calendarLayer_wrap').classList.remove('is-active');
			return;
		}

		if (calendarLayer) {
			e.stopPropagation();
			return;
		}

		document.querySelectorAll('.calendarLayer_wrap.is-active').forEach(layer => {
			layer.classList.remove('is-active');
		});
	});
}


// 슬라이드 옵션 html 컨트롤
function fnSwiperHtmlControl(context = document) {
	if (typeof Swiper === 'undefined') return;
	
	const swiperContainers = context.querySelectorAll('.swiper');
	swiperContainers.forEach(function (container) {
		if (container.swiper) return;

		var dataset = container.dataset;
		var isAutoplay = dataset.autoplay === 'true';
		var autoDelay = parseInt(dataset.delay, 10) || 3000;
		var isLoop = dataset.loop === 'true';
		var speed = parseInt(dataset.speed, 10) || 300;
		var rawPerView = dataset.slidesPerView;
		var slidesPerView = rawPerView === 'auto' ? 'auto' : (parseInt(rawPerView, 10) || 1);
		var slidesPerGroup = parseInt(dataset.slidesPerGroup, 10) || 1;
		var useNavigation = dataset.useNavigation !== 'false';
		var paginationType = dataset.paginationType || 'bullets';
		var isCustomBullet = dataset.customBullet === 'true';
		var playBtnSelector = dataset.btnPlay || '.swiper-btn-play';
		var pauseBtnSelector = dataset.btnPause || '.swiper-btn-pause';

		var swiperOptions = {
			speed: speed,
			loop: isLoop,
			slidesPerView: slidesPerView,
			slidesPerGroup: slidesPerGroup,
			autoplay: isAutoplay ? { delay: autoDelay, disableOnInteraction: false } : false
		};

		var $pagination = container.querySelector('.swiper-pagination');
		var $prevBtn = container.querySelector('.swiper-button-prev');
		var $nextBtn = container.querySelector('.swiper-button-next');
		var $scrollbar = container.querySelector('.swiper-scrollbar');

		if ($pagination) {
			var paginationConfig = { el: $pagination, clickable: true };
			if (paginationType === 'dash') {
				paginationConfig.type = 'bullets';
				paginationConfig.bulletClass = 'swiper-pagination-dash';
				paginationConfig.bulletActiveClass = 'is-active';
				paginationConfig.renderBullet = function (index, className) { return '<span class="' + className + '"></span>'; };
			} else if (paginationType === 'custom') {
				paginationConfig.type = 'custom';
				paginationConfig.renderCustom = function (swiper, current, total) {
					return '<span class="current">' + current + '</span> <span class="divider">/</span> <span class="total">' + total + '</span>';
				};
			} else if (paginationType === 'bullets' && isCustomBullet) {
				paginationConfig.type = 'bullets';
				paginationConfig.renderBullet = function (index, className) {
					return '<span class="' + className + '">' + (index + 1) + '</span>';
				};
			} else {
				paginationConfig.type = paginationType;
			}
			swiperOptions.pagination = paginationConfig;
		}

		if (useNavigation && $prevBtn && $nextBtn) swiperOptions.navigation = { nextEl: $nextBtn, prevEl: $prevBtn };
		if ($scrollbar) swiperOptions.scrollbar = { el: $scrollbar, draggable: true };

		var swiper = new Swiper(container, swiperOptions);
		var $playBtn = container.querySelector(playBtnSelector);
		var $pauseBtn = container.querySelector(pauseBtnSelector);

		if ($pauseBtn) {
			$pauseBtn.addEventListener('click', function () {
				if (swiper.autoplay) swiper.autoplay.stop();
				if ($playBtn) { $pauseBtn.style.display = 'none'; $playBtn.style.display = 'inline-block'; }
			});
		}
		if ($playBtn) {
			$playBtn.addEventListener('click', function () {
				if (swiper.autoplay) swiper.autoplay.start();
				if ($pauseBtn) { $playBtn.style.display = 'none'; $pauseBtn.style.display = 'inline-block'; }
			});
		}
	});
}

// allcheck
function initTableCheckbox(context = document) {
	var tables = context.querySelectorAll(".js-check-table");
	
	tables.forEach(function (table) {
		if (table.dataset.checkInit) return;
		table.dataset.checkInit = 'true';

		function updateState() {
			var checkAlls = table.querySelectorAll(".check-all");
			var rowChecks = table.querySelectorAll(".row-check");
			var count = table.querySelector(".selected-count span");
			if (!checkAlls.length || !rowChecks.length) return;

			var checked = table.querySelectorAll(".row-check:checked").length;
			if (count) count.textContent = checked;

			checkAlls.forEach(function (ca) {
				ca.checked = (checked > 0 && checked === rowChecks.length);
				ca.indeterminate = (checked > 0 && checked < rowChecks.length);
			});
		}

		table.addEventListener('change', function (e) {
			const targetCheckAll = e.target.closest('.check-all');
			const targetRowCheck = e.target.closest('.row-check');

			if (targetCheckAll) {
				table.querySelectorAll('.row-check').forEach(function (item) {
					item.checked = targetCheckAll.checked;
				});
				updateState();
			}
			
			if (targetRowCheck) {
				updateState();
			}
		});

		updateState();
	});
}

// 테이블 자동 caption 생성
function initAutoTableCaptions(context = document) {
	context.querySelectorAll('table.table-type01, table.table-type02, table.table-type03').forEach((table) => {
		const labels = Array.from(
			table.querySelectorAll('thead th, tbody th, tr:first-child th')
		).map((th) => {
			const text = th.textContent.replace(/\s+/g, ' ').trim();
			return text;
		}).filter(Boolean);

		if (!labels.length) return;

		const uniqueLabels = [...new Set(labels)];
		const captionText = `${uniqueLabels.join(', ')}에 대한 구성 테이블입니다.`;
		const existingCaption = table.querySelector('caption');

		if (existingCaption) {
			existingCaption.textContent = captionText;
			return;
		}

		const caption = document.createElement('caption');
		caption.textContent = captionText;
		table.insertBefore(caption, table.firstChild);
	});
}

function initPaginationButtonState(context = document) {
	context.querySelectorAll('.list-pagination .btn-page').forEach(($btn) => {
		const isActive = $btn.classList.contains('active');
		if (isActive) $btn.setAttribute('title', '현재 페이지');
		else $btn.removeAttribute('title');
	});
}

// 통화 포맷
function initCurrencyFormat(context = document) {
	context.querySelectorAll('table td .typeMd').forEach((el) => {
		if (!el.dataset.formatted) {
			el.innerHTML = el.innerHTML.replace(/원/g, ' 원');
			el.dataset.formatted = 'true';
		}
	});
}

// 말풍선 프로그래스
function initRateRange(context = document) {
	context.querySelectorAll('.rate-range').forEach((range) => {
		if (range.dataset.init) return;
		range.dataset.init = 'true';

		const activeEl = range.querySelector('.rate-range-active');
		const currentEl = range.querySelector('.rate-range-current');
		if (!activeEl || !currentEl) return;

		activeEl.style.width = '0%';
		currentEl.style.left = '0%';

		requestAnimationFrame(() => {
			requestAnimationFrame(() => { renderRateRange(range); });
		});
	});
}

function renderRateRange(range) {
	const min = Number(range.dataset.min);
	const max = Number(range.dataset.max);
	const value = Number(range.dataset.value);
	const unit = range.dataset.unit || '%';

	const activeEl = range.querySelector('.rate-range-active');
	const currentEl = range.querySelector('.rate-range-current');
	const tooltipEl = range.querySelector('.rate-range-tooltip span');

	if (!activeEl || !currentEl || !tooltipEl) return;

	let percent = ((value - min) / (max - min)) * 100;
	percent = Math.max(0, Math.min(100, percent));

	activeEl.style.width = `${percent}%`;
	currentEl.style.left = `${percent}%`;

	if (percent <= 30) activeEl.style.backgroundColor = '#D33128';
	else if (percent <= 70) activeEl.style.backgroundColor = '#FAC515';
	else activeEl.style.backgroundColor = '#0F62FD';

	tooltipEl.textContent = formatAmount(value, unit);
}

function formatAmount(value, unit) {
	const number = Number(value);
	if (unit === '원') return `${number.toLocaleString('ko-KR')}원`;
	return `${number}%`;
}

// Textarea 
function fnInitTextareaLength(context = document) {
	context.querySelectorAll('.form-text-area textarea').forEach($textarea => {
		if ($textarea.dataset.lenInit) return;
		$textarea.dataset.lenInit = 'true';
		
		const $formTextArea = $textarea.closest('.form-text-area');
		const $currentSpan = $formTextArea.querySelector('.current');
		const $totalSpan = $formTextArea.querySelector('.total');
		const numTotal = $textarea.getAttribute('maxLength');

		if ($currentSpan) $currentSpan.textContent = $textarea.value.length;
		if ($totalSpan && numTotal) $totalSpan.textContent = numTotal;
	});
}

// 단순프로그래스
function setProgressBar1(target, options = {}) {
	const el = typeof target === "string" ? document.querySelector(target) : target;
	if (!el) return;

	const { percent = 0, duration = 1000, status = "auto", message, label } = options;
	const gaugeEl = el.querySelector(".progress-gauge");
	const numEl = el.querySelector(".percent .num");
	const messageEl = el.querySelector(".message");
	const labelEl = el.querySelector(".title-progress");

	if (!gaugeEl) return;

	const targetPercent = Math.min(Math.max(Number(percent) || 0, 0), 100);
	if (el._progressAnimationFrame) cancelAnimationFrame(el._progressAnimationFrame);

	if (targetPercent <= 30) gaugeEl.style.backgroundColor = "#2878f0";
	else if (targetPercent <= 70) gaugeEl.style.backgroundColor = "#f5c400";
	else gaugeEl.style.backgroundColor = "#ef4b4b";

	gaugeEl.style.width = "0%";
	if (numEl) numEl.textContent = "0";
	if (label && labelEl) labelEl.textContent = label;
	if (message && messageEl) messageEl.textContent = message;

	const startTime = performance.now();
	function animate(currentTime) {
		const progress = Math.min((currentTime - startTime) / duration, 1);
		const eased = 1 - Math.pow(1 - progress, 3);
		const currentPercent = targetPercent * eased;

		gaugeEl.style.width = `${currentPercent}%`;
		if (numEl) numEl.textContent = Math.round(currentPercent);

		if (progress < 1) {
			el._progressAnimationFrame = requestAnimationFrame(animate);
		} else {
			gaugeEl.style.width = `${targetPercent}%`;
			if (numEl) numEl.textContent = targetPercent;
			el._progressAnimationFrame = null;
		}
	}
	el._progressAnimationFrame = requestAnimationFrame(animate);

	let currentStatus = status;
	if (status === "auto") currentStatus = targetPercent === 100 ? "success" : "progress";

	el.classList.remove("is-success", "is-fail");
	if (currentStatus === "success") el.classList.add("is-success");
	if (currentStatus === "fail") el.classList.add("is-fail");
}

// skip Navigation
function fnSkipNavigation() {
	const $btnsSkipNav = document.querySelectorAll(".skip-nav .btn-skip-nav");
	$btnsSkipNav.forEach(function ($btn) {
		$btn.addEventListener('blur', function () { this.classList.remove("is-open"); });
	});
}

// Header
function fnHeader() {
	var $header = document.querySelector(".header");
	var $gnb = document.querySelector(".header-bottom");
	var $banner = document.querySelector(".banner-layer");
	var $items = document.querySelectorAll(".gnb-item");
	var $links = document.querySelectorAll(".gnb-link");
	var $menus = document.querySelectorAll(".mega-wrap");
	var $selectButtons = document.querySelectorAll(".util-menu .btn-select");
	var $menuToggleButtons = document.querySelectorAll(".menu-toggle");
	var $hasDepthItems = document.querySelectorAll(".menu-item.has-depth");

	var $searchLayer = document.querySelector(".search-layer");
	var $btnSearch = document.querySelector(".btn-search");
	var $input = document.querySelector(".search-input, .box-input-search .input");
	var $dropdown = document.querySelector(".search-dropdown");
	var $btnSearchClose = document.querySelector(".btn-search-close");

	const focusInput = document.querySelector("#headerSearch");
	const autoBox = document.querySelector(".search-autocomplete");
	const list = document.querySelector(".autocomplete-list");
	const searchArea = document.querySelector(".search-area");
	const historyBox = document.querySelector(".autocomplete-history");
	const keywordBox = document.querySelector(".autocomplete-keyword");
	const noResultBox = document.querySelector(".autocomplete-no-result");
	const historyWrap = document.querySelector(".history-wrap");

	if (!searchArea || !focusInput || !autoBox || !historyWrap) return;
	
	const historyList = historyWrap.querySelector(".history-list");
	const hasHistory = historyList.children.length > 0;
	const historyEmpty = document.querySelector(".history-empty");
	const btnDeleteAll = document.querySelector(".btn-delete-all");
	const btnPannelClose = document.querySelector(".btn-pannel-close");

	const autoSaveSwitch = document.querySelector("#SAMPLESWITCHSM01");
	const autoSaveText = document.querySelector(".switch-wrap .typeSm");
	const offBox = document.querySelector(".autocomplete-off");

	if ($banner) {
		var $btnBannerClose = $banner.querySelector(".banner");
		if ($btnBannerClose) {
			$btnBannerClose.addEventListener("click", function () {
				$banner.classList.remove("is-show");
				setTimeout(function () { window.dispatchEvent(new Event('scroll')); }, 100);
			});
		}
	}

	if (typeof Swiper !== 'undefined' && document.querySelector('.wrap-visual')) {
		new Swiper('.wrap-visual', { initialSlide: 0, loop: true, autoplay: { delay: 5000, disableOnInteraction: false } });
	}

	if ($selectButtons.length > 0) {
		$selectButtons.forEach($button => $button.addEventListener("click", function () { this.classList.toggle("active"); }));
	}

	if ($links.length > 0 && $header) {
		$links.forEach($link => {
			$link.addEventListener("click", function () {
				$header.classList.add("is-open");
				$items.forEach($item => $item.classList.remove("is-active"));
				$menus.forEach($menu => $menu.classList.remove("is-active"));
				var $currentItem = this.closest(".gnb-item");
				if ($currentItem) {
					$currentItem.classList.add("is-active");
					var $targetMegaMenu = $currentItem.querySelector(".mega-wrap");
					if ($targetMegaMenu) $targetMegaMenu.classList.add("is-active");
				}
			});
		});
		$header.addEventListener("mouseleave", function () {
			$header.classList.remove("is-open");
			$items.forEach($item => $item.classList.remove("is-active"));
			$menus.forEach($menu => $menu.classList.remove("is-active"));
		});
	}

	if ($gnb) {
		let timer;
		window.addEventListener("scroll", function () {
			clearTimeout(timer);
			var $bannerLayer = document.querySelector(".banner-layer");
			var $headerTop = document.querySelector(".header-top");
			var $container = document.querySelector(".container") || document.querySelector("#contents");
			var topHeight = $headerTop ? $headerTop.offsetHeight : 64;
			var bannerHeight = ($bannerLayer && $bannerLayer.classList.contains("is-show")) ? $bannerLayer.offsetHeight : 0;
			var threshold = topHeight + bannerHeight;

			if (window.scrollY >= threshold) {
				$gnb.classList.add("is-fixed");
				if ($header) $header.classList.add("is-fixed");
				if ($container) $container.style.paddingBottom = "64px";
			} else {
				$gnb.classList.remove("is-fixed");
				if ($header) $header.classList.remove("is-fixed");
				if ($container) $container.style.paddingBottom = "";
			}
		});
	}

	if ($menuToggleButtons.length > 0) {
		$menuToggleButtons.forEach($button => {
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
		$hasDepthItems.forEach($item => {
			var depthCount = $item.querySelectorAll(".depth-list > li").length;
			if (depthCount >= 2) $item.classList.add("is-toggle");
			else $item.classList.add("is-single");
		});
	}

	if ($btnSearch && $searchLayer) {
		$btnSearch.addEventListener("click", function (event) {
			event.preventDefault();
			if ($header) $header.classList.remove("is-open");
			$items.forEach($item => $item.classList.remove("is-active"));
			$menus.forEach($menu => $menu.classList.remove("is-active"));
			$searchLayer.classList.add("is-search-open");
		});

		if ($input && $dropdown) {
			$input.addEventListener("blur", function () {
				setTimeout(function () { $dropdown.classList.remove("is-search-open"); }, 100);
			});
		}

		if ($links.length > 0) {
			$links.forEach($link => {
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

	const items = document.querySelectorAll(".autocomplete-list .typeMd");
	items.forEach((item) => { item.dataset.keyword = item.textContent.trim(); });

	function openAutocomplete() { autoBox.classList.add("is-active"); searchArea.classList.add("is-active"); }
	function closeAutocomplete() {
		autoBox.classList.remove("is-active"); searchArea.classList.remove("is-active");
		document.querySelectorAll(".autocomplete-panel").forEach(panel => panel.classList.remove("is-active"));
	}
	
	btnPannelClose.addEventListener("click", closeAutocomplete);

	function showPanel(panel) {
		document.querySelectorAll(".autocomplete-panel").forEach(item => item.classList.remove("is-active"));
		if (panel) panel.classList.add("is-active");
	}

	focusInput.addEventListener("focus", () => {
		openAutocomplete();
		if (autoSaveSwitch.checked) showPanel(historyBox);
		else showPanel(offBox);
	});

	focusInput.addEventListener("input", () => {
		const value = focusInput.value.trim();
		if (!value) {
			items.forEach((textEl) => {
				const li = textEl.closest("li");
				li.style.display = "";
				textEl.textContent = textEl.dataset.keyword;
			});
			showPanel(autoSaveSwitch.checked ? historyBox : offBox);
			return;
		}

		let hasResult = false;
		items.forEach((textEl) => {
			const keyword = textEl.dataset.keyword;
			const li = textEl.closest("li");
			if (keyword.includes(value)) {
				li.style.display = "";
				hasResult = true;
				textEl.innerHTML = keyword.replace(new RegExp(value, "g"), `<strong>${value}</strong>`);
			} else {
				li.style.display = "none";
				textEl.textContent = keyword;
			}
		});

		if (hasResult) showPanel(keywordBox);
		else showPanel(noResultBox);
		openAutocomplete();
	});

	list.addEventListener("click", (e) => {
		const link = e.target.closest(".keyword-btn");
		if (!link) return;
		e.preventDefault();
		focusInput.value = link.querySelector(".text").textContent.trim();
		closeAutocomplete();
	});

	document.addEventListener("click", (e) => {
		if (!e.target.closest(".search-area")) closeAutocomplete();
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
		e.preventDefault(); e.stopPropagation();
		btn.closest("li").remove();
		updateHistoryState();
	});

	btnDeleteAll.addEventListener("click", () => {
		historyList.innerHTML = "";
		updateHistoryState();
	});

	function updateAutoSave() {
		autoSaveText.textContent = autoSaveSwitch.checked ? "자동저장 켜기" : "자동저장 끄기";
	}

	autoSaveSwitch.addEventListener("change", () => {
		updateAutoSave();
		if (!focusInput.value.trim()) showPanel(autoSaveSwitch.checked ? historyBox : offBox);
	});
	updateAutoSave();
}