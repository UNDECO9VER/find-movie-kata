import React, { Component } from 'react'
import { Spin, Alert, Pagination, Tabs } from 'antd'
import debounce from 'lodash.debounce'

import { FilmGenresProvider } from '../film-genres-context/FilmGenresContext'
import TmdbService from '../../services/tmdb-service'
import FilmItemList from '../film-item-list/FilmItemList'
import FilmFindForm from '../film-find-form/FilmFindForm'
import './App.css'

export default class App extends Component{
  tmdbService = new TmdbService()

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
    this.tmdbService.getGuestToken()
    this.getGenres()
    this.updateRatedFilmes()
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
      this.setState({films: movies.results,totalItems: movies.total_results})
    }else{
      this.onEmptySearch()
    }
  }

  updateFilmes = (filmName, page = 1) =>{
    this.setState({films: [],totalItems: 0,searchState: {loading: false, error: false, emptySearch: false}})
    if(filmName.trim() === ''){
      this.setState({searchState: {loading: false, error: false, emptySearch: false}})
    }else{
      this.tmdbService
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

  updateRatedFilmes = (page = 1) => {
    this.tmdbService.getRatedMovies(page)
      .then((el)=>{
        this.setState({ratedFilmes: el.results, 
          totalRatedMovies: el.total_results,
          ratedState: {loading: false, error: false}})
      }).catch(()=>{
        this.setState({ratedState: {loading: false, error: true}})
      })
  }

  getGenres(){
    this.tmdbService
      .getGenreMovieList()
      .then((el)=>{
        this.setState({genres: el.genres})
      })
  }

  debouncedSearch = debounce(this.updateFilmes, 200)

  componentDidUpdate(prevProps, prevState){
    if(prevState.searchValue !== this.state.searchValue){
      this.debouncedSearch(this.state.searchValue)
    }
    if(prevState.page !== this.state.page){
      this.updateFilmes(this.state.searchValue, this.state.page)
    }
    if(prevState.ratedPage !== this.state.ratedPage){
      this.updateRatedFilmes(this.state.ratedPage)
    }
  }

  rateMovie = (id, rating) =>{
    this.tmdbService.guestRateMovie(id, rating)
      .then(()=>{
        this.updateRatedFilmes()
      }).catch(()=>{
        alert('Произошла ошибка при отправке данных на сервер')
      })
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
    const{films,ratedFilmes,genres, page, totalItems,
      totalRatedMovies, ratedPage, searchState, ratedState} = this.state
    const searchTab =  
    <React.Fragment>
      <FilmFindForm searchValue={this.state.searchValue} setSearchValue={this.handleSearch}/>
      {searchState.loading && <Spin style={{position: 'fixed', top:'50%', left:'50%'}} size='large' tip='Loading...'/>}
      {searchState.error && <Alert message='Connection Error' description='Ooops, somthing go wrong...' type='error'/>}
      {searchState.emptySearch && <Alert message='Эх...' description='По вашему запросу ничего не найденно' type='info'/>}
      {(searchState.loading==false && searchState.error==false) && <FilmItemList rateMovie={this.rateMovie} films={films}/>}
      {totalItems > 0 
        ? <Pagination 
          className='pagination'
          defaultCurrent={1} 
          pageSize={20} 
          onChange={(e)=> this.setPage(e)} 
          current={page} 
          total={totalItems} 
          showSizeChanger={false}/> : null}
    </React.Fragment>

    const ratedTab = <React.Fragment>
      {ratedState.loading && <Spin style={{position: 'fixed',top: '50%', left: '50%'}} size='large' tip='Loading...'/>}
      {ratedState.error && <Alert message='Connection Error' description='Ooops, something go wrong...' type='error'/>}
      {(ratedState.loading==false && ratedState.error==false) && <FilmItemList rateMovie={this.rateMovie} films={ratedFilmes}/>}
      {totalRatedMovies > 0 
        ? <Pagination 
          className='pagination'
          defaultCurrent={1} 
          pageSize={20} 
          onChange={(e)=> this.setRatedPage(e)} 
          current={ratedPage} 
          total={totalRatedMovies} 
          showSizeChanger={false}/> : null}
    </React.Fragment>

    const items = [
      { label: 'Search', key: 'item-1', children: searchTab }, 
      { label: 'Rated', key: 'item-2', children: ratedTab },
    ]
    return(
      <div className='main-container'>
        <FilmGenresProvider value={genres}>
          <Tabs items={items}/>
        </FilmGenresProvider>
      </div>
    )
  }
}