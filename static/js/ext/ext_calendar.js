/*
 * @설 명 : 미니 달력 레이어.
 * @dependency : jQuery-1.8 이상 버전.
 * @2단계까지의 name space 는 package.js 에 정의 되어 있다.
 * @===========================================================================
 * @변경이력:
 * @DATE AUTHOR DESCRIPTION
 * @---------------------------------------------------------------------------
 * @변경 이력은 이곳에 추가 합니다.
 */

(function($) {
	/**
	 * ECMAScript 5 Strict Mode.
	 */
	"use strict";
	/**
	 * Calendar 클래스
	 * 
	 * @class
	 */
	ext.calendar = function() {
		/** 최대 년도 */
		this.cal_max_year = 9999;
		/** 최소 년도 */
		this.cal_min_year = 2005;
		/** 최대 월 */
		this.cal_max_month = null;
		/** 최소 월 */
		this.cal_min_month = null;
		/** 최대 일 */
		this.cal_max_day = null;
		/** 최소 일 */
		this.cal_min_day = null;
		/** 날자 포멧 구분자 */
		this.date_split_format = "-";
		/** "오늘" 버튼 보이기/감추기 */
		this.today_show = true;
		/** 요일 */
		this.cal_yoil = null;
		/** 한글 요일 */
		this.cal_yoil_ko = [ "일", "월", "화", "수", "목", "금", "토", "일" ];
		/** 영문 요일 */
		this.cal_yoil_en = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ];
		/** 월의 마지막 날자 배열 */
		this.cal_mon = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
		/** 시작 요일 ( 0: sunday, 1:monday ) */
		this.cal_start_day = "0";
		/** 읽기 전용 여부 */
		this.cal_readOnly = false;
		/** 오늘 날자 */
		this.cal_todayStr = JUtilDate.getToday();
		/** "달력" 버튼 */
		this.cal_btn_img = null;
		/** 달력 객체 */
		this.cal_obj = null;
		/** 달력 대상 필드 */
		this.cal_target = null;
		/** 달력 이미지 필드 */
		this.cal_target_img = null;
		/** 기본 설정 일자 (사용자의 선택으로 변경되는 일자) */
		this.cal_selectDt = null;
		/** 날자 구분자 */
		this.cal_sperator = null;
		/** 언어 = */
		this.cal_locale = null;
		/** 달력 선택 여부 */
		this.cal_sel = false;
	};

	/**
	 * Calendar prototype 메서드.
	 */
	ext.calendar.prototype = {
		/** 블럭 기본 옵션 */
		blockOptions : {
			/** ESC key 레이어 닫기 */
			esckey : true,
			/** 메세지 스크롤 시 윈도우 스크롤 감추기 */
			hideWindowScroll : false,
			/** before close event */
			beforeClose : function(callback) {
				if (callback)
					callback();
			},
			/** after close event */
			afterClose : null
		},

		/**
		 * 달력 생성.
		 * 
		 * @param calIcon
		 *            달력 버튼
		 * @param target
		 *            달력 타겟 필드
		 * @param minY
		 *            최소 년도
		 * @param maxY
		 *            최대 년도
		 * @param defaultDt
		 *            기본 설정 일자
		 * @param sperator
		 *            포멧 구분자.
		 * @param locale
		 *            언어
		 * @param left
		 *            좌측 위치 픽셀
		 * @param top
		 *            상단 위치 픽셀
		 */
		initCal : function(calIcon, target, defaultDt, validDt, sperator, min, max, locale) {

			this.cal_sperator = sperator;
			this.cal_locale = locale;
			
			if (min.substring(0, 1) == 'Y') {
				/** 기준 최소 일자 */
				this.cal_min_day = JUtilDate.getAddDays(1, JUtilDate.getAddYears(-parseInt(min.substring(1)), validDt));
			} else if (min.substring(0, 1) == 'M') {
				/** 기준 최소 일자 */
				this.cal_min_day = JUtilDate.getAddDays(1, JUtilDate.getAddMonths(-parseInt(min.substring(1)), validDt));
			} else if (min.substring(0, 1) == 'D') {
				/** 기준 최소 일자 */
				this.cal_min_day = JUtilDate.getAddDays(1, JUtilDate.getAddDays(-parseInt(min.substring(1)), validDt));
			}

			/** 최소 년도 */
			this.cal_min_year = this.cal_min_day.substring(0, 4);
			/** 최소 월 */
			this.cal_min_month = this.cal_min_day.substring(0, 6);

			if (max.substring(0, 1) == 'Y') {
				/** 기준 최대 일자 */
				if (parseInt(max.substring(1) + "0101", 10) + parseInt(validDt) > 100000000) {
					// 99990101 + 20170406
					this.cal_max_day = '99991231';
				} else {
					this.cal_max_day = JUtilDate.getAddDays(-1, JUtilDate.getAddYears(parseInt(max.substring(1)), validDt));
				}
				
			} else if (max.substring(0, 1) == 'M') {
				/** 기준 최대 일자 */
				this.cal_max_day = JUtilDate.getAddDays(-1, JUtilDate.getAddMonths(parseInt(max.substring(1)), validDt));
			} else if (max.substring(0, 1) == 'D') {
				/** 기준 최대 일자 */
				this.cal_max_day = JUtilDate.getAddDays(0, JUtilDate.getAddDays(parseInt(max.substring(1)), validDt));
			}
			
			// max 기준일자가 99991231 을 넘어가는 경우 99991231 로 초기화
			//if (parseInt(this.cal_max_day) > 10000000) {
			if (JUtilFormat.replaceAll(defaultDt, this.cal_sperator, "") == '99991231') {
				this.cal_max_day = '99991231';
			}

			console.log("this.cal_max_day :: " + this.cal_max_day);
			
			/** 최대 년도 */
			this.cal_max_year = this.cal_max_day.substring(0, 4);
			/** 최대 월 */
			this.cal_max_month = this.cal_max_day.substring(0, 6);

			// console.log("cal_min_year :: " + this.cal_min_year + " cal_max_year ::" + this.cal_max_year);
			// console.log("cal_min_month :: " + this.cal_min_month + " cal_max_month ::" + this.cal_max_month);
			// console.log("cal_min_day :: " + this.cal_min_day + " cal_max_day ::" + this.cal_max_day);

			// 입력값이 있을경우 달력초기화시 해당 입력달에 날짜로 셋팅 */
			this.cal_target = $('#' + target);
			this.cal_target_img = $(this.cal_target).next();
			var targetVal = $(this.cal_target).val();
			// console.log("targetVal :: " + targetVal);
			if (targetVal == '')
				this.cal_selectDt = JUtilFormat.replaceAll(defaultDt, this.cal_sperator, "");
			else
				this.cal_selectDt = JUtilFormat.replaceAll(targetVal, this.cal_sperator, "");

			// console.log("cal_selectDt :: " + this.cal_selectDt);

			

			this.cal_todayStr = this.dateStr(JUtilDate.getSystemDate(), 1);

			this.cal_target = $('#' + target);
			this.cal_btn_img = $('#' + calIcon);

			// type 지정
			$(this.cal_target).attr("maxlength", 10);

			// 다국어 처리
			this.cal_yoil = this.cal_locale == 'ko' ? this.cal_yoil_ko : this.cal_yoil_en;

			// 날자가 입력될 object
			var $target_obj = this.cal_target;

			var _options = {
				title : LOCALE == 'ko' ? '날짜선택' : 'Calendar Select',
				callback : function(day) {
					// alert("day :: " + day);
					if (day != null)
						$target_obj.val(day);
				}
			};

			this.calendarMsgBox(_options);
			this.resize();
			return this;
		},

		/**
		 * Alert Message Box를 화면에 출력합니다.
		 * 
		 * @param {Config}
		 *            options 환경 설정
		 */
		calendarMsgBox : function(options) {
			var _options = {
				title : options.title,
				callback : options.callback
			};
			var innerhtml = this.makeCal(_options);
			this.setBaseCalendarForm(_options, innerhtml);
		},

		/**
		 * resize layer.
		 */
		resize : function(callback) {

			var obj = $(".calendarLayer_data"); // 화면에 생성된 DIV 위치 설정 하기
			var objH = obj.height();
			objH = parseInt(objH) / 2;

			var objW = obj.width();
			objW = parseInt(objW) / 2;

			obj.css({
				"left" : "50%",
				"top" : "50%",
				"margin-top" : "-" + objH + "px",
				"margin-left" : "-" + objW + "px",
				"position" : "absolute"
			});
			
			// 접근성처리 : 화면 로딩 후 타이틀에 포커스 처리
			$(obj).find("._calendar_header").attr("tabindex", "0");
			$(obj).find("._calendar_header").focus();

		},

		/**
		 * 날자 변경.
		 * 
		 * @param id
		 *            달력 id
		 */
		changeCal : function(date) {

			date = JUtilFormat.replaceAll(date, this.cal_sperator, "");
			// 디폴트 일자 설정 : this.cal_selectDt 은 2016-12-07 의 형태를 유지한다.
			this.cal_selectDt = date.substring(0, 4) + this.date_split_format + date.substring(4, 6) + this.date_split_format + date.substring(6, 8);
			// 달력 일자 변경
			$("#calendar_period").html(this.getSelectYear() + ". " + this.getSelectMonth());

			var cal_html = $(this.makeDate(this.cal_selectDt));

			var $this = this;
			var $target_obj = this.cal_target;
			/** 상단 년, 월 변경등으로 일자를 다시 그리는 경우 이벤트를 재 바인딩한다. */
			$(cal_html).find("td>a").bind('click', function(evt) {
				// alert("day :: " + $(this).data("day"));
				var select_day = $(this).data("day");
				/** 리스트에서 선택한 행 */
				// open 시 설정한 before close event.
				$this.blockOptions.beforeClose(function() {
					$this.extBlock.hide(function() {
						window.top.isMessageShow = false;
						// open 시 설정한 after close event.
						if ($this.blockOptions.afterClose)
							$this.blockOptions.afterClose(function() {
								// alert("select_day :: " + select_day);
								// 선택 일자 설정
								if (select_day != null)
									$target_obj.val(select_day);
							});
						else {
							// 선택 일자 설정
							if (select_day != null)
								$target_obj.val(select_day);
						}
					});
				});
			});

			// 달력 그리드 변경
			$("#rowDay").empty();
			$("#rowDay").append(cal_html);
		},

		/**
		 * 날자 선택 콤보 태그 생성
		 * 
		 * @param id
		 *            달력 id
		 * @param tValue
		 *            선택 날자
		 * @returns {String} 달력 일자 HTML
		 */
		makeCal : function(options) {
			var cal_html = "";

			cal_html += '<div class="calendarLayer_wrap">';
			cal_html += '	<div class="calendarLayer_data">';
			cal_html += '		<div class="pop_header">';
			cal_html += '			<h1 class="_calendar_header">' + options.title + '</h1>';
			cal_html += '		</div>';
			cal_html += '		<div class="calendar_select">';
			cal_html += '			<a href="#none" class="year_prev" title="이전 년도 이동"></a>';
			cal_html += '			<a href="#none"  class="month_prev" title="이전 월 이동"></a>';
			cal_html += '			<strong id="calendar_period" class="period">' + this.getSelectYear() + '. ' + this.getSelectMonth() + '</strong>';
			cal_html += '			<a href="#none"  class="month_next" title="이후 월 이동"></a>';
			cal_html += '			<a href="#none"  class="year_next" title="이후 년 이동"></a>';
			cal_html += '		</div>';
			cal_html += '		<!-- 해당 년, 월 선택시 summary, caption 날짜텍스트 수정 적용요-->';
			cal_html += '		<div class="calendar_wrap">';
			cal_html += '			<table class="calendarSmall" summary="' + this.getSelectYear() + '년 ' + this.getSelectMonth() + '월 달력입니다.">';
			cal_html += '				<caption>' + this.getSelectYear() + '년 ' + this.getSelectMonth() + '월 달력</caption>';
			cal_html += '				<colgroup>';
			cal_html += '					<col width="14.2%">';
			cal_html += '					<col width="14.2%">';
			cal_html += '					<col width="14.2%">';
			cal_html += '					<col width="14.2%">';
			cal_html += '					<col width="14.2%">';
			cal_html += '					<col width="14.2%">';
			cal_html += '					<col width="14.2%">';
			cal_html += '				</colgroup>';
			cal_html += '				<thead>';
			cal_html += '					<tr>';
			cal_html += '						<th class="sun" scope="col">일</th>';
			cal_html += '						<th scope="col">월</th>';
			cal_html += '						<th scope="col">화</th>';
			cal_html += '						<th scope="col">수</th>';
			cal_html += '						<th scope="col">목</th>';
			cal_html += '						<th scope="col">금</th>';
			cal_html += '						<th class="sat" scope="col">토</th>';
			cal_html += '					</tr>';
			cal_html += '				</thead>';
			cal_html += '				<tbody id="rowDay">';
			cal_html += this.makeDate(this.cal_selectDt);
			cal_html += '				</tbody>';
			cal_html += '			</table>';
			cal_html += '		</div>';
			cal_html += '		<a href="#none" class="btn_calendar_close" role="button" aria-label="달력레이어팝업 닫기"></a>';
			cal_html += '	</div>';
			cal_html += '</div>';

			// console.log(cal_html);

			return cal_html;
		},
		/**
		 * 날자 태그 생성
		 * 
		 * @param year
		 *            년도
		 * @param month
		 *            월
		 * @param id
		 *            달력 id
		 * @returns {String} 달력 선택 콤보 HTML
		 */
		makeDate : function(date) {

			// alert("date :: " + date);

			var today = '';
			var cal_html = "";

			var year = this.getSelectYear();
			var month = this.getSelectMonth();

			// console.log("1year :: " + year);
			// console.log("2month :: " + month);

			// 윤년계산
			if ((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0))
				this.cal_mon[1] = 29;

			var day = new Date(year, month - 1, 1);

			if (day == "NaN") {
				day = JUtilDate.getSystemDate();
			}

			/*
			 * cal_html += ' <tr>'; cal_html += ' <td class="sun"><a href="#none">27</a></td>'; cal_html += ' <td><a href="#none">28</a></td>'; cal_html += ' <td><a href="#none">28</a></td>'; cal_html += ' <td><a href="#none">29</a></td>'; cal_html += ' <td><a href="#none">30</a></td>'; cal_html += ' <td><a href="#none">31</a></td>'; cal_html += ' <td class="sat">&nbsp;</td>'; cal_html += ' </tr>';
			 */

			// before
			if (day.getDay() != this.cal_start_day) {
				var startDay = day.getMonth() == 0 ? 0 : (day.getMonth() - 1);
				var maxDay = day.getDay() == 0 ? 6 : (day.getDay() - parseInt(this.cal_start_day));
				cal_html += "<tr>";
				for (i = maxDay; i > 0; i--) {
					// cal_html += "<td><div value='" + this.dateStr(new Date(year, (day.getMonth()
					// - 1), (this.cal_mon[startDay] - (i - 1))), 1) + "' align='center'
					// class='dayOther'>" + (this.cal_mon[startDay] - (i - 1)) + "</div></td>";
					// cal_html += ' <td class="sun"><a href="#none">' + (this.cal_mon[startDay] -
					// (i - 1)) + '</a></td>';
					cal_html += '						<td><a href="#none" title="선택불가날짜">&nbsp;</a></td>';
				}
			}
			// day
			for (var i = 1; i <= this.cal_mon[day.getMonth()]; i++) {
				today = new Date(year, month - 1, i); // 오늘 날짜를 얻음 -> 요일을 알기 위해서.
				// console.log("today.getDay() :: " + today.getDay() + " cal_start_day ::" +
				// this.cal_start_day + " val ::" + this.dateStr(today, 1) + " today :: " +
				// this.cal_todayStr);
				// 일요일이면 다음 줄로 넘어감.
				if (today.getDay() == this.cal_start_day)
					cal_html += "</tr><tr>";

				var clsSun = "";
				if (today.getDay() == this.cal_start_day) {
					clsSun = 'class="sun"';
				} else if (today.getDay() == 6) {
					clsSun = 'class="sat"';
				}

				var clsToday = "";
				if (this.cal_selectDt == JUtilFormat.replaceAll(this.dateStr(today, 1), this.cal_sperator, "")) {
					clsToday = 'class="on" title="현재 날자 선택함"';
				}
				
				// cal_html += "<td><div value='" + this.dateStr(today, 1) + "' day='" +
				// today.getDay() + "' align='center'><a href='#//Citibank' title='" +
				// this.cal_yoil[today.getDay()] +' '+ (this.cal_locale == 'ko' ? '요일' : 'Day') +
				// "'>" + i + "</a></div></td>";
				
				//console.log("1:: " + JUtilFormat.replaceAll(this.dateStr(today, 1), this.cal_sperator, "") + " / 2:: " + this.cal_max_day + " / 3:: " + JUtilFormat.replaceAll(this.dateStr(today, 1), this.cal_sperator, "") + " / 4:: " + this.cal_min_day);
				
				if (JUtilFormat.replaceAll(this.dateStr(today, 1), this.cal_sperator, "") <= this.cal_max_day && JUtilFormat.replaceAll(this.dateStr(today, 1), this.cal_sperator, "") >= this.cal_min_day) {
					cal_html += '						<td ' + clsSun + '><a href="#none" title="선택가능날짜" data-day="' + this.dateStr(today, 1) + '"' + clsToday + '>' + i + '</a></td>';
				} else {
					cal_html += '						<td class="na">' + i + '</td>';
				}
				
				//console.log(" date :: " + this.dateStr(today, 1));
				//console.log(" max :: " + this.cal_max_day);
				//console.log(" min :: " + this.cal_min_day);

			}
			// next
			if (((this.cal_start_day == 0) && today.getDay() != 6) || (this.cal_start_day == 1) && today.getDay() != 0) {
				var next_day = 1;
				for (i = today.getDay(); i < 6 + parseInt(this.cal_start_day); i++) {
					// cal_html += "<td><div value='" + this.dateStr(new Date(year, (day.getMonth()
					// + 1), next_day), 1) + "' align='center' class='dayOther'>" + next_day++ +
					// "</div></td>";
					// cal_html += ' <td class="sun"><a href="#none">' + next_day++ + '</a></td>';
					cal_html += '						<td><a href="#none" title="선택불가날짜">&nbsp;</a></td>';
				}
			}
			cal_html += '					</tr>';

			return cal_html;
		},

		/**
		 * 날자 포멧 반환.
		 * 
		 * @param obj
		 *            날자 객체
		 * @param returnType
		 *            반환 포멧
		 * @returns 포멧팅 날자
		 */
		dateStr : function(obj, returnType) {
			var y = obj.getFullYear();
			var m = obj.getMonth() + 1 + "";
			var d = obj.getDate() + "";
			if (m.length == 1)
				m = "0" + m;
			if (d.length == 1)
				d = "0" + d;
			var returnValue = y + this.date_split_format + m + this.date_split_format + d;
			if (returnType == "1") {
				return returnValue;
			} else if (returnType == "2") {
				return returnValue.split(this.date_split_format);
			}
		},

		/**
		 * 오늘 날자 선택.
		 * 
		 * @param id
		 *            달력 id
		 */
		changeToday : function(id) {

		},

		/**
		 * 선택 일자 return
		 */
		getSelectYear : function() {
			var date = null;
			if (this.cal_selectDt.indexOf(this.cal_sperator) > -1) {
				date = this.cal_selectDt.split(this.date_split_format);
				return date[0];
			} else {
				return this.cal_selectDt.substring(0, 4);
			}
		},

		/**
		 * 선택 년도 return
		 */
		getSelectMonth : function() {
			var date = null;
			if (this.cal_selectDt.indexOf(this.cal_sperator) > -1) {
				date = this.cal_selectDt.split(this.date_split_format);
				return date[1];
			} else {
				return this.cal_selectDt.substring(4, 6);
			}
		},

		/**
		 * 선택 일자 return
		 */
		getSelectDay : function() {
			var date = null;
			if (this.cal_selectDt.indexOf(this.cal_sperator) > -1) {
				date = this.cal_selectDt.split(this.date_split_format);
				return date[2];
			} else {
				return this.cal_selectDt.substring(6, 8);
			}
		},

		/**
		 * Base Message Box를 화면에 셋팅합니다.
		 * 
		 * @param {Config}
		 *            options 환경설정
		 */
		setBaseCalendarForm : function(options, innerhtml) {
			// 현재 알림 메세지 박스 있으면 금지!
			if (window.top.isMessageShow)
				return;

			window.top.isMessageShow = true;

			var $this = this;

			this.extBlock = new window.top.ext.Block();

			// iFrame 사용시 모든 객체는 window.top 으로 생성 하여 DOM 계층 구조를 맞춰준다.
			this.extContainer = window.top.document.createElement('div');
			this.extContainer.setAttribute('id', this.extLayer);
			this.extContainer.innerHTML = innerhtml;

			this.extBlock.show(this.extContainer, function() {
				$this.extBlock.beforeFocus = null; // 레이어 닫힌 후 자동 포커싱 금지.

				// 날자 선택 이벤트
				$($this.extContainer).find("td>a").bind('click', function(evt) {
					// alert("day :: " + $(this).data("day"));
					/** 리스트에서 선택한 행 */
					var $a = $(this);
					// open 시 설정한 before close event.
					$this.blockOptions.beforeClose(function() {
						$this.extBlock.hide(function() {
							window.top.isMessageShow = false;
							// open 시 설정한 after close event.
							if ($this.blockOptions.afterClose)
								$this.blockOptions.afterClose(function() {
									options.callback($a.data("day"));
									// 접근성 처리
									$this.cal_target_img.focus();
								});
							else if (options.callback) {
								options.callback($a.data("day"));
								// 접근성 처리
								$this.cal_target_img.focus();								
							}
						});
					});
				});

				// 닫기 이벤트
				$($this.extContainer).find(".btn_calendar_close").bind('click', function(evt) {
					/** 리스트에서 선택한 행 */
					// open 시 설정한 before close event.
					$this.blockOptions.beforeClose(function() {
						$this.extBlock.hide(function() {
							window.top.isMessageShow = false;
							// open 시 설정한 after close event.
							if ($this.blockOptions.afterClose)
								$this.blockOptions.afterClose(function() {
									options.callback(null);
									// 접근성 처리
									$this.cal_target_img.focus();
								});
							else if (options.callback) {
								options.callback(null);
								// 접근성 처리
								$this.cal_target_img.focus();								
							}
						});
					});
				});

				// << 이전 년도 이동
				$($this.extContainer).find(".year_prev").bind('click', function(evt) {
					// console.log("cal_selectDt :: " + $this.cal_selectDt);
					//if (parseInt($this.cal_min_year) > parseInt($this.getSelectYear()) - 1) {
					if (JUtilDate.getDaysBetween($this.cal_min_day, JUtilDate.getAddYears(-1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) < 0) {
						// message ...
						/*
						 * Message.alert("선택 가능일자는 " + $this.cal_min_day + "일부터 " + $this.cal_max_day + "일까지 입니다.", "", function (){ return false; });
						 */
					} else {
						$this.changeCal(JUtilDate.getAddYears(-1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, "")));
					}
				});
				// >> 이후 년도 이동
				$($this.extContainer).find(".year_next").bind('click', function(evt) {
					
					// max 기준일자가 99991231 을 넘어가는 경우 99991231 로 초기화
					if (parseInt(JUtilDate.getAddYears(+1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) >= parseInt('99991231')) {
						return;
					}
					
					// console.log("cal_selectDt :: " + JUtilDate.getAddYears(+1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, "")));
					// console.log("cal_selectDt :: " + $this.cal_selectDt);
					//if (parseInt($this.cal_max_year) < parseInt($this.getSelectYear()) + 1) {
					if (JUtilDate.getDaysBetween($this.cal_max_day, JUtilDate.getAddYears(+1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) > 0) {
						// message ...

					} else {
						$this.changeCal(JUtilDate.getAddYears(1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, "")));
					}
				});
				// < 이전 월 이동
				$($this.extContainer).find(".month_prev").bind('click', function(evt) {
					// console.log("cal_selectDt :: " + $this.cal_selectDt);
					//if (parseInt($this.cal_min_month) > parseInt($this.getSelectYear() + $this.getSelectMonth()) - 1) {
					//if (JUtilDate.getDaysBetween($this.cal_min_day, JUtilDate.getAddMonths(-1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) < 0) {
					if (JUtilDate.getDaysBetween($this.cal_min_day, JUtilDate.getAddMonths(-1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) < -1) {
						// message ...

					} else {
						$this.changeCal(JUtilDate.getAddMonths(-1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, "")));
					}
				});
				// > 이후 월 이동
				$($this.extContainer).find(".month_next").bind('click', function(evt) {
					
					// max 기준일자가 99991231 을 넘어가는 경우 99991231 로 초기화
					if (parseInt(JUtilDate.getAddMonths(+1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) >= parseInt('99991231')) {
						return;
					}
					
					// console.log("cal_selectDt :: " + $this.cal_selectDt);
					//if (parseInt($this.cal_max_month) < parseInt($this.getSelectYear() + $this.getSelectMonth()) + 1) {
					//if (JUtilDate.getDaysBetween($this.cal_max_day, JUtilDate.getAddMonths(+1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) > 0) {
					if (JUtilDate.getDaysBetween($this.cal_max_day, JUtilDate.getAddMonths(+1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, ""))) > 1) {
						// message ...

					} else {
						$this.changeCal(JUtilDate.getAddMonths(1, JUtilFormat.replaceAll($this.cal_selectDt, $this.cal_sperator, "")));
					}
				});

				// after open event.
				if ($this.blockOptions.afterOpen)
					$this.blockOptions.afterOpen(options.callback);

			}, this.blockOptions);

		}

	};

})(jQuery);
