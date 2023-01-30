import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { debounce } from 'lodash';

const searchForm = document.querySelector('#search-form');
const searchFormInput = document.querySelector('input');
const searchFormButton = document.querySelector('button[submit]');
const gallery = document.querySelector('.gallery');
const galleryButton = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery');

asyns function fetchImages()