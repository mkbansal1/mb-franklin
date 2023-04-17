
const getListHTML = (row) => `<div>
            <div class="list-profile">${row.Number} - ${row.Name}</div>
            <div class="list-age">${row.Age} years, with experience of ${row.TotalExperience} years</div>
            <div class="list-salary">Expected salary is more then ${row.Salary}</div>
            </div>`;
const getPaginationHTML = (text, path) => `<a href="${path}">${text}</li>`;
const getQueryPath = (pageNo) => `?page=${pageNo}`;

const queryParams = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

async function loadData(path, offset, limit) {
    if (path && path.startsWith('/')) {
        console.log('path: ' + path);

        const resp = await fetch(`${path}.json?offset=${offset}&limit=${limit}`);

        console.log(resp);

        const listData = JSON.parse(await resp.text());

        return listData;
    }
    return null;
}

export default async function decorate(block) {
    console.log('process started!');
    const path = '/data';
    const limit = queryParams.limit || 9;
    var pageNo = queryParams.page || 1;
    if (pageNo < 1) {
        pageNo = 1;
    }
    const offset = (pageNo-1) * limit;
    
    const list = await loadData(path, offset, limit);
    console.log('Printing response ... ');
    console.log(list);

    block.textContent = '';
    if (list.data.length > 0) {
        var totalPages = Math.round(list.total/limit);
        if ((totalPages * limit) < list.total) {
            totalPages++;
        }
        const objects = await printList(list);    
        const pagination = await printPagination(totalPages, pageNo);
    
        block.append(objects);
        block.append(pagination);
    } else {
        block.append(`no result found`);
    }
   

    console.log('process finished!');
}

async function printList(list) {
    const ul = document.createElement('ul');
    list.data.forEach((row) => {
        const li = document.createElement('li');
        li.innerHTML = getListHTML(row);
        // console.log(li.innerHTML);
        ul.append(li);
    });
    return ul;
}

async function printPagination(totalPages, pageNo) {
    const ul = document.createElement('ul');
    ul.className = "lists-pagination";
    console.log('total: ' + totalPages + ', pageNo: ' + pageNo);

    const prevPage = (pageNo-1)*1;
    const nextPage = ((pageNo*1)+1);
    console.log('pageNo: ' + pageNo + ', prev: ' + prevPage + ', Next: ' + nextPage);

    // Logic for previous page
    if (prevPage>=1) {
        const prevLi = document.createElement('li');
        prevLi.innerHTML = getPaginationHTML('Prev', getQueryPath(prevPage));
        ul.append(prevLi);
    }

    for (var i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        if (i == pageNo) {
            li.className = "selected";
        }

        li.innerHTML = getPaginationHTML(i, getQueryPath(i));
        ul.append(li);
    }


    // Logic for next page
    if (nextPage <= totalPages) {
        const nextLi = document.createElement('li');
        nextLi.innerHTML = getPaginationHTML('Next', getQueryPath(nextPage));
        ul.append(nextLi);
    }

    return ul;
}
