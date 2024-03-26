function fetchComments(interfaceName,sortType) {
    const wxNickName = document.getElementById('wxNickName').value;
    const novelTitle = document.getElementById('novelTitle').value;
    const numberOfRaces = document.getElementById('numberOfRaces').value;
    let url = 'http://127.0.0.1:8888/api/'+interfaceName+'?';
    const groupTypeValues = [1, 2, 3]; // GroupType的三种取值

    groupTypeValues.forEach(groupType => {
        let currentUrl = url; // 每次循环重新初始化URL
        if (wxNickName.trim() !== '') {
            currentUrl += `&wxNickName=${wxNickName}`;
        }
        if (novelTitle.trim() !== '') {
            currentUrl += `&novelTitle=${novelTitle}`;
        }
        if (numberOfRaces.trim() !== '') {
            currentUrl += `&number=${numberOfRaces}`;
        }
        currentUrl += `&sortType=${sortType}`;
        currentUrl += `&groupType=${groupType}`;
        currentUrl += `&sortType=1`; // 假设sortType始终为1

        fetch(currentUrl)
            .then(response => response.json())
            .then(data => {
                if (groupType === 1) {
                    displayDataByNickName(data);
                } else if (groupType === 2) {
                    displayDataByNovelTitle(data);
                } else if (groupType === 3) {
                    displayDataByNumber(data);
                }
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
            });
    });
}


function displayDataByNickName(comments) {
    const tableBody = document.getElementById('statisticsByNickNameBody');
    tableBody.innerHTML = '';

    comments.forEach(comment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comment.WxNickName}</td>
            <td>${comment.Count}</td>
        `;
        tableBody.appendChild(row);
    });
}

function displayDataByNovelTitle(comments) {
    const tableBody = document.getElementById('statisticsByNovelTitleBody');
    tableBody.innerHTML = '';

    comments.forEach(comment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comment.NovelTitle}</td>
            <td>${comment.Count}</td>
        `;
        tableBody.appendChild(row);
    });
}
function displayDataByNumber(comments) {
    const tableBody = document.getElementById('statisticsByNumberBody');
    tableBody.innerHTML = '';

    comments.forEach(comment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comment.Number}</td>
            <td>${comment.Count}</td>
        `;
        tableBody.appendChild(row);
    });
}