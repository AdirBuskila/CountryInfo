'use strict';

const btn = document.querySelector('.btn-country');
const btnReset = document.querySelector('.btn-reset');
const btnEnter = document.querySelector('.btn-enter')
const input = document.querySelector('.country-input')
const countriesContainer = document.querySelector('.countries');
const dashboard = document.querySelector('.dashboard-container')



const renderCountry = (data, className = '') => {
    console.log(data);
    const { flag, name, nativeName, region, capital, population, languages, currencies, area } = data
    const html = `
        <article class="country ${className}">
        <img class="country__img" src="${flag}" />
        <div class="country__data">
        <div class="country__names">
        <h3 class="country__name">${name}</h3>
        <h3>-<h3>
        <h3 class="country__name">${nativeName}</h3>
        </div>
        <h4 class="country__region">${region}</h4>
        <p class="country__row"><span>⭐</span>${capital} (capital)</p>
        <p class="country__row"><span>👫</span>${(+population / 1000000).toFixed(1)} M people</p>
        <p class="country__row"><span>🗣️</span>${languages[0].name}</p>
        <p class="country__row"><span>💰</span>${currencies[0].name}</p>
        <p class="country__row"><span>🏡</span>${numberWithCommas(area)} km²</p>
        </div>
        </article>
        `;
    countriesContainer.insertAdjacentHTML('beforeend', html)
    countriesContainer.style.opacity = 1


}



const resetView = () => {
    countriesContainer.innerHTML = input.value = ''
}

const toggleView = () => {
    dashboard.classList.toggle('hide')
    btnReset.classList.toggle('hide')
}

const getPosition = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}
const renderN = async (countryCode) => {
    const res = await fetch(`https://restcountries.com/v2/alpha/${countryCode}`)
    const data = await res.json()
    renderCountry(data, 'neighbour')
}

const getCountry = async (countryName) => {
    try {
        const res = await fetch(`https://restcountries.com/v2/name/${countryName}`)
        const data = await res.json()
        renderCountry(data[0])
        const neighbors = data[0]?.borders
        if (!neighbors) return
        neighbors.forEach(c => renderN(c))
    } catch (err) {
        renderError(err)
        console.error(err);
    }
}

const whereAmI = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        // Geolocation
        const pos = await getPosition();
        const { latitude: lat, longitude: lng } = pos.coords
        // Reverse geocoding
        const resGeo = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`)
        if (!resGeo.ok) throw new Error('Problem getting location data')
        const dataGeo = await resGeo.json()
        // Country data
        const res = await fetch(`https://restcountries.com/v2/name/${dataGeo.country}`)
        if (!res.ok) throw new Error('Problem getting country')
        const data = await res.json()
        renderCountry(data[0])
        toggleView()
        const neighbors = data[0]?.borders
        if (!neighbors) return
        // Rendering neighbors
        neighbors.forEach(c => renderN(c))
    } catch (err) {
        console.error(err)
        renderError(`Something went wrong`)
        //Reject promise return from async function 
        throw err
    }
}


const renderError = (msg) => {
    countriesContainer.insertAdjacentText('beforeend', msg)
    countriesContainer.style.opacity = 1

}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


btn.addEventListener('click', whereAmI)
document.addEventListener('keydown', function (e) {
    if (e.code === 'Enter') {
        getCountry(input.value)
        toggleView()
    }
})

btnReset.addEventListener('click', () => {
    toggleView()
    resetView()
})

btnEnter.addEventListener('click', () => {
    getCountry(input.value)
    toggleView()
})

