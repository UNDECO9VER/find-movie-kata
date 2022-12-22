import React, { Component } from 'react'
import { Tabs } from 'antd'
import debounce from 'lodash.debounce'

import FilmGenresContext from '../../context/film-genres-context/FilmGenresContext'
import TmdbService from '../../services/tmdb-service'
import FilmItemList from '../film-item-list/FilmItemList'
import ComponentState from '../component-state/ComponentState'
import FilmFindForm from '../film-find-form/FilmFindForm'
import PaginationCustom from '../pagination-custom/PaginationCustom'
import './App.css'

const tmdbService = new TmdbService()

export default class App extends Component{

  state = {
    films: [],
    ratedFilmes: [],
    genres: [],
    searchState:{
      loading: false,
      error: false,
      emptySearch: false,
    },
    ratedState:{
      loading: false,
      error: false,
    },
    searchValue: '',
    page: 1,
    totalItems: 0,
    totalRatedMovies: 0,
    ratedPage: 1
  }

  componentDidMount(){
    tmdbService.getGuestToken().then(()=>{
      this.getPopularMovies()
      this.updateRatedFilmes()
    }).catch(()=> alert('Не удалось создать гостевую сессию'))
    this.getGenres()

  }

  onMoviesLoaded(){
    this.setState({searchState:{loading: false, error: false, emptySearch: false}})
  }

  onError(){
    this.setState({searchState:{loading: false, error: true, emptySearch: false}})
  }

  onEmptySearch(){
    this.setState({searchState:{loading: false, error: false,  emptySearch: true}})
  }

  setMovies(movies){
    if (movies.results.length > 0) {
      const total = movies.total_results > 10000 ? 10000 : movies.total_results
      this.setState((state)=>
      {
        return{
          films: this.setRatedFilmes(movies.results, state.ratedFilmes), totalItems: total,
          searchState: {loading: false, error: false, emptySearch: false}
        }
      })
    }else{
      this.onEmptySearch()
    }
  }

  updateFilmes = (filmName, page = 1) =>{
    this.setState({films: [],totalItems: 0,searchState: {loading: true, error: false, emptySearch: false}})
    if(filmName.trim() === ''){
      this.setState({searchState: {loading: true, error: false, emptySearch: false}})
      this.getPopularMovies()
    }else{
      tmdbService
        .searchMoviesByName(`${filmName}`, page)
        .then((el)=>{
          this.setMovies(el)
          if(el.results > 0)
            this.onMoviesLoaded()
        }).catch(()=>{
          this.onError()
        })
    }
  }

  searchFilmes =()=>{
    if(this.state.page !== 1){
      this.setState({page: 1})
    }else(
      this.updateFilmes(this.state.searchValue)
    )
  }

  getPopularMovies =(page) =>{
    tmdbService
      .getPopularMovies(page)
      .then((el)=>{
        this.setMovies(el)
      }).catch(()=>{
        this.onError()
      })
  }

  updateRatedFilmes = async (page = 1) => {
    try{
      this.setState({ratedState: {loading: true, error: false}})
      const data = await tmdbService.getRatedMovies(page)
      this.setState({ratedFilmes: data.results, 
        totalRatedMovies: data.total_results,
        ratedState: {loading: false, error: false}})
    }catch{
      this.setState({ratedState: {loading: false, error: true}})
    }
          
  }

  getGenres(){
    tmdbService
      .getGenreMovieList()
      .then((el)=>{
        this.setState({genres: el.genres})
      })
  }

  setRatedFilmes =(filmes, ratedFilmes)=>{
    return filmes.map((el)=>{
      for(let i of ratedFilmes){
        if(el.id === i.id) return i
      }
      return el 
    })
  }
    
  

  debouncedSearch = debounce(()=>{this.searchFilmes()}, 300)

  componentDidUpdate(prevProps, prevState){
    if(prevState.searchValue !== this.state.searchValue){
      this.debouncedSearch()
    }
    if(prevState.page !== this.state.page){
      if(this.state.searchValue){
        this.updateFilmes(this.state.searchValue, this.state.page)
      } else{
        this.getPopularMovies(this.state.page)
      }
    }
    if(prevState.ratedPage !== this.state.ratedPage){
      this.updateRatedFilmes(this.state.ratedPage)
    }
    if(prevState.ratedFilmes !== this.state.ratedFilmes){
      this.setState(({films, ratedFilmes})=> {
        return{
          films: this.setRatedFilmes(films,ratedFilmes)
        }
      })
    }
  }

  rateMovie = async (id, rating) =>{
    try{
      await tmdbService.guestRateMovie(id, rating)
      this.setState(({films})=>{
        return{
          films: films.map((el)=> el.id === id ? {...el, rating: rating} : el)
        }
      })
    }catch{
      if(!sessionStorage.getItem('guest_token')){
        await tmdbService.getGuestToken()
        await this.rateMovie()
      }
    }  
  }

  handleSearch = (e) =>{
    this.setState({searchValue: e.target.value})  
  }

  setPage = (page) => {
    this.setState({page: page, searchState:{loading: true, error: false, emptySearch: false}})
  }

  setRatedPage = (page) => {
    this.setState({ratedPage: page, ratedState:{loading: true, error: false}})
  }
  
  render(){
    const{films,ratedFilmes, genres, page, totalItems,
      totalRatedMovies, ratedPage, searchState, ratedState} = this.state
    const searchTab =  
      <React.Fragment>
        <FilmFindForm searchValue={this.state.searchValue} setSearchValue={this.handleSearch}/>
        <ComponentState componentState={searchState}>
          <FilmItemList rateMovie={this.rateMovie} films={films}/>
        </ComponentState>
        <PaginationCustom totalItems={totalItems} page={page} onChange={this.setPage}/>
      </React.Fragment>

    const ratedTab = 
      <React.Fragment>
        <ComponentState componentState={ratedState}>
          <FilmItemList rateMovie={this.rateMovie} films={ratedFilmes}/>
        </ComponentState>
        <PaginationCustom totalItems={totalRatedMovies} page={ratedPage} onChange={this.setRatedPage}/>
      </React.Fragment>

    const items = [
      { label: 'Search', key: 'item-1', children: searchTab }, 
      { label: 'Rated', key: 'item-2', children: ratedTab },
    ]

    return(
      <div className='main-container'>
        <FilmGenresContext.Provider value={genres}>
          <Tabs centered items={items} onTabClick={(key)=> {if(key === 'item-2') this.updateRatedFilmes()}}/>
        </FilmGenresContext.Provider>
      </div>
    )
  }
}