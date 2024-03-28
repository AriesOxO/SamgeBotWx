function fetchComments(interfaceName, sortType, limit) {
    const wxNickName = document.getElementById('wxNickName').value;
    const novelTitle = document.getElementById('novelTitle').value;
    const numberOfRaces = document.getElementById('numberOfRaces').value;
    let url = 'http://114.55.235.157:8888/api/' + interfaceName + '?';
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
                    displayDataByNickName(data, limit, groupType);
                } else if (groupType === 2) {
                    displayDataByNovelTitle(data, limit, groupType);
                } else if (groupType === 3) {
                    displayDataByNumber(data, limit, groupType);
                }
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
            });
    });
}

function displayDataByNickName(comments, limit, groupType) {
    const tableBody = document.getElementById('statisticsByNickNameBody');
    const paginationDiv = document.getElementById('paginationByNickName');

    // Clear previous data
    tableBody.innerHTML = '';
    paginationDiv.innerHTML = '';

    // Calculate number of pages
    const totalPages = Math.ceil(comments.length / limit);

    // Display current page
    let currentPage = 1;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, comments.length);

    for (let i = startIndex; i < endIndex; i++) {
        const comment = comments[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comment.WxNickName}</td>
            <td>${comment.Count}</td>
        `;
        tableBody.appendChild(row);
    }

    // Create pagination
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = function () {
            currentPage = i;
            const startIndex = (currentPage - 1) * limit;
            const endIndex = Math.min(startIndex + limit, comments.length);
            displayCurrentPageData(comments, startIndex, endIndex, tableBody,1);
        };
        // 添加样式类名以便于CSS样式控制
        button.className = 'pagination-button';
        paginationDiv.appendChild(button);
    }
}

function displayDataByNovelTitle(comments, limit, groupType) {
    const tableBody = document.getElementById('statisticsByNovelTitleBody');
    const paginationDiv = document.getElementById('paginationByNovelTitle');

    // Clear previous data
    tableBody.innerHTML = '';
    paginationDiv.innerHTML = '';

    // Calculate number of pages
    const totalPages = Math.ceil(comments.length / limit);

    // Display current page
    let currentPage = 1;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, comments.length);

    for (let i = startIndex; i < endIndex; i++) {
        const comment = comments[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comment.NovelTitle}</td>
            <td>${comment.Count}</td>
        `;
        tableBody.appendChild(row);
    }

    // Create pagination
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = function () {
            currentPage = i;
            const startIndex = (currentPage - 1) * limit;
            const endIndex = Math.min(startIndex + limit, comments.length);
            displayCurrentPageData(comments, startIndex, endIndex, tableBody,2);
        };
        // 添加样式类名以便于CSS样式控制
        button.className = 'pagination-button';
        paginationDiv.appendChild(button);
    }
}

function displayDataByNumber(comments, limit, groupType) {
    const tableBody = document.getElementById('statisticsByNumberBody');
    const paginationDiv = document.getElementById('paginationByNumber');

    // Clear previous data
    tableBody.innerHTML = '';
    paginationDiv.innerHTML = '';

    // Calculate number of pages
    const totalPages = Math.ceil(comments.length / limit);

    // Display current page
    let currentPage = 1;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, comments.length);

    for (let i = startIndex; i < endIndex; i++) {
        const comment = comments[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comment.NovelTitle}</td>
            <td>${comment.Count}</td>
        `;
        tableBody.appendChild(row);
    }

    // Create pagination
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = function () {
            currentPage = i;
            const startIndex = (currentPage - 1) * limit;
            const endIndex = Math.min(startIndex + limit, comments.length);
            displayCurrentPageData(comments, startIndex, endIndex, tableBody,3);
        };
        // 添加样式类名以便于CSS样式控制
        button.className = 'pagination-button';
        paginationDiv.appendChild(button);
    }
}

function displayCurrentPageData(comments, startIndex, endIndex, tableBody,lineType) {
    tableBody.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
        const comment = comments[i];
        const row = document.createElement('tr');
        if(1 === lineType){
            row.innerHTML = `
            <td>${comment.WxNickName}</td>
            <td>${comment.Count}</td>
        `;
        }
        if(2 === lineType){
            row.innerHTML = `
            <td>${comment.Number}</td>
            <td>${comment.Count}</td>
        `;
        }
        if(3 === lineType){
            row.innerHTML = `
            <td>${comment.Number}</td>
            <td>${comment.Count}</td>
        `;
        }
        tableBody.appendChild(row);
    }
}
