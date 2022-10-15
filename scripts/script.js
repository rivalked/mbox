const searchLink = document.querySelector('.search__link'),
    mainContent = document.querySelector('.main__content'),
    mainBlock = document.querySelector('.main__block'),
    pagination = document.querySelector('.pagination'),
    mainSolo = document.querySelector('.main__solo'),
    mainClose = document.querySelector('.main__close'),
    formMain = document.querySelector('.form__main'),
    formInput = document.querySelector('.header__input'),
    headerBtn = document.querySelector('.header__btn'),
    headerItems = document.querySelector('.header__items'),
    headerAbs = document.querySelector('.header__abs'),
    anime = document.querySelector('.anime')

function openMenu(e) {
    e.preventDefault()
    const removeAndAddClass = headerBtn.classList.contains('active') ? 'remove' : 'add'
    headerBtn.classList[removeAndAddClass]('active')
    headerAbs.classList[removeAndAddClass]('active')
    headerItems.classList[removeAndAddClass]('active')
    document.body.classList[removeAndAddClass]('active')
}

headerBtn.addEventListener('click', (e) => openMenu(e))
headerAbs.addEventListener('click', (e) => openMenu(e))

function openSearchPanel(e, bool = true) {
    e.preventDefault()
    mainContent.classList[bool ? 'add' : 'remove']('active')
}

searchLink.addEventListener('click', (e) => openSearchPanel(e))
mainClose.addEventListener('click', (e) => openSearchPanel(e, false))

const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)
const getLink = (url) => url.split('www.').join('')

const host = 'https://kinopoiskapiunofficial.tech'
const hostName = 'X-API-KEY'
const hostKey = '050eb290-b8c1-4d49-84ed-2d75d46046f4'

class Kino {
    constructor() {
        this.date = new Date().getMonth()
        this.month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
        this.currentYear = new Date().getFullYear()
        this.currentMonth = this.month[this.date]
    }

    fStart = async (url) => {
        const res = await fetch(url, {
            headers: {
                [hostName]: hostKey,
                'Content-Type': 'application/json'
            }
        })
        if (res.ok) return res.json()
        else throw new Error(`Неверный адрес ${url}`)
    }
    getTopMovies = (page = 1) => this.fStart(`${host}/api/v2.2/films/top?type=TOP_250_BEST_FILMS&page=${page}`)
    getSoloFilm = (id) => this.fStart(`${host}/api/v2.2/films/${id}`)
    getReleases = (page = 1, year = this.currentYear, month = this.currentMonth) =>
        this.fStart(`${host}/api/v2.1/films/releases?year=${year}&month=${month}&page=${page}`)
    getReviews = (id) => this.fStart(`${host}/api/v2.2/films/${id}/reviews?page=1&order=DATE_DESC`)
    getSearch = (page = 1, keyword) => this.fStart(`${host}/api/v2.1/films/search-by-keyword?keyword=${keyword}&page=${page}`)
    getFrames = (id) => this.fStart(`${host}/api/v2.2/films/${id}/images`)
    
}

const db = new Kino()



const renderTrendMovies = (element = [], method = [], films = [], params = []) => {
    anime.classList.add('active')
    element.forEach((item, i) => {
        const parent = document.querySelector(`${item} .swiper-wrapper`)
        db[method[i]](params[i]).then(data => {
            data[films[i]].forEach(obj => {
                const slide = document.createElement('div')
                slide.classList.add('swiper-slide')
                slide.innerHTML = `
                    <div class="movie__item" data-id="${obj.filmId}">
                        <img src="${obj.posterUrlPreview}" alt="" />
                    </div>
                `
                parent.append(slide)
            })
            const movieItem = document.querySelectorAll('.movie__item')
            movieItem.forEach(item => {
                item.addEventListener('click', () => {
                    let attr = item.getAttribute('data-id')
                    // функция для рендера отдельного (соло) фильма
                    renderSolo(attr)
                })
            })
            new Swiper(`${item}`, {
                slidesPerView: 5,
                spaceBetween: 27,
                loop: true,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                }
            })
        })
            .then(() => {
                const pages = 13
                const randomNum = random(1, pages)
                // функцию для рендера фильма в header
                renderHeader(randomNum)
            })
            .catch(e => {
                anime.classList.remove('active')
                console.log(e);
            })
    })
}

renderTrendMovies(['.trend__tv-slider', '.popular__actors-slider'], ['getTopMovies', 'getReleases'], ['films', 'releases'], [1, 1])

const renderHeader = (page) =>{
    db.getTopMovies(page).then(res=> {
        anime.classList.add('active')
        const max = random(0, res.films.length - 1)
        const filmId =res.films[max].filmId
        const filmRating =res.films[max].rating
        db.getSoloFilm(filmId).then(response =>{
            const film = response
            const headerText = document.querySelector('.header__text')
            headerText.innerHTML =`
            <h1 class="header__title">${film.nameRu || film.nameEn}</h1>
            <div class="header__balls">
                <span class="header__year">${film.year}</span>
                <span clasName="logo__span header__rating header__year">
                    ${film.ratingAgeLimits}+
                </span>
                <div class="header__stars header__year">
                    <span class="icon-solid"></span>
                    ${filmRating}
                </div>
            </div>
            <p class="header__descr">
                ${film.description}
            </p>
            <div class="header__button">
                <a href="" class="header__watch">
                <span class="icon-solid"></span>
                Watch 
                </a>
                <a href="" class="header__more header__watch movie__item">
                    More information
                </a>
            </div>
            `
            anime.classList.remove('active')
            
        })
        .catch(e=>{
            anime.classList.remove('active')
            console.log(e);
        })
    })
    .catch(e=>{
        anime.classList.remove('active')
        console.log(e);
    })
}

