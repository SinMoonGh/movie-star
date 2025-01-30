const Sort = {
    BY_LIKES: "likes",
    BY_VIEWERS: "viewers",
    BY_DATE: "date",
};

let sortMode = Sort.BY_LIKES
let trashMode = false

// index.html 의 로드가 완료되면 ready(...) 안에 등록된 함수가 자동으로 호출됩니다.
// 아래는 함수에 이름을 부여하지 않고 바로 ready(...) 의 매개변수로 함수를 전달하는 방식으로 로드 완료시 호출될 함수를 등록합니다.
$(document).ready(function () {
    // 영화 목록을 보여줍니다.
    showMovie()

    // 현재 적용되고 있는 정렬 방식의 버튼에 눌려져 보이는 효과를 줍니다.
    displaySorter()

    // 휴지통 모드에 따라 메뉴를 다르게 바꿔줍니다.
    displayTrashMode(trashMode)
});

function changeTrashMode() {
    trashMode = !trashMode
    showMovie()
}

function showMovie() {
    // 1. id="movie-box" 로 된 태그의 내부 html 태그를 모두 삭제합니다.
    $('#movie-box').empty()

    // 2. 휴지통을 보고 있는지 여부에 따라 호출할 API 를 선택합니다.
    //    휴지통이 아닐 경우 GET /api/list
    //    휴지통일 경우 GET /api/list/trash
    if (trashMode == false) {
        $.ajax({
            type: "GET",
            url: "/api/list",
            data: { 'sortMode': sortMode },
            success: function (response) {
                if (response['result'] != 'success') {
                    alert(sortMode + ' 순으로 영화 목록 받아오기 실패!')
                    return
                }
                // 3. 서버가 돌려준 stars_list를 movies 라는 변수에 저장합니다.
                let movies = response['movies_list']
                // 4. 영화 카드를 추가합니다. 이 때 휴지통 여부에 따라 카드 모양이 달라지므로 휴지통 여부(=false)도 같이 전달합니다.
                addMovieCards(movies, false)
            },
        })
    } else {
        $.ajax({
            type: "GET",
            url: "/api/list/trash",
            data: { 'sortMode': sortMode },
            success: function (response) {
                if (response['result'] != 'success') {
                    alert(sortMode + ' 순으로 영화 목록 받아오기 실패!')
                    return
                }
                addMovieCards(response['movies_list'], true)
            },
        })
    }
}

function addMovieCards(movies, trashMode) {
    // for 문을 활용하여 movies 배열의 요소를 차례대로 조회합니다.
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i]

        // 1. movie[i] 요소의 title,viewers, likes 키 값을 활용하여 값을 조회합니다.
        let id = movie['_id']
        let poster = movie['poster_url']
        let title = movie['title']
        let viewers = movie['viewers']
        let likes = movie['likes']
        let open_year = movie['open_year']
        let open_month = movie['open_month']
        let open_day = movie['open_day']

        // 2. 영화 카드를 만듭니다.
        let cardContentHtml = `                
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${poster}" class="img-fluid rounded-start" alt="...">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <p class="card-title">${title}</p>
                        <div class="card-detail">
                            <p class="card-text"><span class="icon"><i class="fas fa-thumbs-up"></i></span><span class="movie-likes">${likes.toLocaleString()}</span></p>
                            <p class="card-text">누적관객수 <span class="movie-viewers">${viewers.toLocaleString()}</span> 명</p>
                            <p class="card-text">개봉일 <span class="movie-date">${open_year}년 ${open_month}월 ${open_day}일</span></p>
                        </div>
                    </div>
                </div>
            </div>               
            `

        // 3. 휴지통을 보고 있는지 여부에 따라 카드의 버튼을 다르게 설정해줍니다.
        let cardFooterHtml = ''
        if (trashMode == false) {
            cardFooterHtml = `
                <div class="card-footer">
                    <a href="#" onclick="likeMovie('${id}')">
                    추천
                    <i class="fas fa-thumbs-up"></i>
                    </a>
                    <a href="#" onclick="trashMovie('${id}')">
                    휴지통
                    <i class="fa-solid fa-trash"></i>
                    </a>
                </div>
                `
        } else {
            cardFooterHtml = `
                <div class="card-footer">
                    <a href="#" onclick="restoreMovie('${id}')">
                    복구하기
                    </a>
                    <a href="#" onclick="deleteMovie('${id}')">
                    영구삭제
                    </a>
                </div>
                `
        }

        // 4. #movie-box에 생성된 HTML 을 붙입니다.
        $('#movie-box').append(`
                <div class="card mb-3" style="max-width: 540px;">
                    ${cardContentHtml}
                    ${cardFooterHtml}
                </div>
            `)
    }
}

function likeMovie(id) {
    $.ajax({
        type: "POST",
        url: "/api/like",
        data: { 'id': id },
        success: function (response) {
            if (response['result'] == 'success') {
                alert('좋아요 완료!')
                showMovie()
            } else {
                alert('좋아요 실패ㅠㅠ')
            }
        }
    });
}

function trashMovie(id) {
    $.ajax({
        type: "POST",
        url: "/api/trash",
        data: { 'id': id },
        success: function (response) {
            if (response['result'] == 'success') {
                alert('휴지통으로 이동 완료!')
                showMovie()
            } else {
                alert('휴지통으로 이동 실패ㅠㅠ')
            }
        }
    });
}

function restoreMovie(id) {
    $.ajax({
        type: "POST",
        url: "/api/restore",
        data: { 'id': id },
        success: function (response) {
            if (response['result'] == 'success') {
                alert('복구 완료!')
                showMovie()
            } else {
                alert('복구 실패ㅠㅠ')
            }
        }
    });
}

function deleteMovie(id) {
    $.ajax({
        type: "POST",
        url: "/api/delete",
        data: { 'id': id },
        success: function (response) {
            if (response['result'] == 'success') {
                alert('삭제 완료!')
                showMovie()
            } else {
                alert('삭제 실패ㅠㅠ')
            }
        }
    });
}

// 정렬 기준 버튼을 클릭하면 호출됨
function changeSorter(newMode) {
    if (sortMode == newMode) {
        return
    }

    sortMode = newMode
    displaySorter()
    showMovie()
}

// 정렬 기준에 따라 해당 버튼만 활성화 시키고 다른 버튼은 비활성화 시킴
function displaySorter() {
    document.getElementById("sorter-likes").classList.remove("active")
    document.getElementById("sorter-viewers").classList.remove("active")
    document.getElementById("sorter-date").classList.remove("active")
}

function displayTrashMode(trashMode) {
    // trashMode 에 따라 "휴지통 보기" 또는 "휴지통 나가기" 가 출력 되게 구현해야 됩니다.
}