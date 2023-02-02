import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { debounce } from 'lodash';
import './css/styles.css';

const searchForm = document.querySelector('#search-form');
const searchFormInput = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const galleryButton = document.querySelector('.load-more');
const footer = document.querySelector('.footer');

const lightbox = new SimpleLightbox('.gallery__imgbox a');

let page = 1;
let pagesNumber = 0;
let lastSearched = null;
let smoothScrolling = false;

async function fetchingImages(searchedInput, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '33195802-8138848f2bbeb34e6b62aa9d8',
        q: searchedInput,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });

    pagesNumber = Math.ceil(response.data.totalHits / 40);

    if (response.data.totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else if (page === 1) {
      Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    }
    return response.data.hits;
  } catch (error) {
    console.log(error);
  }

  page = 1;
}

function scrolling() {
  if (smoothScrolling) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

function updatingGallery(imgData) {
  let galleryCardHtml = ``;
  imgData.forEach(image => {
    galleryCardHtml += `
    <div class="gallery__card">
    <div class="gallery__imgbox">
    <a href="${image.largeImageURL}">
    <img class="gallery__img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy"/>
    </a>
    </div>
    <div class="gallery__info">
      <p class="gallery__item-info">
        <b>Likes </b> ${image.likes}
      </p>
      <p class="gallery__item-info">
        <b>Views </b>${image.views}
      </p>
      <p class="gallery__item-info">
        <b>Comments </b>${image.comments}
      </p>
      <p class="gallery__item-info">
        <b>Downloads </b>${image.downloads}
      </p>
    </div>
  </div>`;
  });

  gallery.innerHTML += galleryCardHtml;
  scrolling();
  lightbox.refresh();

  if (page === 1 && pagesNumber !== 0) {
    galleryButton.classList.remove('hidden');
    smoothScrolling = true;
  } else {
    galleryButton.classList.add('hidden');
  }
}

const footerObserver = new IntersectionObserver(async function (
  entries,
  observer
) {
  if (entries[0].isIntersecting === false) return;
  if (page >= pagesNumber) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    return;
  }
  page += 1;
  const imgData = await fetchingImages(lastSearched, page);
  updatingGallery(imgData);

  galleryButton.classList.remove('hidden');
});

const debouncing = debounce(async function () {
  const searchedInput = searchFormInput.value;

  if (searchedInput === lastSearched) {
    return;
  } else {
    gallery.innerHTML = '';
  }

  lastSearched = searchedInput;
  page = 1;

  const imgData = await fetchingImages(searchedInput, page);
  updatingGallery(imgData);
}, 250);

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  debouncing();
});

galleryButton.addEventListener('click', async function () {
  page += 1;
  const imgData = await fetchingImages(lastSearched, page);
  updatingGallery(imgData);
  footerObserver.observe(footer);
  galleryButton.classList.remove('hidden');
});
