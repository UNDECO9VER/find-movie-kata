export default class TmdbService {
  _baseURL = 'https://api.themoviedb.org/3/'
  _apiKey = 'd7e0b9855f0f8bc1f89b40ec1f88c57c'

  getResource = async  (url) =>{
    const link = `${this._baseURL}${url}api_key=${this._apiKey}`
    try{
      const res = await fetch(link)
      return await res.json()
    }catch(err){
      throw new Error(`Could not fetch ${url}, receivd ${err.status}`)
    }
  }

  setResource = async(url, body)=>{
    const link = `${this._baseURL}${url}api_key=${this._apiKey}`
    try{
      await fetch(link, {
        method: 'POST',
        body: body
      })
    }catch(err){
      throw new Error(`Could not fetch ${url}, receivd ${err.status}`)
    }
  }

  searchMoviesByName = async (filmName, page = 1) => {
    const res = await this.getResource(`search/movie?query=${filmName}&page=${page}&`)
    return res
  }

  getGenreMovieList = async () => {  
    return await this.getResource('genre/movie/list?')
  }

  getGuestToken = async () =>{
    const res = await this.getResource('authentication/guest_session/new?')
    if(!sessionStorage.getItem('guest_token')){
      sessionStorage.setItem('guest_token', res.guest_session_id)
    }
  }

  getRatedMovies = async (page) =>{
    return await this.getResource(`guest_session/${sessionStorage.getItem('guest_token')}/rated/movies?page=${page}&`)
  }

  guestRateMovie = async (movieId, value) => {
    const data = new FormData()
    data.append('value', value)
    await this.setResource(`movie/${movieId}/rating?guest_session_id=${sessionStorage.getItem('guest_token')}&`, data)
  }

}