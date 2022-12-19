import React, { Component } from 'react'
import { Spin, Alert, Pagination, Tabs } from 'antd'
import debounce from 'lodash.debounce'

import { FilmGenresProvider } from '../../context/film-genres-context/FilmGenresContext'
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
    this.tmdbService.getGuestToken().then(()=>{
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

  searchFilmes =()=>{
    if(this.state.page !== 1){
      this.setState({page: 1})
    }else(
      this.updateFilmes(this.state.searchValue)
    )
  }

  getPopularMovies =(page) =>{
    this.tmdbService
      .getPopularMovies(page)
      .then((el)=>{
        this.setMovies(el)
      }).catch(()=>{
        this.onError()
      })
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
      await this.tmdbService.guestRateMovie(id, rating)
      this.setState(({films})=>{
        return{
          films: films.map((el)=> el.id === id ? {...el, rating: rating} : el)
        }
      })
      this.updateRatedFilmes()
    }catch{
      if(!sessionStorage.getItem('guest_token')){
        await this.tmdbService.getGuestToken()
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
          <Tabs centered items={items}/>
        </FilmGenresProvider>
      </div>
    )
  }
}