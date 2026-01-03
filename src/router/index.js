import { createRouter, createWebHistory } from "vue-router";

import HomeView from "../views/HomeView.vue";
import SearchView from "../views/SearchView.vue";
import FavoritesView from "../views/FavoritesView.vue";
import MovieView from "../views/MovieView.vue";
import TvView from "../views/TvView.vue";
import PersonView from "../views/PersonView.vue";
import CollectionView from "../views/CollectionView.vue";
import CompanyView from "../views/CompanyView.vue";
import ListsView from "../views/ListsView.vue";



export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/search", name: "search", component: SearchView },
    { path: "/favorites", name: "favorites", component: FavoritesView },
    { path: "/movie/:id", name: "movie", component: MovieView, props: true },
    { path: "/tv/:id", name: "tv", component: TvView, props: true },
    { path: "/person/:id", name: "person", component: PersonView, props: true },
    { path: "/collection/:id", name: "collection", component: CollectionView },
{ path: "/company/:id", name: "company", component: CompanyView },
{ path: "/lists", name: "lists", component: ListsView },


  ],
});