const renderSolo = (id)=>{
    mainBlock.innerHTML = ''
    pagination.innerHTML = ''
    anime.classList.add('active')
    openSearchPanel(event);
    (
        async function () {
            const[reviews, frames, solo ] = await Promise.all([
                db.getReviews(id),
                db.getFrames(id),
                db.getSoloFilm(id)
            ])  
            return{reviews, frames, solo }
        }()
    ).then(res =>{
        console.log(res);
        const {reviews, frames, solo} = res
        const genres = solo.genres.reduce((acc, item) => acc + `${item.genre}`,'')
        const countires = solo.countries.reduce((acc, item) => acc + `${item.country}`,'')
        let review = ''
        let frame = ''
        frames.items.forEach((item, i)=>{
            if(i < 10) frame += `<img src="${item.previewUrl}" alt="">`
        })
        reviews.items.forEach((item, i) =>{
            if(i<10){
                review +=`
                <div class="review__item>
                    <span>${item.author}</span>
                    <p class="review__descr">${item.description}</p>
                    
                </div>
                `
            }
        })
        mainSolo.innerHTML = `
            <div class="solo__img">
                <img src="${solo.posterUrlPreview}" alt=""/>
                <a href="" class="solo__link header__watch">Смотреть фильм</a>
            </div>
            <div class="solo__content">
                <h3 class="solo__title trend__tv-title">${solo.nameRu || solo.nameEn}</h3>
                <ul>
                    <li class="solo__countries">Страны: ${countires}</li>
                    <li class="solo__countries">Жанры: ${genres}</li>
                    <li class="solo__countries">Продолжительность: ${solo.filmlength || ''}</li>
                    <li class="solo__countries">Год: ${solo.year || ''}</li>
                    <li class="solo__countries">Мировая премьера: ${solo.premiereWorld || ''}</li>
                    <li class="solo__countries">Возростной рейтинг: ${solo.ratingAgeLimits || ''}</li>
                    <li class="solo__countries">Слоган: ${solo.slogan || ''}</li>
                    <li class="solo__countries">Описание: ${solo.description || ''}</li>
                </ul>
            </div>
            <h3 class="trend__tv-title solo__title">Кадры из фильма</h3>
            <div class="solo__images">
                ${frame}
            </div>
            <div class="solo__reviews">
                <h3 class="trend__tv-title solo__title">Отзывы</h3>
                ${review}
            </div>
        `
        anime.classList.remove('active')
    })
}

// const renderCards = (page = 1, value = '', fn = 'getTopMovies')=>{
//     mainBlock.innerHTML = ''
//     mainSolo.innerHTML = ''
//     anime.classList.add('active')
//     db[fn](page, value).then(data =>{
//         if(data.film.length > 0){
//             data.films.forEach(item =>{
//                 const {nameEn, nameRu, rating, posterUrlPreview, filmId} = item
//                 const someItem = document.createElement('div')
//                 someItem.classList.add('some__item')
//                 someItem.innerHTML = `
//                 <div class="some_img">
//                     <img src="${posterUrlPreview}" alt=""/>
//                     <span class="some__rating">${rating || ''}</span>
//                 </div>
//                 <h3 class="some__title">${nameRu || nameEn}</h3>
//                 `
//                 mainBlock.append(someItem)
//                 someItem.addEventListener('click', ()=>{
//                     renderSolo(filmId)  
//                 })
//             })
//             if(fn != 'getTopMovies') anime.classList.remove('active')
//         }else{
//             anime.classList.remove('active')
//             mainBlock.innerHTML = `
//                 <div class="some__item">
//                     <h3 class="some__title">Ничего не найдено</h3>
//                 </div>
//             `
//         }
//     })
//     .catch(e => {
//         anime.classList.remove('active')
//         console.log(e);
//     })
// }

// formMain.addEventListener('submit', (e) => {
//     e.preventDefault()
//     const value = formInput.value
//     renderCards(1, value, 'getSearch')
// })

const renderCards = (page = 1, value = '', fn = 'getTopMovies') => {
    mainBlock.innerHTML = ''
    mainSolo.innerHTML = ''
    anime.classList.add('active')
    db['getSearch'](page, value).then(data => {
        if (data.films.length > 0) {
            data.films.forEach(item => {
                const { nameRu, nameEn, rating, posterUrlPreview, filmId } = item
                const someItem = document.createElement('div')
                someItem.classList.add('some__item')
                someItem.innerHTML = `
                    <div class="some__img">
                        <img src="${posterUrlPreview}" alt="" />
                        <span class="some__rating">${rating || ''}</span>
                    </div>
                    <h3 class="some__title">${nameRu || nameEn}</h3>
                `
                mainBlock.append(someItem)
                someItem.addEventListener('click', () => {
                    renderSolo(filmId)
                })
            })
            if (fn != 'getTopMovies') anime.classList.remove('active')
        } else {
            anime.classList.remove('active')
            mainBlock.innerHTML = `
                <div class="some__item">
                    <h3 class="some__title">Ничего не найдено</h3>
                </div>
            `
        }
    })
    .catch(e => {
        anime.classList.remove('active')
        console.log(e);
    })
 }
 
 
 formMain.addEventListener('submit', (e) => {
    e.preventDefault()
    const value = formInput.value
    renderCards(1, value, 'getSearch')
 })
 
 
const comingSoonImg = document.querySelector('.coming__soon-block img')

db.getTopMovies(2).then(data =>{
    const r = random(0, data.films.length - 1)
    comingSoonImg.src = data.films[r].posterUrlPreview
})



