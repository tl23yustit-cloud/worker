const depthName = {
    inq: "조회",
    trn: "이체",
    card: "카드",
    fin: "금융상품",
    fns: "금융서비스",
    b2b: "B2B전자결제",
    bmg: "뱅킹관리",
    aug: "인증센터",
    fpd: "공시실",
    cbu: "기업뱅킹 이용가이드",
    bop: "뱅킹업무",
    sil: "간편조회",
    mnd: "메인",
    bni: "은행소개",
    cmn: "공통 팝업 및 화면",
    cst: "고객센터",
    fcp: "금융소비자포털",

    //2depth
    clrs: "대출상환스케줄조회",
    lon: "대출",
    foe: "외환",
    tpr:"신탁",
    act:"계좌이체",

    //3depth
    ip: "이자납입",   
    rop: "원금상환",    
    import:"수입",
    fx:"FX",
    dli:"내국신용장조회",
    pom:"상품성 신탁 운용방법 및 소수율 현황",
    dlyt:"지연이체등록내역조회/취소",
    ai:"계좌조회",
    mact:"다계좌이체",
    
    //4depth
    rip: "상환_이자납입",
    clha: "대출보유계좌조회",
    oilc:"수입신용장개설",
    ctl:"한도조회",
    ctd:"거래내역조회",
    hai:"휴먼계좌조회",
    rthf:"거래내역파일요청",

    //5depth
    al:"신청목록",
    eai:"신청목록",
    ob:"신청정보입력",
    ourb:"당행",
    othb:"타행",

    guide: "가이드",
    popup: "팝업",
    common: "공통",
    components: "컴포넌트",
    main: "메인",
    sub: "서브",
    cst: "고객센터",

   
    interest_situation: "이자상환"

};
async function loadList() {

    const res = await fetch("./list.json");

    const data = await res.json();

    render(data);

    const input = document.querySelector("#search");

    input.addEventListener("input", () => {

        const keyword = input.value.toLowerCase();

        const filtered = data.filter(item => {

            return (
                item.folder.toLowerCase().includes(keyword) ||
                item.title.toLowerCase().includes(keyword) ||
                item.file.toLowerCase().includes(keyword)
            );

        });

        render(filtered);

    });

}
function getStatusClass(status) {

    switch (status) {

        case "완료":
            return "complete";

        case "진행중":
            return "progress";

        case "수정중":
            return "modify";

        case "수정완료":
            return "modify-complete";

        case "긴급":
            return "urgent";

        case "삭제":
            return "delete";

        default:
            return "wait";

    }

}
function render(data) {

    const container = document.querySelector("#list");

    // 최대 Depth 계산
    const maxDepth = Math.max(
        ...data.map(item => item.depths.length)
    );

    // Depth 헤더 생성
    let depthHeader = "";

    for (let i = 0; i < maxDepth; i++) {
        depthHeader += `<th>${i + 1}Depth</th>`;
    }

    // 그룹핑
    const groups = {};

    data.forEach(item => {
        const key = item.depths[0] || "기타";

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(item);
    });

    let html = "";

    Object.keys(groups).forEach(group => {
        groups[group].sort((a, b) => {

            // depth를 문자열로 만들어 비교
            const depthA = a.depths.join("/");
            const depthB = b.depths.join("/");

            return depthA.localeCompare(depthB, "ko");
        });
        html += `
            <section class="pub-section">
                <h2> ${depthName[group] || group}</h2>

                <table>
                    <thead>
                        <tr>
                            ${depthHeader}
                            <th>화면명</th>
                            <th>파일명</th>
                            <th>상태</th>
                            <th>수정일</th>
                            <th>보기</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        groups[group].forEach(item => {

            const status = item.status || "대기";

            // Depth td 생성
            let depthTd = "";

            for (let i = 0; i < maxDepth; i++) {

                const depth = item.depths[i];

                depthTd += `<td>${depth
                    ? (depthName[depth] || depth)
                    : "-"
                    }</td>`;
            }

            html += `
                <tr>
                    

                    ${depthTd}

                    <td>${item.title}</td>
                    <td>${item.file}</td>
                    <td>
                        <span class="status ${getStatusClass(status)}">
                            ${status}
                        </span>
                    </td>
                    <td>${item.modified}</td>
                    <td><a href="./${item.link}" target="_blank">보기</a></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </section>
        `;
    });

    container.innerHTML = html;
}
loadList();