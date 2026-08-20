window.addEventListener('load', function () {
	fnSkipNavigation(); // skip Navigation
	fnLNB(); // LNB
	fnHeader(); // header
	fnBoxAccordion(); // Accordion
	fnBtnAnchor(); // Anchor
	fnSelectColorChange(); // select 태그 class 추가
	fnInputClear(); // 기본 검색
	fnBoxSearchDetail(); // 상세검색
	fnBoxSelect(); // 기본 드롭다운
	fnBoxMultiSelect(); // 멀티 드롭다운
	fnTextareaCounter(); // Textarea
	var defaultTabIndex = 0
	fnTab(0); // Tab
	fnBoxTooltip(); // Tooltip
	fnModal(); // Modal
	fnInitSortButtons() //정렬 버튼
	initTableCheckbox() //allcheck
	fnInitViewSelector() //뷰셀렉터
	fnSwiperHtmlControl() // 슬라이드 옵션 html 컨트롤
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
	var $banner = document.querySelector(".banner-layer");

	var $items = document.querySelectorAll(".gnb-item");
	var $links = document.querySelectorAll(".gnb-link");
	var $menus = document.querySelectorAll(".mega-wrap");

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

	if (!searchArea || !focusInput || !autoBox || !historyWrap) {
		return;
	}
	const historyList = historyWrap.querySelector(".history-list");

	const hasHistory = historyList.children.length > 0;
	const historyEmpty = document.querySelector(".history-empty");
	const btnDeleteAll = document.querySelector(".btn-delete-all");
	const btnPannelClose = document.querySelector(".btn-pannel-close");

	//스위치
	const autoSaveSwitch = document.querySelector("#SAMPLESWITCHSM01");
	const autoSaveText = document.querySelector(".switch-wrap .typeSm");
	const offBox = document.querySelector(".autocomplete-off");

	// 띠배너 닫기 이벤트 연동
	if ($banner) {
		var $btnBannerClose = $banner.querySelector(".banner");
		if ($btnBannerClose) {
			$btnBannerClose.addEventListener("click", function () {
				$banner.classList.remove("is-show");
				// 배너가 사라지면 스크롤 위치 재계산
				setTimeout(function () {
					window.dispatchEvent(new Event('scroll'));
				}, 100);
			});
		}
	}

	// 메인 스와이퍼 배너 visual
	// Swiper 라이브러리가 로드되어 있고, .wrap-visual 요소가 화면에 존재하는 경우에만 실행
	if (typeof Swiper !== 'undefined' && document.querySelector('.wrap-visual')) {
		const visualSlider = new Swiper('.wrap-visual', {
			initialSlide: 0,
			loop: true,
			autoplay: {
				delay: 5000,
				disableOnInteraction: false,
			},
		});
	}

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
			$link.addEventListener("click", function () {
				$header.classList.add("is-open");

				$items.forEach(function ($item) { $item.classList.remove("is-active"); });
				$menus.forEach(function ($menu) { $menu.classList.remove("is-active"); });

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
			$items.forEach(function ($item) { $item.classList.remove("is-active"); });
			$menus.forEach(function ($menu) { $menu.classList.remove("is-active"); });
		});
	}

	if ($gnb) {
		let timer;
		window.addEventListener("scroll", function () {
			clearTimeout(timer);

			// 1. body 바로 아래의 띠배너 및 header-top 요소 찾기
			var $bannerLayer = document.querySelector(".banner-layer");
			var $headerTop = document.querySelector(".header-top");
			var $container = document.querySelector(".container") || document.querySelector("#contents");

			// 2. header-top 높이 (기본값 약 64px)
			var topHeight = $headerTop ? $headerTop.offsetHeight : 64;

			// 3. 띠배너가 존재하고 화면에 보이고 있는지 확인 후 높이 계산
			var bannerHeight = 0;
			if ($bannerLayer && $bannerLayer.classList.contains("is-show")) {
				bannerHeight = $bannerLayer.offsetHeight;
			}

			// 4. 스크롤 기준점 (띠배너 높이 + header-top 높이)
			var threshold = topHeight + bannerHeight;

			// 5. 스크롤 위치 판단 조건문
			if (window.scrollY >= threshold) {
				$gnb.classList.add("is-fixed");
				if ($header) $header.classList.add("is-fixed");
				if ($container) $container.style.paddingBottom = "64px"; //  헤더 높이값 추가(덜컥거림 방지)
			} else {
				$gnb.classList.remove("is-fixed");
				if ($header) $header.classList.remove("is-fixed");
				if ($container) $container.style.paddingBottom = ""; // 원복
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
		// const hasHistory = true;
		// 나중에 실제 데이터로 변경

		// showPanel(hasHistory ? historyBox : "");
		if (autoSaveSwitch.checked) {
			showPanel(historyBox);
		} else {
			showPanel(offBox);
		}
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

			// const hasHistory = true;
			// showPanel(hasHistory ? historyBox : "");
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
	function updateAutoSave() {
		if (autoSaveSwitch.checked) {
			autoSaveText.textContent = "자동저장 켜기";
		} else {
			autoSaveText.textContent = "자동저장 끄기";
		}
	}

	autoSaveSwitch.addEventListener("change", () => {
		updateAutoSave();

		// 검색창에 입력이 없을 때만 패널 변경
		if (!focusInput.value.trim()) {
			showPanel(autoSaveSwitch.checked ? historyBox : offBox);
		}
	});

	updateAutoSave();
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
		TRIGGER: "box-item-list",
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
		const $blindText = $toggleBtn ? $toggleBtn.querySelector('.blind') : null;

		if (!$toggleBtn || !$hiddenPanel) return;

		$toggleBtn.addEventListener('click', function () {
			const isExpanded = $boxSearchDetail.classList.contains('active');

			if (isExpanded) {
				$boxSearchDetail.classList.remove('active');
				this.classList.remove('active');
				this.setAttribute('aria-expanded', 'false');
				if ($blindText) $blindText.textContent = '펼침';
			} else {
				$boxSearchDetail.classList.add('active');
				this.classList.add('active');
				this.setAttribute('aria-expanded', 'true');
				if ($blindText) $blindText.textContent = '접힘';
			}
		});
	});
}
// 기본 드롭다운
// function fnBoxSelect() {
// 	const $boxeSelect = document.querySelectorAll('.box-select');

// 	$boxeSelect.forEach(function ($boxeSelect) {
// 		const $triggerBtn = $boxeSelect.querySelector('.select');
// 		const $blindText = $boxeSelect.querySelector('.select .blind');

// 		if (!$triggerBtn) return;

// 		$triggerBtn.addEventListener('click', function (e) {
// 			e.stopPropagation();

// 			const isOpen = this.classList.contains('active');
// 			closeAllSelects();

// 			if (!isOpen) {
// 				this.classList.add('active');
// 				$boxeSelect.classList.add('is-open');
// 				if ($blindText) $blindText.textContent = '접힘';
// 			}
// 		});

// 		$boxeSelect.addEventListener('click', function (e) {
// 			e.stopPropagation();
// 		});

// 	});

// 	// 드롭다운 바깥 영역 클릭 시 일괄 닫기
// 	document.addEventListener('click', function () {
// 		closeAllSelects();
// 	});
// }

// 기본 드롭다운
function fnBoxSelect() {
	const $boxeSelect = document.querySelectorAll('.box-select');

	$boxeSelect.forEach(function ($boxeSelect) {
		const $triggerBtn = $boxeSelect.querySelector('.select');
		const $blindText = $boxeSelect.querySelector('.select .blind');
		// 1. 선택 가능한 항목 요소들 가져오기
		const $selectItems = $boxeSelect.querySelectorAll('.item-select');

		if (!$triggerBtn) return;

		// 드롭다운 열기/닫기 토글
		$triggerBtn.addEventListener('click', function (e) {
			e.stopPropagation();

			const isOpen = this.classList.contains('active');
			closeAllSelects();

			if (!isOpen) {
				this.classList.add('active');
				$boxeSelect.classList.add('is-open');
				if ($blindText) $blindText.textContent = '접힘';
			}
		});

		// 2. [추가] 각 옵션 항목(li) 클릭 이벤트 처리
		$selectItems.forEach(function ($item) {
			$item.addEventListener('click', function (e) {
				e.stopPropagation(); // 이벤트 버블링 방지

				// A. 클릭한 항목의 텍스트 가져오기 (span.form-box 또는 내부 텍스트)
				const selectedText = this.textContent.trim();

				// B. 버튼 영역의 텍스트 표시 요소(예: .text) 찾기 및 텍스트 변경
				const $textSpan = $triggerBtn.querySelector('.text');
				if ($textSpan) {
					$textSpan.textContent = selectedText;
				} else {
					// .text 클래스가 없을 경우 blind 요소를 유지하면서 텍스트 변경
					const blindContent = $blindText ? $blindText.outerHTML : '';
					$triggerBtn.innerHTML = selectedText + blindContent;
				}

				// C. aria-selected 상태 업데이트 (접근성 반영)
				$selectItems.forEach(function (el) {
					el.setAttribute('aria-selected', 'false');
					el.classList.remove('selected');
				});
				this.setAttribute('aria-selected', 'true');
				this.classList.add('selected');

				// D. 선택 후 드롭다운 닫기
				closeAllSelects();
			});
		});

		$boxeSelect.addEventListener('click', function (e) {
			e.stopPropagation();
		});
	});

	// 드롭다운 바깥 영역 클릭 시 일괄 닫기
	document.addEventListener('click', function () {
		closeAllSelects();
	});
}
function fnBoxSelect() {
	const $boxeSelect = document.querySelectorAll('.box-select');

	$boxeSelect.forEach(function ($boxeSelect) {
		const $triggerBtn = $boxeSelect.querySelector('.select');
		const $blindText = $boxeSelect.querySelector('.select .blind');
		// 1. 선택 가능한 항목 요소들 가져오기
		const $selectItems = $boxeSelect.querySelectorAll('.item-select');

		if (!$triggerBtn) return;

		// 드롭다운 열기/닫기 토글
		$triggerBtn.addEventListener('click', function (e) {
			e.stopPropagation();

			const isOpen = this.classList.contains('active');
			closeAllSelects();

			if (!isOpen) {
				this.classList.add('active');
				$boxeSelect.classList.add('is-open');
				if ($blindText) $blindText.textContent = '접힘';
			}
		});

		// 2. [추가] 각 옵션 항목(li) 클릭 이벤트 처리
		$selectItems.forEach(function ($item) {
			$item.addEventListener('click', function (e) {
				e.stopPropagation(); // 이벤트 버블링 방지

				// A. 클릭한 항목의 텍스트 가져오기 (span.form-box 또는 내부 텍스트)
				const selectedText = this.textContent.trim();

				// B. 버튼 영역의 텍스트 표시 요소(예: .text) 찾기 및 텍스트 변경
				const $textSpan = $triggerBtn.querySelector('.text');
				if ($textSpan) {
					$textSpan.textContent = selectedText;
				} else {
					// .text 클래스가 없을 경우 blind 요소를 유지하면서 텍스트 변경
					const blindContent = $blindText ? $blindText.outerHTML : '';
					$triggerBtn.innerHTML = selectedText + blindContent;
				}

				// C. aria-selected 상태 업데이트 (접근성 반영)
				$selectItems.forEach(function (el) {
					el.setAttribute('aria-selected', 'false');
					el.classList.remove('selected');
				});
				this.setAttribute('aria-selected', 'true');
				this.classList.add('selected');

				// D. 선택 후 드롭다운 닫기
				closeAllSelects();
			});
		});

		$boxeSelect.addEventListener('click', function (e) {
			e.stopPropagation();
		});
	});

	// 드롭다운 바깥 영역 클릭 시 일괄 닫기
	document.addEventListener('click', function () {
		closeAllSelects();
	});
}

function closeAllSelects() {
	const $activeTriggers = document.querySelectorAll('.box-select .select.active');
	const $openComponents = document.querySelectorAll('.box-select.is-open');

	$activeTriggers.forEach(function ($btn) {
		const $blindText = $btn.querySelector('.blind');
		$btn.classList.remove('active');

		if ($blindText) $blindText.textContent = '펼침';
	});
	$openComponents.forEach(function ($comp) { $comp.classList.remove('is-open'); });
}

//멀티 드롭다운
function fnBoxMultiSelect() {
	const $boxesMultiSelect = document.querySelectorAll('.box-multi-select');

	$boxesMultiSelect.forEach(function ($boxMultiSelect) {
		const $triggerBtn = $boxMultiSelect.querySelector('.select');
		const $blindText = $boxMultiSelect.querySelector('.select .blind');
		const $allCheckbox = $boxMultiSelect.querySelector('.box-list-select-all .form-checkbox');
		const $itemCheckboxes = $boxMultiSelect.querySelectorAll('.list-select .form-checkbox');
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

// 모달
function fnModal() {
	let lastFocusedElement; // 열기 전 요소를 기억할 변수

	// 스크롤바 너비를 동적으로 계산하는 함수
	const getScrollbarWidth = () => {
		return window.innerWidth - document.documentElement.clientWidth;
	};

	// 활성 상태에 따라 body 스크롤 제어 및 들썩임 방지
	const updateBodyScroll = () => {
		const hasActive = document.querySelector('.modal.is-active, .alert.is-active');
		if (hasActive) {
			const scrollbarWidth = getScrollbarWidth();
			// 스크롤바가 실제로 존재하는 경우에만 padding-right 부여
			if (scrollbarWidth > 0) {
				document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
			}
			document.body.classList.add('is-scroll-locked');
		} else {
			document.body.classList.remove('is-scroll-locked');
			document.documentElement.style.removeProperty('--scrollbar-width');
		}
	};

	document.addEventListener('click', (e) => {
		// 1. 모달 또는 알림창 열기 버튼 클릭 (.btn-modal 또는 .btn-alert)
		const openBtn = e.target.closest('.btn-modal, .btn-alert');
		if (openBtn) {
			const targetId = openBtn.dataset.target;
			const targetEl = document.getElementById(targetId);

			if (targetEl) {
				lastFocusedElement = document.activeElement; // 현재 포커스 저장
				targetEl.classList.add('is-active');      // 클래스로 제어
				updateBodyScroll();                       // 배경 스크롤 잠금 및 패딩 적용

				// 내부의 첫 번째 포커스 가능 요소 찾기
				const firstFocusable = targetEl.querySelector('button, [href], input, select, textarea');
				if (firstFocusable) firstFocusable.focus();
			}
		}

		// 2. 닫기 버튼 클릭 (.btn-close)
		const closeBtn = e.target.closest('.btn-close');
		if (closeBtn) {
			const container = closeBtn.closest('.modal, .alert'); // modal 또는 alert 닫기
			if (container) {
				container.classList.remove('is-active');
				updateBodyScroll(); // 남은 모달 여부에 따라 스크롤 복구

				// 포커스 복귀
				if (lastFocusedElement) lastFocusedElement.focus();
			}
		}

		// 3. 배경(백드롭) 클릭 시 닫기 (.modal 또는 .alert 배경)
		if (e.target.classList.contains('modal') || e.target.classList.contains('alert')) {
			const backdropClose = e.target.dataset.backdropClose !== "false";

			if (backdropClose) {
				e.target.classList.remove('is-active');
				updateBodyScroll(); // 남은 모달 여부에 따라 스크롤 복구
				if (lastFocusedElement) lastFocusedElement.focus();
			}
		}
	});

	// 4. ESC 키로 닫기
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			const activeEl = document.querySelector('.modal.is-active, .alert.is-active');
			if (activeEl) {
				activeEl.classList.remove('is-active');
				updateBodyScroll(); // 남은 모달 여부에 따라 스크롤 복구
				if (lastFocusedElement) lastFocusedElement.focus();
			}
		}
	});
}

//정렬버튼
function fnInitSortButtons() {
	const wrappers = document.querySelectorAll('.sort-btn-wrapper');

	wrappers.forEach(wrapper => {
		const buttons = wrapper.querySelectorAll('.btn');

		buttons.forEach(button => {
			button.addEventListener('click', () => {
				const isCurrentlyPressed = button.getAttribute('aria-pressed') === 'true';

				buttons.forEach(btn => {
					btn.setAttribute('aria-pressed', 'false');
					btn.classList.remove('type-bg-neutral');
					btn.classList.add('type-line-neutral');
				});

				if (!isCurrentlyPressed) {
					button.setAttribute('aria-pressed', 'true');
					button.classList.remove('type-line-neutral');
					button.classList.add('type-bg-neutral');
				}
			});
		});
	});
}

//뷰셀렉터
function fnInitViewSelector() {
	const selectors = document.querySelectorAll('.view-selector');

	selectors.forEach(selector => {
		const buttons = selector.querySelectorAll('button');

		buttons.forEach((button, index) => {
			button.addEventListener('click', (e) => {
				e.preventDefault();

				// 1. 모든 버튼과 아이콘 상태 초기화 (active 제거 및 netral 복원)
				buttons.forEach(btn => {
					btn.classList.remove('active');
					const icon = btn.querySelector('i');
					if (icon) {
						icon.classList.remove('color-fg-primary');
						icon.classList.add('color-fg-netral');
					}
				});

				// 2. 현재 클릭된 버튼 활성화 (active 추가 및 primary 적용)
				button.classList.add('active');
				const currentIcon = button.querySelector('i');
				if (currentIcon) {
					currentIcon.classList.remove('color-fg-netral');
					currentIcon.classList.add('color-fg-primary');
				}

				// 3. 카드 및 리스트 영역 토글 처리
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
			});
		});
	});
}

//allcheck
function initTableCheckbox() {

	var tables = document.querySelectorAll(".js-check-table");

	tables.forEach(function (table) {

		var checkAlls = table.querySelectorAll(".check-all");
		var rowChecks = table.querySelectorAll(".row-check");
		var count = table.querySelector(".selected-count span");

		if (!checkAlls.length || !rowChecks.length) return;

		function updateState() {

			var checked = table.querySelectorAll(".row-check:checked").length;

			if (count) {
				count.textContent = checked;
			}

			checkAlls.forEach(function (checkAll) {
				checkAll.checked = checked === rowChecks.length;
				checkAll.indeterminate = checked > 0 && checked < rowChecks.length;
			});
		}

		checkAlls.forEach(function (checkAll) {

			checkAll.addEventListener("change", function () {

				rowChecks.forEach(function (item) {
					item.checked = checkAll.checked;
				});

				updateState();

			});

		});

		rowChecks.forEach(function (item) {

			item.addEventListener("change", function () {
				updateState();
			});

		});

		updateState();

	});

}

// 슬라이드 옵션 html 컨트롤
function fnSwiperHtmlControl() {
	var swiperContainers = document.querySelectorAll('.swiper');

	swiperContainers.forEach(function (container) {
		var dataset = container.dataset;

		// 1. dataset 파싱 및 Default 기본값 지정
		var isAutoplay = dataset.autoplay === 'true';
		var autoDelay = parseInt(dataset.delay, 10) || 3000;
		var isLoop = dataset.loop === 'true';
		var speed = parseInt(dataset.speed, 10) || 300;

		var rawPerView = dataset.slidesPerView;
		var slidesPerView = rawPerView === 'auto' ? 'auto' : (parseInt(rawPerView, 10) || 1);
		var slidesPerGroup = parseInt(dataset.slidesPerGroup, 10) || 1;

		var useNavigation = dataset.useNavigation !== 'false';

		// HTML의 data-pagination-type 속성을 dataset.paginationType으로 파싱
		var paginationType = dataset.paginationType || 'bullets';
		var isCustomBullet = dataset.customBullet === 'true';

		var playBtnSelector = dataset.btnPlay || '.swiper-btn-play';
		var pauseBtnSelector = dataset.btnPause || '.swiper-btn-pause';

		// 2. Swiper 기본 옵션 구성
		var swiperOptions = {
			speed: speed,
			loop: isLoop,
			slidesPerView: slidesPerView,
			slidesPerGroup: slidesPerGroup,
			autoplay: isAutoplay ? {
				delay: autoDelay,
				disableOnInteraction: false
			} : false
		};

		// 3. 컨트롤 요소 존재 여부 및 옵션 동적 동기화
		var $pagination = container.querySelector('.swiper-pagination');
		var $prevBtn = container.querySelector('.swiper-button-prev');
		var $nextBtn = container.querySelector('.swiper-button-next');
		var $scrollbar = container.querySelector('.swiper-scrollbar');

		// Pagination 설정
		if ($pagination) {
			var paginationConfig = {
				el: $pagination,
				clickable: true
			};

			// [수정] 'dash' 타입: bullets 방식을 활용해 renderBullet 처리 (클릭 지원 + is-active 커스텀)
			if (paginationType === 'dash') {
				paginationConfig.type = 'bullets';
				paginationConfig.bulletClass = 'swiper-pagination-dash';
				paginationConfig.bulletActiveClass = 'is-active';
				paginationConfig.renderBullet = function (index, className) {
					return '<span class="' + className + '"></span>';
				};
			}
			// 'custom' 타입
			else if (paginationType === 'custom') {
				paginationConfig.type = 'custom';
				paginationConfig.renderCustom = function (swiper, current, total) {
					return '<span class="current">' + current + '</span> <span class="divider">/</span> <span class="total">' + total + '</span>';
				};
			}
			// 'bullets' 타입 + 커스텀 불릿 (숫자 불릿 등)
			else if (paginationType === 'bullets' && isCustomBullet) {
				paginationConfig.type = 'bullets';
				paginationConfig.renderBullet = function (index, className) {
					return '<span class="' + className + '">' + (index + 1) + '</span>';
				};
			}
			// 기타 기본 타입 (fraction, progressbar, 기본 bullets)
			else {
				paginationConfig.type = paginationType;
			}

			swiperOptions.pagination = paginationConfig;
		}

		// Navigation 설정
		if (useNavigation && $prevBtn && $nextBtn) {
			swiperOptions.navigation = {
				nextEl: $nextBtn,
				prevEl: $prevBtn
			};
		}

		// Scrollbar 설정
		if ($scrollbar) {
			swiperOptions.scrollbar = {
				el: $scrollbar,
				draggable: true
			};
		}

		// 4. Swiper 인스턴스 생성
		var swiper = new Swiper(container, swiperOptions);

		// 5. 재생 / 정지 버튼 동적 바인딩
		var $playBtn = container.querySelector(playBtnSelector);
		var $pauseBtn = container.querySelector(pauseBtnSelector);

		if ($pauseBtn) {
			$pauseBtn.addEventListener('click', function () {
				if (swiper.autoplay) {
					swiper.autoplay.stop();
				}
				if ($playBtn) {
					$pauseBtn.style.display = 'none';
					$playBtn.style.display = 'inline-block';
				}
			});
		}

		if ($playBtn) {
			$playBtn.addEventListener('click', function () {
				if (swiper.autoplay) {
					swiper.autoplay.start();
				}
				if ($pauseBtn) {
					$playBtn.style.display = 'none';
					$pauseBtn.style.display = 'inline-block';
				}
			});
		}
	});
}
document.querySelectorAll('table td .typeMd').forEach((el) => {
	el.innerHTML = el.innerHTML.replace(/원/g, ' 원');
});


