export default class TmdbService {
  _baseURL = ''
  async getResource(url){
    const res = await fetch(`${this._baseURL}${url}`)
    if(!res.ok){
      throw new Error(`Could not fetch ${url}, receivd ${res.status}`)
    }
    return await res.json()
  }
}