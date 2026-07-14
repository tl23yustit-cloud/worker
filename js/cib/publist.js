const depthName = {
    card: "카드",
    transfer: "이체",
    inquiry: "조회",
    guide: "가이드",
    popup: "팝업",
    common: "공통",
    components: "컴포넌트",
    main: "메인",
    sub: "서브"

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

        html += `
            <section class="pub-section">
                <h2>${group}</h2>

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